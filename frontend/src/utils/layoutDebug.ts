/* Activation helpers for the Layout Debugger overlay.
   Kept separate from the component file so that module exports
   only React components (react-refresh/only-export-components). */

export const LAYOUT_DEBUG_STORAGE_KEY = 'rootly:layoutDebug';
export const LAYOUT_DEBUG_EVENT = 'rootly:layoutDebug';

/** Read the current enabled state, honouring a ?debug URL flag. */
export function readLayoutDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.has('debug')) {
      window.localStorage.setItem(LAYOUT_DEBUG_STORAGE_KEY, '1');
      return true;
    }
    return window.localStorage.getItem(LAYOUT_DEBUG_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

/** Toggle the debugger from anywhere (e.g. a Settings switch). */
export function setLayoutDebugEnabled(on: boolean): void {
  try {
    if (on) window.localStorage.setItem(LAYOUT_DEBUG_STORAGE_KEY, '1');
    else window.localStorage.removeItem(LAYOUT_DEBUG_STORAGE_KEY);
  } catch {
    /* ignore storage failures (private mode) */
  }
  window.dispatchEvent(new CustomEvent(LAYOUT_DEBUG_EVENT, { detail: on }));
}
