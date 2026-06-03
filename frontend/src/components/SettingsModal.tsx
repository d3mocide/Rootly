import React, { useState } from 'react';
import { T } from '../tokens';
import { Button, Icon } from './index';
import { apiChangePassword } from '../api/auth';
import type { UserResponse } from '../api/auth';
import { getDisplayName } from '../api/auth';
import type { Area } from '../types/area';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserResponse | null;
  onLogout: () => void;
  flash: (msg: string) => void;
  areas: Area[];
  onAddArea: (name: string) => Promise<void>;
  onDeleteArea: (id: string) => Promise<void>;
}

export function SettingsModal({ isOpen, onClose, currentUser, onLogout, flash, areas, onAddArea, onDeleteArea }: SettingsModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [newAreaName, setNewAreaName] = useState('');
  const [areaError, setAreaError] = useState<string | null>(null);
  const [areaLoading, setAreaLoading] = useState(false);

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

    if (!currentPassword) {
      setError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await apiChangePassword(currentPassword, newPassword);
      setSuccess('Password updated successfully!');
      flash('Password updated successfully!');
      // Clear inputs
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // Auto close after brief delay
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to change password. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: T.sans,
    fontSize: 13.5,
    fontWeight: 600,
    color: T.ink2,
    marginBottom: 6,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    fontFamily: T.sans,
    fontSize: 15,
    padding: '12px 16px',
    borderRadius: 12,
    border: `1.5px solid ${T.stone300}`,
    background: T.card,
    color: T.ink,
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color .18s cubic-bezier(.22,.61,.36,1)',
  };

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
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
          maxWidth: 460,
          background: T.paper,
          borderRadius: 20,
          boxShadow: '0 20px 40px rgba(23, 61, 44, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          animation: 'slideUp .18s cubic-bezier(.22,.61,.36,1)',
          overflow: 'hidden',
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
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: T.stone100,
              border: 'none',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
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
                fontFamily: T.sans,
                fontSize: 12,
                fontWeight: 700,
                color: T.canopy,
                background: T.sprout,
                padding: '4px 10px',
                borderRadius: 999,
                textTransform: 'capitalize',
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
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = T.canopy}
                onBlur={e => e.currentTarget.style.borderColor = T.stone300}
              />
            </div>

            <div>
              <label style={labelStyle}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = T.canopy}
                onBlur={e => e.currentTarget.style.borderColor = T.stone300}
              />
            </div>

            <div>
              <label style={labelStyle}>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = T.canopy}
                onBlur={e => e.currentTarget.style.borderColor = T.stone300}
              />
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

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading ? 'Updating...' : 'Save Password'}
            </Button>
          </form>

          {/* Areas section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, borderTop: `1px solid ${T.stone100}`, paddingTop: 20 }}>
            <h3 style={{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: 17, color: T.ink }}>Locations</h3>
            
            {/* List of current areas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {areas.map(area => (
                <div key={area.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.card, padding: '10px 14px', borderRadius: 12, border: `1px solid ${T.stone100}` }}>
                  <span style={{ fontFamily: T.sans, fontSize: 14.5, fontWeight: 600, color: T.ink }}>{area.name}</span>
                  <button
                    type="button"
                    onClick={() => onDeleteArea(area.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'grid',
                      placeItems: 'center',
                      padding: 2,
                    }}
                  >
                    <Icon name="x" size={16} color={T.ink3} stroke={2} />
                  </button>
                </div>
              ))}
              {areas.length === 0 && (
                <div style={{ fontFamily: T.sans, fontSize: 13.5, color: T.ink3, fontStyle: 'italic' }}>
                  No custom locations yet.
                </div>
              )}
            </div>

            {/* Add area form */}
            <form onSubmit={handleAddAreaSubmit} style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                value={newAreaName}
                onChange={e => setNewAreaName(e.target.value)}
                placeholder="New location name"
                style={{ ...inputStyle, flex: 1 }}
                onFocus={e => e.currentTarget.style.borderColor = T.fern}
                onBlur={e => e.currentTarget.style.borderColor = T.stone300}
              />
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
        </div>

        {/* Footer actions */}
        <div style={{ padding: '16px 24px 24px', background: T.card, borderTop: `1px solid ${T.stone100}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button
            variant="secondary"
            icon="logOut"
            full
            onClick={() => {
              onClose();
              onLogout();
            }}
            style={{ color: '#BC5B49', borderColor: T.stone300 }}
          >
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
