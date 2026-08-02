import React, { useState, useEffect } from 'react';
import I from '../../icons/icons.jsx';
import { Av, Modal, Toggle } from '../../components/index.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { updateProfile, uploadProfileAvatar } from '../../services/profileService.js';
import { updatePassword } from '../../services/authService.js';

function AccountSection({ theme, setTheme, showToast, onOpenNotifications, onOpenSupport }) {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [tab, setTab] = useState('profile');
  const [notifs, setNotifs] = useState(true);
  const [twofa, setTwofa] = useState(false);
  const [bio, setBio] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pwOpen, setPwOpen] = useState(false);
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [stateName, setStateName] = useState('');
  const [desc, setDesc] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const names = (profile.full_name || '').split(' ');
    setFirstName(names[0] || '');
    setLastName(names.slice(1).join(' ') || '');
    setPhone(profile.phone || '');
    setStateName(profile.state || '');
    setDesc(profile.bio || '');
    setAvatarPreview(null);
  }, [profile]);

  const isDirty = profile && (
    firstName !== (profile.full_name?.split(' ')[0] || '') ||
    lastName !== profile.full_name?.split(' ').slice(1).join(' ') ||
    phone !== (profile.phone || '') ||
    stateName !== (profile.state || '') ||
    desc !== (profile.bio || '')
  );

  async function saveProfile() {
    if (!user?.id) return;
    try {
      await updateProfile(user.id, {
        full_name: [firstName, lastName].filter(Boolean).join(' ') || profile?.full_name,
        phone,
        state: stateName,
        bio: desc,
      });
      await refreshProfile();
      showToast('ok', 'Profile updated!');
    } catch (error) {
      console.error('Profile update error', error);
      showToast('err', 'Unable to update profile.');
    }
  }

  async function saveAvatar() {
    if (!user?.id || !avatarFile) return;
    setUploadingAvatar(true);
    try {
      await uploadProfileAvatar(user.id, avatarFile);
      await refreshProfile();
      setAvatarFile(null);
      setAvatarPreview(null);
      showToast('ok', 'Profile image updated!');
    } catch (error) {
      console.error('Avatar upload error', error);
      showToast('err', 'Unable to upload profile image.');
    } finally {
      setUploadingAvatar(false);
    }
  }

  function handleAvatarChange(file) {
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  }

  async function savePassword() {
    if (!pwCurrent || !pwNew || !pwConfirm) {
      showToast('err', 'Please fill in all fields.');
      return;
    }
    if (pwNew !== pwConfirm) {
      showToast('err', 'New passwords do not match.');
      return;
    }
    if (pwNew.length < 8) {
      showToast('err', 'Password must be at least 8 characters.');
      return;
    }
    try {
      await updatePassword(pwNew);
      setPwOpen(false);
      setPwCurrent('');
      setPwNew('');
      setPwConfirm('');
      showToast('ok', 'Password updated successfully!');
    } catch (error) {
      console.error('Password update error', error);
      showToast('err', 'Unable to update password.');
    }
  }

  return (
    <div className="main">
      <div className="sub-hd">
        <button className={"sub-tab" + (tab === 'profile' ? ' on' : '')} onClick={() => setTab('profile')}><I.User/>Profile</button>
        <button className={"sub-tab" + (tab === 'settings' ? ' on' : '')} onClick={() => setTab('settings')}><I.Settings/>Settings</button>
      </div>
      <div className="scroll">
        {tab === 'profile' && <>
          <div className="acc-hero">
            <div className="ah">
              <div className="ah-av">{profile?.initials || 'YO'}</div>
              <div><div style={{ fontFamily: 'var(--fd)', fontSize: 18, fontWeight: 900, marginBottom: 2 }}>{profile?.full_name || user?.user_metadata?.full_name || 'Your Name'}</div><div style={{ fontSize: 11.5, opacity: .7 }}>{profile?.role || 'Farmer and Investor · Nigeria'}</div><div style={{ fontSize: 12, opacity: .6, marginTop: 2 }}>{user?.email || 'you@example.com'}</div></div>
            </div>
            <div style={{ position: 'relative', zIndex: 1, marginTop: 14, display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              <button className="wc-btn" onClick={() => document.querySelector('input[type=file]')?.click()}><I.Edit/>Upload avatar</button>
              <button className="wc-btn"><I.Shield/>Verified</button>
            </div>
          </div>
          <div className="stat-row">
            {[['💰', '37,000', 'IST Balance'], ['🌾', '4', 'Investments'], ['📈', '28%', 'Avg ROI'], ['🤝', '12', 'Transactions']].map(([ic, v, l]) => (
              <div key={l} className="stat-tile"><div className="stat-ico">{ic}</div><div className="stat-v">{v}</div><div className="stat-l">{l}</div></div>
            ))}
          </div>
          <div className="sh">Personal Information</div>
          <div className="form-row" style={{ marginBottom: 12 }}>
            <div className="form-g"><label className="label">First Name</label><input className="field" value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
            <div className="form-g"><label className="label">Last Name</label><input className="field" value={lastName} onChange={e => setLastName(e.target.value)} /></div>
            <div className="form-g"><label className="label">Phone</label><input className="field" value={phone} onChange={e => setPhone(e.target.value)} /></div>
            <div className="form-g"><label className="label">State</label><input className="field" value={stateName} onChange={e => setStateName(e.target.value)} /></div>
          </div>
          <div className="bio-card">
            <div className="bio-card-hd">
              <div className="bio-card-ico"><I.Edit/></div>
              <div>
                <div className="bio-card-title">Farm Description</div>
                <div className="bio-card-sub">Shown on your public profile to other farmers and investors</div>
              </div>
            </div>
            <textarea className="field textarea bio-textarea" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Tell other farmers about your operation…" />
            <div className="bio-card-count">{desc.length} / 280</div>
          </div>
          <button className="btn btn-p btn-full btn-lg" onClick={saveProfile} disabled={!isDirty}><I.Check/>Save Changes</button>
        </>}

        {tab === 'settings' && <>
          <div className="set-group-lbl">Appearance</div>
          <div className="set-row" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
            <div className="set-left"><div className="set-ico">{theme === 'dark' ? <I.Sun/> : <I.Moon/>}</div><div><div className="set-t">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</div><div className="set-s">Currently using {theme} theme</div></div></div>
            <Toggle on={theme === 'dark'} set={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />
          </div>

          <div className="set-group-lbl">Notifications</div>
          <div className="set-row" onClick={onOpenNotifications}>
            <div className="set-left"><div className="set-ico"><I.Bell/></div><div><div className="set-t">Notification Center</div><div className="set-s">View all recent alerts and updates</div></div></div>
            <I.ChevR style={{ color: 'var(--t5)', width: 14, height: 14 }} />
          </div>
          <div className="set-row">
            <div className="set-left"><div className="set-ico"><I.Bell/></div><div><div className="set-t">Push Notifications</div><div className="set-s">Farm updates, messages, returns</div></div></div>
            <Toggle on={notifs} set={setNotifs} />
          </div>
          <div className="set-row">
            <div className="set-left"><div className="set-ico"><I.Package/></div><div><div className="set-t">Email Notifications</div><div className="set-s">Weekly summaries and receipts</div></div></div>
            <Toggle on={emailNotifs} set={setEmailNotifs} />
          </div>

          <div className="set-group-lbl">Security</div>
          <div className="set-row" onClick={() => setPwOpen(true)}>
            <div className="set-left"><div className="set-ico"><I.Edit/></div><div><div className="set-t">Change Password</div><div className="set-s">Update your login password</div></div></div>
            <I.ChevR style={{ color: 'var(--t5)', width: 14, height: 14 }} />
          </div>
          <div className="set-row">
            <div className="set-left"><div className="set-ico"><I.Shield/></div><div><div className="set-t">Two-Factor Authentication</div><div className="set-s">Extra security on login</div></div></div>
            <Toggle on={twofa} set={setTwofa} />
          </div>
          <div className="set-row">
            <div className="set-left"><div className="set-ico"><I.Lock/></div><div><div className="set-t">Biometric Login</div><div className="set-s">Face ID or Fingerprint</div></div></div>
            <Toggle on={bio} set={setBio} />
          </div>

          <div className="set-group-lbl">Account</div>
          <div className="set-row" onClick={() => showToast('info', 'Export started — check your email shortly.') }>
            <div className="set-left"><div className="set-ico"><I.Package/></div><div><div className="set-t">Export My Data</div><div className="set-s">Download all your data as CSV</div></div></div>
            <I.ChevR style={{ color: 'var(--t5)', width: 14, height: 14 }} />
          </div>
          <div className="set-row" onClick={onOpenSupport}>
            <div className="set-left"><div className="set-ico"><I.Help/></div><div><div className="set-t">Help and Support</div><div className="set-s">FAQs, live chat, email support</div></div></div>
            <I.ChevR style={{ color: 'var(--t5)', width: 14, height: 14 }} />
          </div>

          <div style={{ marginTop: 14 }}><button className="btn btn-d btn-full btn-lg" onClick={() => { signOut(); showToast('info', 'Signed out.'); }}><I.LogOut/>Sign Out</button></div>
        </>}
      </div>

      <Modal open={pwOpen} onClose={() => setPwOpen(false)} title="Change Password" sheet
        footer={<><button className="btn btn-g" onClick={() => setPwOpen(false)}>Cancel</button><button className="btn btn-p" onClick={savePassword}><I.Check/>Update Password</button></>}>
        <div className="notice ni"><I.Info/><span>Use at least 8 characters with a mix of letters, numbers, and symbols for a strong password.</span></div>
        <div className="form-g"><label className="label">Current Password</label><input className="field" type="password" placeholder="Enter current password" value={pwCurrent} onChange={e => setPwCurrent(e.target.value)} /></div>
        <div className="form-g"><label className="label">New Password</label><input className="field" type="password" placeholder="Enter new password" value={pwNew} onChange={e => setPwNew(e.target.value)} /></div>
        <div className="form-g"><label className="label">Confirm New Password</label><input className="field" type="password" placeholder="Re-enter new password" value={pwConfirm} onChange={e => setPwConfirm(e.target.value)} /></div>
      </Modal>
    </div>
  );
}

export default AccountSection;
