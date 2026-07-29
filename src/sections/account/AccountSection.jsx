import React, { useState } from 'react';
import I from '../../icons/icons.jsx';
import { Av, Modal, Toggle } from '../../components/index.jsx';

function AccountSection({theme,setTheme,showToast,onOpenNotifications,onOpenSupport}){
  const [tab,setTab]=useState("profile");
  const [notifs,setNotifs]=useState(true);
  const [twofa,setTwofa]=useState(false);
  const [bio,setBio]=useState(true);
  const [emailNotifs,setEmailNotifs]=useState(true);
  const [pwOpen,setPwOpen]=useState(false);
  const [pwCurrent,setPwCurrent]=useState("");
  const [pwNew,setPwNew]=useState("");
  const [pwConfirm,setPwConfirm]=useState("");

  const initialProfile={firstName:"Your",lastName:"Name",phone:"0801 234 5678",state:"Lagos",desc:"Smallholder farmer and agricultural investor focused on maize, rice, and tomato production across Northern and Southern Nigeria."};
  const [profile,setProfile]=useState(initialProfile);
  const isDirty=JSON.stringify(profile)!==JSON.stringify(initialProfile);
  function updateField(key,val){setProfile(p=>({...p,[key]:val}));}
  function saveProfile(){
    showToast("ok","Profile updated!");
  }

  function savePassword(){
    if(!pwCurrent||!pwNew||!pwConfirm){showToast("err","Please fill in all fields.");return;}
    if(pwNew!==pwConfirm){showToast("err","New passwords do not match.");return;}
    if(pwNew.length<8){showToast("err","Password must be at least 8 characters.");return;}
    setPwOpen(false);setPwCurrent("");setPwNew("");setPwConfirm("");
    showToast("ok","Password updated successfully!");
  }

  return(
    <div className="main">
      <div className="sub-hd">
        <button className={"sub-tab"+(tab==="profile"?" on":"")} onClick={()=>setTab("profile")}><I.User/>Profile</button>
        <button className={"sub-tab"+(tab==="settings"?" on":"")} onClick={()=>setTab("settings")}><I.Settings/>Settings</button>
      </div>
      <div className="scroll">
        {tab==="profile"&&<>
          <div className="acc-hero">
            <div className="ah">
              <div className="ah-av">YO</div>
              <div><div style={{fontFamily:"var(--fd)",fontSize:18,fontWeight:900,marginBottom:2}}>Your Name</div><div style={{fontSize:11.5,opacity:.7}}>Farmer and Investor · Nigeria</div><div style={{fontSize:12,opacity:.6,marginTop:2}}>yourname@email.com</div></div>
            </div>
            <div style={{position:"relative",zIndex:1,marginTop:14,display:"flex",gap:7}}>
              <button className="wc-btn"><I.Edit/>Edit Profile</button>
              <button className="wc-btn"><I.Shield/>Verified</button>
            </div>
          </div>
          <div className="stat-row">
            {[["💰","37,000","IST Balance"],["🌾","4","Investments"],["📈","28%","Avg ROI"],["🤝","12","Transactions"]].map(([ic,v,l])=>(
              <div key={l} className="stat-tile"><div className="stat-ico">{ic}</div><div className="stat-v">{v}</div><div className="stat-l">{l}</div></div>
            ))}
          </div>
          <div className="sh">Personal Information</div>
          <div className="form-row" style={{marginBottom:12}}>
            <div className="form-g"><label className="label">First Name</label><input className="field" value={profile.firstName} onChange={e=>updateField("firstName",e.target.value)}/></div>
            <div className="form-g"><label className="label">Last Name</label><input className="field" value={profile.lastName} onChange={e=>updateField("lastName",e.target.value)}/></div>
            <div className="form-g"><label className="label">Phone</label><input className="field" value={profile.phone} onChange={e=>updateField("phone",e.target.value)}/></div>
            <div className="form-g"><label className="label">State</label><input className="field" value={profile.state} onChange={e=>updateField("state",e.target.value)}/></div>
          </div>
          <div className="bio-card">
            <div className="bio-card-hd">
              <div className="bio-card-ico"><I.Edit/></div>
              <div>
                <div className="bio-card-title">Farm Description</div>
                <div className="bio-card-sub">Shown on your public profile to other farmers and investors</div>
              </div>
            </div>
            <textarea className="field textarea bio-textarea" value={profile.desc} onChange={e=>updateField("desc",e.target.value)} placeholder="Tell other farmers about your operation…"/>
            <div className="bio-card-count">{profile.desc.length} / 280</div>
          </div>
          <button className="btn btn-p btn-full btn-lg" onClick={saveProfile} disabled={!isDirty}><I.Check/>Save Changes</button>
        </>}
        {tab==="settings"&&<>
          <div className="set-group-lbl">Appearance</div>
          <div className="set-row" onClick={()=>setTheme(t=>t==="dark"?"light":"dark")}>
            <div className="set-left"><div className="set-ico">{theme==="dark"?<I.Sun/>:<I.Moon/>}</div><div><div className="set-t">{theme==="dark"?"Light Mode":"Dark Mode"}</div><div className="set-s">Currently using {theme} theme</div></div></div>
            <Toggle on={theme==="dark"} set={()=>setTheme(t=>t==="dark"?"light":"dark")}/>
          </div>

          <div className="set-group-lbl">Notifications</div>
          <div className="set-row" onClick={onOpenNotifications}>
            <div className="set-left"><div className="set-ico"><I.Bell/></div><div><div className="set-t">Notification Center</div><div className="set-s">View all recent alerts and updates</div></div></div>
            <I.ChevR style={{color:"var(--t5)",width:14,height:14}}/>
          </div>
          <div className="set-row">
            <div className="set-left"><div className="set-ico"><I.Bell/></div><div><div className="set-t">Push Notifications</div><div className="set-s">Farm updates, messages, returns</div></div></div>
            <Toggle on={notifs} set={setNotifs}/>
          </div>
          <div className="set-row">
            <div className="set-left"><div className="set-ico"><I.Package/></div><div><div className="set-t">Email Notifications</div><div className="set-s">Weekly summaries and receipts</div></div></div>
            <Toggle on={emailNotifs} set={setEmailNotifs}/>
          </div>

          <div className="set-group-lbl">Security</div>
          <div className="set-row" onClick={()=>setPwOpen(true)}>
            <div className="set-left"><div className="set-ico"><I.Edit/></div><div><div className="set-t">Change Password</div><div className="set-s">Update your login password</div></div></div>
            <I.ChevR style={{color:"var(--t5)",width:14,height:14}}/>
          </div>
          <div className="set-row">
            <div className="set-left"><div className="set-ico"><I.Shield/></div><div><div className="set-t">Two-Factor Authentication</div><div className="set-s">Extra security on login</div></div></div>
            <Toggle on={twofa} set={setTwofa}/>
          </div>
          <div className="set-row">
            <div className="set-left"><div className="set-ico"><I.Lock/></div><div><div className="set-t">Biometric Login</div><div className="set-s">Face ID or Fingerprint</div></div></div>
            <Toggle on={bio} set={setBio}/>
          </div>

          <div className="set-group-lbl">Account</div>
          <div className="set-row" onClick={()=>showToast("info","Export started — check your email shortly.")}>
            <div className="set-left"><div className="set-ico"><I.Package/></div><div><div className="set-t">Export My Data</div><div className="set-s">Download all your data as CSV</div></div></div>
            <I.ChevR style={{color:"var(--t5)",width:14,height:14}}/>
          </div>
          <div className="set-row" onClick={onOpenSupport}>
            <div className="set-left"><div className="set-ico"><I.Help/></div><div><div className="set-t">Help and Support</div><div className="set-s">FAQs, live chat, email support</div></div></div>
            <I.ChevR style={{color:"var(--t5)",width:14,height:14}}/>
          </div>

          <div style={{marginTop:14}}><button className="btn btn-d btn-full btn-lg" onClick={()=>showToast("info","Signed out.")}><I.LogOut/>Sign Out</button></div>
        </>}
      </div>

      {/* Change Password Modal */}
      <Modal open={pwOpen} onClose={()=>setPwOpen(false)} title="Change Password" sheet
        footer={<><button className="btn btn-g" onClick={()=>setPwOpen(false)}>Cancel</button><button className="btn btn-p" onClick={savePassword}><I.Check/>Update Password</button></>}>
        <div className="notice ni"><I.Info/><span>Use at least 8 characters with a mix of letters, numbers, and symbols for a strong password.</span></div>
        <div className="form-g"><label className="label">Current Password</label><input className="field" type="password" placeholder="Enter current password" value={pwCurrent} onChange={e=>setPwCurrent(e.target.value)}/></div>
        <div className="form-g"><label className="label">New Password</label><input className="field" type="password" placeholder="Enter new password" value={pwNew} onChange={e=>setPwNew(e.target.value)}/></div>
        <div className="form-g"><label className="label">Confirm New Password</label><input className="field" type="password" placeholder="Re-enter new password" value={pwConfirm} onChange={e=>setPwConfirm(e.target.value)}/></div>
      </Modal>
    </div>
  );
}

/* ============================================================
   SUPPORT SECTION
   ============================================================ */

export default AccountSection;
