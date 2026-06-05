import { useState, useRef, useEffect } from 'react';
import type { Plant } from './types/plant';
import { T } from './tokens';
import { Toast, SettingsModal, AddPlantModal, EditPlantModal, LogGrowthModal, Icon } from './components';
import { useBreakpoint } from './hooks/useBreakpoint';
import { getToken, getMe, apiLogout, checkSetup } from './api/auth';
import type { UserResponse } from './api/auth';
import { fetchPlants, apiWaterPlant, apiCreatePlant, apiUpdatePlant, apiDeletePlant } from './api/plants';
import { fetchAreas, apiCreateArea, apiDeleteArea } from './api/areas';
import type { Area } from './types/area';
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
import { EditPlantScreen } from './screens/mobile/EditPlantScreen';
import { WaterSheet } from './screens/mobile/WaterSheet';

// Desktop
import { Sidebar } from './screens/desktop/Sidebar';
import { TodayDesktop } from './screens/desktop/TodayDesktop';
import { PlantsDesktop } from './screens/desktop/PlantsDesktop';
import { ProfilePanel } from './screens/desktop/ProfilePanel';
import { PlaceholderDesktop } from './screens/desktop/PlaceholderDesktop';

export default function App() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [tab, setTab] = useState<TabId>('today');
  const [profile, setProfile] = useState<Plant | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addOpenDesktop, setAddOpenDesktop] = useState(false);
  const [editTarget, setEditTarget] = useState<Plant | null>(null);
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState<Plant | null>(null);
  const [waterTarget, setWaterTarget] = useState<Plant | null>(null);
  const [growthTarget, setGrowthTarget] = useState<Plant | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [token, setToken] = useState<string | null>(getToken);
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);
  const [signupsEnabled, setSignupsEnabled] = useState(false);

  const isDesktop = useBreakpoint(700);

  useEffect(() => {
    if (token) {
      getMe()
        .then(user => { 
          setCurrentUser(user); 
          return Promise.all([fetchPlants(), fetchAreas()]); 
        })
        .then(([plantsData, areasData]) => { 
          setPlants(plantsData); 
          setAreas(areasData); 
        })
        .catch(() => setToken(null))
        .finally(() => setAuthChecking(false));
    } else {
      checkSetup()
        .then(({ setup_required, signups_enabled }) => {
          setSetupRequired(setup_required);
          setSignupsEnabled(signups_enabled);
        })
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
    setAreas([]);
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
    const due = plants.filter(p => p.status === 'dry' || p.status === 'soon');
    Promise.all(due.map(p => apiWaterPlant(p.id)))
      .then(updated => {
        const map = Object.fromEntries(updated.map(p => [p.id, p]));
        setPlants(ps => ps.map(p => map[p.id] ?? p));
        flash(due.length ? `Nice — ${due.length} watered.` : 'All caught up.');
      })
      .catch(() => flash('Something went wrong.'));
  };

  const handleAddPlant = async (plantData: Omit<Plant, 'id'>) => {
    try {
      const newPlant = await apiCreatePlant(plantData);
      setPlants(ps => [...ps, newPlant]);
      flash(`Successfully added ${newPlant.name}!`);
    } catch (err: unknown) {
      flash('Failed to add plant.');
      throw err;
    }
  };

  const handleEditPlant = async (id: string, updates: Partial<Plant>) => {
    try {
      const updated = await apiUpdatePlant(id, updates);
      setPlants(ps => ps.map(x => x.id === id ? updated : x));
      if (profile?.id === id) {
        setProfile(updated);
      }
      flash(`Updated details for ${updated.name}!`);
    } catch (err: unknown) {
      flash('Failed to update plant.');
      throw err;
    }
  };

  const handleDeletePlant = async (id: string) => {
    try {
      await apiDeletePlant(id);
      setPlants(ps => ps.filter(x => x.id !== id));
      if (profile?.id === id) {
        setProfile(null);
      }
      flash('Plant successfully deleted.');
    } catch (err: unknown) {
      flash('Failed to delete plant.');
      throw err;
    }
  };

  const handleAddArea = async (name: string) => {
    const newArea = await apiCreateArea(name);
    setAreas(prev => [...prev, newArea]);
    flash(`Added room: ${name}`);
  };

  const handleDeleteArea = async (id: string) => {
    const areaToDelete = areas.find(a => a.id === id);
    if (areaToDelete) {
      await apiDeleteArea(id);
      setAreas(prev => prev.filter(a => a.id !== id));
      flash(`Deleted room: ${areaToDelete.name}`);
    }
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
    return <AuthScreen onAuth={handleAuth} isFirstRun={setupRequired} signupsEnabled={signupsEnabled} />;
  }

  return (
    <div style={{ height: '100dvh', position: 'relative', overflow: 'hidden' }}>
      {isDesktop ? (
        <div style={{ display: 'flex', height: '100dvh', position: 'relative', overflow: 'hidden' }}>
          <Sidebar
            active={tab}
            onNav={t => { setTab(t); setProfile(null); }}
            onAdd={() => setAddOpenDesktop(true)}
            currentUser={currentUser}
            plantsCount={plants.length}
            onLogout={handleLogout}
            onSettings={() => setSettingsOpen(true)}
          />
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {tab === 'today'  && <TodayDesktop plants={plants} onOpen={setProfile} onWater={onWater} onWaterAll={waterAll} currentUser={currentUser} />}
            {tab === 'plants' && <PlantsDesktop plants={plants} onOpen={setProfile} areas={areas} />}
            {(tab === 'growth' || tab === 'care') && <PlaceholderDesktop tab={tab} />}
            {live && <ProfilePanel plant={live} onClose={() => setProfile(null)} onWater={onWater} onEdit={setEditTarget} onDelete={setConfirmDeleteTarget} onLogGrowth={setGrowthTarget} />}
          </div>
          <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} currentUser={currentUser} onLogout={handleLogout} flash={flash} areas={areas} onAddArea={handleAddArea} onDeleteArea={handleDeleteArea} />
          <AddPlantModal isOpen={addOpenDesktop} onClose={() => setAddOpenDesktop(false)} onAdd={handleAddPlant} areas={areas} />
        </div>
      ) : (
        <div style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
          {!profile ? (
            <>
              {tab === 'today'  && <TodayScreen plants={plants} onOpen={setProfile} onWater={onWater} onWaterAll={waterAll} currentUser={currentUser} onSettings={() => setSettingsOpen(true)} />}
              {tab === 'plants' && <PlantsScreen plants={plants} onOpen={setProfile} areas={areas} />}
              {tab === 'growth' && <GrowthScreen plants={plants} onOpen={setProfile} />}
              {tab === 'care'   && <CareScreen plants={plants} onOpen={setProfile} />}
              <TabBar active={tab} onChange={t => { setTab(t); setProfile(null); }} onAdd={() => setAddOpen(true)} />
            </>
          ) : (
            <ProfileScreen plant={profile} onBack={() => setProfile(null)} onWater={onWater} onEdit={setEditTarget} onDelete={setConfirmDeleteTarget} onLogGrowth={setGrowthTarget} />
          )}

          {addOpen && <AddPlantScreen onAdd={handleAddPlant} onClose={() => setAddOpen(false)} areas={areas} />}
          {waterTarget && <WaterSheet plant={waterTarget} onConfirm={confirmWater} onClose={() => setWaterTarget(null)} />}
          <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} currentUser={currentUser} onLogout={handleLogout} flash={flash} areas={areas} onAddArea={handleAddArea} onDeleteArea={handleDeleteArea} />
        </div>
      )}

      {/* Overlays shared by both Desktop and Mobile layout */}
      {editTarget && isDesktop && (
        <EditPlantModal key={editTarget.id} isOpen={!!editTarget} onClose={() => setEditTarget(null)} plant={editTarget} onEdit={handleEditPlant} areas={areas} />
      )}
      {editTarget && !isDesktop && (
        <EditPlantScreen key={editTarget.id} plant={editTarget} onClose={() => setEditTarget(null)} onEdit={handleEditPlant} areas={areas} />
      )}

      {/* Delete confirmation modal */}
      {confirmDeleteTarget && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmDeleteTarget(null); }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 110,
            background: 'rgba(30, 42, 34, 0.4)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            animation: 'fadeIn .18s cubic-bezier(.22,.61,.36,1)',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 400,
              background: T.paper,
              borderRadius: 20,
              boxShadow: '0 20px 40px rgba(23, 61, 44, 0.15)',
              padding: 24,
              animation: 'slideUp .18s cubic-bezier(.22,.61,.36,1)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              fontFamily: T.sans,
            }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#F6E2DC', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon name="alertCircle" size={20} color="#BC5B49" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 18, color: T.ink }}>Delete {confirmDeleteTarget.name}?</h3>
                <p style={{ margin: '6px 0 0', fontSize: 14, color: T.ink3, lineHeight: 1.5 }}>This action cannot be undone. Are you sure you want to remove this plant from your garden?</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
              <button
                onClick={() => setConfirmDeleteTarget(null)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.ink2,
                  padding: '10px 16px', borderRadius: 999,
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const id = confirmDeleteTarget.id;
                  setConfirmDeleteTarget(null);
                  await handleDeletePlant(id);
                }}
                style={{
                  background: '#BC5B49', border: 'none', cursor: 'pointer',
                  fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: '#fff',
                  padding: '10px 20px', borderRadius: 999,
                  boxShadow: '0 4px 12px rgba(188, 91, 73, 0.25)',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {growthTarget && (
        <LogGrowthModal
          isOpen={!!growthTarget}
          onClose={() => setGrowthTarget(null)}
          plant={growthTarget}
          onLog={async (newHeight) => {
            const updatedGrowth = [...growthTarget.growth, newHeight];
            await handleEditPlant(growthTarget.id, { growth: updatedGrowth });
          }}
        />
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
}
