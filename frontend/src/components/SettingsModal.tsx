import React, { useState, useEffect } from 'react';
import { T } from '../tokens';
import { Button, Icon } from './index';
import { apiChangePassword, updatePreferences } from '../api/auth';
import type { UserResponse } from '../api/auth';
import { getDisplayName } from '../api/auth';
import type { Area } from '../types/area';
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  getAdminSettings,
  updateAdminSettings,
} from '../api/admin';
import { setLayoutDebugEnabled, readLayoutDebugEnabled } from '../utils/layoutDebug';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserResponse | null;
  onUpdateUser: (user: UserResponse) => void;
  onLogout: () => void;
  flash: (msg: string) => void;
  areas: Area[];
  onAddArea: (name: string) => Promise<void>;
  onDeleteArea: (id: string) => Promise<void>;
}

export function SettingsModal({ isOpen, onClose, currentUser, onUpdateUser, onLogout, flash, areas, onAddArea, onDeleteArea }: SettingsModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [newAreaName, setNewAreaName] = useState('');
  const [areaError, setAreaError] = useState<string | null>(null);
  const [areaLoading, setAreaLoading] = useState(false);

  // Admin state
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [signupsEnabled, setSignupsEnabled] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('operator');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Developer tools
  const [layoutDebug, setLayoutDebug] = useState(readLayoutDebugEnabled);

  const isAdmin = currentUser?.role === 'admin';

  const toggleLayoutDebug = () => {
    const next = !layoutDebug;
    setLayoutDebug(next);
    setLayoutDebugEnabled(next);
    flash(next ? 'Layout diagnostics on — tap the DBG button.' : 'Layout diagnostics off.');
  };

  useEffect(() => {
    if (isOpen && isAdmin) {
      setAdminLoading(true);
      Promise.all([listUsers(), getAdminSettings()])
        .then(([us, s]) => {
          setUsers(us);
          setSignupsEnabled(s.signups_enabled);
        })
        .catch(() => {})
        .finally(() => setAdminLoading(false));
    }
  }, [isOpen, isAdmin]);

  const handleAddAreaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaName.trim()) return;
    setAreaError(null);
    setAreaLoading(true);
    try {
      await onAddArea(newAreaName.trim());
      setNewAreaName('');
    } catch (err: unknown) {
      setAreaError(err instanceof Error ? err.message : 'Failed to add location.');
    } finally {
      setAreaLoading(false);
    }
  };

  if (!isOpen) return null;

  const displayName = currentUser ? getDisplayName(currentUser) : 'Guest';
  const avatarLetter = displayName[0]?.toUpperCase() || '?';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!currentPassword) { setError('Please enter your current password.'); return; }
    if (newPassword.length < 8) { setError('New password must be at least 8 characters long.'); return; }
    if (newPassword !== confirmPassword) { setError('New passwords do not match.'); return; }
    setLoading(true);
    try {
      await apiChangePassword(currentPassword, newPassword);
      setSuccess('Password updated successfully!');
      flash('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => { onClose(); setSuccess(null); }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const units = currentUser?.units ?? 'imperial';

  const handleUnitsChange = async (next: 'imperial' | 'metric') => {
    if (!currentUser || next === currentUser.units) return;
    try {
      const updated = await updatePreferences(next);
      onUpdateUser(updated);
      flash(next === 'imperial' ? 'Switched to imperial units' : 'Switched to metric units');
    } catch {
      flash('Failed to update units');
    }
  };

  const handleToggleSignups = async () => {
    const next = !signupsEnabled;
    setSignupsEnabled(next);
    try {
      await updateAdminSettings({ signups_enabled: next });
      flash(`Signups ${next ? 'enabled' : 'disabled'}`);
    } catch {
      setSignupsEnabled(!next);
      flash('Failed to update setting');
    }
  };

  const handleToggleActive = async (user: UserResponse) => {
    const next = !user.is_active;
    setUsers(us => us.map(u => u.id === user.id ? { ...u, is_active: next } : u));
    try {
      await updateUser(user.id, { is_active: next });
      flash(`${getDisplayName(user)} ${next ? 'enabled' : 'disabled'}`);
    } catch (err: unknown) {
      setUsers(us => us.map(u => u.id === user.id ? { ...u, is_active: !next } : u));
      flash(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const handleChangeRole = async (user: UserResponse, role: string) => {
    setUsers(us => us.map(u => u.id === user.id ? { ...u, role } : u));
    try {
      await updateUser(user.id, { role });
    } catch (err: unknown) {
      setUsers(us => us.map(u => u.id === user.id ? { ...u, role: user.role } : u));
      flash(err instanceof Error ? err.message : 'Failed to update role');
    }
  };

  const handleDeleteUser = async (id: string) => {
    setDeleteConfirmId(null);
    try {
      await deleteUser(id);
      setUsers(us => us.filter(u => u.id !== id));
      flash('User deleted');
    } catch (err: unknown) {
      flash(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateLoading(true);
    try {
      const u = await createUser(newUserEmail, newUserPassword, newUserName.trim() || undefined, newUserRole);
      setUsers(us => [...us, u]);
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserName('');
      setNewUserRole('operator');
      flash(`Created account for ${getDisplayName(u)}`);
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontFamily: T.sans, fontSize: 13.5,
    fontWeight: 600, color: T.ink2, marginBottom: 6,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', fontFamily: T.sans, fontSize: 15,
    padding: '12px 16px', borderRadius: 12,
    border: `1.5px solid ${T.stone300}`, background: T.card,
    color: T.ink, boxSizing: 'border-box', outline: 'none',
    transition: 'border-color .18s cubic-bezier(.22,.61,.36,1)',
  };

  const smallInputStyle: React.CSSProperties = {
    ...inputStyle, fontSize: 14, padding: '10px 14px', borderRadius: 10,
  };

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(30, 42, 34, 0.4)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, animation: 'fadeIn .18s cubic-bezier(.22,.61,.36,1)',
      }}
    >
      <div
        style={{
          width: '100%', maxWidth: 460, background: T.paper,
          borderRadius: 20, boxShadow: '0 20px 40px rgba(23, 61, 44, 0.15)',
          display: 'flex', flexDirection: 'column', maxHeight: '90vh',
          animation: 'slideUp .18s cubic-bezier(.22,.61,.36,1)', overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px 16px', borderBottom: `1px solid ${T.stone100}` }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 22, color: T.ink, letterSpacing: '-0.02em' }}>Settings</h2>
            <div style={{ fontFamily: T.sans, fontSize: 13, color: T.ink3, marginTop: 2 }}>Manage your account and security</div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: '50%', background: T.stone100,
              border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center',
              transition: 'background .14s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = T.stone200}
            onMouseLeave={e => e.currentTarget.style.background = T.stone100}
          >
            <Icon name="x" size={18} color={T.ink2} stroke={2} />
          </button>
        </div>

        <div style={{ padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* User info card */}
          {currentUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: T.card, padding: 16, borderRadius: 16, border: `1px solid ${T.stone100}` }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: T.sun, display: 'grid', placeItems: 'center', fontFamily: T.display, fontWeight: 700, color: '#3a2c12', fontSize: 18, flexShrink: 0 }}>
                {avatarLetter}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: T.sans, fontSize: 15.5, fontWeight: 700, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName}
                </div>
                <div style={{ fontFamily: T.sans, fontSize: 13, color: T.ink3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>
                  {currentUser.email}
                </div>
              </div>
              <span style={{
                fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.canopy,
                background: T.sprout, padding: '4px 10px', borderRadius: 999, textTransform: 'capitalize',
              }}>
                {currentUser.role}
              </span>
            </div>
          )}

          {/* Change password form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ margin: '0 0 4px', fontFamily: T.display, fontWeight: 700, fontSize: 17, color: T.ink }}>Security</h3>
            <div>
              <label style={labelStyle}>Current Password</label>
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Enter current password" style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = T.canopy}
                onBlur={e => e.currentTarget.style.borderColor = T.stone300} />
            </div>
            <div>
              <label style={labelStyle}>New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters" style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = T.canopy}
                onBlur={e => e.currentTarget.style.borderColor = T.stone300} />
            </div>
            <div>
              <label style={labelStyle}>Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password" style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = T.canopy}
                onBlur={e => e.currentTarget.style.borderColor = T.stone300} />
            </div>
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F6E2DC', color: '#BC5B49', padding: '10px 14px', borderRadius: 10, fontFamily: T.sans, fontSize: 13.5, fontWeight: 600 }}>
                <Icon name="alertCircle" size={16} color="#BC5B49" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: T.successSoft, color: T.success, padding: '10px 14px', borderRadius: 10, fontFamily: T.sans, fontSize: 13.5, fontWeight: 600 }}>
                <Icon name="check" size={16} color={T.success} />
                <span>{success}</span>
              </div>
            )}
            <Button type="submit" variant="primary" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? 'Updating...' : 'Save Password'}
            </Button>
          </form>

          {/* Preferences section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, borderTop: `1px solid ${T.stone100}`, paddingTop: 20 }}>
            <h3 style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 17, color: T.ink }}>Preferences</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.card, padding: '14px 16px', borderRadius: 14, border: `1px solid ${T.stone100}` }}>
              <div>
                <div style={{ fontFamily: T.sans, fontSize: 14.5, fontWeight: 600, color: T.ink }}>Measurement units</div>
                <div style={{ fontFamily: T.sans, fontSize: 12.5, color: T.ink3, marginTop: 2 }}>
                  {units === 'imperial' ? 'Inches and °F' : 'Centimetres and °C'}
                </div>
              </div>
              <div style={{ display: 'flex', background: T.stone100, borderRadius: 999, padding: 3, flexShrink: 0 }}>
                {(['imperial', 'metric'] as const).map(u => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => handleUnitsChange(u)}
                    style={{
                      fontFamily: T.sans, fontSize: 12.5, fontWeight: 700, textTransform: 'capitalize',
                      padding: '6px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
                      background: units === u ? T.card : 'transparent',
                      color: units === u ? T.canopy : T.ink3,
                      boxShadow: units === u ? '0 1px 3px rgba(30,42,34,.12)' : 'none',
                      transition: 'all .14s cubic-bezier(.22,.61,.36,1)',
                    }}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Developer section — admins only */}
          {isAdmin && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, borderTop: `1px solid ${T.stone100}`, paddingTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 17, color: T.ink }}>Developer</h3>
              <span style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.canopy, background: T.sprout, padding: '3px 9px', borderRadius: 999 }}>Admin</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.card, padding: '14px 16px', borderRadius: 14, border: `1px solid ${T.stone100}` }}>
              <div style={{ paddingRight: 12 }}>
                <div style={{ fontFamily: T.sans, fontSize: 14.5, fontWeight: 600, color: T.ink }}>Layout diagnostics</div>
                <div style={{ fontFamily: T.sans, fontSize: 12.5, color: T.ink3, marginTop: 2 }}>
                  Overlay safe-area insets, viewport units &amp; DOM layers to debug PWA spacing.
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={layoutDebug}
                onClick={toggleLayoutDebug}
                style={{
                  flexShrink: 0, width: 46, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: layoutDebug ? T.canopy : T.stone200, padding: 3,
                  display: 'flex', justifyContent: layoutDebug ? 'flex-end' : 'flex-start',
                  transition: 'background .18s cubic-bezier(.22,.61,.36,1)',
                }}
              >
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: T.card, boxShadow: '0 1px 3px rgba(30,42,34,.25)' }} />
              </button>
            </div>
          </div>
          )}

          {/* Areas section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, borderTop: `1px solid ${T.stone100}`, paddingTop: 20 }}>
            <h3 style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 17, color: T.ink }}>Locations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {areas.map(area => (
                <div key={area.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.card, padding: '10px 14px', borderRadius: 12, border: `1px solid ${T.stone100}` }}>
                  <span style={{ fontFamily: T.sans, fontSize: 14.5, fontWeight: 600, color: T.ink }}>{area.name}</span>
                  <button type="button" onClick={() => onDeleteArea(area.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', padding: 2 }}>
                    <Icon name="x" size={16} color={T.ink3} stroke={2} />
                  </button>
                </div>
              ))}
              {areas.length === 0 && (
                <div style={{ fontFamily: T.sans, fontSize: 13.5, color: T.ink3, fontStyle: 'italic' }}>No custom locations yet.</div>
              )}
            </div>
            <form onSubmit={handleAddAreaSubmit} style={{ display: 'flex', gap: 10 }}>
              <input type="text" value={newAreaName} onChange={e => setNewAreaName(e.target.value)}
                placeholder="New location name" style={{ ...inputStyle, flex: 1 }}
                onFocus={e => e.currentTarget.style.borderColor = T.fern}
                onBlur={e => e.currentTarget.style.borderColor = T.stone300} />
              <Button type="submit" variant="secondary" disabled={areaLoading || !newAreaName.trim()} style={{ padding: '0 18px', height: 45, borderRadius: 12 }}>
                {areaLoading ? '...' : 'Add'}
              </Button>
            </form>
            {areaError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F6E2DC', color: '#BC5B49', padding: '10px 14px', borderRadius: 10, fontFamily: T.sans, fontSize: 13.5, fontWeight: 600 }}>
                <Icon name="alertCircle" size={16} color="#BC5B49" />
                <span>{areaError}</span>
              </div>
            )}
          </div>

          {/* Admin: User Management — only visible to admins */}
          {isAdmin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, borderTop: `1px solid ${T.stone100}`, paddingTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 17, color: T.ink }}>User Management</h3>
                <span style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.canopy, background: T.sprout, padding: '3px 9px', borderRadius: 999 }}>Admin</span>
              </div>

              {/* Signups toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.card, padding: '14px 16px', borderRadius: 14, border: `1px solid ${T.stone100}` }}>
                <div>
                  <div style={{ fontFamily: T.sans, fontSize: 14.5, fontWeight: 600, color: T.ink }}>Allow new signups</div>
                  <div style={{ fontFamily: T.sans, fontSize: 12.5, color: T.ink3, marginTop: 2 }}>
                    {signupsEnabled ? 'Anyone can create an account' : 'Only admins can create accounts'}
                  </div>
                </div>
                <button
                  onClick={handleToggleSignups}
                  style={{
                    width: 44, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer',
                    background: signupsEnabled ? T.fern : T.stone300,
                    position: 'relative', flexShrink: 0,
                    transition: 'background .18s cubic-bezier(.22,.61,.36,1)',
                  }}
                >
                  <span style={{
                    position: 'absolute', top: 3, left: signupsEnabled ? 21 : 3,
                    width: 20, height: 20, borderRadius: '50%', background: '#fff',
                    boxShadow: '0 1px 4px rgba(0,0,0,.18)',
                    transition: 'left .18s cubic-bezier(.22,.61,.36,1)',
                  }} />
                </button>
              </div>

              {/* User list */}
              {adminLoading ? (
                <div style={{ fontFamily: T.sans, fontSize: 13.5, color: T.ink3, textAlign: 'center', padding: '12px 0' }}>Loading users…</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {users.map(user => (
                    <div key={user.id} style={{
                      background: T.card, borderRadius: 14, border: `1px solid ${T.stone100}`,
                      padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8,
                      opacity: user.is_active ? 1 : 0.6,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%', background: T.sun,
                          display: 'grid', placeItems: 'center', fontFamily: T.display,
                          fontWeight: 700, color: '#3a2c12', fontSize: 14, flexShrink: 0,
                        }}>
                          {(getDisplayName(user)[0] || '?').toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 700, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {getDisplayName(user)}
                            {user.id === currentUser?.id && <span style={{ fontWeight: 400, color: T.ink3, marginLeft: 6 }}>(you)</span>}
                          </div>
                          <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user.email}
                          </div>
                        </div>
                        {/* Role selector */}
                        <select
                          value={user.role}
                          disabled={user.id === currentUser?.id}
                          onChange={e => handleChangeRole(user, e.target.value)}
                          style={{
                            fontFamily: T.sans, fontSize: 12, fontWeight: 700,
                            color: T.canopy, background: T.sprout,
                            border: 'none', borderRadius: 999, padding: '4px 10px',
                            cursor: user.id === currentUser?.id ? 'default' : 'pointer',
                            outline: 'none', appearance: 'none', textTransform: 'capitalize',
                          }}
                        >
                          <option value="operator">Operator</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      {user.id !== currentUser?.id && (
                        <div style={{ display: 'flex', gap: 8, paddingLeft: 44 }}>
                          {/* Active toggle */}
                          <button
                            onClick={() => handleToggleActive(user)}
                            style={{
                              fontFamily: T.sans, fontSize: 12, fontWeight: 600,
                              padding: '5px 12px', borderRadius: 999, border: 'none',
                              cursor: 'pointer',
                              background: user.is_active ? T.stone100 : T.sprout,
                              color: user.is_active ? T.ink2 : T.canopy,
                              transition: 'all .14s',
                            }}
                          >
                            {user.is_active ? 'Disable' : 'Enable'}
                          </button>
                          {/* Delete */}
                          {deleteConfirmId === user.id ? (
                            <>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 999, border: 'none', cursor: 'pointer', background: '#BC5B49', color: '#fff' }}
                              >
                                Confirm delete
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 999, border: 'none', cursor: 'pointer', background: T.stone100, color: T.ink2 }}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(user.id)}
                              style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 999, border: 'none', cursor: 'pointer', background: '#F6E2DC', color: '#BC5B49' }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Create new user */}
              <div style={{ borderTop: `1px solid ${T.stone100}`, paddingTop: 16 }}>
                <h4 style={{ margin: '0 0 12px', fontFamily: T.display, fontWeight: 700, fontSize: 15, color: T.ink }}>Create account</h4>
                <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)}
                    placeholder="Display name (optional)" style={smallInputStyle}
                    onFocus={e => e.currentTarget.style.borderColor = T.fern}
                    onBlur={e => e.currentTarget.style.borderColor = T.stone300} />
                  <input type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)}
                    placeholder="Email address" required style={smallInputStyle}
                    onFocus={e => e.currentTarget.style.borderColor = T.fern}
                    onBlur={e => e.currentTarget.style.borderColor = T.stone300} />
                  <input type="password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)}
                    placeholder="Password (min 8 chars)" required minLength={8} style={smallInputStyle}
                    onFocus={e => e.currentTarget.style.borderColor = T.fern}
                    onBlur={e => e.currentTarget.style.borderColor = T.stone300} />
                  <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)}
                    style={{ ...smallInputStyle, cursor: 'pointer', appearance: 'auto' }}>
                    <option value="operator">Operator</option>
                    <option value="admin">Admin</option>
                  </select>
                  {createError && (
                    <div style={{ fontFamily: T.sans, fontSize: 13, color: '#BC5B49', background: '#F6E2DC', borderRadius: 10, padding: '8px 12px' }}>
                      {createError}
                    </div>
                  )}
                  <Button type="submit" variant="secondary" disabled={createLoading || !newUserEmail || !newUserPassword}>
                    {createLoading ? 'Creating…' : 'Create account'}
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div style={{ padding: '16px 24px 24px', background: T.card, borderTop: `1px solid ${T.stone100}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button variant="secondary" icon="logOut" full onClick={() => { onClose(); onLogout(); }} style={{ color: '#BC5B49', borderColor: T.stone300 }}>
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
