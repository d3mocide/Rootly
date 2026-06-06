import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { T } from '../tokens';
import {
  LAYOUT_DEBUG_STORAGE_KEY as STORAGE_KEY,
  LAYOUT_DEBUG_EVENT as EVENT_NAME,
  readLayoutDebugEnabled,
} from '../utils/layoutDebug';

/* ============================================================
   Rootly — Layout Debugger
   A self-contained front-end diagnostic overlay for chasing
   PWA / iOS standalone layout bugs (safe-area insets, viewport
   unit drift, and the "nav jumps after first launch" class of
   problem). It surfaces live geometry and, crucially, logs how
   those numbers CHANGE over the first seconds after launch so a
   one-off reflow can be caught after the fact.

   Activation (any of):
     - localStorage 'rootly:layoutDebug' === '1'
     - URL contains ?debug  (also persists the flag)
     - window event 'rootly:layoutDebug' { detail: boolean }

   Nothing here imports app state — it is purely observational
   and safe to mount unconditionally at the app root.
   ============================================================ */

const MAX_LOG = 60;

// ---- Metric model ------------------------------------------------
interface Insets { top: number; right: number; bottom: number; left: number; }

interface LayerInfo {
  key: string;
  label: string;
  color: string;
  top: number;
  bottom: number;
  height: number;
  width: number;
}

interface Metrics {
  iosVer: string;
  standalone: boolean;
  displayMode: string;
  orientation: string;
  insets: Insets;
  innerW: number;
  innerH: number;
  clientW: number;
  clientH: number;
  visualW: number;
  visualH: number;
  vvScale: number;
  vvOffsetTop: number;
  screenW: number;
  screenH: number;
  availH: number;
  dpr: number;
  vh: number;
  lvh: number;
  svh: number;
  dvh: number;
  layers: LayerInfo[];
}

interface LogEntry { id: number; t: number; label: string; detail: string; warn: boolean; }

// Distinct outline colours for the layer-highlight overlay.
const LAYER_COLORS: Record<string, string> = {
  html: '#E5484D',
  body: '#30A46C',
  '#root': '#5E8FB8',
  shell: '#E0A050',
  nav: '#9B6BDF',
};

function pxNum(v: string): number {
  const n = parseFloat(v);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

function detectDisplayMode(): string {
  if (typeof window.matchMedia !== 'function') return 'unknown';
  const modes = ['standalone', 'fullscreen', 'minimal-ui', 'browser'];
  for (const m of modes) {
    if (window.matchMedia(`(display-mode: ${m})`).matches) return m;
  }
  return 'browser';
}

function detectIosVersion(): string {
  const ua = navigator.userAgent || '';
  const m = ua.match(/OS (\d+)[_.](\d+)(?:[_.](\d+))?/);
  if (m) return `${m[1]}.${m[2]}${m[3] ? '.' + m[3] : ''}`;
  // Non-iOS — report the platform so the panel is still useful elsewhere.
  if (/Android/.test(ua)) return 'Android';
  return 'n/a';
}

/** `allowed` gates the whole tool to privileged users (admins). When
 *  false the component renders nothing, regardless of the stored flag. */
export function LayoutDebugger({ allowed = false }: { allowed?: boolean }) {
  const [enabled, setEnabled] = useState(readLayoutDebugEnabled);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [copied, setCopied] = useState(false);

  // Floating button + panel positions (draggable). Seed the FAB near the
  // bottom-left, clear of the tab bar.
  const [fabPos, setFabPos] = useState(() => ({
    x: 16,
    y: typeof window !== 'undefined' ? Math.max(16, window.innerHeight - 140) : 16,
  }));
  const [panelPos, setPanelPos] = useState<{ x: number; y: number } | null>(null);

  const probeRef = useRef<HTMLDivElement | null>(null);
  const vhRef = useRef<HTMLDivElement | null>(null);
  const lvhRef = useRef<HTMLDivElement | null>(null);
  const svhRef = useRef<HTMLDivElement | null>(null);
  const dvhRef = useRef<HTMLDivElement | null>(null);
  const prevRef = useRef<Metrics | null>(null);
  const logId = useRef(0);

  // ---- Enable / disable wiring -----------------------------------
  useEffect(() => {
    const onToggle = (e: Event) => setEnabled(Boolean((e as CustomEvent).detail));
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setEnabled(e.newValue === '1');
    };
    window.addEventListener(EVENT_NAME, onToggle as EventListener);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(EVENT_NAME, onToggle as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // ---- Measurement -----------------------------------------------
  const measure = useCallback((): Metrics => {
    const probe = probeRef.current;
    const cs = probe ? getComputedStyle(probe) : null;
    const insets: Insets = cs
      ? {
          top: pxNum(cs.paddingTop),
          right: pxNum(cs.paddingRight),
          bottom: pxNum(cs.paddingBottom),
          left: pxNum(cs.paddingLeft),
        }
      : { top: 0, right: 0, bottom: 0, left: 0 };

    const vv = window.visualViewport;
    const measH = (el: HTMLElement | null) => (el ? Math.round(el.getBoundingClientRect().height) : 0);

    // DOM layers, top→bottom, that could push the nav around.
    const layerDefs: Array<{ key: string; el: Element | null }> = [
      { key: 'html', el: document.documentElement },
      { key: 'body', el: document.body },
      { key: '#root', el: document.getElementById('root') },
    ];
    document.querySelectorAll('[data-debug-layer]').forEach(el => {
      const key = el.getAttribute('data-debug-layer') || 'layer';
      layerDefs.push({ key, el });
    });
    const layers: LayerInfo[] = layerDefs
      .filter(d => d.el)
      .map(d => {
        const r = (d.el as Element).getBoundingClientRect();
        return {
          key: d.key,
          label: d.key,
          color: LAYER_COLORS[d.key] || T.fern,
          top: Math.round(r.top),
          bottom: Math.round(r.bottom),
          height: Math.round(r.height),
          width: Math.round(r.width),
        };
      });

    return {
      iosVer: detectIosVersion(),
      standalone: Boolean((navigator as Navigator & { standalone?: boolean }).standalone),
      displayMode: detectDisplayMode(),
      orientation: window.innerHeight >= window.innerWidth ? 'portrait' : 'landscape',
      insets,
      innerW: window.innerWidth,
      innerH: window.innerHeight,
      clientW: document.documentElement.clientWidth,
      clientH: document.documentElement.clientHeight,
      visualW: vv ? Math.round(vv.width) : 0,
      visualH: vv ? Math.round(vv.height) : 0,
      vvScale: vv ? Math.round(vv.scale * 100) / 100 : 1,
      vvOffsetTop: vv ? Math.round(vv.offsetTop) : 0,
      screenW: window.screen.width,
      screenH: window.screen.height,
      availH: window.screen.availHeight,
      dpr: Math.round(window.devicePixelRatio * 100) / 100,
      vh: measH(vhRef.current),
      lvh: measH(lvhRef.current),
      svh: measH(svhRef.current),
      dvh: measH(dvhRef.current),
      layers,
    };
  }, []);

  const pushLog = useCallback((label: string, detail: string, warn: boolean) => {
    setLog(l => [{ id: logId.current++, t: Date.now(), label, detail, warn }, ...l].slice(0, MAX_LOG));
  }, []);

  // Compare two readings and record meaningful deltas to the log.
  const diffAndLog = useCallback((next: Metrics, label: string) => {
    const prev = prevRef.current;
    prevRef.current = next;
    if (!prev) {
      pushLog('launch', `innerH ${next.innerH} · svh ${next.svh} · dvh ${next.dvh} · sab ${next.insets.bottom}`, false);
      return;
    }
    const changes: string[] = [];
    let warn = false;
    if (prev.innerH !== next.innerH) { changes.push(`innerH ${prev.innerH}→${next.innerH} (${sign(next.innerH - prev.innerH)})`); warn = true; }
    if (prev.insets.bottom !== next.insets.bottom) { changes.push(`sab ${prev.insets.bottom}→${next.insets.bottom}`); warn = true; }
    if (prev.insets.top !== next.insets.top) { changes.push(`sat ${prev.insets.top}→${next.insets.top}`); warn = true; }
    if (prev.dvh !== next.dvh) changes.push(`dvh ${prev.dvh}→${next.dvh}`);
    if (prev.svh !== next.svh) changes.push(`svh ${prev.svh}→${next.svh}`);
    if (prev.visualH !== next.visualH) changes.push(`visualH ${prev.visualH}→${next.visualH}`);
    if (prev.vvOffsetTop !== next.vvOffsetTop) changes.push(`vvOffY ${prev.vvOffsetTop}→${next.vvOffsetTop}`);
    if (changes.length) pushLog(label, changes.join(' · '), warn);
  }, [pushLog]);

  // ---- Live sampling while enabled -------------------------------
  useEffect(() => {
    if (!enabled || !allowed) return;
    let raf = 0;
    const sample = (label: string) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const m = measure();
        setMetrics(m);
        diffAndLog(m, label);
      });
    };

    sample('mount');
    const onResize = () => sample('resize');
    const onOrient = () => sample('orientation');
    const onScroll = () => sample('scroll');

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onOrient);
    const vv = window.visualViewport;
    vv?.addEventListener('resize', onResize);
    vv?.addEventListener('scroll', onScroll);

    // iOS often settles the safe-area / viewport AFTER launch without
    // firing a resize, so poll briefly to capture that silent reflow.
    const poll = window.setInterval(() => sample('poll'), 400);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(poll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onOrient);
      vv?.removeEventListener('resize', onResize);
      vv?.removeEventListener('scroll', onScroll);
    };
  }, [enabled, allowed, measure, diffAndLog]);

  // ---- Copy report ------------------------------------------------
  const report = useMemo(() => {
    if (!metrics) return '';
    const m = metrics;
    const lines = [
      'ROOTLY LAYOUT DIAG',
      `iOS ${m.iosVer} · standalone ${m.standalone} · display-mode ${m.displayMode} · ${m.orientation}`,
      `safe-area  top ${m.insets.top}  right ${m.insets.right}  bottom ${m.insets.bottom}  left ${m.insets.left}`,
      `window ${m.innerW}×${m.innerH} · docEl ${m.clientW}×${m.clientH} · visual ${m.visualW}×${m.visualH}`,
      `vv scale ${m.vvScale} · vv offY ${m.vvOffsetTop} · screen ${m.screenW}×${m.screenH} · availH ${m.availH} · dpr ${m.dpr}`,
      `units  100vh ${m.vh}  100lvh ${m.lvh}  100svh ${m.svh}  100dvh ${m.dvh}`,
      'layers (top→bottom):',
      ...m.layers.map(l => `  ${l.label.padEnd(8)} h=${l.height} (${l.top}→${l.bottom}) w=${l.width}`),
      'event log (newest first):',
      ...log.map(e => `  +${((e.t - (log[log.length - 1]?.t ?? e.t)) / 1000).toFixed(2)}s ${e.label}: ${e.detail}`),
    ];
    return lines.join('\n');
  }, [metrics, log]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  // ---- Drag helpers ----------------------------------------------
  const startDrag = (e: React.PointerEvent, kind: 'fab' | 'panel') => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const base = kind === 'fab' ? fabPos : (panelPos ?? { x: window.innerWidth - 312, y: 40 });
    const moved = { current: false };
    const onMove = (ev: PointerEvent) => {
      const nx = base.x + (ev.clientX - startX);
      const ny = base.y + (ev.clientY - startY);
      if (Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY) > 4) moved.current = true;
      const clamp = (v: number, max: number) => Math.max(4, Math.min(v, max));
      if (kind === 'fab') setFabPos({ x: clamp(nx, window.innerWidth - 56), y: clamp(ny, window.innerHeight - 56) });
      else setPanelPos({ x: clamp(nx, window.innerWidth - 60), y: clamp(ny, window.innerHeight - 60) });
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      // A tap (no movement) on the FAB toggles the panel.
      if (kind === 'fab' && !moved.current) setOpen(o => !o);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  // Hidden probes to read env() insets and the four viewport-height units
  // without affecting layout. Refs are used directly here (idiomatic).
  const probeHidden: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, width: 1, visibility: 'hidden',
    pointerEvents: 'none', zIndex: -1, overflow: 'hidden',
  };
  const probes = (
    <div aria-hidden style={{ position: 'fixed', top: 0, left: 0, width: 0, height: 0, pointerEvents: 'none' }}>
      <div ref={probeRef} style={{
        position: 'fixed', top: 0, left: 0, width: 0, height: 0, visibility: 'hidden', pointerEvents: 'none',
        paddingTop: 'env(safe-area-inset-top)', paddingRight: 'env(safe-area-inset-right)',
        paddingBottom: 'env(safe-area-inset-bottom)', paddingLeft: 'env(safe-area-inset-left)',
      }} />
      <div ref={vhRef} style={{ ...probeHidden, height: '100vh' }} />
      <div ref={lvhRef} style={{ ...probeHidden, height: '100lvh' }} />
      <div ref={svhRef} style={{ ...probeHidden, height: '100svh' }} />
      <div ref={dvhRef} style={{ ...probeHidden, height: '100dvh' }} />
    </div>
  );

  if (!allowed) return null;
  if (!enabled) return probes;

  const panel = panelPos ?? { x: Math.max(8, window.innerWidth - 312), y: 40 };

  return (
    <>
      {probes}

      {/* Layer-highlight overlay — outlines each tracked layer and tags
          the one that reaches the screen bottom. */}
      {highlight && metrics && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2147483640, pointerEvents: 'none' }}>
          {metrics.layers.map(l => (
            <div key={l.key} style={{
              position: 'fixed', left: 2, right: 2, top: l.top, height: Math.max(l.height, 1),
              border: `1.5px dashed ${l.color}`, borderRadius: 4,
            }}>
              <span style={{
                position: 'absolute', left: 0, bottom: 0, transform: 'translateY(100%)',
                background: l.color, color: '#fff', fontFamily: T.mono, fontSize: 10,
                padding: '1px 5px', borderRadius: '0 0 4px 4px', whiteSpace: 'nowrap',
              }}>
                {l.label} {l.height} ({l.top}→{l.bottom})
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Floating toggle button */}
      <button
        onPointerDown={e => startDrag(e, 'fab')}
        style={{
          position: 'fixed', left: fabPos.x, top: fabPos.y, width: 52, height: 52,
          borderRadius: '50%', border: '2px solid #1a1a1a', cursor: 'grab',
          background: T.sun, color: '#231a08', fontFamily: T.mono, fontSize: 13, fontWeight: 700,
          display: 'grid', placeItems: 'center', zIndex: 2147483646, touchAction: 'none',
          boxShadow: '0 6px 18px rgba(0,0,0,.35)', letterSpacing: '.04em',
        }}
      >
        DBG
      </button>

      {open && metrics && (
        <div style={{
          position: 'fixed', left: panel.x, top: panel.y, width: 300, maxHeight: '82vh',
          background: '#0d0d0f', color: '#e7e3d8', borderRadius: 12,
          border: `1px solid ${T.sun}`, zIndex: 2147483647,
          boxShadow: '0 18px 50px rgba(0,0,0,.5)', display: 'flex', flexDirection: 'column',
          fontFamily: T.mono, fontSize: 12, overflow: 'hidden',
        }}>
          {/* Header (drag handle) */}
          <div
            onPointerDown={e => startDrag(e, 'panel')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '9px 11px', borderBottom: '1px solid #2a2a2e', cursor: 'grab',
              touchAction: 'none', background: '#141416',
            }}
          >
            <span style={{ color: T.sun, fontWeight: 700, letterSpacing: '.08em' }}>LAYOUT DIAG</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <HeaderBtn onClick={onCopy} active={copied}>{copied ? 'COPIED' : 'COPY'}</HeaderBtn>
              <HeaderBtn onClick={() => setHighlight(h => !h)} active={highlight}>BOX</HeaderBtn>
              <HeaderBtn onClick={() => setOpen(false)}>✕</HeaderBtn>
            </div>
          </div>

          <div style={{ overflowY: 'auto', padding: '4px 11px 12px' }}>
            <Section title="MODE">
              <Row k="iOS ver" v={metrics.iosVer} />
              <Row k="nav.standalone" v={String(metrics.standalone)} warn={!metrics.standalone} />
              <Row k="display-mode" v={metrics.displayMode} />
              <Row k="orientation" v={metrics.orientation} />
            </Section>

            <Section title="SAFE-AREA INSETS">
              <Row k="top" v={`${metrics.insets.top}px`} />
              <Row k="right" v={`${metrics.insets.right}px`} />
              <Row k="bottom" v={`${metrics.insets.bottom}px`} />
              <Row k="left" v={`${metrics.insets.left}px`} />
            </Section>

            <Section title="VIEWPORT">
              <Row k="window" v={`${metrics.innerW}×${metrics.innerH}`} />
              <Row k="docEl" v={`${metrics.clientW}×${metrics.clientH}`} />
              <Row k="visual" v={`${metrics.visualW}×${metrics.visualH}`} />
              <Row k="vv scale" v={String(metrics.vvScale)} />
              <Row k="vv offY" v={`${metrics.vvOffsetTop}px`} />
              <Row k="screen" v={`${metrics.screenW}×${metrics.screenH}`} />
              <Row k="availH" v={`${metrics.availH}px`} />
              <Row k="dpr" v={String(metrics.dpr)} />
            </Section>

            <Section title="VIEWPORT UNITS">
              <Row k="100vh" v={`${metrics.vh}px`} />
              <Row k="100lvh" v={`${metrics.lvh}px`} />
              <Row k="100svh" v={`${metrics.svh}px`} warn={metrics.svh !== metrics.dvh} />
              <Row k="100dvh" v={`${metrics.dvh}px`} />
            </Section>

            <Section title="DOM LAYERS · H (TOP→BOT)">
              {metrics.layers.map(l => (
                <div key={l.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 0' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
                    <span style={{ color: l.color }}>{l.label}</span>
                  </span>
                  <span style={{ color: '#cfcabb' }}>{l.height} <span style={{ color: '#7c7768' }}>({l.top}→{l.bottom})</span></span>
                </div>
              ))}
            </Section>

            <Section title="EVENT LOG · newest first">
              {log.length === 0 && <div style={{ color: '#7c7768' }}>no changes recorded…</div>}
              {log.map((e, i) => {
                const base = log[log.length - 1]?.t ?? e.t;
                return (
                  <div key={e.id} style={{ padding: '3px 0', borderTop: i === 0 ? 'none' : '1px solid #1c1c1f' }}>
                    <span style={{ color: e.warn ? T.sun : '#5e8fb8' }}>
                      +{((e.t - base) / 1000).toFixed(2)}s {e.label}
                    </span>
                    <div style={{ color: e.warn ? '#f0d9a8' : '#aea89a', wordBreak: 'break-word' }}>{e.detail}</div>
                  </div>
                );
              })}
            </Section>
          </div>
        </div>
      )}
    </>
  );
}

// ---- Sub-components ----------------------------------------------
function sign(n: number): string {
  return n > 0 ? `+${n}` : String(n);
}

function HeaderBtn({ children, onClick, active }: { children: React.ReactNode; onClick: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      onPointerDown={e => e.stopPropagation()}
      style={{
        background: active ? T.sun : 'transparent', color: active ? '#231a08' : '#cfcabb',
        border: '1px solid #3a3a3e', borderRadius: 5, fontFamily: T.mono, fontSize: 10,
        fontWeight: 700, padding: '3px 6px', cursor: 'pointer', letterSpacing: '.05em',
      }}
    >
      {children}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ color: '#7c7768', fontSize: 10, letterSpacing: '.12em', marginBottom: 4, borderBottom: '1px solid #1c1c1f', paddingBottom: 3 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ k, v, warn }: { k: string; v: string; warn?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
      <span style={{ color: '#9a9487' }}>{k}</span>
      <span style={{ color: warn ? T.sun : '#e7e3d8', fontWeight: warn ? 700 : 400 }}>{v}</span>
    </div>
  );
}
