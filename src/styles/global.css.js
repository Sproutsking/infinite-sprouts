const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');

*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

:root {
  --fd:'Bricolage Grotesque',sans-serif;
  --fb:'DM Sans',sans-serif;
  --fm:'DM Mono',monospace;

  --g950:#020c02; --g900:#051405; --g850:#0a1f0a; --g800:#0c260c;
  --g750:#102e10; --g700:#163d16; --g650:#1a4a1a; --g600:#1e5a1e;
  --g550:#235523; --g500:#267326; --g450:#2d8a2d; --g400:#38a038;
  --g350:#4db84d; --g300:#72cb72; --g200:#a8dfa8; --g100:#d0efd0; --g50:#eaf7ea;

  --gold:#d4901a; --gold-l:rgba(212,144,26,.12); --gold-b:#e8a830;
  --blue:#3b82f6; --blue-l:rgba(59,130,246,.12); --blue-b:#60a5fa;
  --red:#ef4444; --red-l:rgba(239,68,68,.12); --red-b:#f87171;
  --purple:#a855f7; --purple-l:rgba(168,85,247,.12);
  --teal:#14b8a6; --teal-l:rgba(20,184,166,.12);

  --hh:54px;
  --sw-desk:220px;
  --sw-tab:72px;
  --bn-h:62px;

  --bg:#f2f7f2; --sf:#ffffff; --sf2:#f7fbf7; --sf3:#eef6ee; --sf4:#e5f2e5;
  --bd:rgba(22,61,22,.08); --bd2:rgba(22,61,22,.14); --bd3:rgba(22,61,22,.24); --bd4:rgba(22,61,22,.38);
  --t1:#080f08; --t2:#163016; --t3:#2d5a2d; --t4:#527052; --t5:#8aaa8a; --t6:#b8ceb8;
  --ac:var(--g450); --ach:var(--g400); --acl:var(--g500);
  --as:rgba(56,160,56,.07); --as2:rgba(56,160,56,.13); --as3:rgba(56,160,56,.20);

  --s1:0 1px 2px rgba(0,0,0,.04),0 1px 4px rgba(0,0,0,.04);
  --s2:0 2px 8px rgba(0,0,0,.06),0 1px 3px rgba(0,0,0,.04);
  --s3:0 4px 16px rgba(0,0,0,.08),0 2px 6px rgba(0,0,0,.04);
  --s4:0 8px 32px rgba(0,0,0,.12),0 4px 12px rgba(0,0,0,.06);
  --s5:0 16px 48px rgba(0,0,0,.16),0 8px 20px rgba(0,0,0,.08);

  --r6:6px; --r8:8px; --r10:10px; --r12:12px; --r14:14px;
  --r16:16px; --r20:20px; --r24:24px; --rf:9999px;
}

[data-theme=dark] {
  --bg:#060d06; --sf:#0c150c; --sf2:#101910; --sf3:#152015; --sf4:#1a281a;
  --bd:rgba(72,200,72,.07); --bd2:rgba(72,200,72,.13); --bd3:rgba(72,200,72,.22); --bd4:rgba(72,200,72,.36);
  --t1:#e8f5e8; --t2:#b8d8b8; --t3:#7aaa7a; --t4:#4e7a4e; --t5:#2e5a2e; --t6:#1e3e1e;
  --ac:var(--g350); --ach:var(--g300); --acl:var(--g400);
  --as:rgba(77,184,77,.07); --as2:rgba(77,184,77,.13); --as3:rgba(77,184,77,.20);
  --s1:0 1px 2px rgba(0,0,0,.2),0 1px 4px rgba(0,0,0,.2);
  --s2:0 2px 8px rgba(0,0,0,.3),0 1px 3px rgba(0,0,0,.2);
  --s3:0 4px 16px rgba(0,0,0,.4),0 2px 6px rgba(0,0,0,.2);
  --s4:0 8px 32px rgba(0,0,0,.5),0 4px 12px rgba(0,0,0,.3);
  --s5:0 16px 48px rgba(0,0,0,.6),0 8px 20px rgba(0,0,0,.35);
}

html, body, #root {
  height:100%; height:100dvh; font-family:var(--fb); background:var(--bg);
  color:var(--t1); font-size:13px; line-height:1.5;
  -webkit-font-smoothing:antialiased; overflow:hidden;
}

/* ---- HIDE ALL SCROLLBARS (but keep scroll) ---- */
* { scrollbar-width:none !important; }
*::-webkit-scrollbar { display:none !important; }
.shell {
  display:grid;
  grid-template-rows:var(--hh) 1fr;
  grid-template-columns:var(--sw-desk) 1fr;
  grid-template-areas:"hd hd" "sb main";
  height:100vh; height:100dvh; overflow:hidden;
}
/* TABLET: icon+label column sidebar */
@media(max-width:1024px) and (min-width:601px){
  .shell {
    grid-template-columns:var(--sw-tab) 1fr;
    grid-template-areas:"hd hd" "sb main";
    grid-template-rows:var(--hh) 1fr;
  }
}
/* MOBILE: bottom nav */
@media(max-width:600px){
  .shell {
    grid-template-columns:1fr;
    grid-template-rows:var(--hh) 1fr auto;
    grid-template-areas:"hd" "main" "sb";
  }
}
.root-hd {
  grid-area:hd; height:var(--hh);
  background:var(--sf); border-bottom:1px solid var(--bd);
  display:flex; align-items:center; padding:0 14px; gap:10px;
  position:sticky; top:0; z-index:300;
}
.hd-left { display:flex; align-items:center; gap:8px; flex:1; }
.hd-center {
  position:absolute; left:50%; transform:translateX(-50%);
  font-family:var(--fd); font-size:13px; font-weight:700;
  color:var(--t2); letter-spacing:-.2px; white-space:nowrap; pointer-events:none;
}
.hd-right { display:flex; align-items:center; gap:3px; margin-left:auto; }

/* Profile button */
.profile-wrap { position:relative; }
.profile-btn {
  width:34px; height:34px; border-radius:var(--rf);
  background:linear-gradient(135deg,var(--g500),var(--g350));
  color:#fff; font-family:var(--fd); font-size:11px; font-weight:800;
  border:none; display:flex; align-items:center; justify-content:center;
  cursor:pointer; transition:all .2s; flex-shrink:0;
  box-shadow:0 0 0 2px var(--as3),0 2px 8px rgba(45,138,45,.25);
}
.profile-btn:hover { transform:scale(1.06); }

.auth-shell {
  min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px;
  background:radial-gradient(circle at top left, rgba(38,179,255,.18), transparent 28%),
             radial-gradient(circle at top right, rgba(73,211,186,.12), transparent 22%),
             linear-gradient(180deg, #0b190b 0%, #121f12 48%, #09110a 100%);
}
.auth-grid {
  display:grid; grid-template-columns:480px 360px; align-items:center; gap:32px; width:100%; max-width:1140px;
}
.auth-grid-loading { max-width:560px; }
.auth-panel {
  background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.08);
  backdrop-filter:blur(30px); border-radius:32px; padding:40px 38px; box-shadow:0 30px 90px rgba(0,0,0,.32);
}
.auth-panel-loading { padding:60px 46px; text-align:center; }
.auth-hero { display:flex; flex-direction:column; gap:24px; }
.auth-badge { display:inline-flex; align-items:center; justify-content:center; padding:6px 14px; border-radius:999px; font-size:11px; font-weight:700; letter-spacing:.5px; background:rgba(255,255,255,.08); color:#d0ffd0; border:1px solid rgba(255,255,255,.12); }
.auth-logo-wrap { display:flex; align-items:center; gap:18px; }
.auth-hero-logo { width:76px; height:76px; border-radius:28px; display:flex; align-items:center; justify-content:center; font-size:38px; background:linear-gradient(135deg,rgba(50,243,154,.95),rgba(38,179,255,.9)); color:#fff; box-shadow:0 24px 60px rgba(38,179,255,.18); }
.auth-heading { font-family:var(--fd); font-size:40px; line-height:1.03; letter-spacing:-.6px; color:#f7fff7; font-weight:900; }
.auth-subheading { font-size:15px; line-height:1.7; color:rgba(255,255,255,.78); max-width:440px; }
.auth-copy { margin:24px 0 28px; color:rgba(255,255,255,.82); font-size:15px; line-height:1.8; }
.auth-status { color:rgba(255,255,255,.64); font-size:13px; letter-spacing:.4px; font-weight:600; }
.auth-btn { width:100%; display:flex; justify-content:center; align-items:center; gap:10px; padding:17px 22px; font-size:15px; font-weight:700; border:none; background:linear-gradient(135deg,#1fd9b6,#2a8ff5); box-shadow:0 18px 34px rgba(32,139,255,.22); border-radius:16px; color:#fff; cursor:pointer; transition:transform .16s ease, box-shadow .16s ease; }
.auth-btn:hover { transform:translateY(-1px); box-shadow:0 22px 48px rgba(32,139,255,.28); }
.auth-note { margin-top:18px; color:rgba(255,255,255,.72); font-size:12.5px; line-height:1.8; }
.auth-feature-list { display:grid; gap:12px; margin-top:28px; }
.auth-feature-item { display:flex; align-items:center; gap:10px; color:rgba(255,255,255,.84); font-size:13px; }
.auth-feature-item span:first-child { width:28px; height:28px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,.08); border-radius:999px; }
.auth-visual { position:relative; display:flex; align-items:center; justify-content:center; }
.auth-visual::before { content:''; position:absolute; inset:0; border-radius:32px; background:radial-gradient(circle at top, rgba(255,255,255,.18), transparent 38%); pointer-events:none; }
.auth-visual-card { position:relative; width:100%; min-height:420px; background:linear-gradient(180deg, rgba(255,255,255,.1), rgba(255,255,255,.04)); border:1px solid rgba(255,255,255,.12); border-radius:32px; padding:28px; box-shadow:0 20px 80px rgba(0,0,0,.22); }
.auth-visual-tag { font-size:11px; text-transform:uppercase; letter-spacing:.85px; color:rgba(255,255,255,.75); margin-bottom:14px; }
.auth-visual-metric { font-family:var(--fd); font-size:54px; line-height:1; color:#fff; font-weight:900; margin-bottom:10px; }
.auth-visual-label { font-size:13px; color:rgba(255,255,255,.7); margin-bottom:18px; }
.auth-feature-grid { display:grid; grid-template-columns:repeat(1,minmax(0,1fr)); gap:12px; margin-top:28px; }
.auth-feature-item { display:flex; align-items:center; gap:12px; color:rgba(255,255,255,.9); font-size:14px; }
.auth-feature-item span:first-child { width:34px; height:34px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,.08); border-radius:14px; font-size:16px; }
.auth-visual { position:relative; display:flex; align-items:center; justify-content:center; min-height:460px; }
.auth-visual-splash { position:absolute; inset:0; background:radial-gradient(circle at 20% 20%, rgba(154,255,178,.22), transparent 16%),
    radial-gradient(circle at 75% 15%, rgba(82,222,232,.14), transparent 12%);
  filter:blur(28px); pointer-events:none; }
.auth-visual-card { position:relative; width:100%; min-height:420px; padding:32px; background:linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.04)); border:1px solid rgba(255,255,255,.12); border-radius:32px; box-shadow:0 24px 60px rgba(0,0,0,.2); overflow:hidden; }
.auth-visual-card::before { content:''; position:absolute; top:-20px; right:-40px; width:180px; height:180px; border-radius:50%; background:rgba(56,210,170,.15); filter:blur(20px); }
.auth-visual-tag { font-size:11px; text-transform:uppercase; letter-spacing:.95px; color:rgba(255,255,255,.72); margin-bottom:16px; }
.auth-visual-metric { font-family:var(--fd); font-size:56px; line-height:1; color:#fff; font-weight:900; margin-bottom:14px; }
.auth-visual-label { font-size:14px; color:rgba(255,255,255,.75); margin-bottom:28px; }
.auth-visual-list { display:grid; gap:14px; padding-top:6px; }
.auth-visual-list div { font-size:14px; color:rgba(255,255,255,.82); }
.auth-visual-list div::before { content:'•'; margin-right:10px; color:rgba(255,255,255,.5); }
.auth-grid, .auth-panel, .auth-visual { transition:all .28s ease; }
.auth-panel { position:relative; overflow:hidden; }
.auth-pill { display:inline-flex; align-items:center; justify-content:center; padding:8px 16px; border-radius:999px; background:rgba(255,255,255,.08); color:rgba(255,255,255,.8); font-size:11px; font-weight:700; letter-spacing:.7px; margin-bottom:24px; border:1px solid rgba(255,255,255,.08); }
.auth-hero { display:flex; flex-direction:column; gap:24px; }
.auth-logo-wrap { display:flex; align-items:flex-start; gap:18px; }
.auth-hero-logo { width:76px; height:76px; border-radius:28px; display:flex; align-items:center; justify-content:center; font-size:34px; background:linear-gradient(135deg,rgba(50,243,154,.95),rgba(38,179,255,.9)); color:#fff; box-shadow:0 26px 80px rgba(38,179,255,.16); }
.auth-hero-copy { display:flex; flex-direction:column; gap:12px; }
.auth-heading { font-family:var(--fd); font-size:44px; line-height:1.02; letter-spacing:-.65px; color:#fff; font-weight:900; }
.auth-subheading { font-size:16px; line-height:1.7; color:rgba(255,255,255,.74); max-width:520px; }
.auth-copy { margin:24px 0 28px; color:rgba(255,255,255,.82); font-size:16px; line-height:1.85; max-width:560px; }
.auth-btn { width:100%; display:flex; justify-content:center; align-items:center; gap:12px; padding:18px 22px; font-size:16px; font-weight:800; border:none; background:linear-gradient(135deg,#20c65c,#2ca8ff); box-shadow:0 20px 40px rgba(36,194,112,.21); border-radius:18px; color:#fff; cursor:pointer; transition:transform .16s ease, box-shadow .16s ease; }
.auth-btn:hover { transform:translateY(-1px); box-shadow:0 22px 50px rgba(36,194,112,.26); }
.auth-note { margin-top:18px; color:rgba(255,255,255,.68); font-size:13px; line-height:1.8; }
@media(max-width:1080px){ .auth-grid { grid-template-columns:1fr; max-width:680px; } .auth-visual { display:none; } }
@media(max-width:720px){ .auth-shell { padding:16px; }
  .auth-panel { padding:28px 22px; }
  .auth-heading { font-size:32px; }
  .auth-subheading { font-size:14px; }
  .auth-copy { margin:18px 0 20px; font-size:15px; }
  .auth-btn { font-size:15px; padding:16px 18px; }
  .auth-feature-grid { margin-top:22px; gap:10px; }
  .auth-feature-item { font-size:13px; }
  .auth-hero-logo { width:62px; height:62px; font-size:28px; }
  .auth-visual { display:none; }
}

/* Dropdown */
.profile-dd {
  position:absolute; top:calc(100% + 10px); left:0;
  width:248px; background:color-mix(in srgb, var(--sf) 78%, transparent);
  backdrop-filter:blur(20px) saturate(160%); -webkit-backdrop-filter:blur(20px) saturate(160%);
  border:1px solid var(--bd2);
  border-radius:var(--r16); box-shadow:var(--s5);
  overflow:hidden; z-index:500;
  animation:ddIn .18s cubic-bezier(.2,0,.2,1);
}
@keyframes ddIn { from{opacity:0;transform:translateY(-8px) scale(.97);} to{opacity:1;transform:none;} }
.dd-head { padding:14px 16px; background:rgba(255,255,255,.03); border-bottom:1px solid var(--bd); }
.dd-av {
  width:40px; height:40px; border-radius:var(--rf);
  background:linear-gradient(135deg,var(--g500),var(--g350));
  color:#fff; font-family:var(--fd); font-size:14px; font-weight:800;
  display:flex; align-items:center; justify-content:center; margin-bottom:8px;
}
.dd-name { font-family:var(--fd); font-size:14px; font-weight:700; color:var(--t1); margin-bottom:1px; }
.dd-email { font-size:11px; color:var(--t4); }
.dd-sect { padding:5px; }
.dd-item {
  display:flex; align-items:center; gap:10px; padding:9px 11px;
  border-radius:var(--r10); border:none; background:transparent;
  color:var(--t2); font-family:var(--fb); font-size:12.5px; font-weight:500;
  width:100%; text-align:left; cursor:pointer; transition:all .12s;
}
.dd-item:hover { background:var(--as); color:var(--ac); }
.dd-item.danger { color:var(--red); }
.dd-item.danger:hover { background:var(--red-l); }
.dd-ico {
  width:22px; height:22px; display:flex; align-items:center; justify-content:center;
  color:var(--t3); flex-shrink:0; transition:color .12s;
}
.dd-ico svg { width:16px; height:16px; }
.dd-item:hover .dd-ico { color:var(--ac); }
.dd-item.danger:hover .dd-ico { color:var(--red); }
.dd-div { height:1px; background:var(--bd); margin:2px 5px; }
.dd-theme-row {
  display:flex; align-items:center; justify-content:space-between;
  padding:9px 11px; border-radius:var(--r10);
}
.dd-theme-lbl { display:flex; align-items:center; gap:10px; font-size:12.5px; font-weight:500; color:var(--t2); }

/* Toggle */
.tog {
  width:42px; height:24px; border-radius:var(--rf); border:none; cursor:pointer;
  position:relative; transition:background .2s; flex-shrink:0;
}
.tog.on { background:var(--ac); }
.tog.off { background:var(--bd3); }
.tog-k {
  position:absolute; top:3px; width:18px; height:18px; border-radius:var(--rf);
  background:#fff; transition:left .2s cubic-bezier(.4,0,.2,1); box-shadow:0 1px 4px rgba(0,0,0,.2);
}
.tog.on .tog-k { left:21px; }
.tog.off .tog-k { left:3px; }

/* Hd buttons */
.hd-btn {
  width:34px; height:34px; border-radius:var(--r10); border:none;
  background:transparent; color:var(--t4); display:flex; align-items:center;
  justify-content:center; cursor:pointer; transition:all .15s; position:relative; flex-shrink:0;
}
.hd-btn svg { width:17px; height:17px; }
.hd-btn:hover { background:var(--as); color:var(--ac); }
.hd-btn .dot {
  position:absolute; top:6px; right:6px; width:7px; height:7px;
  background:var(--red); border-radius:var(--rf); border:1.5px solid var(--sf);
}
.sidebar {
  grid-area:sb; background:var(--sf); border-right:1px solid var(--bd);
  display:flex; flex-direction:column; padding:10px 8px;
  overflow-y:auto;
}
.nav-section { margin-bottom:4px; }
.nav-lbl {
  font-size:9px; font-weight:700; letter-spacing:1px; text-transform:uppercase;
  color:var(--t5); padding:8px 12px 3px;
}
.nav-item {
  display:flex; align-items:center; gap:9px; padding:9px 12px;
  border-radius:var(--r12); cursor:pointer; border:none;
  background:transparent; color:var(--t3); font-family:var(--fb);
  font-size:12.5px; font-weight:500; width:100%; text-align:left;
  transition:all .15s; margin-bottom:1px; position:relative;
}
.nav-item svg { width:16px; height:16px; flex-shrink:0; opacity:.75; transition:opacity .15s; }
.nav-ico-wrap { display:contents; }
.nav-item:hover { background:var(--as); color:var(--ac); }
.nav-item:hover svg { opacity:1; }
.nav-item.on { background:linear-gradient(135deg,var(--g600),var(--g500)); color:#fff; font-weight:600; box-shadow:0 2px 10px rgba(38,115,38,.22); }
.nav-item.on svg { opacity:1; }
.nav-badge {
  margin-left:auto; min-width:17px; height:17px; padding:0 4px;
  background:var(--red); color:#fff; font-size:9px; font-weight:700;
  border-radius:var(--rf); display:flex; align-items:center; justify-content:center;
}
.nav-item.on .nav-badge { background:rgba(255,255,255,.25); }
.nav-spacer { flex:1; }
.nav-div { height:1px; background:var(--bd); margin:6px 4px; }
.nav-item-text {}
@media(max-width:1024px) and (min-width:601px){
  .sidebar {
    padding:8px 6px; align-items:center; overflow-x:hidden;
  }
  .nav-lbl { display:none; }
  .nav-div { width:calc(100% - 8px); }
  .nav-item {
    flex-direction:column; gap:3px; padding:8px 4px;
    font-size:10px; align-items:center; width:100%; text-align:center;
    border-radius:var(--r12); margin-bottom:2px;
  }
  .nav-item svg { width:18px; height:18px; opacity:.8; }
  .nav-item-text { font-size:10px; font-weight:600; }
  .nav-badge { position:absolute; top:3px; right:3px; margin:0; }
  .nav-spacer { flex:1; }
}
@media(max-width:600px){
  .shell { grid-template-rows:var(--hh) 1fr auto; }
  .sidebar {
    flex-direction:row; align-items:center;
    overflow-x:visible; height:auto; border-right:none;
    gap:0; justify-content:space-around;
    position:relative; z-index:50;
    margin:0; padding:8px 6px calc(8px + env(safe-area-inset-bottom));
    background:color-mix(in srgb, var(--sf) 94%, transparent);
    backdrop-filter:blur(22px) saturate(180%); -webkit-backdrop-filter:blur(22px) saturate(180%);
    border:1px solid var(--bd2); border-bottom:none;
    border-radius:var(--r24) var(--r24) 0 0;
    box-shadow:0 -4px 24px rgba(0,0,0,.08);
    width:100%;
  }
  [data-theme=dark] .sidebar { box-shadow:0 -4px 24px rgba(0,0,0,.4); }
  .nav-lbl, .nav-div, .nav-spacer, .nav-item-account { display:none !important; }
  .nav-item {
    flex-direction:column; gap:4px; padding:8px 4px 7px;
    font-size:9.5px; flex:1; border-radius:var(--r14);
    align-items:center; margin-bottom:0; min-width:0; max-width:88px;
    background:transparent !important; box-shadow:none !important;
    transition:all .2s cubic-bezier(.34,1.56,.64,1);
  }
  .nav-item svg { width:20px; height:20px; opacity:.5; transition:all .2s; }
  .nav-item-text { font-size:9px; font-weight:600; color:var(--t4); transition:all .2s; letter-spacing:.1px; }
  .nav-item.on { background:transparent !important; box-shadow:none !important; }
  .nav-item.on svg { opacity:1; color:#fff; }
  .nav-item.on .nav-item-text { color:var(--ac); font-weight:800; }
  .nav-item.on .nav-ico-wrap {
    background:linear-gradient(135deg,var(--g500),var(--g350));
    box-shadow:0 4px 14px var(--as3);
  }
  .nav-ico-wrap {
    width:36px; height:26px; border-radius:var(--r12); display:flex; align-items:center; justify-content:center;
    transition:all .25s cubic-bezier(.34,1.56,.64,1); position:relative;
  }
  .nav-item.on .nav-ico-wrap { transform:scale(1.04); }
  .nav-badge { position:absolute; top:2px; right:calc(50% - 26px); margin:0; min-width:15px; height:15px; font-size:8px; border:1.5px solid var(--sf); z-index:2; }
}
.main { grid-area:main; display:flex; flex-direction:column; overflow:hidden; background:var(--bg); }

/* SUB HEADER */
.sub-hd {
  height:46px; background:var(--sf); border-bottom:1px solid var(--bd);
  display:flex; align-items:center; padding:0 6px; gap:2px;
  flex-shrink:0; overflow-x:auto;
}
.sub-tab {
  display:flex; align-items:center; gap:5px; padding:6px 12px;
  border-radius:var(--r10); border:none; background:transparent; color:var(--t4);
  font-family:var(--fb); font-size:12px; font-weight:500; cursor:pointer;
  transition:all .15s; white-space:nowrap; flex-shrink:0;
}
.sub-tab svg { width:13px; height:13px; }
.sub-tab:hover { background:var(--as); color:var(--ac); }
.sub-tab.on { background:var(--as2); color:var(--ac); font-weight:600; }
.sub-hd-sp { flex:1; }
.sub-hd-act { display:flex; align-items:center; gap:4px; margin-left:4px; flex-shrink:0; }

/* SCROLL */
.scroll { flex:1; overflow-y:auto; padding:16px; }

/* BUTTONS */
.btn {
  display:inline-flex; align-items:center; justify-content:center;
  gap:5px; padding:8px 14px; border-radius:var(--r10); border:none;
  font-family:var(--fb); font-size:12px; font-weight:600; cursor:pointer;
  transition:all .15s; white-space:nowrap;
}
.btn:active { transform:scale(.97); }
.btn svg { width:13px; height:13px; }
.btn-sm { padding:5px 10px; font-size:11px; }
.btn-sm svg { width:11px; height:11px; }
.btn-lg { padding:11px 20px; font-size:13px; border-radius:var(--r12); }
.btn-lg svg { width:15px; height:15px; }
.btn-full { width:100%; }
.btn-p { background:linear-gradient(135deg,var(--g500),var(--g400)); color:#fff; box-shadow:0 2px 8px rgba(38,115,38,.2); }
.btn-p:hover { background:linear-gradient(135deg,var(--g450),var(--g350)); box-shadow:0 4px 14px rgba(38,115,38,.3); }
.btn-p:disabled { opacity:.4; cursor:not-allowed; transform:none; box-shadow:none; }
.btn-g { background:transparent; color:var(--t3); border:1px solid var(--bd2); }
.btn-g:hover { background:var(--as); color:var(--ac); border-color:var(--ac); }
.btn-d { background:var(--red-l); color:var(--red); border:1px solid rgba(239,68,68,.15); }
.btn-d:hover { background:var(--red); color:#fff; }
.ib {
  width:32px; height:32px; border:none; background:transparent;
  color:var(--t4); border-radius:var(--r8); display:flex;
  align-items:center; justify-content:center; cursor:pointer; transition:all .15s;
}
.ib svg { width:15px; height:15px; }
.ib:hover { background:var(--as); color:var(--ac); }
.ib.active-bell { color:var(--ac); }

/* BADGES */
.badge { display:inline-flex; align-items:center; gap:3px; padding:2px 8px; border-radius:var(--rf); font-size:10px; font-weight:700; }
.b-g { background:rgba(56,160,56,.1); color:var(--g500); }
.b-gold { background:rgba(212,144,26,.1); color:var(--gold); }
.b-blue { background:rgba(59,130,246,.1); color:var(--blue); }
.b-red { background:rgba(239,68,68,.1); color:var(--red); }
.b-muted { background:var(--sf3); color:var(--t4); border:1px solid var(--bd); }
.b-purple { background:rgba(168,85,247,.1); color:var(--purple); }
.b-teal { background:rgba(20,184,166,.1); color:var(--teal); }
[data-theme=dark] .b-g { background:rgba(77,184,77,.12); color:var(--g300); }
[data-theme=dark] .b-gold { background:rgba(212,144,26,.12); color:var(--gold-b); }
[data-theme=dark] .b-blue { background:rgba(59,130,246,.12); color:var(--blue-b); }
[data-theme=dark] .b-red { background:rgba(239,68,68,.12); color:var(--red-b); }

.card { background:var(--sf); border:1px solid var(--bd); border-radius:var(--r16); box-shadow:var(--s1); }
.card-p { padding:16px; }

.field {
  width:100%; padding:10px 13px; border:1px solid var(--bd2);
  border-radius:var(--r10); background:var(--sf2); color:var(--t1);
  font-family:var(--fb); font-size:12.5px; outline:none;
  transition:border-color .15s, box-shadow .15s;
}
.field::placeholder { color:var(--t5); }
.field:focus { border-color:var(--ac); box-shadow:0 0 0 3px var(--as); }
.textarea { resize:vertical; min-height:80px; }
.label { display:block; font-size:11px; font-weight:600; color:var(--t3); margin-bottom:4px; }
.form-g { margin-bottom:12px; }
.form-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
@media(max-width:500px){ .form-row { grid-template-columns:1fr; } }

.sbar {
  display:flex; align-items:center; gap:8px; padding:0 12px;
  background:var(--sf2); border:1px solid var(--bd2); border-radius:var(--r10); height:36px;
}
.sbar:focus-within { border-color:var(--ac); box-shadow:0 0 0 3px var(--as); background:var(--sf); }
.sbar svg { width:14px; height:14px; color:var(--t4); flex-shrink:0; }
.sbar input { flex:1; border:none; background:transparent; outline:none; font-family:var(--fb); font-size:12.5px; color:var(--t1); }
.sbar input::placeholder { color:var(--t5); }

.pt { height:5px; background:var(--sf3); border-radius:var(--rf); overflow:hidden; border:1px solid var(--bd); }
.pf { height:100%; background:linear-gradient(90deg,var(--g500),var(--g350)); border-radius:var(--rf); transition:width .6s; }

.div { height:1px; background:var(--bd); margin:12px 0; }

/* OVERLAY */
.overlay {
  position:fixed; inset:0; background:rgba(0,0,0,.62);
  backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px);
  z-index:900; display:flex; align-items:center; justify-content:center;
  padding:16px; animation:fIn .2s ease;
}
@keyframes fIn { from{opacity:0;} to{opacity:1;} }

/* MODAL */
.mbox {
  background:var(--sf); border-radius:var(--r24); border:1px solid var(--bd2);
  box-shadow:var(--s5); width:100%; max-width:480px;
  max-height:90vh; overflow-y:auto; animation:mIn .22s cubic-bezier(.2,0,.2,1);
}
.mbox-wide { max-width:780px; }
.mbox-lg { max-width:640px; }
@keyframes mIn { from{opacity:0;transform:translateY(18px) scale(.97);} to{opacity:1;transform:none;} }

/* Slide-up on mobile */
@media(max-width:600px){
  .overlay.mob-sheet { padding:0; align-items:flex-end; }
  .overlay.mob-sheet .mbox {
    border-radius:var(--r24) var(--r24) 0 0; max-height:92vh;
    max-width:100%; width:100%; animation:slideUp .25s cubic-bezier(.2,0,.2,1);
  }
  @keyframes slideUp { from{transform:translateY(100%);} to{transform:none;} }
  .overlay.mob-sheet .mhd { border-radius:var(--r24) var(--r24) 0 0; }
}

.mhd {
  display:flex; align-items:center; justify-content:space-between;
  padding:16px 20px; border-bottom:1px solid var(--bd);
  position:sticky; top:0; background:var(--sf); z-index:5;
  border-radius:var(--r24) var(--r24) 0 0;
}
.mt { font-family:var(--fd); font-size:15px; font-weight:700; color:var(--t1); }
.mbody { padding:20px; }
.mfoot {
  padding:14px 20px; border-top:1px solid var(--bd);
  display:flex; gap:8px; justify-content:flex-end;
  position:sticky; bottom:0; background:var(--sf);
}

/* TOAST */
.toast-area {
  position:fixed; bottom:80px; right:16px; z-index:2000;
  display:flex; flex-direction:column; gap:6px; pointer-events:none;
}
@media(min-width:601px){ .toast-area { bottom:16px; } }
.toast {
  background:var(--sf); border:1px solid var(--bd2); border-radius:var(--r14);
  box-shadow:var(--s4); padding:10px 14px; display:flex; align-items:center;
  gap:10px; font-size:12.5px; font-weight:500; color:var(--t1);
  pointer-events:all; max-width:300px; animation:mIn .2s ease;
}
.toast.ok { border-left:3px solid var(--g400); }
.toast.err { border-left:3px solid var(--red); }
.toast.info { border-left:3px solid var(--blue); }

/* NOTICE */
.notice {
  padding:10px 13px; border-radius:var(--r10); font-size:12px;
  display:flex; gap:9px; align-items:flex-start; margin-bottom:12px; line-height:1.55; border:1px solid;
}
.notice svg { width:13px; height:13px; flex-shrink:0; margin-top:1px; }
.ni { background:var(--blue-l); color:var(--blue); border-color:rgba(59,130,246,.2); }
.nok { background:rgba(56,160,56,.08); color:var(--g500); border-color:var(--bd); }
.nw { background:var(--gold-l); color:var(--gold); border-color:rgba(212,144,26,.2); }
[data-theme=dark] .ni { background:rgba(59,130,246,.1); color:var(--blue-b); }
[data-theme=dark] .nok { background:rgba(77,184,77,.1); color:var(--g300); }
[data-theme=dark] .nw { background:rgba(212,144,26,.1); color:var(--gold-b); }

/* AVATAR */
.av { border-radius:var(--rf); display:flex; align-items:center; justify-content:center; font-family:var(--fd); font-weight:800; flex-shrink:0; }
.av-xl { width:52px; height:52px; font-size:18px; }
.av-lg { width:40px; height:40px; font-size:14px; }
.av-md { width:33px; height:33px; font-size:12px; }
.av-sm { width:27px; height:27px; font-size:10px; }
.av-c { background:var(--as2); color:var(--ac); }
.av-g { background:linear-gradient(135deg,var(--g500),var(--g350)); color:#fff; }

/* STAT ROW */
.stat-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(120px,1fr)); gap:8px; margin-bottom:14px; }
.stat-tile { background:var(--sf); border:1px solid var(--bd); border-radius:var(--r14); padding:16px 13px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; transition:all .2s; }
.stat-tile:hover { border-color:var(--bd2); box-shadow:var(--s2); transform:translateY(-1px); }
.stat-ico { width:36px; height:36px; border-radius:var(--rf); background:var(--as); display:flex; align-items:center; justify-content:center; color:var(--ac); margin-bottom:9px; font-size:16px; }
.stat-ico svg { width:16px; height:16px; }
.stat-v { font-family:var(--fd); font-size:21px; font-weight:800; color:var(--t1); line-height:1; }
.stat-l { font-size:10.5px; color:var(--t4); font-weight:600; margin-top:4px; letter-spacing:.2px; }

/* CHIP */
.chip { display:inline-flex; align-items:center; gap:4px; padding:4px 11px; border:1px solid var(--bd2); border-radius:var(--rf); font-size:11.5px; font-weight:500; color:var(--t4); background:var(--sf); cursor:pointer; transition:all .15s; }
.chip:hover, .chip.on { background:var(--as); border-color:var(--ac); color:var(--ac); }
.chip-row { display:flex; flex-wrap:wrap; gap:5px; margin-bottom:12px; }

.fbar { display:flex; align-items:center; gap:8px; margin-bottom:12px; flex-wrap:wrap; }
.fbar .sbar { flex:1; min-width:150px; }
.filter-dd-anchor { position:relative; flex-shrink:0; }
.filter-dd {
  position:absolute; top:calc(100% + 6px); right:0; width:170px; z-index:150;
  background:color-mix(in srgb, var(--sf) 94%, transparent);
  backdrop-filter:blur(18px) saturate(170%); -webkit-backdrop-filter:blur(18px) saturate(170%);
  border:1px solid var(--bd2); border-radius:var(--r14); box-shadow:var(--s4);
  overflow:hidden; animation:ddIn .16s ease; padding:5px;
}
.filter-dd-item { display:flex; align-items:center; gap:8px; padding:9px 11px; border:none; background:transparent; color:var(--t2); font-family:var(--fb); font-size:12.5px; font-weight:500; width:100%; text-align:left; cursor:pointer; border-radius:var(--r10); transition:all .12s; }
.filter-dd-item:hover { background:var(--as); color:var(--ac); }
.filter-dd-item.on { color:var(--ac); font-weight:700; background:var(--as); }
.filter-dd-item svg { width:13px; height:13px; flex-shrink:0; }

.empty { display:flex; flex-direction:column; align-items:center; padding:48px 20px; text-align:center; gap:6px; }
.empty-ico { font-size:40px; opacity:.25; margin-bottom:4px; }
.empty-t { font-size:13px; font-weight:600; color:var(--t3); }
.empty-s { font-size:11.5px; color:var(--t4); }

.sh { font-family:var(--fd); font-size:16px; font-weight:800; color:var(--t1); margin-bottom:10px; }
.subsh { font-size:12px; color:var(--t4); margin-bottom:14px; line-height:1.6; }
.page-h { font-family:var(--fd); font-size:20px; font-weight:900; color:var(--t1); margin-bottom:4px; }
.pi { display:flex; justify-content:space-between; font-size:10.5px; color:var(--t4); margin-bottom:4px; }
.post-feed { display:flex; flex-direction:column; gap:10px; container-type:inline-size; container-name:postfeed; }
.post-card { background:var(--sf); border:1px solid var(--bd); border-radius:var(--r16); padding:15px; transition:all .2s; }
.post-card:hover { border-color:var(--bd2); box-shadow:var(--s2); }
.post-hd { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
.post-name { font-size:13px; font-weight:700; color:var(--t1); }
.post-meta { font-size:11px; color:var(--t4); margin-top:1px; }
.post-body { font-size:13px; color:var(--t2); line-height:1.7; margin-bottom:10px; }
.post-img { width:100%; height:170px; background:var(--sf3); border-radius:var(--r12); display:flex; align-items:center; justify-content:center; font-size:42px; margin-bottom:10px; border:1px solid var(--bd); flex-shrink:0; }
.post-content { display:block; }
.post-text-col { display:block; }
/* Row layout: text + image side-by-side once the feed column is wide enough (PC) */
@container postfeed (min-width:560px){
  .post-card.has-media .post-content { display:flex; align-items:stretch; gap:16px; }
  .post-card.has-media .post-text-col { flex:1 1 auto; min-width:0; display:flex; flex-direction:column; }
  .post-card.has-media .post-body { flex:1; margin-bottom:0; }
  .post-card.has-media .post-img { width:200px; height:140px; margin-bottom:0; flex-shrink:0; }
}
.post-tags { display:flex; flex-wrap:wrap; gap:4px; margin-bottom:10px; }
.post-tag { padding:3px 8px; background:var(--as); color:var(--ac); border-radius:var(--rf); font-size:10.5px; font-weight:600; }
.post-acts { display:flex; align-items:center; gap:2px; padding-top:9px; border-top:1px solid var(--bd); }
.post-act-save { margin-left:auto; }
.post-act { display:flex; align-items:center; gap:4px; padding:5px 10px; border:none; background:transparent; border-radius:var(--r8); color:var(--t4); font-size:11.5px; font-weight:500; cursor:pointer; transition:all .15s; font-family:var(--fb); }
.post-act:hover { background:var(--as); color:var(--ac); }
.post-act.liked { color:var(--red); }
.post-act svg { width:13px; height:13px; }
.compose-box { background:var(--sf); border:1px solid var(--bd); border-radius:var(--r16); padding:14px; margin-bottom:14px; }
.compose-input { width:100%; border:none; background:transparent; font-family:var(--fb); font-size:13px; color:var(--t1); resize:none; outline:none; min-height:60px; line-height:1.6; }
.compose-input::placeholder { color:var(--t5); }
.compose-foot { display:flex; align-items:center; justify-content:space-between; padding-top:10px; border-top:1px solid var(--bd); }

/* Community card */
.comm-card {
  background:var(--sf); border:1px solid var(--bd); border-radius:var(--r16);
  overflow:hidden; cursor:pointer; transition:all .2s; position:relative;
}
.comm-card:hover { box-shadow:var(--s3); border-color:var(--bd2); transform:translateY(-2px); }
.comm-banner { height:80px; display:flex; align-items:center; justify-content:center; font-size:34px; position:relative; overflow:hidden; }
.comm-banner::after { content:''; position:absolute; inset:0; background:linear-gradient(180deg,transparent 40%,rgba(0,0,0,.28)); }
.comm-notif-btn {
  position:absolute; top:8px; right:8px; z-index:3;
  width:32px; height:32px; border-radius:var(--rf);
  background:rgba(0,0,0,.42); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
  border:1px solid rgba(255,255,255,.18);
  display:flex; align-items:center; justify-content:center; cursor:pointer;
  color:#fff; transition:all .18s;
}
.comm-notif-btn:hover { background:rgba(0,0,0,.62); border-color:rgba(255,255,255,.35); transform:scale(1.07); }
.comm-notif-btn svg { width:14px; height:14px; }
.comm-notif-btn.active { background:var(--ac); border-color:transparent; color:#fff; }
.comm-notif-count {
  position:absolute; top:-5px; right:-5px; min-width:16px; height:16px; padding:0 4px;
  background:var(--red); color:#fff; font-size:8.5px; font-weight:800; border-radius:var(--rf);
  display:flex; align-items:center; justify-content:center; border:2px solid var(--sf);
  animation:notifPop .2s cubic-bezier(.34,1.56,.64,1);
}
@keyframes notifPop { from{transform:scale(0);} to{transform:scale(1);} }
.comm-body { padding:11px; }
.comm-name { font-family:var(--fd); font-size:12.5px; font-weight:700; color:var(--t1); margin-bottom:2px; }
.comm-meta { font-size:10.5px; color:var(--t4); margin-bottom:8px; }
.author-trigger { display:flex; align-items:center; gap:10px; cursor:pointer; background:none; border:none; padding:0; text-align:left; }
.author-name-link { font-size:13px; font-weight:700; color:var(--t1); transition:color .12s; }
.author-trigger:hover .author-name-link { color:var(--ac); }

/* Profile popover */
.profile-pop-anchor { position:relative; display:inline-block; }
.profile-pop {
  position:absolute; top:calc(100% + 8px); left:0; z-index:400;
  width:270px; max-width:calc(100vw - 16px);
  background:color-mix(in srgb, var(--sf) 90%, transparent);
  backdrop-filter:blur(20px) saturate(170%); -webkit-backdrop-filter:blur(20px) saturate(170%);
  border:1px solid var(--bd2); border-radius:var(--r20); box-shadow:var(--s5);
  padding:16px; animation:ddIn .16s ease;
}
.profile-pop.measuring { visibility:hidden; pointer-events:none; }
.profile-pop.anchor-right { left:auto; right:0; }
.profile-pop.anchor-center { left:50%; transform:translateX(-50%); }
.pp-top { display:flex; align-items:flex-start; gap:12px; margin-bottom:10px; }
.pp-name { font-family:var(--fd); font-size:14.5px; font-weight:800; color:var(--t1); }
.pp-role { font-size:11px; color:var(--t4); margin-top:1px; }
.pp-stats { display:flex; gap:14px; margin-bottom:13px; font-size:11.5px; color:var(--t3); }
.pp-stats b { color:var(--t1); font-weight:700; }
.pp-acts { display:flex; gap:7px; }
.pp-btn { flex:1; padding:8px; border-radius:var(--r10); font-size:11.5px; font-weight:700; cursor:pointer; transition:all .15s; display:flex; align-items:center; justify-content:center; gap:5px; border:1px solid var(--bd2); background:transparent; color:var(--t2); }
.pp-btn svg { width:13px; height:13px; }
.pp-btn.primary { background:linear-gradient(135deg,var(--g500),var(--g400)); color:#fff; border:none; }
.pp-btn.primary:hover { background:linear-gradient(135deg,var(--g450),var(--g350)); }
.pp-btn.following { background:var(--as); color:var(--ac); border-color:var(--as3); }
.pp-btn:hover:not(.primary):not(.following) { background:var(--as); color:var(--ac); border-color:var(--ac); }
.profile-page-hd { display:flex; align-items:center; gap:10px; padding:10px 14px; border-bottom:1px solid var(--bd); background:var(--sf); flex-shrink:0; }
.profile-banner { height:120px; background:linear-gradient(135deg,var(--g800),var(--g500)); position:relative; }
.profile-block { padding:0 18px 14px; position:relative; }
.profile-av-lg { width:86px; height:86px; border-radius:var(--rf); border:4px solid var(--sf); background:linear-gradient(135deg,var(--g500),var(--g350)); color:#fff; display:flex; align-items:center; justify-content:center; font-family:var(--fd); font-size:28px; font-weight:800; margin-top:-43px; margin-bottom:10px; }
.profile-name-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:2px; }
.profile-name { font-family:var(--fd); font-size:19px; font-weight:900; color:var(--t1); }
.profile-role { font-size:12px; color:var(--t4); margin-bottom:10px; }
.profile-bio { font-size:13px; color:var(--t2); line-height:1.65; margin-bottom:12px; max-width:560px; }
.profile-meta-row { display:flex; gap:16px; font-size:12px; color:var(--t3); margin-bottom:6px; }
.profile-meta-row b { color:var(--t1); font-weight:700; }
.profile-tabs { display:flex; border-bottom:1px solid var(--bd); margin-top:8px; }
.profile-tab { flex:1; text-align:center; padding:13px; font-size:12.5px; font-weight:600; color:var(--t4); cursor:pointer; border-bottom:2px solid transparent; transition:all .15s; }
.profile-tab:hover { background:var(--sf2); }
.profile-tab.on { color:var(--ac); border-bottom-color:var(--ac); font-weight:700; }

/* Reply card (in profile Replies tab) */
.reply-card { padding:14px 18px; border-bottom:1px solid var(--bd); cursor:pointer; transition:background .12s; }
.reply-card:hover { background:var(--sf2); }
.reply-context { font-size:11px; color:var(--t4); margin-bottom:6px; }
.reply-text { font-size:13px; color:var(--t2); line-height:1.6; }
.post-view-hd { display:flex; align-items:center; gap:10px; padding:10px 14px; border-bottom:1px solid var(--bd); background:var(--sf); flex-shrink:0; }
.post-view-main { padding:18px; border-bottom:8px solid var(--sf2); }
.post-view-body { font-size:16px; color:var(--t1); line-height:1.7; margin:14px 0; }
.post-view-img { width:100%; border-radius:var(--r16); background:var(--sf3); display:flex; align-items:center; justify-content:center; font-size:64px; height:240px; margin-bottom:14px; border:1px solid var(--bd); }
.post-view-time { font-size:12.5px; color:var(--t4); padding:10px 0; border-bottom:1px solid var(--bd); margin-bottom:8px; }
.post-view-stats { display:flex; gap:18px; padding:10px 0; border-bottom:1px solid var(--bd); font-size:12.5px; }
.post-view-stats b { color:var(--t1); font-weight:700; }
.post-view-stats span { color:var(--t4); }
.post-view-acts { display:flex; align-items:center; justify-content:space-around; padding:6px 0; }

/* Comment composer */
.comment-composer { display:flex; gap:10px; padding:14px 18px; border-bottom:8px solid var(--sf2); }
.comment-input-wrap { flex:1; }
.comment-input { width:100%; border:none; background:transparent; font-family:var(--fb); font-size:13.5px; color:var(--t1); resize:none; outline:none; min-height:44px; line-height:1.6; border-bottom:1px solid var(--bd); padding-bottom:10px; }
.comment-input::placeholder { color:var(--t5); }
.comment-composer-foot { display:flex; justify-content:flex-end; margin-top:8px; }

/* Threaded comment system */
.comment-thread { padding:0 18px; }
.comment-item { display:flex; gap:10px; padding:14px 0; border-bottom:1px solid var(--bd); scroll-margin-top:70px; }
.comment-item.highlight { background:var(--as); border-radius:var(--r12); padding:14px 10px; animation:commentGlow 1.8s ease; }
@keyframes commentGlow { 0%{background:var(--as3);} 100%{background:var(--as);} }
.comment-body-col { flex:1; min-width:0; }
.comment-meta-row { display:flex; align-items:center; gap:6px; margin-bottom:3px; flex-wrap:wrap; }
.comment-author { font-size:12.5px; font-weight:700; color:var(--t1); }
.comment-time { font-size:11px; color:var(--t5); }
.comment-text { font-size:13px; color:var(--t2); line-height:1.6; margin-bottom:6px; }
.comment-acts-row { display:flex; align-items:center; gap:16px; }
.comment-act-btn { display:flex; align-items:center; gap:4px; border:none; background:none; color:var(--t4); font-size:11.5px; font-weight:500; cursor:pointer; padding:2px 0; transition:color .12s; }
.comment-act-btn:hover { color:var(--ac); }
.comment-act-btn.liked { color:var(--red); }
.comment-act-btn svg { width:13px; height:13px; }
.reply-list { margin-top:10px; padding-left:18px; border-left:2px solid var(--bd); display:flex; flex-direction:column; gap:12px; }
.reply-compose-row { display:flex; gap:8px; margin-top:10px; align-items:flex-start; }
.reply-compose-input { flex:1; border:1px solid var(--bd2); border-radius:var(--r12); padding:8px 12px; font-family:var(--fb); font-size:12.5px; background:var(--sf2); color:var(--t1); outline:none; resize:none; min-height:36px; }
.reply-compose-input:focus { border-color:var(--ac); box-shadow:0 0 0 3px var(--as); }
.comm-feed-hero { height:140px; display:flex; align-items:flex-end; padding:18px; position:relative; }
.comm-feed-hero-c { position:relative; z-index:1; color:#fff; }
.comm-feed-ico { font-size:36px; margin-bottom:6px; }
.comm-feed-name { font-family:var(--fd); font-size:20px; font-weight:900; }
.comm-feed-meta { padding:14px 18px; border-bottom:1px solid var(--bd); }
.comm-feed-desc { font-size:13px; color:var(--t2); line-height:1.6; margin-bottom:10px; }
.comm-feed-stats { display:flex; gap:16px; font-size:12px; color:var(--t3); margin-bottom:12px; }
.comm-feed-stats b { color:var(--t1); font-weight:700; }
.comm-feed-acts { display:flex; gap:8px; }
.comm-gate-notice { margin:14px 18px; }
.folder-row { display:flex; align-items:center; gap:12px; padding:12px 14px; background:var(--sf); border:1px solid var(--bd); border-radius:var(--r12); margin-bottom:7px; cursor:pointer; transition:all .15s; }
.folder-row:hover { border-color:var(--ac); background:var(--as); }
.folder-row.saved { border-color:var(--ac); background:var(--as); }
.folder-ico { width:38px; height:38px; border-radius:var(--r10); background:var(--sf3); display:flex; align-items:center; justify-content:center; font-size:17px; flex-shrink:0; }
.folder-info { flex:1; }
.folder-name { font-size:12.5px; font-weight:700; color:var(--t1); }
.folder-count { font-size:11px; color:var(--t4); }
.folder-check { width:20px; height:20px; border-radius:var(--rf); border:2px solid var(--bd3); display:flex; align-items:center; justify-content:center; color:#fff; flex-shrink:0; }
.folder-row.saved .folder-check { background:var(--ac); border-color:var(--ac); }
.folder-check svg { width:11px; height:11px; }

/* Empty state nudge for community gate */
.gate-card { background:var(--sf); border:1px dashed var(--bd3); border-radius:var(--r16); padding:24px; text-align:center; margin:14px 18px; }
.gate-card-ico { font-size:32px; margin-bottom:8px; }
.post-menu-anchor { position:relative; }
.post-menu-dd {
  position:absolute; top:calc(100% + 6px); right:0; width:210px; z-index:200;
  background:color-mix(in srgb, var(--sf) 92%, transparent);
  backdrop-filter:blur(18px) saturate(170%); -webkit-backdrop-filter:blur(18px) saturate(170%);
  border:1px solid var(--bd2); border-radius:var(--r14); box-shadow:var(--s4);
  overflow:hidden; animation:ddIn .16s ease; padding:5px;
}
.post-menu-dd.drop-up { top:auto; bottom:calc(100% + 6px); animation:ddUpIn .16s ease; }
@keyframes ddUpIn { from{opacity:0;transform:translateY(8px) scale(.97);} to{opacity:1;transform:none;} }
.pmd-item { display:flex; align-items:center; gap:10px; padding:9px 11px; border:none; background:transparent; color:var(--t2); font-family:var(--fb); font-size:12.5px; font-weight:500; width:100%; text-align:left; cursor:pointer; border-radius:var(--r10); transition:all .12s; }
.pmd-item:hover { background:var(--as); color:var(--ac); }
.pmd-item.danger { color:var(--red); }
.pmd-item.danger:hover { background:var(--red-l); }
.pmd-item svg { width:14px; height:14px; flex-shrink:0; }
.pmd-div { height:1px; background:var(--bd); margin:4px 5px; }
.comment-row-wrap { display:flex; gap:8px; width:100%; }
.comment-menu-anchor { position:relative; flex-shrink:0; padding-top:2px; }
.comment-menu-trigger { width:22px; height:22px; border:none; background:transparent; color:var(--t5); border-radius:var(--r8); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .15s; opacity:0; }
.comment-item:hover .comment-menu-trigger { opacity:1; }
.comment-menu-trigger:hover { background:var(--as); color:var(--ac); }
.comment-menu-trigger svg { width:13px; height:13px; }
.comment-menu-dd {
  position:absolute; top:0; left:calc(100% + 4px); width:180px; z-index:200;
  background:color-mix(in srgb, var(--sf) 92%, transparent);
  backdrop-filter:blur(18px) saturate(170%); -webkit-backdrop-filter:blur(18px) saturate(170%);
  border:1px solid var(--bd2); border-radius:var(--r12); box-shadow:var(--s4);
  overflow:hidden; animation:ddIn .14s ease; padding:4px;
}
.comment-menu-dd.drop-up { top:auto; bottom:0; }
.share-recent-row { display:flex; gap:14px; overflow-x:auto; padding:4px 2px 6px; margin-bottom:14px; }
.share-recent-item { display:flex; flex-direction:column; align-items:center; gap:6px; flex-shrink:0; cursor:pointer; width:64px; }
.share-recent-item:hover .av { transform:scale(1.05); }
.share-recent-name { font-size:10.5px; font-weight:600; color:var(--t2); text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:64px; }
.share-via-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
.share-via-btn { display:flex; flex-direction:column; align-items:center; gap:7px; padding:14px 8px; background:var(--sf2); border:1px solid var(--bd); border-radius:var(--r14); cursor:pointer; transition:all .15s; }
.share-via-btn:hover { border-color:var(--ac); background:var(--as); transform:translateY(-2px); }
.share-via-ico { width:38px; height:38px; border-radius:var(--rf); display:flex; align-items:center; justify-content:center; font-size:18px; }
.share-via-ico svg { width:18px; height:18px; }
.share-via-label { font-size:11px; font-weight:600; color:var(--t2); }
.share-divider-row { display:flex; align-items:center; gap:10px; margin:14px 0 12px; }
.share-divider-line { flex:1; height:1px; background:var(--bd); }
.share-divider-text { font-size:9.5px; font-weight:700; letter-spacing:.8px; text-transform:uppercase; color:var(--t5); }

/* Save panel - post preview row */
.save-post-preview { display:flex; align-items:center; gap:10px; padding:10px 13px; background:var(--sf3); border:1px solid var(--bd); border-radius:var(--r12); margin-bottom:14px; }
.save-post-ico { font-size:16px; }
.save-post-label { font-size:10.5px; font-weight:700; color:var(--t4); text-transform:uppercase; letter-spacing:.4px; }
.save-post-text { font-size:12px; color:var(--t2); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1; }

/* Icon button for top-right post action trigger */
.post-ico-btn { width:30px; height:30px; border:none; background:transparent; color:var(--t4); border-radius:var(--r8); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .15s; }
.post-ico-btn:hover { background:var(--as); color:var(--ac); }
.post-ico-btn svg { width:15px; height:15px; }

/* Coming soon card (Labs > Features > Explore) */
.coming-soon-overlay { position:fixed; inset:0; background:rgba(0,0,0,.6); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); z-index:900; display:flex; align-items:center; justify-content:center; padding:20px; animation:fIn .2s ease; }
.coming-soon-card { background:var(--sf); border:1px solid var(--bd2); border-radius:var(--r24); box-shadow:var(--s5); max-width:360px; width:100%; padding:32px 28px; text-align:center; position:relative; overflow:hidden; }
.coming-soon-card::before { content:''; position:absolute; inset:0; background:radial-gradient(circle at 50% 0%,var(--as2),transparent 60%); }
.coming-soon-ico-wrap { width:72px; height:72px; border-radius:var(--rf); background:linear-gradient(135deg,var(--g500),var(--g350)); display:flex; align-items:center; justify-content:center; font-size:32px; margin:0 auto 18px; position:relative; z-index:1; box-shadow:0 8px 24px var(--as3); }
.coming-soon-title { font-family:var(--fd); font-size:18px; font-weight:900; color:var(--t1); margin-bottom:8px; position:relative; z-index:1; }
.coming-soon-desc { font-size:12.5px; color:var(--t4); line-height:1.6; margin-bottom:20px; position:relative; z-index:1; }
.coming-soon-badge { display:inline-flex; align-items:center; gap:5px; padding:5px 13px; background:var(--as); color:var(--ac); border-radius:var(--rf); font-size:10.5px; font-weight:700; margin-bottom:18px; position:relative; z-index:1; }
.items-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:10px; }
.item-card { background:var(--sf); border:1px solid var(--bd); border-radius:var(--r16); overflow:hidden; transition:all .2s; cursor:pointer; display:flex; flex-direction:column; }
.item-card:hover { box-shadow:var(--s3); border-color:var(--bd2); transform:translateY(-2px); }
.item-thumb { height:92px; background:linear-gradient(135deg,var(--g750),var(--g500)); display:flex; align-items:center; justify-content:center; font-size:34px; position:relative; overflow:hidden; }
.item-thumb::after { content:''; position:absolute; inset:0; background:linear-gradient(180deg,transparent 30%,rgba(0,0,0,.25)); }
.ith-icon { position:relative; z-index:1; }
.ith-badge { position:absolute; top:8px; right:8px; z-index:2; }
.item-body { padding:10px; flex:1; display:flex; flex-direction:column; }
.item-name { font-family:var(--fd); font-size:13px; font-weight:700; color:var(--t1); margin-bottom:2px; line-height:1.3; }
.item-sub { font-size:11px; color:var(--t4); margin-bottom:8px; }
.item-pr { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
.item-price { font-family:var(--fd); font-size:15px; font-weight:800; color:var(--ac); }
.item-qty { font-size:10.5px; color:var(--t4); background:var(--sf3); padding:2px 7px; border-radius:var(--rf); border:1px solid var(--bd); }
.item-acts { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:auto; }

.invest-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(270px,1fr)); gap:10px; }
.inv-card { background:var(--sf); border:1px solid var(--bd); border-radius:var(--r16); overflow:hidden; transition:all .2s; }
.inv-card:hover { box-shadow:var(--s3); border-color:var(--bd2); transform:translateY(-2px); }
.inv-banner { height:110px; background:linear-gradient(135deg,var(--g750),var(--g500)); display:flex; align-items:center; justify-content:center; font-size:44px; position:relative; }
.inv-banner::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(0,0,0,.05),rgba(0,0,0,.3)); }
.inv-banner-ico { position:relative; z-index:1; }
.inv-body { padding:13px; }
.inv-name { font-family:var(--fd); font-size:14px; font-weight:800; color:var(--t1); margin-bottom:2px; }
.inv-loc { font-size:11px; color:var(--t4); margin-bottom:10px; }
.inv-stats { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:10px; }
.ist { background:var(--sf2); border:1px solid var(--bd); border-radius:var(--r10); padding:8px; text-align:center; }
.ist-l { font-size:9.5px; color:var(--t4); font-weight:700; text-transform:uppercase; letter-spacing:.4px; margin-bottom:2px; }
.ist-v { font-family:var(--fd); font-size:13px; font-weight:700; color:var(--t1); }
.labs-hero { background:linear-gradient(135deg,var(--g800) 0%,var(--g600) 55%,var(--g450) 100%); border-radius:var(--r20); padding:24px; color:#fff; margin-bottom:14px; position:relative; overflow:hidden; }
.labs-hero-grid { position:absolute; inset:0; opacity:.04; background-image:repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 44px), repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 44px); }
.labs-hero-c { position:relative; z-index:1; }
.labs-tag { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; background:rgba(255,255,255,.15); border-radius:var(--rf); font-size:10.5px; font-weight:600; color:rgba(255,255,255,.9); margin-bottom:10px; }
.labs-title { font-family:var(--fd); font-size:22px; font-weight:900; margin-bottom:6px; line-height:1.2; }
.labs-desc { font-size:12.5px; opacity:.8; line-height:1.7; max-width:500px; }
.labs-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:8px; margin-bottom:14px; }
.labs-feat { background:var(--sf); border:1px solid var(--bd); border-radius:var(--r14); padding:14px; transition:all .2s; cursor:pointer; }
.labs-feat:hover { border-color:var(--ac); box-shadow:var(--s2); transform:translateY(-1px); }
.labs-feat-ico { width:36px; height:36px; border-radius:var(--r10); background:var(--as); display:flex; align-items:center; justify-content:center; font-size:17px; margin-bottom:10px; }
.labs-feat-t { font-family:var(--fd); font-size:13px; font-weight:700; color:var(--t1); margin-bottom:3px; }
.labs-feat-d { font-size:11.5px; color:var(--t4); line-height:1.55; margin-bottom:9px; }

/* AI Chat box — full width in section */
.ai-box { background:var(--sf); border:1px solid var(--bd); border-radius:var(--r16); overflow:hidden; margin-bottom:14px; width:100%; }
.ai-box-hd { background:var(--sf2); padding:11px 15px; border-bottom:1px solid var(--bd); display:flex; align-items:center; gap:9px; }
.ai-chat { display:flex; flex-direction:column; gap:10px; padding:16px; overflow-y:auto; max-height:400px; background:var(--bg); }
.ai-msg { display:flex; gap:8px; animation:mIn .2s ease; }
.ai-msg.me { flex-direction:row-reverse; }
.ai-bub { padding:10px 14px; border-radius:var(--r14); font-size:12.5px; line-height:1.6; max-width:82%; }
.ai-bot { background:var(--sf); color:var(--t2); border:1px solid var(--bd); border-bottom-left-radius:4px; }
.ai-me { background:linear-gradient(135deg,var(--g500),var(--g400)); color:#fff; border-bottom-right-radius:4px; box-shadow:0 2px 8px rgba(38,115,38,.2); }
.ai-typing { display:flex; gap:4px; padding:10px 14px; background:var(--sf); border-radius:var(--r14); border:1px solid var(--bd); }
.ai-dot { width:5px; height:5px; border-radius:var(--rf); background:var(--t4); animation:bounce 1.1s infinite; }
.ai-dot:nth-child(2) { animation-delay:.18s; }
.ai-dot:nth-child(3) { animation-delay:.36s; }
@keyframes bounce { 0%,60%,100%{transform:translateY(0);} 30%{transform:translateY(-6px);} }
.ai-prompts { display:flex; flex-wrap:wrap; gap:5px; padding:10px 15px; background:var(--sf); border-top:1px solid var(--bd); }
.ai-input { display:flex; gap:8px; padding:12px 15px; border-top:1px solid var(--bd); background:var(--sf); }

/* Full-screen AI chat */
.ai-fs { position:fixed; inset:0; z-index:850; background:var(--bg); display:flex; flex-direction:column; animation:fIn .2s ease; }
.ai-fs-hd { display:flex; align-items:center; gap:10px; padding:12px 16px; background:var(--sf); border-bottom:1px solid var(--bd); flex-shrink:0; }
.ai-fs-msgs { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:10px; }
.ai-fs-foot { background:var(--sf); border-top:1px solid var(--bd); flex-shrink:0; }

/* Market data — extraordinary */
.mkt-hero { background:linear-gradient(135deg,var(--g800),var(--g550)); border-radius:var(--r20); padding:20px; color:#fff; margin-bottom:14px; position:relative; overflow:hidden; }
.mkt-hero::before { content:''; position:absolute; inset:0; background:radial-gradient(circle at 85% 20%,rgba(255,255,255,.08),transparent 55%); }
.mkt-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:8px; margin-bottom:14px; }
.mkt-card { background:var(--sf); border:1px solid var(--bd); border-radius:var(--r14); padding:14px; transition:all .2s; cursor:pointer; position:relative; overflow:hidden; }
.mkt-card:hover { box-shadow:var(--s3); border-color:var(--bd2); transform:translateY(-2px); }
.mkt-card::before { content:''; position:absolute; bottom:0; left:0; right:0; height:3px; }
.mkt-card.up::before { background:linear-gradient(90deg,var(--g500),var(--g300)); }
.mkt-card.dn::before { background:linear-gradient(90deg,var(--red),var(--red-b)); }
.mkt-crop-name { font-family:var(--fd); font-size:14px; font-weight:800; color:var(--t1); margin-bottom:2px; }
.mkt-crop-loc { font-size:10.5px; color:var(--t4); margin-bottom:10px; }
.mkt-price-big { font-family:var(--fd); font-size:20px; font-weight:900; color:var(--t1); margin-bottom:4px; }
.mkt-mini-row { display:flex; align-items:center; justify-content:space-between; }
.mkt-vol { font-size:10.5px; color:var(--t4); }
.mkt-ticker { display:flex; gap:0; overflow:hidden; background:var(--sf2); border-radius:var(--r10); border:1px solid var(--bd); padding:10px 0; margin-bottom:14px; position:relative; }
.mkt-ticker-inner { display:flex; gap:32px; animation:ticker 20s linear infinite; white-space:nowrap; padding:0 16px; }
@keyframes ticker { from{transform:translateX(0);} to{transform:translateX(-50%);} }
.mkt-tick-item { display:inline-flex; align-items:center; gap:8px; font-size:12px; font-weight:500; color:var(--t2); }
.mkt-tick-price { font-family:var(--fd); font-weight:700; }
.mkt-tick-up { color:var(--g400); }
.mkt-tick-dn { color:var(--red); }
/* Wallet overview card — reimagined */
.w-card {
  background:linear-gradient(135deg,var(--g800) 0%,var(--g650) 50%,var(--g500) 100%);
  border-radius:var(--r24); padding:22px; color:#fff; margin-bottom:14px;
  position:relative; overflow:hidden; box-shadow:0 8px 32px rgba(14,50,14,.4);
}
.w-card::before { content:''; position:absolute; inset:0; background:radial-gradient(circle at 85% 15%,rgba(255,255,255,.1),transparent 55%), radial-gradient(circle at 10% 85%,rgba(255,255,255,.05),transparent 45%); }
.w-card::after { content:''; position:absolute; bottom:-30px; right:-30px; width:180px; height:180px; border-radius:var(--rf); border:1px solid rgba(255,255,255,.07); }
.wci { position:relative; z-index:1; }
.wc-lbl { font-size:10px; opacity:.65; font-weight:700; text-transform:uppercase; letter-spacing:.9px; margin-bottom:4px; }
.wc-amt { font-family:var(--fd); font-size:34px; font-weight:900; line-height:1; margin-bottom:4px; }
.wc-sub { font-size:12px; opacity:.6; margin-bottom:18px; }
/* Action row — Binance-style, 3-4 buttons in one line */
.wc-act-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(0,1fr)); gap:6px; }
.wc-act-btn {
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px;
  padding:10px 4px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12);
  border-radius:var(--r14); color:#fff; font-family:var(--fb); font-size:11px; font-weight:600;
  cursor:pointer; transition:all .15s; backdrop-filter:blur(6px);
}
.wc-act-btn:hover { background:rgba(255,255,255,.16); transform:translateY(-1px); }
.wc-act-ico { width:38px; height:38px; border-radius:var(--rf); background:rgba(255,255,255,.14); display:flex; align-items:center; justify-content:center; }
.wc-act-ico svg { width:16px; height:16px; }

.w-cards { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px; }
@media(max-width:480px){ .w-cards { grid-template-columns:1fr; } }
.w-mini { background:var(--sf); border:1px solid var(--bd); border-radius:var(--r16); padding:15px; position:relative; overflow:hidden; }
.w-mini::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,var(--g500),var(--g350)); }
.w-mini-lbl { font-size:10px; color:var(--t4); font-weight:700; text-transform:uppercase; letter-spacing:.5px; margin-bottom:5px; }
.w-mini-amt { font-family:var(--fd); font-size:22px; font-weight:900; color:var(--t1); margin-bottom:3px; }
.w-mini-note { font-size:10.5px; color:var(--t4); }
.opay-badge { display:flex; align-items:center; gap:5px; margin-top:9px; padding:4px 9px; background:var(--sf3); border-radius:7px; border:1px solid var(--bd); font-size:10.5px; color:var(--t4); font-weight:500; width:fit-content; }
.opay-dot { width:7px; height:7px; border-radius:var(--rf); background:#22c55e; flex-shrink:0; animation:pulse 2s infinite; }
@keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.4);} 50%{box-shadow:0 0 0 4px rgba(34,197,94,0);} }

/* TX rows */
.tx-list { display:flex; flex-direction:column; gap:5px; }
.tx-row { display:flex; align-items:center; gap:11px; padding:11px 13px; background:var(--sf); border:1px solid var(--bd); border-radius:var(--r12); transition:all .15s; cursor:pointer; }
.tx-row:hover { border-color:var(--bd2); box-shadow:var(--s1); }
.tx-ico { width:34px; height:34px; border-radius:var(--r10); display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; }
.tx-in { background:rgba(56,160,56,.1); }
.tx-out { background:var(--red-l); }
.tx-n { background:var(--sf3); }
[data-theme=dark] .tx-in { background:rgba(77,184,77,.1); }
[data-theme=dark] .tx-out { background:rgba(239,68,68,.1); }
.tx-info { flex:1; min-width:0; }
.tx-title { font-size:12.5px; font-weight:600; color:var(--t1); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.tx-sub { font-size:10.5px; color:var(--t4); }
.tx-amt { font-family:var(--fd); font-size:13px; font-weight:700; text-align:right; flex-shrink:0; }
.tx-amt-in { color:var(--g400); }
.tx-amt-out { color:var(--red); }
.tx-date { font-size:10px; color:var(--t5); text-align:right; }

/* TXP */
.txp { background:var(--sf); border:1px solid var(--bd); border-radius:var(--r20); overflow:hidden; }
.txp-hd { background:linear-gradient(135deg,var(--g800),var(--g550)); padding:20px; color:#fff; text-align:center; }
.txp-ico { font-size:46px; margin-bottom:8px; }
.txp-title { font-family:var(--fd); font-size:17px; font-weight:800; margin-bottom:4px; }
.txp-sub { font-size:12px; opacity:.72; }
.txp-body { padding:18px; }
.txp-step { display:flex; align-items:flex-start; gap:11px; padding:11px 0; border-bottom:1px solid var(--bd); }
.txp-step:last-child { border-bottom:none; }
.txp-num { width:23px; height:23px; border-radius:var(--rf); background:var(--ac); color:#fff; font-size:10px; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; }
.txp-num.done { background:var(--g350); }
.txp-num.pend { background:var(--gold); animation:pw 1.5s infinite; }
@keyframes pw { 0%,100%{box-shadow:0 0 0 0 rgba(212,144,26,.4);} 50%{box-shadow:0 0 0 6px rgba(212,144,26,0);} }
.txp-t { font-size:12.5px; font-weight:600; color:var(--t1); }
.txp-s { font-size:11px; color:var(--t4); }

/* PAY OPTIONS */
.pay-opt { display:flex; justify-content:space-between; align-items:center; padding:12px 14px; background:var(--sf2); border:1.5px solid var(--bd2); border-radius:var(--r12); cursor:pointer; transition:all .15s; margin-bottom:7px; }
.pay-opt:hover { border-color:var(--ac); }
.pay-opt.on { border-color:var(--ac); background:var(--as); }
.pay-opt.dim { opacity:.45; cursor:not-allowed; }
.pay-radio { width:17px; height:17px; border:2px solid var(--bd3); border-radius:var(--rf); position:relative; transition:.15s; flex-shrink:0; }
.pay-opt.on .pay-radio { border-color:var(--ac); }
.pay-opt.on .pay-radio::after { content:''; position:absolute; inset:3px; background:var(--ac); border-radius:var(--rf); }

/* Send/Receive hero */
.sr-hero { background:linear-gradient(135deg,var(--g750),var(--g500)); border-radius:var(--r20); padding:20px; color:#fff; margin-bottom:20px; text-align:center; }
.sr-hero-ico { font-size:48px; margin-bottom:10px; }
.sr-hero-t { font-family:var(--fd); font-size:18px; font-weight:800; margin-bottom:4px; }
.sr-hero-s { font-size:12px; opacity:.72; }

/* Buy IST */
.ist-buy-hero {
  background:linear-gradient(135deg,#1a1a2e,#16213e,#0f3460);
  border-radius:var(--r20); padding:24px; color:#fff; margin-bottom:16px; position:relative; overflow:hidden;
}
.ist-buy-hero::before { content:''; position:absolute; inset:0; background:radial-gradient(circle at 80% 20%,rgba(77,184,77,.15),transparent 55%); }
.ist-buy-hero-c { position:relative; z-index:1; }
.ist-token-ico { font-size:52px; margin-bottom:10px; }
.ist-rate-badge { display:inline-flex; align-items:center; gap:6px; padding:4px 12px; background:rgba(77,184,77,.2); border:1px solid rgba(77,184,77,.3); border-radius:var(--rf); font-size:11px; font-weight:700; color:var(--g200); margin-bottom:12px; }
.ist-packages { display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:8px; margin-bottom:16px; }
.ist-pkg {
  background:var(--sf); border:2px solid var(--bd2); border-radius:var(--r14);
  padding:14px; cursor:pointer; transition:all .2s; text-align:center;
}
.ist-pkg:hover { border-color:var(--ac); }
.ist-pkg.on { border-color:var(--ac); background:var(--as); box-shadow:0 0 0 3px var(--as2); }
.ist-pkg-amt { font-family:var(--fd); font-size:18px; font-weight:900; color:var(--t1); margin-bottom:2px; }
.ist-pkg-naira { font-size:11px; color:var(--t4); margin-bottom:6px; }
.ist-pkg-bonus { font-size:10px; font-weight:700; color:var(--gold); }
.msg-shell { display:flex; height:100%; overflow:hidden; }
.msg-sb { width:300px; border-right:1px solid var(--bd); display:flex; flex-direction:column; overflow:hidden; flex-shrink:0; background:var(--sf); }
.msg-sb-hd { padding:10px; border-bottom:1px solid var(--bd); flex-shrink:0; }
.msg-list { flex:1; overflow-y:auto; }
.convo { display:flex; align-items:center; gap:10px; padding:12px 14px; cursor:pointer; border-bottom:1px solid var(--bd); transition:background .12s; position:relative; }
.convo:hover { background:var(--sf2); }
.convo.on { background:var(--as2); }
.convo-info { flex:1; min-width:0; }
.convo-name { font-size:13px; font-weight:700; color:var(--t1); margin-bottom:2px; }
.convo-prev { font-size:11.5px; color:var(--t4); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.convo-meta { display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0; }
.convo-time { font-size:10px; color:var(--t5); }
.unread { min-width:18px; height:18px; padding:0 4px; background:var(--ac); color:#fff; font-size:9px; font-weight:800; border-radius:var(--rf); display:flex; align-items:center; justify-content:center; }

/* Chat area */
.chat-area { flex:1; display:flex; flex-direction:column; overflow:hidden; }
.chat-hd { display:flex; align-items:center; gap:10px; padding:10px 14px; border-bottom:1px solid var(--bd); flex-shrink:0; background:var(--sf); }
.chat-status { font-size:10.5px; color:var(--g400); margin-top:1px; }
.chat-msgs { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:10px; background:var(--bg); }

/* Bubble design */
.brow { display:flex; gap:8px; animation:mIn .18s ease; align-items:flex-end; }
.brow.me { flex-direction:row-reverse; }
.bub-wrap { max-width:68%; }
.bub { padding:10px 14px; font-size:12.5px; line-height:1.55; word-break:break-word; }
.bub-them { background:var(--sf); color:var(--t1); border:1px solid var(--bd); border-radius:var(--r16); border-bottom-left-radius:4px; box-shadow:var(--s1); }
.bub-me { background:linear-gradient(135deg,var(--g550),var(--g400)); color:#fff; border-radius:var(--r16); border-bottom-right-radius:4px; box-shadow:0 2px 10px rgba(38,115,38,.22); }
.bub-time { font-size:9.5px; color:var(--t5); margin-top:3px; }
.brow.me .bub-time { text-align:right; color:rgba(255,255,255,.45); }

/* Chat bar */
.chat-bar { display:flex; align-items:flex-end; gap:8px; padding:10px 14px; border-top:1px solid var(--bd); background:var(--sf); flex-shrink:0; }
.chat-plus-btn { width:34px; height:34px; border:1px solid var(--bd2); background:var(--sf2); color:var(--t4); border-radius:var(--rf); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .15s; flex-shrink:0; }
.chat-plus-btn:hover { background:var(--as); color:var(--ac); border-color:var(--ac); }
.chat-plus-btn svg { width:16px; height:16px; }
.chat-field { flex:1; border:1px solid var(--bd2); border-radius:20px; padding:9px 14px; font-family:var(--fb); font-size:12.5px; color:var(--t1); background:var(--sf2); outline:none; resize:none; max-height:100px; overflow-y:auto; line-height:1.4; transition:all .15s; }
.chat-field:focus { border-color:var(--ac); box-shadow:0 0 0 3px var(--as); background:var(--sf); }
.chat-field::placeholder { color:var(--t5); }
.send-btn { width:36px; height:36px; border-radius:var(--rf); border:none; background:linear-gradient(135deg,var(--g500),var(--g400)); color:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .15s; flex-shrink:0; box-shadow:0 2px 8px rgba(38,115,38,.25); }
.send-btn:hover { background:linear-gradient(135deg,var(--g450),var(--g350)); transform:scale(1.05); }
.send-btn svg { width:13px; height:13px; }

/* Chat action dropdown */
.chat-action-dd { position:absolute; top:calc(100% + 6px); right:0; width:220px; background:var(--sf); border:1px solid var(--bd2); border-radius:var(--r14); box-shadow:var(--s4); overflow:hidden; z-index:100; animation:ddIn .18s ease; }
.cad-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border:none; background:transparent; color:var(--t2); font-family:var(--fb); font-size:12.5px; font-weight:500; width:100%; cursor:pointer; transition:background .12s; }
.cad-item:hover { background:var(--as); color:var(--ac); }
.cad-item.danger { color:var(--red); }
.cad-item.danger:hover { background:var(--red-l); }
.cad-item svg { width:14px; height:14px; flex-shrink:0; }

/* Mobile messages — full screen chat covers everything */
@media(max-width:600px){
  .msg-sb { width:100%; border-right:none; }
  .msg-list-view .chat-area { display:none; }
  .msg-chat-view .msg-sb { display:none; }
  .msg-chat-view { position:fixed; inset:0; z-index:400; background:var(--bg); }
  .msg-chat-view .chat-area { height:100vh; height:100dvh; }
  .msg-chat-view .chat-hd { padding-top:max(10px, env(safe-area-inset-top)); }
}
@media(min-width:601px) and (max-width:1024px){
  .msg-sb { width:260px; }
}
.acc-hero { background:linear-gradient(135deg,var(--g900),var(--g650)); border-radius:var(--r20); padding:24px; color:#fff; margin-bottom:14px; position:relative; overflow:hidden; }
.acc-hero::before { content:''; position:absolute; inset:0; background:radial-gradient(circle at 80% 30%,rgba(255,255,255,.07),transparent 55%); }
.ah { position:relative; z-index:1; display:flex; align-items:center; gap:15px; }
.ah-av { width:60px; height:60px; border-radius:var(--rf); background:rgba(255,255,255,.18); display:flex; align-items:center; justify-content:center; font-family:var(--fd); font-weight:900; font-size:22px; border:2px solid rgba(255,255,255,.28); flex-shrink:0; }
.wc-btn { display:flex; align-items:center; gap:5px; padding:8px 14px; background:rgba(255,255,255,.13); border:1px solid rgba(255,255,255,.18); border-radius:var(--r10); color:#fff; font-family:var(--fb); font-size:12px; font-weight:600; cursor:pointer; transition:all .15s; backdrop-filter:blur(4px); }
.wc-btn:hover { background:rgba(255,255,255,.22); }
.wc-btn svg { width:13px; height:13px; }
.set-row { display:flex; align-items:center; justify-content:space-between; padding:13px 15px; background:var(--sf); border:1px solid var(--bd); border-radius:var(--r14); margin-bottom:6px; transition:all .15s; cursor:pointer; }
.set-row:hover { border-color:var(--ac); box-shadow:var(--s2); background:var(--as); }
.set-left { display:flex; align-items:center; gap:12px; }
.set-ico { width:34px; height:34px; border-radius:var(--rf); background:transparent; border:1px solid var(--bd2); display:flex; align-items:center; justify-content:center; color:var(--t3); transition:all .15s; }
.set-row:hover .set-ico { color:var(--ac); border-color:var(--ac); background:rgba(255,255,255,.04); }
.set-ico svg { width:15px; height:15px; }
.set-row > svg { width:14px; height:14px; flex-shrink:0; }
.faq-q svg { width:14px; height:14px; flex-shrink:0; }
.set-t { font-size:12.5px; font-weight:600; color:var(--t1); }
.set-s { font-size:11px; color:var(--t4); margin-top:1px; }

/* Bio card — polished farm description block */
.bio-card { background:linear-gradient(160deg,var(--sf),var(--sf2)); border:1px solid var(--bd2); border-radius:var(--r16); padding:16px; margin-bottom:14px; position:relative; overflow:hidden; }
.bio-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,var(--g500),var(--g350)); }
.bio-card-hd { display:flex; align-items:flex-start; gap:11px; margin-bottom:12px; }
.bio-card-ico { width:34px; height:34px; border-radius:var(--r10); background:var(--as); color:var(--ac); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.bio-card-ico svg { width:15px; height:15px; }
.bio-card-title { font-size:13px; font-weight:700; color:var(--t1); }
.bio-card-sub { font-size:11px; color:var(--t4); margin-top:2px; line-height:1.5; }
.bio-textarea { background:var(--sf); min-height:90px; }
.bio-card-count { font-size:10.5px; color:var(--t5); text-align:right; margin-top:6px; }
.set-group-lbl { font-size:9px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:var(--t5); margin:18px 2px 8px; }
.set-group-lbl:first-child { margin-top:0; }
.sup-overlay { position:fixed; inset:0; background:var(--bg); z-index:800; display:flex; flex-direction:column; animation:fIn .2s ease; }
.sup-hd { display:flex; align-items:center; gap:10px; padding:12px 16px; background:var(--sf); border-bottom:1px solid var(--bd); flex-shrink:0; }
.sup-body { flex:1; overflow-y:auto; }
.sup-hero { background:linear-gradient(135deg,var(--g800),var(--g600)); padding:28px; color:#fff; text-align:center; position:relative; overflow:hidden; }
.sup-hero::before { content:''; position:absolute; inset:0; background:radial-gradient(circle at 50% 0%,rgba(255,255,255,.1),transparent 60%); }
.sup-hero-c { position:relative; z-index:1; }
.sup-content { padding:16px; }
.sup-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:8px; margin-bottom:20px; }
.sup-card { background:var(--sf); border:1px solid var(--bd); border-radius:var(--r16); padding:18px; text-align:center; cursor:pointer; transition:all .2s; }
.sup-card:hover { border-color:var(--ac); box-shadow:var(--s2); transform:translateY(-2px); }
.sup-card-ico { font-size:28px; margin-bottom:8px; }
.sup-card-t { font-family:var(--fd); font-size:13px; font-weight:700; color:var(--t1); margin-bottom:4px; }
.sup-card-d { font-size:11.5px; color:var(--t4); line-height:1.5; }
.faq-item { background:var(--sf); border:1px solid var(--bd); border-radius:var(--r12); margin-bottom:6px; overflow:hidden; }
.faq-q { padding:13px 15px; font-size:12.5px; font-weight:600; color:var(--t1); cursor:pointer; display:flex; justify-content:space-between; align-items:center; }
.faq-q:hover { background:var(--sf2); }
.faq-a { padding:0 15px 13px; font-size:12px; color:var(--t3); line-height:1.65; border-top:1px solid var(--bd); padding-top:10px; }
.notif-list { display:flex; flex-direction:column; gap:10px; }
.notif-row { display:flex; align-items:flex-start; gap:13px; padding:15px 16px; background:var(--sf); border:1px solid var(--bd2); border-radius:var(--r16); transition:all .15s; cursor:pointer; position:relative; box-shadow:var(--s1); overflow:hidden; }
.notif-row:hover { border-color:var(--ac); box-shadow:var(--s2); transform:translateY(-1px); }
.notif-row.unread { border-color:var(--as3); background:var(--as); }
.notif-row.unread::before { content:''; position:absolute; top:0; left:0; bottom:0; width:3px; background:var(--ac); }
.notif-ico { width:40px; height:40px; border-radius:var(--rf); background:var(--sf3); border:1px solid var(--bd); display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
.notif-info { flex:1; min-width:0; display:flex; flex-direction:column; gap:3px; }
.notif-title-row { display:flex; align-items:flex-start; justify-content:space-between; gap:10px; }
.notif-title { font-size:13px; font-weight:700; color:var(--t1); line-height:1.4; }
.notif-body { font-size:11.5px; color:var(--t3); line-height:1.6; }
.notif-time { font-size:10px; color:var(--t5); white-space:nowrap; flex-shrink:0; margin-top:1px; }
.notif-dot { width:8px; height:8px; border-radius:var(--rf); background:var(--ac); flex-shrink:0; margin-top:5px; box-shadow:0 0 0 3px var(--as2); }
`;

/* ============================================================
   SEED DATA
   ============================================================ */

export default CSS;
