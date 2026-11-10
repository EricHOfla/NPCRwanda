'use client';

import React, { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type Profile = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
};

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function ProfileSettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropViewportRef = useRef<HTMLDivElement>(null);
  const cropImageRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const [profile, setProfile] = useState<Profile>({ id: '', name: '', email: '', role: 'EDITOR', avatar: '' });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [cropSource, setCropSource] = useState('');
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [cropDimensions, setCropDimensions] = useState({ width: 0, height: 0 });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/auth/profile', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Unable to load your profile.');
        if (active) setProfile(data);
      })
      .catch((error) => {
        if (active) setMessage({ type: 'danger', text: error.message || 'Unable to load your profile.' });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => () => { if (cropSource) URL.revokeObjectURL(cropSource); }, [cropSource]);

  useEffect(() => {
    if (!photoFile) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setMessage({ type: 'danger', text: 'Choose a JPG, PNG, or WebP image.' });
      event.target.value = '';
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setMessage({ type: 'danger', text: 'Profile photos must be 5 MB or smaller.' });
      event.target.value = '';
      return;
    }
    setMessage(null);
    if (cropSource) URL.revokeObjectURL(cropSource);
    setCropSource(URL.createObjectURL(file));
    setCropZoom(1);
    setCropOffset({ x: 0, y: 0 });
    setCropDimensions({ width: 0, height: 0 });
  };

  const handleCropPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!cropDimensions.width || !cropDimensions.height) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, offsetX: cropOffset.x, offsetY: cropOffset.y };
  };

  const handleCropPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || !cropSource) return;
    const viewSize = cropViewportRef.current?.clientWidth || 300;
    const baseScale = Math.max(viewSize / cropDimensions.width, viewSize / cropDimensions.height) * cropZoom;
    const renderedWidth = cropDimensions.width * baseScale;
    const renderedHeight = cropDimensions.height * baseScale;
    const maxX = Math.max(0, (renderedWidth - viewSize) / 2);
    const maxY = Math.max(0, (renderedHeight - viewSize) / 2);
    setCropOffset({
      x: Math.min(maxX, Math.max(-maxX, dragRef.current.offsetX + event.clientX - dragRef.current.x)),
      y: Math.min(maxY, Math.max(-maxY, dragRef.current.offsetY + event.clientY - dragRef.current.y)),
    });
  };

  const finishCrop = () => {
    const image = cropImageRef.current;
    if (!image || !image.naturalWidth || !image.naturalHeight) return;
    const size = 512;
    const viewSize = cropViewportRef.current?.clientWidth || 300;
    const baseScale = Math.max(viewSize / image.naturalWidth, viewSize / image.naturalHeight) * cropZoom;
    const renderedWidth = image.naturalWidth * baseScale;
    const renderedHeight = image.naturalHeight * baseScale;
    const offsetX = (viewSize - renderedWidth) / 2 + cropOffset.x;
    const offsetY = (viewSize - renderedHeight) / 2 + cropOffset.y;
    const sourceSize = viewSize / baseScale;
    const sourceX = Math.max(0, Math.min(image.naturalWidth - sourceSize, -offsetX / baseScale));
    const sourceY = Math.max(0, Math.min(image.naturalHeight - sourceSize, -offsetY / baseScale));
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    if (!context) {
      setMessage({ type: 'danger', text: 'Your browser could not prepare the cropped photo. Please try another image.' });
      return;
    }
    context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);
    canvas.toBlob((blob) => {
      if (!blob) {
        setMessage({ type: 'danger', text: 'Unable to create the cropped photo. Please try again.' });
        return;
      }
      const croppedFile = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg', lastModified: Date.now() });
      setPhotoFile(croppedFile);
      setCropSource('');
      setMessage(null);
    }, 'image/jpeg', 0.9);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (password && password.length < 6) {
      setMessage({ type: 'danger', text: 'Your new password must contain at least 6 characters.' });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ type: 'danger', text: 'The password confirmation does not match.' });
      return;
    }

    setSaving(true);
    try {
      let avatar = profile.avatar || '';
      if (photoFile) {
        const formData = new FormData();
        formData.append('file', photoFile);
        formData.append('folder', 'profile');
        formData.append('entity', profile.id || 'admin-profile');

        const uploadResponse = await fetch('/api/upload', { method: 'POST', body: formData });
        const uploadData = await uploadResponse.json().catch(() => ({}));
        if (!uploadResponse.ok || !uploadData.url) {
          throw new Error(uploadData.error || 'Profile photo upload failed.');
        }
        avatar = uploadData.url;
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          password: password || undefined,
          avatar,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to save profile changes.');

      setProfile(data.user);
      setPhotoFile(null);
      setPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: 'Your profile has been updated successfully.' });
      router.refresh();
    } catch (error) {
      setMessage({ type: 'danger', text: error instanceof Error ? error.message : 'Unable to save profile changes.' });
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = previewUrl || (profile.avatar
    ? profile.avatar.startsWith('http') || profile.avatar.startsWith('/')
      ? profile.avatar
      : `/assets/img/${profile.avatar}`
    : '/assets/img/avatar-1.svg');

  if (loading) {
    return (
      <main className="p-4 d-flex align-items-center justify-content-center" style={{ minHeight: '320px' }}>
        <div className="text-center text-muted">
          <i className="fas fa-circle-notch fa-spin fa-2x mb-3 text-primary" />
          <p className="small fw-semibold mb-0">Loading profile settings...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-3 p-md-4" style={{ background: '#F8FAFC', minHeight: '100%' }}>
      {cropSource && (
        <div role="dialog" aria-modal="true" aria-labelledby="crop-photo-title" className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3" style={{ zIndex: 2000, background: 'rgba(8, 20, 35, .72)' }}>
          <div className="bg-white rounded-4 shadow-lg p-3 p-md-4" style={{ width: '100%', maxWidth: '440px' }}>
            <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
              <div><h3 id="crop-photo-title" className="h5 fw-bold mb-1" style={{ color: '#102B49' }}>Crop profile photo</h3><p className="small text-muted mb-0">Drag to position your photo, then adjust the zoom.</p></div>
              <button type="button" className="btn-close" aria-label="Cancel crop" onClick={() => setCropSource('')} />
            </div>
            <div ref={cropViewportRef} onPointerDown={handleCropPointerDown} onPointerMove={handleCropPointerMove} onPointerUp={() => { dragRef.current = null; }} onPointerCancel={() => { dragRef.current = null; }} className="mx-auto position-relative overflow-hidden rounded-3" style={{ width: 'min(300px, 100%)', aspectRatio: '1 / 1', background: '#E2E8F0', cursor: 'grab', touchAction: 'none', userSelect: 'none' }}>
              <img ref={cropImageRef} src={cropSource} alt="Crop preview" draggable={false} onLoad={(event) => setCropDimensions({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} style={{ position: 'absolute', left: '50%', top: '50%', width: cropDimensions.width ? `${Math.max(300 / cropDimensions.width, 300 / cropDimensions.height) * cropDimensions.width}px` : 'auto', height: cropDimensions.height ? `${Math.max(300 / cropDimensions.width, 300 / cropDimensions.height) * cropDimensions.height}px` : 'auto', maxWidth: 'none', transform: `translate(calc(-50% + ${cropOffset.x}px), calc(-50% + ${cropOffset.y}px)) scale(${cropZoom})`, transformOrigin: 'center', pointerEvents: 'none' }} />
              <div className="position-absolute top-0 start-0 w-100 h-100" style={{ border: '2px solid rgba(255,255,255,.95)', boxShadow: '0 0 0 999px rgba(8,20,35,.16)', pointerEvents: 'none' }} />
            </div>
            <div className="mt-3">
              <div className="d-flex justify-content-between small fw-semibold mb-1"><label htmlFor="profile-photo-zoom">Zoom</label><span>{Math.round(cropZoom * 100)}%</span></div>
              <input id="profile-photo-zoom" type="range" className="form-range" min="1" max="3" step="0.05" value={cropZoom} onChange={(event) => { setCropZoom(Number(event.target.value)); setCropOffset({ x: 0, y: 0 }); }} />
            </div>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <button type="button" className="btn btn-light border" onClick={() => setCropSource('')}>Cancel</button>
              <button type="button" className="btn text-white fw-semibold" style={{ background: '#1E5A91' }} onClick={finishCrop} disabled={!cropDimensions.width}>Use this photo</button>
            </div>
          </div>
        </div>
      )}
      <div style={{ maxWidth: '980px', margin: '0 auto' }}>
        <div className="mb-4">
          <span className="small fw-bold text-uppercase" style={{ color: '#B7791F', letterSpacing: '1px' }}>Account</span>
          <h2 className="h3 fw-bold mb-1" style={{ color: '#0F172A' }}>Profile Settings</h2>
          <p className="text-muted mb-0">Manage your personal details, profile photo, and sign-in password.</p>
        </div>

        {message && (
          <div className={`alert alert-${message.type} d-flex align-items-center gap-2`} role="status">
            <i className={`fas ${message.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`} />
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <section className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-3 p-md-4">
              <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-start gap-4">
                <div className="text-center">
                  <img
                    src={avatarSrc}
                    alt="Profile photo preview"
                    className="rounded-circle border"
                    style={{ width: '116px', height: '116px', objectFit: 'cover', background: '#F1F5F9', borderColor: '#E2E8F0' }}
                    onError={(event) => { event.currentTarget.src = '/assets/img/avatar-1.svg'; }}
                  />
                </div>
                <div className="flex-grow-1 text-center text-sm-start">
                  <h3 className="h5 fw-bold mb-1" style={{ color: '#0F172A' }}>Profile photo</h3>
                  <p className="small text-muted mb-3">Choose a clear photo to identify your account across the admin dashboard.</p>
                  <div className="d-flex flex-wrap justify-content-center justify-content-sm-start gap-2">
                    <button type="button" className="btn btn-sm fw-semibold text-white" style={{ background: '#0F172A', borderColor: '#0F172A' }} onClick={() => fileInputRef.current?.click()}>
                      <i className="fas fa-upload me-2" />Choose photo from computer
                    </button>
                    {(photoFile || profile.avatar) && (
                      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => { setPhotoFile(null); setCropSource(''); setProfile((current) => ({ ...current, avatar: '' })); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
                        Remove photo
                      </button>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="d-none" onChange={handlePhotoChange} />
                  <small className="text-muted d-block mt-2">JPG, PNG, or WebP · Maximum 5 MB</small>
                  {photoFile && <small className="text-success d-block mt-1"><i className="fas fa-check-circle me-1" />{photoFile.name} selected</small>}
                </div>
              </div>
            </div>
          </section>

          <section className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-3 p-md-4">
              <h3 className="h5 fw-bold mb-3" style={{ color: '#0F172A' }}>Personal information</h3>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Full name</label>
                  <input className="form-control" value={profile.name} onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))} required minLength={2} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Email address</label>
                  <input type="email" className="form-control" value={profile.email} onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">System role</label>
                  <input className="form-control text-uppercase" value={profile.role.replace('_', ' ')} readOnly />
                  <small className="text-muted">Your access role is managed by the system administrator.</small>
                </div>
              </div>
            </div>
          </section>

          <section className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-3 p-md-4">
              <h3 className="h5 fw-bold mb-1" style={{ color: '#0F172A' }}>Change password</h3>
              <p className="small text-muted mb-3">Leave these fields empty if you do not want to change your password.</p>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">New password</label>
                  <input type="password" className="form-control" autoComplete="new-password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Confirm new password</label>
                  <input type="password" className="form-control" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Re-enter new password" />
                </div>
              </div>
            </div>
          </section>

          <div className="d-flex flex-wrap gap-2 justify-content-end">
            <button type="button" className="btn btn-light border px-4" onClick={() => router.push('/dashboard?tab=overview')}>Cancel</button>
            <button type="submit" className="btn px-4 fw-semibold text-white" style={{ background: '#0F172A', borderColor: '#0F172A' }} disabled={saving}>
              {saving ? <><i className="fas fa-spinner fa-spin me-2" />Saving...</> : <><i className="fas fa-floppy-disk me-2" />Save profile</>}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
