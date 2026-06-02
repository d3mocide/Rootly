import { useState, useRef, useEffect } from 'react';
import type { Plant } from './types/plant';
import { T } from './tokens';
import { Toast } from './components';
import { useBreakpoint } from './hooks/useBreakpoint';
import { getToken, getMe, getDisplayName, apiLogout, checkSetup } from './api/auth';
import type { UserResponse } from './api/auth';
import { fetchPlants, apiWaterPlant } from './api/plants';
import { AuthScreen } from './screens/AuthScreen';

// Mobile
import { TabBar } from './screens/mobile/TabBar';
import type { TabId } from './screens/mobile/TabBar';
import { TodayScreen } from './screens/mobile/TodayScreen';
import { PlantsScreen } from './screens/mobile/PlantsScreen';
import { ProfileScreen } from './screens/mobile/ProfileScreen';
import { GrowthScreen } from './screens/mobile/GrowthScreen';
import { CareScreen } from './screens/mobile/CareScreen';
import { AddPlantScreen } from './screens/mobile/AddPlantScreen';
import { WaterSheet } from './screens/mobile/WaterSheet';

// Desktop
import { Sidebar } from './screens/desktop/Sidebar';
import { TodayDesktop } from './screens/desktop/TodayDesktop';
import { PlantsDesktop } from './screens/desktop/PlantsDesktop';
import { ProfilePanel } from './screens/desktop/ProfilePanel';
import { PlaceholderDesktop } from './screens/desktop/PlaceholderDesktop';

export default function App() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [tab, setTab] = useState<TabId>('today');
  const [profile, setProfile] = useState<Plant | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [waterTarget, setWaterTarget] = useState<Plant | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [token, setToken] = useState<string | null>(getToken);
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);

  const isDesktop = useBreakpoint(700);

  useEffect(() => {
    if (token) {
      getMe()
        .then(user => { setCurrentUser(user); return fetchPlants(); })
        .then(setPlants)
        .catch(() => setToken(null))
        .finally(() => setAuthChecking(false));
    } else {
      checkSetup()
        .then(({ setup_required }) => setSetupRequired(setup_required))
        .catch(() => {})
        .finally(() => setAuthChecking(false));
    }
  }, [token]);

  const flash = (msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  const handleAuth = (newToken: string) => {
    setSetupRequired(false);
    setToken(newToken);
  };

  const handleLogout = async () => {
    await apiLogout();
    setCurrentUser(null);
    setPlants([]);
    setToken(null);
  };

  const waterPlant = async (p: Plant) => {
    try {
      const updated = await apiWaterPlant(p.id);
      setPlants(ps => ps.map(x => x.id === p.id ? updated : x));
      setProfile(cur => cur?.id === p.id ? updated : cur);
    } catch {
      flash('Failed to log watering.');
    }
  };

  const onWater = (p: Plant) => {
    if (isDesktop) {
      waterPlant(p).then(() => flash(`Logged. ${p.name} watered today.`));
    } else {
      setWaterTarget(p);
    }
  };

  const confirmWater = () => {
    if (!waterTarget) return;
    const target = waterTarget;
    setWaterTarget(null);
    waterPlant(target).then(() => flash(`Logged. ${target.name} watered today.`));
  };

  const waterAll = () => {
    const dry = plants.filter(p => p.status === 'dry');
    Promise.all(dry.map(p => apiWaterPlant(p.id)))
      .then(updated => {
        const map = Object.fromEntries(updated.map(p => [p.id, p]));
        setPlants(ps => ps.map(p => map[p.id] ?? p));
        flash(dry.length ? `Nice — ${dry.length} watered.` : 'All caught up.');
      })
      .catch(() => flash('Something went wrong.'));
  };

  const live = profile ? plants.find(p => p.id === profile.id) ?? profile : null;

  if (authChecking) {
    return (
      <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.paper }}>
        <img src="/rootly-mark.svg" alt="Rootly" style={{ width: 40, height: 40, opacity: 0.5 }} />
      </div>
    );
  }

  if (!token) {
    return <AuthScreen onAuth={handleAuth} isFirstRun={setupRequired} />;
  }

  if (isDesktop) {
    return (
      <div style={{ display: 'flex', height: '100dvh', position: 'relative', overflow: 'hidden' }}>
        <Sidebar active={tab} onNav={t => { setTab(t); setProfile(null); }} onAdd={() => flash('Add plant — full flow coming soon.')} />
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {tab === 'today'  && <TodayDesktop plants={plants} onOpen={setProfile} onWater={onWater} onWaterAll={waterAll} />}
          {tab === 'plants' && <PlantsDesktop plants={plants} onOpen={setProfile} />}
          {(tab === 'growth' || tab === 'care') && <PlaceholderDesktop tab={tab} />}
          {live && <ProfilePanel plant={live} onClose={() => setProfile(null)} onWater={onWater} />}
        </div>
        {toast && <Toast message={toast} />}
        <div style={{ position: 'fixed', bottom: 20, left: 20, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
          {currentUser && (
            <span style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: T.ink2, paddingLeft: 10 }}>
              {getDisplayName(currentUser)}
              {currentUser.is_admin && (
                <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, color: T.ink3, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Admin
                </span>
              )}
            </span>
          )}
          <button
            onClick={handleLogout}
            style={{
              fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: T.ink3,
              background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 10px',
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100dvh', position: 'relative', overflow: 'hidden' }}>
      {!profile ? (
        <>
          {tab === 'today'  && <TodayScreen plants={plants} onOpen={setProfile} onWater={onWater} onWaterAll={waterAll} />}
          {tab === 'plants' && <PlantsScreen plants={plants} onOpen={setProfile} />}
          {tab === 'growth' && <GrowthScreen plants={plants} onOpen={setProfile} />}
          {tab === 'care'   && <CareScreen plants={plants} onOpen={setProfile} />}
          <TabBar active={tab} onChange={t => { setTab(t); setProfile(null); }} onAdd={() => setAddOpen(true)} />
        </>
      ) : (
        <ProfileScreen plant={profile} onBack={() => setProfile(null)} onWater={onWater} />
      )}

      {addOpen && <AddPlantScreen onClose={() => setAddOpen(false)} />}
      {waterTarget && <WaterSheet plant={waterTarget} onConfirm={confirmWater} onClose={() => setWaterTarget(null)} />}
      {toast && <Toast message={toast} />}
    </div>
  );
}
