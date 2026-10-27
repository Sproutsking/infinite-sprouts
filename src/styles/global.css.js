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
  --sw-desk: 250px;
  --sw-tab: clamp(72px, 10vw, 110px);
  --shell-max: 1250px;
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
  --bg:#080a09; --sf:#101312; --sf2:#141817; --sf3:#1a1f1c; --sf4:#222824;
  --bd:rgba(190,205,194,.08); --bd2:rgba(190,205,194,.14); --bd3:rgba(190,205,194,.24); --bd4:rgba(190,205,194,.38);
  --t1:#f0f3f0; --t2:#c7cec8; --t3:#9aa49c; --t4:#77827a; --t5:#59645c; --t6:#3e4841;
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
body { display:flex; justify-content:center; }
#root { width:100%; }

/* ---- HIDE ALL SCROLLBARS (but keep scroll) ---- */
* { scrollbar-width:none !important; }
*::-webkit-scrollbar { display:none !important; }
.shell {
  display:flex;
  flex-direction:column;
  height:100vh; height:100dvh; overflow:hidden;
  width:100%;
  max-width:var(--shell-max);
  margin:0 auto;
  background:var(--bg);
  border-left:1px solid var(--bd);
  border-right:1px solid var(--bd);
  box-shadow:0 0 0 1px rgba(255,255,255,.02);
  gap:0;
}
.workspace {
  display:flex;
  flex:1 1 auto;
  flex-direction:row;
  min-width:0;
  min-height:0;
  overflow:hidden;
}
@media(max-width:1024px) and (min-width:601px){
  .sidebar.sidebar-v2 { flex-basis:var(--sw-tab); width:var(--sw-tab); }
}
@media(max-width:600px){
  .workspace {
    flex-direction:column;
  }
  .main-shell { order:1; width:100%; flex:1 1 0; }
  .sidebar.sidebar-v2 { order:2; flex:0 0 auto; width:100%; }
}
.root-hd {
  height:var(--hh); flex:0 0 var(--hh);
  background:linear-gradient(180deg, rgba(8,20,9,0.98), rgba(7,15,8,0.96));
  border-bottom:1px solid var(--bd);
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
  min-height:100vh; height:100vh; height:100dvh; display:flex; align-items:center; justify-content:center;
  padding:20px; position:relative; overflow:hidden;
  background:linear-gradient(180deg, #061009 0%, #081811 32%, #04100b 100%);
}
.auth-shell::before {
  content:''; position:absolute; inset:0;
  background-image:
    radial-gradient(circle at 16% 18%, rgba(72,255,138,.16), transparent 20%),
    radial-gradient(circle at 84% 14%, rgba(112,218,255,.12), transparent 16%),
    radial-gradient(circle at 50% 78%, rgba(255,255,255,.05), transparent 16%);
  opacity:.9; pointer-events:none;
}
..auth-shell::after {
  content:''; position:absolute; inset:0;
  background-image:
    radial-gradient(circle, rgba(255,255,255,.18) 1px, transparent 1px),
    radial-gradient(circle, rgba(255,255,255,.1) 1px, transparent 1px);
  background-size:42px 42px, 18px 18px;
  opacity:.45; pointer-events:none;
}

.auth-landing {
  position:relative; z-index:1; width:100%; max-width:1040px; max-height:100%;
  display:flex; flex-wrap:wrap; gap:20px; align-items:center;
}
.auth-landing::before {
  content:''; position:absolute; inset:0;
  background-image:
    radial-gradient(circle at 13% 22%, rgba(58,255,160,.08), transparent 20%),
    radial-gradient(circle at 92% 18%, rgba(41,188,255,.06), transparent 16%),
    radial-gradient(circle at 35% 70%, rgba(255,255,255,.04), transparent 17%);
  pointer-events:none;
}
.auth-landing::after {
  content:''; position:absolute; inset:12px;
  border:1px solid rgba(255,255,255,.08);
  border-radius:30px;
  pointer-events:none;
}

/* Landing (signed-out) */
.auth-landing {
  position:relative; z-index:1; width:100%; max-width:1040px; max-height:100%;
  display:flex; flex-wrap:wrap; gap:20px; align-items:center;
}
.auth-copy { flex:1 1 360px; min-width:0; }
.auth-panel {
  padding:clamp(22px,4.5vh,36px) clamp(22px,3vw,32px);
  background:rgba(0,0,0,.24); border:1px solid rgba(144,255,84,.12);
  border-radius:26px; box-shadow:0 30px 70px rgba(0,0,0,.28); backdrop-filter:blur(22px);
}
.auth-eyebrow {
  display:block; color:#3eff45; font-size:.78rem; font-weight:800;
  text-transform:uppercase; letter-spacing:.18em; margin-bottom:8px;
}
.auth-title {
  margin:0 0 10px; font-size:clamp(2rem,4.2vw,3.1rem); line-height:1;
  color:#ffd200; font-weight:900; font-family:var(--fd);
}
.auth-desc {
  margin:0; max-width:480px; color:rgba(255,255,255,.85); font-size:.9rem; line-height:1.6;
}
.auth-actions { display:flex; flex-wrap:wrap; align-items:center; gap:16px; margin-top:20px; }
.auth-btn {
  display:inline-flex; align-items:center; justify-content:center; gap:9px;
  padding:13px 22px; border-radius:999px; font-family:var(--fb); font-weight:800; font-size:.86rem;
  letter-spacing:.03em; border:1px solid transparent; cursor:pointer; transition:all .18s ease;
}
.auth-btn-icon {
  display:flex; align-items:center; justify-content:center;
  width:28px; height:28px; border-radius:999px; background:rgba(255,255,255,.12);
}
.auth-btn-primary {
  background:linear-gradient(135deg,#37e083,#1cc7ff); color:#fff; border-color:rgba(56,244,132,.28);
}
.auth-btn-primary:hover { transform:translateY(-1px); box-shadow:0 18px 40px rgba(56,244,132,.24); }
.auth-secondary-link {
  font-size:.8rem; font-weight:600; color:rgba(255,255,255,.55); text-decoration:none; transition:color .15s;
}
.auth-secondary-link:hover { color:#9cff7f; }

.auth-card {
  width:100%; background:rgba(15,30,16,.94); border:1px solid rgba(255,255,255,.08);
  border-radius:26px; padding:22px 20px; box-shadow:0 26px 70px rgba(0,0,0,.26);
  flex:1 1 280px; min-width:0;
}
.auth-card-header { display:flex; align-items:center; gap:11px; margin-bottom:16px; }
.auth-card-icon {
  width:36px; height:36px; border-radius:13px; display:flex; align-items:center; justify-content:center;
  background:rgba(50,255,94,.14); color:#7fff9c; font-size:1.05rem; flex-shrink:0;
}
.auth-card-title { font-size:.88rem; color:#b3ff9d; font-weight:800; font-family:var(--fd); }
.auth-card-stats { display:flex; flex-wrap:wrap; gap:8px; }
.auth-stat {
  flex:1 1 130px;
  display:flex; flex-direction:column; gap:3px; padding:11px 13px; border-radius:14px;
  background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08);
}
.auth-stat-label { color:rgba(255,255,255,.62); font-size:.72rem; }
.auth-stat-value { color:#7bff7e; font-size:1.05rem; font-weight:800; font-family:var(--fd); }
.auth-card-footer { display:flex; justify-content:center; margin-top:16px; }
.auth-dots { display:flex; gap:8px; }
.auth-dot { width:8px; height:8px; border-radius:999px; background:#3bff5d; opacity:.24; }
.auth-dot.active { opacity:1; box-shadow:0 0 10px rgba(59,255,93,.32); }

/* Loading state */
.auth-loading-card {
  position:relative; z-index:1; width:100%; max-width:340px; text-align:center;
  padding:32px 26px; background:rgba(0,0,0,.24); border:1px solid rgba(144,255,84,.12);
  border-radius:24px; box-shadow:0 30px 70px rgba(0,0,0,.28); backdrop-filter:blur(22px); color:#fff;
}
.auth-loading-logo { font-size:2.1rem; margin-bottom:10px; }
.auth-loading-title { font-family:var(--fd); font-size:1.2rem; font-weight:900; color:#ffd200; margin-bottom:6px; }
.auth-loading-copy { font-size:.85rem; color:rgba(255,255,255,.7); line-height:1.5; margin-bottom:18px; }
.auth-loading-status {
  display:flex; align-items:center; justify-content:center; gap:9px;
  font-size:.78rem; color:rgba(255,255,255,.55); font-weight:600;
}
.auth-spinner {
  width:14px; height:14px; border-radius:999px; flex-shrink:0;
  border:2px solid rgba(255,255,255,.18); border-top-color:#3eff45;
  animation:auth-spin .7s linear infinite;
}
@keyframes auth-spin { to { transform:rotate(360deg); } }

/* Below this width, drop the stat card — hero copy + CTA only */
@media(max-width:960px) {
  .auth-landing { flex-direction:column; max-width:100%; justify-content:center; text-align:center; }
  .auth-panel { width:100%; padding:32px 24px; background:transparent; border:0; box-shadow:none; }
  .auth-copy { width:100%; }
  .auth-desc { max-width:100%; }
  .auth-actions { justify-content:center; }
  .auth-card { width:100%; max-width:100%; background:rgba(0,0,0,.28); border:0; box-shadow:0 32px 90px rgba(0,0,0,.3); border-radius:28px; padding:26px 22px; }
  .auth-card-header { justify-content:center; }
  .auth-card-stats { display:flex; gap:10px; }
  .auth-stat { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08); }
  .auth-landing::before { display:block; }
  .auth-landing::after { display:none; }
}
@media(max-width:480px) {
  .auth-shell { padding:12px; }
  .auth-landing { gap:18px; }
  .auth-panel { padding:22px 16px; }
  .auth-actions { flex-direction:column; gap:14px; }
  .auth-btn { width:100%; }
  .auth-card { padding:22px 18px; }
  .auth-card-header { gap:10px; }
  .auth-card-icon { width:32px; height:32px; }
}

/* Short viewports (laptop browser chrome, landscape phones) — guarantee no scroll */
@media(max-height:760px) {
  .auth-card { display:none; }
  .auth-landing { flex-direction:column; max-width:520px; justify-content:center; text-align:center; }
  .auth-panel { width:100%; padding:22px 22px; }
  .auth-title { font-size:clamp(1.7rem,4vw,2.2rem); margin-bottom:6px; }
  .auth-eyebrow { margin-bottom:6px; }
  .auth-desc { font-size:.82rem; max-width:100%; }
  .auth-actions { margin-top:12px; justify-content:center; }
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


@media(min-width:1025px){
  .btn { padding:11px 18px; font-size:13px; }
  .btn-sm { padding:7px 12px; font-size:12px; }
  .btn-lg { padding:13px 22px; font-size:14px; }
  .btn-full { min-height:44px; }
}

.main-shell {
  display:flex;
  flex:1 1 0;
  flex-direction:row;
  min-width:0;
  min-height:0;
  height:100%;
  width:100%;
  max-width:100%;
  padding:0;
  overflow:hidden;
  background:var(--bg);
  border-left:1px solid var(--bd);
  position:relative;
  z-index:1;
  isolation:isolate;
  contain:layout paint;
}

.section-host { display:flex; flex:1 1 700px; flex-direction:column; overflow:hidden; background:var(--bg); min-width:0; min-height:0; height:100%; width:100%; max-width:700px; }
.section-host > * { animation:sectionReveal .22s cubic-bezier(.2,.75,.25,1) both; }
@keyframes sectionReveal {
  from { opacity:.88; transform:translateY(5px); }
  to { opacity:1; transform:translateY(0); }
}
@media(prefers-reduced-motion:reduce) {
  .section-host > * { animation:none; }
}
.main-shell.messages-layout .section-host { flex:1 1 0; max-width:none; }
.main { display:flex; flex:1; flex-direction:column; overflow:hidden; background:var(--bg); min-width:0; min-height:0; height:100%; width:100%; max-width:100%; border-radius:0; border:0; box-shadow:none; }

.right-rail {
  display:flex;
  flex-direction:column;
  gap:12px;
  min-width:220px;
  max-width:300px;
  width:100%;
  padding:12px 12px 14px;
  margin-top:0;
  border-left:1px solid var(--bd);
  background:linear-gradient(180deg, rgba(10,20,10,0.3), rgba(8,14,8,0));
  overflow-y:auto;
  overflow-x:hidden;
  overscroll-behavior:contain;
  min-height:0;
}
.rail-card {
  background:linear-gradient(180deg, var(--sf), var(--sf2));
  border:1px solid var(--bd2);
  border-radius:var(--r12);
  box-shadow:var(--s2);
  overflow:hidden;
  transition:transform .15s ease, border-color .15s ease;
  margin:0 2px 0 0;
}
.rail-card:hover { transform:translateY(-1px); border-color:var(--ac); }
.rail-card button, .rail-card .rail-button {
  display:flex; align-items:center; justify-content:space-between; gap:10px;
  width:100%; background:transparent; border:none; color:var(--t1); padding:12px 14px;
  font-family:var(--fb); font-size:12px; font-weight:600; cursor:pointer; text-align:left;
}
.rail-card .rail-button + .rail-button { border-top:1px solid var(--bd); }
.rail-card .rail-label { display:flex; align-items:center; gap:8px; color:var(--t2); }
.rail-card .rail-ico {
  width:28px; height:28px; border-radius:var(--r10); background:var(--as); color:var(--ac);
  display:flex; align-items:center; justify-content:center; flex-shrink:0;
}
.rail-card .rail-ico svg { width:14px; height:14px; }
.rail-card .rail-value {
  font-family:var(--fd); font-size:17px; font-weight:800; color:var(--t1);
}
.rail-card .rail-copy {
  padding:14px 14px 10px; border-bottom:1px solid var(--bd);
  background:linear-gradient(135deg, rgba(38,115,38,.08), rgba(255,255,255,0));
}
.rail-card .rail-title {
  font-size:10px; letter-spacing:1px; font-weight:700; text-transform:uppercase; color:var(--t4);
  margin-bottom:8px;
}
.rail-card .rail-headline {
  font-family:var(--fd); font-size:18px; font-weight:800; color:var(--t1);
  line-height:1.2;
}
.rail-card .rail-sub { font-size:11px; color:var(--t4); margin-top:4px; }

@media(max-width:1100px){
  .main-shell {
    flex-direction:row;
  }
  .right-rail { min-width:220px; max-width:290px; flex-basis:290px; }
}
@media(min-width:761px) and (max-width:900px){
  .main-shell { flex-direction:row; }
  .right-rail {
    min-width:0;
    max-width:220px;
    width:100%;
    flex-basis:220px;
    padding:10px 8px;
  }
}
@media(max-width:760px){
  .main-shell {
    border-left:0;
  }
  .right-rail { display:none; }
}

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
.field-hint { margin-top:5px; color:var(--t5); font-size:10.5px; line-height:1.45; }
.field:focus { border-color:var(--ac); box-shadow:0 0 0 3px var(--as); }
.textarea { resize:vertical; min-height:80px; }
.label { display:block; font-size:11px; font-weight:600; color:var(--t3); margin-bottom:4px; }
.form-g { margin-bottom:12px; }
.form-row { display:flex; flex-wrap:wrap; gap:12px; }
.form-row > * { flex:1 1 calc(50% - 6px); min-width:0; }
@media(max-width:500px){ .form-row > * { flex-basis:100%; } }

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
  position:fixed; inset:0; overflow-y:auto; overscroll-behavior:contain;
  background:rgba(0,0,0,.68); backdrop-filter:blur(3px); -webkit-backdrop-filter:blur(3px);
  z-index:2100; display:flex; align-items:center; justify-content:center;
  padding:16px; animation:fIn .2s ease;
}
@keyframes fIn { from{opacity:0;} to{opacity:1;} }

/* MODAL */
.mbox {
  background:var(--sf); border-radius:var(--r24); border:1px solid var(--bd2);
  box-shadow:var(--s5); width:100%; max-width:480px;
  max-height:calc(100dvh - 32px); display:flex; flex-direction:column; overflow:hidden;
  animation:mIn .2s cubic-bezier(.2,0,.2,1);
}
.mbox-wide { max-width:780px; }
.mbox-lg { max-width:640px; }
@keyframes mIn { from{opacity:0;transform:scale(.98);} to{opacity:1;transform:scale(1);} }

@media(max-width:600px){
  .mbox, .mbox-wide, .mbox-lg {
    max-width:480px; width:100%; max-height:calc(100dvh - 32px);
  }
  .mbody { padding:18px; }
}

.mhd {
  display:flex; align-items:center; justify-content:space-between;
  padding:16px 20px; border-bottom:1px solid var(--bd);
  flex:0 0 auto; background:var(--sf);
  border-radius:var(--r24) var(--r24) 0 0;
}
.mt { font-family:var(--fd); font-size:15px; font-weight:700; color:var(--t1); }
.mbody { flex:1 1 auto; min-height:0; overflow-y:auto; overscroll-behavior:contain; padding:20px; }
.mfoot {
  padding:14px 20px; border-top:1px solid var(--bd);
  display:flex; flex:0 0 auto; gap:8px; justify-content:flex-end;
  background:var(--sf);
}

.anchored-popover {
  position:fixed; z-index:1500; width:min(390px,calc(100vw - 24px));
  max-height:calc(100dvh - 24px); overflow:auto; overscroll-behavior:contain;
  background:var(--sf); border:1px solid var(--bd2); border-radius:var(--r20);
  box-shadow:var(--s5); color:var(--t1); animation:popoverIn .14s ease-out;
}
.anchored-popover.share-post-popover { width:min(410px,calc(100vw - 24px)); }
.anchored-popover-header {
  display:flex; align-items:center; justify-content:space-between; gap:12px;
  padding:12px 14px; border-bottom:1px solid var(--bd);
}
.anchored-popover-header h2 { font:700 13px/1.4 var(--fd); color:var(--t1); }
.anchored-popover-body { padding:14px; }
.anchored-popover-footer { padding:0 14px 14px; }
@keyframes popoverIn { from{opacity:0;transform:translateY(-3px) scale(.99);} to{opacity:1;transform:none;} }

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
.av { border-radius:var(--rf); display:flex; align-items:center; justify-content:center; font-family:var(--fd); font-weight:800; flex-shrink:0; overflow:hidden; }
.av img { width:100%; height:100%; object-fit:cover; border-radius:inherit; }
.av-xl { width:52px; height:52px; font-size:18px; }
.av-lg { width:40px; height:40px; font-size:14px; }
.av-md { width:33px; height:33px; font-size:12px; }
.av-sm { width:27px; height:27px; font-size:10px; }
.av-c { background:var(--as2); color:var(--ac); }
.av-g { background:linear-gradient(135deg,var(--g500),var(--g350)); color:#fff; }

/* STAT ROW */
.stat-row { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px; }
.stat-row > * { flex:1 1 120px; min-width:0; }
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

/* ═════════════════════════════════════════════════════════════════
   Post Card - GrovaApp Design (with profile click functionality)
   ═════════════════════════════════════════════════════════════════ */
.gvp-card {
  background:var(--sf); border:1px solid var(--bd); border-radius:var(--r16); padding:14px;
  transition:all .2s ease; display:flex; flex-direction:column;
}

/* Header: Profile info + Author details + Menu */
.gvp-header {
  display:flex; align-items:center; gap:10px; margin-bottom:12px;
}
.gvp-hsp {
  flex:1; display:flex; flex-direction:column; min-width:0;
}
.gvp-author-row {
  display:flex; align-items:center; gap:6px; margin-bottom:2px;
}
.gvp-author-name {
  font-size:13px; font-weight:700; color:var(--t1); line-height:1.3;
}
.gvp-ts {
  font-size:11px; color:var(--t4);
}
.gvp-author-handle {
  font-size:11px; color:var(--t4); font-weight:500;
}

/* Body: Content (text + media + tags) */
.gvp-body {
  flex:1; margin-bottom:12px; display:flex; flex-direction:column; gap:8px;
}
.gvp-media-wrap {
  width:100%; border-radius:var(--r12); overflow:hidden;
  position:relative; display:flex; align-items:center;
}
.gvp-cinematic {
  position:absolute; inset:0; background:linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,.12) 100%);
  z-index:1; pointer-events:none;
}
.gvp-slide {
  width:100%; opacity:0; transition:opacity .3s ease;
  display:none; flex-shrink:0;
}
.gvp-slide.show {
  opacity:1; display:block;
}
.gvp-text-only {
  display:flex; flex-direction:column; gap:8px;
}

/* Tags */
.post-tags { display:flex; flex-wrap:wrap; gap:4px; margin-top:4px; }
.post-tag { padding:4px 10px; background:var(--as); color:var(--ac); border-radius:var(--rf); font-size:10px; font-weight:600; }

/* Footer: Actions (likes, comments, shares, save) */
.gvp-footer {
  display:flex; align-items:center; gap:2px; padding-top:10px; border-top:1px solid var(--bd);
}
.post-act {
  display:flex; align-items:center; gap:4px; padding:6px 10px;
  border:none; background:transparent; border-radius:var(--r8);
  color:var(--t4); font-size:12px; font-weight:500;
  cursor:pointer; transition:all .15s ease; font-family:var(--fb);
  user-select:none;
}
.post-act:hover {
  background:var(--as); color:var(--ac);
}
.post-act.liked {
  color:var(--red);
}
.post-act.saved { color:var(--ac); }
.post-act svg {
  width:13px; height:13px;
}
.reaction-button { position:relative; overflow:visible; }
.reaction-heart { position:relative; z-index:1; display:inline-flex; align-items:center; }
.reaction-button.liked .reaction-heart svg { animation:likeBeat .34s cubic-bezier(.2,.8,.3,1.4); }
.like-burst { position:absolute; left:16px; top:50%; width:0; height:0; pointer-events:none; z-index:3; }
.like-burst i { position:absolute; width:5px; height:5px; border-radius:50%; background:var(--red); animation:likeParticle .68s ease-out forwards; }
.like-burst i:nth-child(1) { --dx:0px; --dy:-19px; }
.like-burst i:nth-child(2) { --dx:15px; --dy:-12px; background:#ffb14a; }
.like-burst i:nth-child(3) { --dx:18px; --dy:5px; }
.like-burst i:nth-child(4) { --dx:0px; --dy:17px; background:#ff7185; }
.like-burst i:nth-child(5) { --dx:-15px; --dy:8px; }
.like-burst i:nth-child(6) { --dx:-14px; --dy:-11px; background:#ffb14a; }
@keyframes likeBeat { 45% { transform:scale(1.45); } 100% { transform:scale(1); } }
@keyframes likeParticle { 0% { opacity:0; transform:translate(0,0) scale(.3); } 22% { opacity:1; } 100% { opacity:0; transform:translate(var(--dx),var(--dy)) scale(0); } }

/* Old styles for backward compatibility */
.post-card { background:var(--sf); border:1px solid var(--bd); border-radius:var(--r16); padding:15px; transition:all .2s; }
.post-card:hover { border-color:var(--bd2); box-shadow:var(--s2); }
.post-hd { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
.post-name { font-size:13px; font-weight:700; color:var(--t1); }
.post-meta { font-size:11px; color:var(--t4); margin-top:1px; }
.post-body { font-size:13px; color:var(--t2); line-height:1.7; margin-bottom:10px; }
.post-img { width:100%; height:170px; background:var(--sf3); border-radius:var(--r12); display:flex; align-items:center; justify-content:center; font-size:42px; margin-bottom:10px; border:1px solid var(--bd); flex-shrink:0; }
.post-content { display:block; }
.post-text-col { display:block; }
@container postfeed (min-width:560px){
  .post-card.has-media .post-content { display:flex; align-items:stretch; gap:16px; }
  .post-card.has-media .post-text-col { flex:1 1 auto; min-width:0; display:flex; flex-direction:column; }
  .post-card.has-media .post-body { flex:1; margin-bottom:0; }
  .post-card.has-media .post-img { width:200px; height:140px; margin-bottom:0; flex-shrink:0; }
}
.compose-box { background:var(--sf); border:1px solid var(--bd); border-radius:var(--r16); padding:14px; margin-bottom:14px; }
.compose-input { width:100%; border:none; background:transparent; font-family:var(--fb); font-size:13px; color:var(--t1); resize:none; outline:none; min-height:60px; line-height:1.6; }
.compose-input::placeholder { color:var(--t5); }
.compose-foot { display:flex; align-items:center; justify-content:space-between; padding-top:10px; border-top:1px solid var(--bd); }

/* Community card */
.comm-card {
  background:linear-gradient(160deg,var(--sf),var(--sf2)); border:1px solid var(--bd); border-radius:var(--r16);
  overflow:hidden; cursor:pointer; transition:all .2s; position:relative;
}
.comm-card:hover { box-shadow:var(--s3); border-color:var(--bd2); transform:translateY(-2px); }
.comm-banner { height:104px; display:flex; align-items:center; justify-content:center; font-size:34px; position:relative; overflow:hidden; }
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
.comm-body { padding:14px; }
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
  background:var(--sf);
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
.profile-banner { height:150px; background:linear-gradient(135deg,var(--g800),var(--g500)); background-size:cover; background-position:center; position:relative; }
.profile-block { padding:0 18px 16px; position:relative; margin:0 12px; border:1px solid var(--bd2); border-top:0; border-radius:0 0 14px 14px; background:var(--sf); }
.profile-av-lg { width:86px; height:86px; border-radius:var(--rf); border:4px solid var(--sf); background:linear-gradient(135deg,var(--g500),var(--g350)); color:#fff; display:flex; align-items:center; justify-content:center; font-family:var(--fd); font-size:28px; font-weight:800; margin-top:-43px; margin-bottom:10px; }
.profile-name-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:2px; }
.profile-name { font-family:var(--fd); font-size:19px; font-weight:900; color:var(--t1); }
.profile-role { font-size:12px; color:var(--t4); margin-bottom:10px; }
.profile-bio { font-size:13px; color:var(--t2); line-height:1.65; margin-bottom:12px; max-width:560px; }
.profile-meta-row { display:flex; gap:16px; font-size:12px; color:var(--t3); margin-bottom:6px; }
.profile-meta-row b { color:var(--t1); font-weight:700; }
.profile-tabs { display:flex; border:1px solid var(--bd2); border-radius:12px 12px 0 0; margin:12px 12px 0; background:var(--sf); }
.profile-tab { flex:1; text-align:center; padding:13px; font-size:12.5px; font-weight:600; color:var(--t4); cursor:pointer; border-bottom:2px solid transparent; transition:all .15s; }
.profile-tab:hover { background:var(--sf2); }
.profile-tab.on { color:var(--ac); border-bottom-color:var(--ac); font-weight:700; }

/* Reply card (in profile Replies tab) */
.reply-card { padding:14px 18px; border-bottom:1px solid var(--bd); cursor:pointer; transition:background .12s; }
.reply-card:hover { background:var(--sf2); }
.reply-context { font-size:11px; color:var(--t4); margin-bottom:6px; }
.reply-text { font-size:13px; color:var(--t2); line-height:1.6; }
.post-view-hd { display:flex; align-items:center; gap:10px; padding:10px 14px; border-bottom:1px solid var(--bd); background:var(--sf); flex-shrink:0; }
.post-view-main { padding:18px; margin:12px 12px 0; border:1px solid var(--bd2); border-radius:14px 14px 0 0; background:var(--sf); }
.post-view-body { font-size:16px; color:var(--t1); line-height:1.7; margin:14px 0; }
.post-view-img { width:100%; border-radius:var(--r16); background:var(--sf3); display:flex; align-items:center; justify-content:center; font-size:64px; height:240px; margin-bottom:14px; border:1px solid var(--bd); }
.post-view-time { font-size:12.5px; color:var(--t4); padding:10px 0; border-bottom:1px solid var(--bd); margin-bottom:8px; }
.post-view-stats { display:flex; gap:18px; padding:10px 0; border-bottom:1px solid var(--bd); font-size:12.5px; }
.post-view-stats b { color:var(--t1); font-weight:700; }
.post-view-stats span { color:var(--t4); }
.post-view-acts { display:flex; align-items:center; justify-content:space-around; padding:6px 0; }

/* Comment composer */
.comment-composer { display:flex; gap:10px; padding:14px 18px; margin:0 12px; border:1px solid var(--bd2); border-top:0; background:var(--sf); }
.comment-input-wrap { flex:1; }
.comment-input { width:100%; border:none; background:transparent; font-family:var(--fb); font-size:13.5px; color:var(--t1); resize:none; outline:none; min-height:44px; line-height:1.6; border-bottom:1px solid var(--bd); padding-bottom:10px; }
.comment-input::placeholder { color:var(--t5); }
.comment-composer-foot { display:flex; justify-content:flex-end; margin-top:8px; }

/* Threaded comment system */
.comment-thread { padding:0 18px; margin:0 12px 12px; border:1px solid var(--bd2); border-top:0; border-radius:0 0 14px 14px; background:var(--sf); }
.comment-thread .empty { min-height:180px; margin:0 0 14px; justify-content:center; border:1px solid var(--bd); border-radius:11px; background:var(--sf2); }
.post-view-main+.notice { margin:0 12px; border-radius:0; }
.post-view-main+.notice+.comment-thread { border-top:1px solid var(--bd2); border-radius:0 0 14px 14px; }
.profile-banner-editor { display:flex; align-items:center; justify-content:space-between; gap:16px; min-height:104px; padding:16px; margin:0 0 18px; border:1px solid var(--bd2); border-radius:12px; color:#fff; background-color:var(--g800); background-size:cover; background-position:center; }
.profile-banner-editor>div:first-child { display:flex; flex-direction:column; gap:4px; }
.profile-banner-editor strong { font-size:13px; }
.profile-banner-editor span { color:rgba(255,255,255,.76); font-size:11px; }
.profile-banner-controls { display:flex; flex-wrap:wrap; gap:7px; }
.community-image-preview { display:block; width:76px; height:76px; margin-top:8px; border:1px solid var(--bd2); border-radius:14px; object-fit:cover; background:var(--sf2); }
.community-banner-preview { display:block; width:100%; height:76px; margin-top:8px; border:1px solid var(--bd2); border-radius:10px; object-fit:cover; background:var(--sf2); }
.community-settings-image-preview { display:block; width:72px; height:72px; margin-top:8px; border:1px solid var(--bd2); border-radius:13px; object-fit:cover; }
.community-settings-banner-preview { display:block; width:100%; height:76px; margin-top:8px; border:1px solid var(--bd2); border-radius:10px; object-fit:cover; }
.community-mark img, .community-rail-node img, .comm-card-mark img, .community-popover-mark img { width:100%; height:100%; border-radius:inherit; object-fit:cover; }
.comment-empty .empty-ico svg { width:28px; height:28px; }
.community-mark:has(img), .community-rail-node:has(img), .comm-card-mark:has(img), .community-popover-mark:has(img) { overflow:hidden; padding:0; }
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
.community-owner-panel { padding:14px 18px; border-bottom:1px solid var(--bd); background:var(--sf2); }
.community-owner-heading { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:8px; }
.community-request-row { display:flex; align-items:center; gap:9px; padding:9px 0; border-top:1px solid var(--bd); }
.community-settings-section { padding:4px 0 14px; border-bottom:1px solid var(--bd); margin-bottom:12px; }
.community-settings-section:last-child { border-bottom:0; margin-bottom:0; }
.community-setting-toggle { display:flex; align-items:center; gap:8px; min-height:38px; color:var(--t2); font-size:12px; }
.community-setting-toggle input { accent-color:var(--ac); width:16px; height:16px; }
.comm-feed-desc { font-size:13px; color:var(--t2); line-height:1.6; margin-bottom:10px; }
.comm-feed-stats { display:flex; gap:16px; font-size:12px; color:var(--t3); margin-bottom:12px; }
.comm-feed-stats b { color:var(--t1); font-weight:700; }
.comm-feed-acts { display:flex; gap:8px; }
.comm-gate-notice { margin:14px 18px; }
.folder-row { display:flex; align-items:center; gap:12px; padding:12px 14px; background:var(--sf); border:1px solid var(--bd); border-radius:var(--r12); margin-bottom:7px; cursor:pointer; transition:all .15s; width:100%; text-align:left; color:var(--t1); font-family:var(--fb); }
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
  background:var(--sf);
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
  background:var(--sf);
  border:1px solid var(--bd2); border-radius:var(--r12); box-shadow:var(--s4);
  overflow:hidden; animation:ddIn .14s ease; padding:4px;
}
.comment-menu-dd.drop-up { top:auto; bottom:0; }
.share-recent-row { display:flex; gap:14px; overflow-x:auto; padding:4px 2px 6px; margin-bottom:14px; }
.share-recent-item { display:flex; flex-direction:column; align-items:center; gap:6px; flex-shrink:0; cursor:pointer; width:64px; }
.share-recent-item:hover .av { transform:scale(1.05); }
.share-recent-name { font-size:10.5px; font-weight:600; color:var(--t2); text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:64px; }
.share-via-grid { display:flex; flex-wrap:wrap; gap:8px; }
.share-via-grid > * { flex:1 1 calc(33.333% - 6px); min-width:80px; }
.share-via-btn { display:flex; flex-direction:column; align-items:center; gap:7px; padding:14px 8px; background:var(--sf2); border:1px solid var(--bd); border-radius:var(--r14); cursor:pointer; transition:all .15s; color:var(--t1); font-family:var(--fb); }
.share-via-btn:hover { border-color:var(--ac); background:var(--as); transform:translateY(-2px); }
.share-count-note { margin-top:12px; color:var(--t4); font-size:11px; line-height:1.5; }
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
.coming-soon-overlay { position:fixed; inset:0; background:transparent; z-index:900; display:flex; align-items:center; justify-content:center; padding:20px; animation:fIn .2s ease; }
.coming-soon-card { background:var(--sf); border:1px solid var(--bd2); border-radius:var(--r24); box-shadow:var(--s5); max-width:360px; width:100%; padding:32px 28px; text-align:center; position:relative; overflow:hidden; }
.coming-soon-card::before { content:''; position:absolute; inset:0; background:radial-gradient(circle at 50% 0%,var(--as2),transparent 60%); }
.coming-soon-ico-wrap { width:72px; height:72px; border-radius:var(--rf); background:linear-gradient(135deg,var(--g500),var(--g350)); display:flex; align-items:center; justify-content:center; font-size:32px; margin:0 auto 18px; position:relative; z-index:1; box-shadow:0 8px 24px var(--as3); }
.coming-soon-title { font-family:var(--fd); font-size:18px; font-weight:900; color:var(--t1); margin-bottom:8px; position:relative; z-index:1; }
.coming-soon-desc { font-size:12.5px; color:var(--t4); line-height:1.6; margin-bottom:20px; position:relative; z-index:1; }
.coming-soon-badge { display:inline-flex; align-items:center; gap:5px; padding:5px 13px; background:var(--as); color:var(--ac); border-radius:var(--rf); font-size:10.5px; font-weight:700; margin-bottom:18px; position:relative; z-index:1; }
.items-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
.items-grid > * { min-width:0; width:100%; }
.item-card { width:100%; max-width:100%; background:var(--sf); border:1px solid var(--bd); border-radius:var(--r16); overflow:hidden; transition:all .2s; cursor:pointer; display:flex; flex-direction:column; }
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
.item-acts { display:flex; gap:6px; margin-top:auto; }
.item-acts > * { flex:1 1 0; min-width:0; }

.invest-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
.invest-grid > * { min-width:0; width:100%; }
.inv-card { width:100%; max-width:100%; background:var(--sf); border:1px solid var(--bd); border-radius:var(--r16); overflow:hidden; transition:all .2s; }
.inv-card:hover { box-shadow:var(--s3); border-color:var(--bd2); transform:translateY(-2px); }
.inv-banner { height:110px; background:linear-gradient(135deg,var(--g750),var(--g500)); display:flex; align-items:center; justify-content:center; font-size:44px; position:relative; }
.inv-banner::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(0,0,0,.05),rgba(0,0,0,.3)); }
.inv-banner-ico { position:relative; z-index:1; }
.inv-body { padding:13px; }
.inv-name { font-family:var(--fd); font-size:14px; font-weight:800; color:var(--t1); margin-bottom:2px; }
.inv-loc { font-size:11px; color:var(--t4); margin-bottom:10px; }
.inv-stats { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px; }
.inv-stats > * { flex:1 1 calc(50% - 3px); min-width:0; }
.ist { background:var(--sf2); border:1px solid var(--bd); border-radius:var(--r10); padding:8px; text-align:center; }
.ist-l { font-size:9.5px; color:var(--t4); font-weight:700; text-transform:uppercase; letter-spacing:.4px; margin-bottom:2px; }
.ist-v { font-family:var(--fd); font-size:13px; font-weight:700; color:var(--t1); }
.labs-hero { background:linear-gradient(135deg,var(--g800) 0%,var(--g600) 55%,var(--g450) 100%); border-radius:var(--r20); padding:24px; color:#fff; margin-bottom:14px; position:relative; overflow:hidden; }
.labs-hero-grid { position:absolute; inset:0; opacity:.04; background-image:repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 44px), repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 44px); }
.labs-hero-c { position:relative; z-index:1; }
.labs-tag { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; background:rgba(255,255,255,.15); border-radius:var(--rf); font-size:10.5px; font-weight:600; color:rgba(255,255,255,.9); margin-bottom:10px; }
.labs-title { font-family:var(--fd); font-size:22px; font-weight:900; margin-bottom:6px; line-height:1.2; }
.labs-desc { font-size:12.5px; opacity:.8; line-height:1.7; max-width:500px; }
.labs-grid { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px; }
.labs-grid > * { flex:1 1 200px; min-width:0; }
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
.mkt-grid { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px; }
.mkt-grid > * { flex:1 1 200px; min-width:0; }
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
.wc-act-grid { display:flex; gap:6px; }
.wc-act-grid > * { flex:1 1 0; min-width:0; }
.wc-act-btn {
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px;
  padding:10px 4px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12);
  border-radius:var(--r14); color:#fff; font-family:var(--fb); font-size:11px; font-weight:600;
  cursor:pointer; transition:all .15s; backdrop-filter:blur(6px);
}
.wc-act-btn:hover { background:rgba(255,255,255,.16); transform:translateY(-1px); }
.wc-act-ico { width:38px; height:38px; border-radius:var(--rf); background:rgba(255,255,255,.14); display:flex; align-items:center; justify-content:center; }
.wc-act-ico svg { width:16px; height:16px; }

.w-cards { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:12px; }
.w-cards > * { flex:1 1 calc(50% - 5px); min-width:0; }
@media(max-width:480px){ .w-cards > * { flex-basis:100%; } }
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
.ist-packages { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:16px; }
.ist-packages > * { flex:1 1 140px; min-width:0; }
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
.msg-shell { display:flex; height:100%; min-height:0; min-width:0; overflow:hidden; }
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
.bub-wrap { max-width:68%; position:relative; }
.bub { padding:10px 14px; font-size:12.5px; line-height:1.55; word-break:break-word; }
.bub-them { background:var(--sf); color:var(--t1); border:1px solid var(--bd); border-radius:var(--r16); border-bottom-left-radius:4px; box-shadow:var(--s1); }
.bub-me { background:linear-gradient(135deg,var(--g550),var(--g400)); color:#fff; border-radius:var(--r16); border-bottom-right-radius:4px; box-shadow:0 2px 10px rgba(38,115,38,.22); }
.bub-time { font-size:9.5px; color:var(--t5); margin-top:3px; }
.brow.me .bub-time { text-align:right; color:rgba(255,255,255,.45); }
.msg-delete-btn { width:28px; height:28px; display:flex; align-items:center; justify-content:center; flex-shrink:0; border:1px solid var(--bd); border-radius:var(--r10); background:var(--sf); color:var(--t4); cursor:pointer; opacity:.72; }
.msg-delete-btn:hover { color:var(--red); border-color:var(--red); opacity:1; }
.msg-delete-btn svg { width:13px; height:13px; }

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
.sup-overlay { position:fixed; inset:0; background:transparent; z-index:800; display:flex; flex-direction:column; animation:fIn .2s ease; }
.sup-window { display:flex; flex:1; min-height:0; flex-direction:column; background:var(--bg); }
.sup-window-notifications { background:radial-gradient(ellipse at 90% 0%, color-mix(in srgb, var(--ac) 7%, transparent), transparent 42%), var(--bg); }
.sup-hd { display:flex; align-items:center; gap:10px; padding:12px 16px; background:var(--sf); border-bottom:1px solid var(--bd); flex-shrink:0; }
.sup-body { flex:1; overflow-y:auto; }
.sup-hero { background:linear-gradient(135deg,var(--g800),var(--g600)); padding:28px; color:#fff; text-align:center; position:relative; overflow:hidden; }
.sup-hero::before { content:''; position:absolute; inset:0; background:radial-gradient(circle at 50% 0%,rgba(255,255,255,.1),transparent 60%); }
.sup-hero-c { position:relative; z-index:1; }
.sup-content { padding:16px; }
.sup-grid { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:20px; }
.sup-grid > * { flex:1 1 180px; min-width:0; }
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

/* Quiet, shared surfaces and interaction finish across every section. */
.main {
  position:relative;
  isolation:isolate;
  background:
    radial-gradient(ellipse at 8% 0%, color-mix(in srgb, var(--ac) 5%, transparent), transparent 42%),
    var(--bg);
}
.main::before {
  content:'';
  position:absolute;
  z-index:0;
  inset:46px 0 0;
  pointer-events:none;
  opacity:.55;
  background:
    radial-gradient(circle at 90% 8%, color-mix(in srgb, var(--ac) 11%, transparent), transparent 25%),
    radial-gradient(circle at 8% 72%, color-mix(in srgb, var(--ac) 5%, transparent), transparent 32%);
}
.main > * { position:relative; z-index:1; }
.main-farm::before {
  background:
    radial-gradient(ellipse at 92% 10%, color-mix(in srgb, var(--g400) 14%, transparent), transparent 30%),
    repeating-linear-gradient(135deg, transparent 0 54px, color-mix(in srgb, var(--ac) 2.3%, transparent) 55px 56px),
    radial-gradient(ellipse at 12% 84%, color-mix(in srgb, var(--g500) 7%, transparent), transparent 34%);
}
.main-link::before {
  background:
    radial-gradient(circle at 88% 14%, color-mix(in srgb, var(--g350) 13%, transparent), transparent 22%),
    radial-gradient(circle at 84% 18%, color-mix(in srgb, var(--ac) 5%, transparent) 1px, transparent 1.5px);
  background-size:auto, 22px 22px;
}
.main-labs::before {
  background:
    radial-gradient(ellipse at 78% 2%, color-mix(in srgb, var(--g350) 13%, transparent), transparent 29%),
    linear-gradient(90deg, color-mix(in srgb, var(--ac) 2.5%, transparent) 1px, transparent 1px),
    linear-gradient(color-mix(in srgb, var(--ac) 2.5%, transparent) 1px, transparent 1px);
  background-size:auto, 42px 42px, 42px 42px;
  mask-image:linear-gradient(180deg, #000, transparent 82%);
}
.main-wallet::before {
  background:
    radial-gradient(ellipse at 90% 7%, color-mix(in srgb, var(--g350) 14%, transparent), transparent 28%),
    radial-gradient(ellipse at 12% 88%, color-mix(in srgb, var(--blue) 5%, transparent), transparent 32%);
}
.main-messages::before {
  background:
    radial-gradient(ellipse at 96% 4%, color-mix(in srgb, var(--g350) 10%, transparent), transparent 24%),
    radial-gradient(ellipse at 0% 100%, color-mix(in srgb, var(--ac) 5%, transparent), transparent 36%);
}
.main-account::before {
  background:
    radial-gradient(ellipse at 92% 6%, color-mix(in srgb, var(--g350) 12%, transparent), transparent 27%),
    radial-gradient(ellipse at 0% 82%, color-mix(in srgb, var(--g500) 5%, transparent), transparent 34%);
}
.scroll {
  background-image:radial-gradient(ellipse at 92% 0%, color-mix(in srgb, var(--ac) 4%, transparent), transparent 40%);
  background-attachment:local;
}
.sub-hd {
  background:linear-gradient(180deg, var(--sf), color-mix(in srgb, var(--sf) 92%, var(--ac)));
}
.btn {
  border:1px solid transparent;
  transition:transform .16s ease, box-shadow .16s ease, background-color .16s ease, border-color .16s ease, color .16s ease;
}
.btn-p {
  box-shadow:inset 0 1px rgba(255,255,255,.16), 0 2px 8px rgba(38,115,38,.2);
}
.btn-p:hover:not(:disabled) { transform:translateY(-1px); }
.btn-g {
  background:linear-gradient(145deg, color-mix(in srgb, var(--sf) 94%, var(--ac)), var(--sf));
}
.btn:focus-visible, .ib:focus-visible, .sub-tab:focus-visible {
  outline:2px solid var(--ac);
  outline-offset:2px;
}
.card, .post-card, .compose-box, .comm-card, .rail-card, .item-card,
.inv-card, .stat-tile, .labs-feat, .set-row, .w-mini, .mkt-card {
  background:linear-gradient(150deg, var(--sf), var(--sf2));
  border-color:var(--bd2);
  box-shadow:var(--s1);
}
.post-card, .compose-box, .comm-card, .rail-card, .item-card, .inv-card,
.labs-feat, .set-row, .w-mini, .mkt-card {
  transition:transform .18s ease, border-color .18s ease, box-shadow .18s ease, background-color .18s ease;
}
.post-card:hover, .comm-card:hover, .rail-card:hover, .item-card:hover,
.inv-card:hover, .labs-feat:hover, .set-row:hover, .mkt-card:hover {
  border-color:var(--bd3);
  box-shadow:var(--s2);
}
@media(prefers-reduced-motion:reduce) {
  .btn, .post-card, .compose-box, .comm-card, .rail-card, .item-card,
  .inv-card, .stat-tile, .labs-feat, .set-row, .w-mini, .mkt-card {
    transition:none !important;
  }
  .btn-p:hover:not(:disabled) { transform:none; }
}
@media(min-width:761px) {
  .sup-overlay {
    align-items:center;
    justify-content:center;
    padding:32px;
    background:transparent;
  }
  .sup-window {
    flex:0 1 auto;
    width:min(100%, 880px);
    height:min(820px, calc(100vh - 64px));
    border:1px solid var(--bd3);
    border-radius:var(--r20);
    box-shadow:var(--s5);
    overflow:hidden;
    animation:sectionReveal .2s cubic-bezier(.2,.75,.25,1) both;
  }
  .sup-window-notifications { width:min(100%, 700px); }
  .sup-hd { padding:13px 18px; }
}

@media(max-width:760px) {
  .sup-window { width:100%; height:100%; }
}

@media(prefers-reduced-motion:reduce) {
  .sup-overlay, .sup-window { animation:none !important; }
}

/* Community identity and discovery */
.community-page { background:var(--sf2); }
.community-page .scroll {
  background:
    radial-gradient(ellipse at 4% 0%, color-mix(in srgb, var(--community-accent) 7%, transparent), transparent 34%),
    var(--sf2);
}
.community-crumb { min-width:0; flex:1; display:flex; flex-direction:column; gap:2px; }
.community-crumb span, .community-eyebrow { color:var(--t5); font-size:9px; font-weight:800; letter-spacing:.14em; }
.community-crumb strong { overflow:hidden; color:var(--t1); font-size:13px; text-overflow:ellipsis; white-space:nowrap; }
.community-cover {
  height:clamp(170px, 23vw, 250px); position:relative; isolation:isolate; overflow:visible;
  background:
    radial-gradient(ellipse at 76% 24%, color-mix(in srgb, var(--community-accent) 48%, transparent), transparent 34%),
    radial-gradient(ellipse at 16% 100%, color-mix(in srgb, var(--g500) 35%, transparent), transparent 42%),
    linear-gradient(125deg, var(--g950), var(--g800) 54%, #172719);
  background-size:cover; background-position:center;
}
.community-cover::before {
  content:""; position:absolute; z-index:0; inset:-40%; opacity:.35; transform:rotate(-12deg);
  background:repeating-linear-gradient(0deg, transparent 0 25px, rgba(255,255,255,.12) 26px, transparent 27px 52px);
  mask-image:linear-gradient(90deg,transparent,#000 28%,#000 80%,transparent);
}
.community-cover-grid {
  position:absolute; z-index:1; inset:0; opacity:.2;
  background:repeating-linear-gradient(90deg,transparent 0 54px,rgba(255,255,255,.14) 55px,transparent 56px 110px);
  mask-image:linear-gradient(180deg,#000,transparent 92%);
}
.community-cover-top { position:absolute; z-index:2; top:20px; left:max(22px,calc((100% - 1000px)/2)); right:max(22px,calc((100% - 1000px)/2)); display:flex; gap:8px; }
.community-cover-chip {
  display:inline-flex; align-items:center; gap:6px; padding:7px 10px; border:1px solid rgba(255,255,255,.2); border-radius:var(--rf);
  color:#fff; background:rgba(5,17,8,.44); backdrop-filter:blur(12px); font-size:10px; font-weight:700; text-transform:capitalize;
}
.community-cover-chip svg { width:12px; height:12px; }
.community-mark {
  position:absolute; z-index:2; left:max(22px,calc((100% - 1000px)/2)); bottom:-48px; display:grid; place-items:center;
  width:96px; height:96px; overflow:visible; transform:none; border:4px solid var(--sf2); border-radius:25px;
  background:linear-gradient(145deg,color-mix(in srgb,var(--community-accent) 72%,var(--g800)),var(--g800));
  box-shadow:0 10px 32px rgba(0,0,0,.23); font-size:39px;
}
.community-mark img { width:100%; height:100%; object-fit:cover; display:block; border-radius:inherit; }
.community-profile { max-width:1000px; margin:-1px auto 0; padding:60px 24px 18px 158px; }
.community-profile-main { display:flex; align-items:flex-end; justify-content:space-between; gap:18px; }
.community-profile-copy { min-width:0; flex:1; padding-left:8px; display:flex; flex-direction:column; gap:6px; }
.community-title-row { display:flex; align-items:center; flex-wrap:wrap; gap:8px; margin-top:2px; }
.community-title { margin:0; color:var(--t1); font-family:var(--fd); font-size:clamp(22px,3vw,30px); font-weight:900; letter-spacing:-.04em; line-height:1.15; }
.community-owner-badge { display:inline-flex; align-items:center; gap:5px; padding:5px 8px; border:1px solid var(--as3); border-radius:var(--rf); color:var(--ac); background:var(--as); font-size:10px; font-weight:750; }
.community-owner-badge svg { width:12px; height:12px; }
.community-description { max-width:650px; margin:0; color:var(--t3); font-size:12.5px; line-height:1.65; }
.community-profile-actions { display:flex; flex-wrap:wrap; align-items:center; justify-content:flex-end; gap:8px; margin-left:auto; }
.community-icon-action { display:grid; place-items:center; width:38px; height:38px; border:1px solid var(--bd2); border-radius:12px; color:var(--t2); background:var(--sf); cursor:pointer; }
.community-icon-action:hover { border-color:var(--community-accent); color:var(--ac); }
.community-icon-action:focus-visible, .community-view-tabs button:focus-visible, .community-composer-prompt:focus-visible,
.comm-card-open:focus-visible, .comm-card-view:focus-visible { outline:2px solid var(--ac); outline-offset:3px; }
.community-icon-action svg { width:16px; height:16px; }
.community-follow-btn, .community-post-btn, .community-cancel-btn { min-height:38px; white-space:nowrap; }
.community-metrics { display:flex; gap:9px; margin-top:19px; }
.community-metric { min-width:100px; display:flex; flex-direction:column; gap:3px; padding:10px 14px; border:1px solid var(--bd); border-radius:13px; background:linear-gradient(145deg,var(--sf),color-mix(in srgb,var(--community-accent) 4%,var(--sf2))); }
.community-metric strong { color:var(--t1); font-size:15px; font-weight:850; letter-spacing:-.02em; }
.community-metric span { color:var(--t5); font-size:10px; font-weight:650; }
.community-view-tabs { max-width:1000px; display:flex; gap:6px; margin:0 auto; padding:0 24px; border-bottom:1px solid var(--bd); }
.community-view-tabs button { position:relative; display:flex; align-items:center; gap:8px; min-height:48px; padding:0 14px; border:0; color:var(--t4); background:transparent; font:650 12px var(--fb); cursor:pointer; }
.community-view-tabs button::after { position:absolute; right:10px; bottom:-1px; left:10px; height:2px; border-radius:2px; background:transparent; content:""; }
.community-view-tabs button.active { color:var(--ac); }
.community-view-tabs button.active::after { background:var(--ac); }
.community-view-tabs button svg { width:14px; height:14px; }
.community-view-tabs button span { min-width:18px; padding:2px 5px; border-radius:var(--rf); color:var(--t4); background:var(--sf3); text-align:center; font-size:9px; }
.community-content { max-width:1000px; margin:0 auto; padding:19px 24px 28px; }
.community-join-callout, .community-composer-prompt, .community-status-note {
  display:flex; align-items:center; gap:12px; padding:14px; border:1px solid var(--bd); border-radius:16px; background:linear-gradient(120deg,var(--sf),color-mix(in srgb,var(--community-accent) 5%,var(--sf)));
}
.community-join-callout { margin-bottom:16px; }
.community-join-callout.pending { border-color:var(--as3); background:var(--as); }
.community-join-icon { display:grid; place-items:center; flex:0 0 38px; width:38px; height:38px; border-radius:12px; color:var(--ac); background:var(--sf); }
.community-join-icon svg { width:17px; height:17px; }
.community-join-copy { display:flex; flex:1; min-width:0; flex-direction:column; gap:3px; }
.community-join-copy strong { color:var(--t1); font-size:12px; }
.community-join-copy span { color:var(--t4); font-size:11px; line-height:1.5; }
.community-composer-prompt { width:100%; min-height:66px; margin-bottom:23px; color:var(--t4); text-align:left; cursor:pointer; transition:border-color .16s,transform .16s,box-shadow .16s; }
.community-composer-prompt:hover { transform:translateY(-1px); border-color:var(--bd3); box-shadow:var(--s2); }
.community-composer-prompt>span:nth-child(2) { flex:1; font-size:12px; }
.community-composer-action { display:inline-flex; align-items:center; gap:6px; padding:8px 11px; border:1px solid var(--as3); border-radius:10px; color:var(--ac); background:var(--as); font-size:11px; font-weight:750; }
.community-composer-action svg { width:13px; height:13px; }
.community-status-note { margin-bottom:20px; color:var(--t4); font-size:11px; }
.community-status-note svg { width:15px; height:15px; color:var(--ac); }
.community-feed-heading { display:flex; align-items:flex-end; justify-content:space-between; gap:12px; margin:0 0 14px; }
.community-feed-heading h2 { margin:4px 0 0; color:var(--t1); font-family:var(--fd); font-size:19px; font-weight:850; letter-spacing:-.03em; }
.community-feed-count { color:var(--t5); font-size:10px; }
.community-empty { display:flex; align-items:center; flex-direction:column; padding:42px 20px; border:1px dashed var(--bd2); border-radius:18px; background:radial-gradient(ellipse at 50% 0%,color-mix(in srgb,var(--community-accent) 7%,transparent),transparent 70%),var(--sf); text-align:center; }
.community-empty-orbit { display:grid; place-items:center; width:66px; height:66px; margin-bottom:17px; border:1px solid color-mix(in srgb,var(--community-accent) 24%,var(--bd)); border-radius:22px; background:color-mix(in srgb,var(--community-accent) 9%,var(--sf)); font-size:31px; }
.community-empty-orbit.small { width:38px; height:38px; margin:0; border-radius:13px; color:var(--ac); font-size:15px; }
.community-empty-orbit.small svg { width:16px; height:16px; }
.community-empty h2 { margin:6px 0; color:var(--t1); font-family:var(--fd); font-size:19px; }
.community-empty p { max-width:390px; margin:2px 0 17px; color:var(--t4); font-size:12px; line-height:1.6; }
.community-locked-feed { display:flex; align-items:center; flex-direction:column; gap:7px; padding:32px 20px; border:1px dashed var(--bd2); border-radius:18px; background:var(--sf); text-align:center; }
.community-locked-feed strong { color:var(--t1); font-size:13px; }
.community-locked-feed>span:last-child { max-width:400px; color:var(--t4); font-size:11px; line-height:1.6; }
.community-locked-icon { display:grid; place-items:center; width:43px; height:43px; margin-bottom:5px; border-radius:15px; color:var(--ac); background:var(--as); }
.community-locked-icon svg { width:18px; height:18px; }
.community-about-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); align-items:stretch; gap:12px; }
.community-info-card { padding:18px; border:1px solid var(--bd); border-radius:16px; background:linear-gradient(145deg,var(--sf),color-mix(in srgb,var(--community-accent) 3%,var(--sf2))); box-shadow:var(--s1); }
.community-info-card p { margin:12px 0 0; color:var(--t3); font-size:12px; line-height:1.7; }
.community-about-intro { grid-column:1/-1; padding:22px; background:radial-gradient(ellipse at 90% 0%,color-mix(in srgb,var(--community-accent) 10%,transparent),transparent 45%),linear-gradient(145deg,var(--sf),var(--sf2)); }
.community-about-intro h2 { margin:7px 0 0; color:var(--t1); font-family:var(--fd); font-size:22px; letter-spacing:-.03em; }
.community-about-intro p { max-width:700px; margin-top:7px; }
.community-info-title { display:flex; align-items:center; gap:11px; }
.community-info-icon { display:grid; place-items:center; flex:0 0 38px; width:38px; height:38px; border-radius:12px; color:var(--ac); background:var(--as); }
.community-info-icon svg { width:17px; height:17px; }
.community-info-title h3 { margin:3px 0 0; color:var(--t1); font-size:13px; }
.community-rules { white-space:pre-wrap; }
.community-about-facts { display:flex; flex-wrap:wrap; gap:7px; margin-top:14px; }
.community-about-facts span { padding:6px 9px; border:1px solid var(--bd); border-radius:var(--rf); color:var(--t4); background:var(--sf2); font-size:10px; }
.community-owner-panel { padding:18px; border:1px solid var(--bd); border-radius:16px; background:var(--sf); box-shadow:var(--s1); }
.community-owner-heading { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:10px; }
.community-owner-heading h2 { margin:4px 0 0; color:var(--t1); font-family:var(--fd); font-size:18px; }
.community-owner-heading p { margin:4px 0 0; color:var(--t4); font-size:11px; }
.community-pending-count { padding:7px 10px; border:1px solid var(--bd); border-radius:var(--rf); color:var(--t3); background:var(--sf2); font-size:10px; font-weight:700; white-space:nowrap; }
.community-request-row { gap:11px; padding:13px 0 0; margin-top:12px; border-top:1px solid var(--bd); }
.community-empty-state { display:flex; align-items:center; flex-direction:column; gap:7px; padding:25px 12px; color:var(--t4); font-size:11px; text-align:center; }
.community-empty-state strong { color:var(--t1); font-size:12px; }
.community-manage-card { margin-top:12px; }
.community-manage-card .btn { margin-top:15px; }
.comm-card { --community-accent:var(--ac); position:relative; overflow:visible; border-radius:18px; box-shadow:var(--s1); }
.comm-card-open { display:block; width:100%; padding:0; border:0; color:inherit; background:transparent; text-align:left; cursor:pointer; }
.comm-banner { height:124px; background-size:cover !important; background-position:center !important; overflow:visible; }
.comm-banner::after { background:linear-gradient(180deg,rgba(2,8,3,.1),rgba(2,8,3,.34)); }
.comm-card-category, .comm-card-privacy { position:absolute; z-index:2; top:10px; display:inline-flex; align-items:center; gap:5px; padding:6px 8px; border:1px solid rgba(255,255,255,.19); border-radius:var(--rf); color:#fff; background:rgba(4,13,5,.42); backdrop-filter:blur(8px); font-size:9px; font-weight:700; }
.comm-card-category { left:10px; }
.comm-card-privacy { right:10px; }
.comm-card-category svg, .comm-card-privacy svg { width:11px; height:11px; }
.comm-card-mark {
  position:absolute; z-index:3; left:16px; bottom:-28px; display:grid; place-items:center;
  width:58px; height:58px; overflow:visible; border:1px solid rgba(255,255,255,.28); border-radius:18px;
  background:linear-gradient(145deg,color-mix(in srgb,var(--community-accent) 72%,var(--g800)),var(--g800));
  box-shadow:0 8px 24px rgba(0,0,0,.15); font-size:28px; backdrop-filter:blur(8px);
}
.comm-card-mark img { width:100%; height:100%; object-fit:cover; display:block; border-radius:inherit; }
.comm-body { padding:52px 14px 9px; }
.comm-name { overflow:hidden; margin-top:4px; font-size:14px; text-overflow:ellipsis; white-space:nowrap; }
.comm-description { display:-webkit-box; min-height:34px; margin:6px 0 11px; overflow:hidden; color:var(--t4); font-size:10.5px; line-height:1.55; -webkit-box-orient:vertical; -webkit-line-clamp:2; }
.comm-meta { display:flex; gap:13px; margin:0; font-size:10px; }
.comm-meta span { display:inline-flex; align-items:center; gap:5px; }
.comm-meta svg { width:12px; height:12px; }
.comm-card-actions { display:flex; gap:8px; padding:0 14px 14px; }
.comm-card-actions .btn { flex:1; }
.comm-card-view { display:grid; place-items:center; flex:0 0 34px; width:34px; border:1px solid var(--bd2); border-radius:10px; color:var(--t3); background:var(--sf); cursor:pointer; }
.comm-card-view:hover { border-color:var(--community-accent); color:var(--ac); }
.comm-card-view svg { width:14px; height:14px; }
@media(max-width:760px) {
  .community-profile { padding:52px 16px 17px 116px; }
  .community-profile-copy { padding-left:6px; }
  .community-mark { left:16px; bottom:-36px; width:72px; height:72px; font-size:34px; }
  .community-cover-top { left:16px; right:16px; }
  .community-view-tabs { padding:0 10px; }
  .community-content { padding:15px 14px 24px; }
  .items-grid, .invest-grid { grid-template-columns:1fr; }
}
@media(max-width:520px) {
  .profile-banner-editor { align-items:flex-start; flex-direction:column; }
  .community-banner-preview { height:64px; }
  .community-cover { height:156px; }
  .community-profile { padding:42px 13px 0; }
  .community-profile-copy { padding-left:0; }
  .community-mark { left:16px; bottom:-26px; width:52px; height:52px; border-radius:14px; font-size:22px; }
  .community-profile-main { flex-direction:column; gap:12px; }
  .community-profile-actions { width:100%; justify-content:flex-start; }
  .community-metrics { gap:6px; margin-top:15px; }
  .community-metric { flex:1; min-width:0; padding:9px 10px; }
  .community-view-tabs { gap:0; }
  .community-view-tabs button { flex:1; justify-content:center; gap:6px; padding:0 5px; font-size:11px; }
  .community-join-callout { align-items:flex-start; flex-wrap:wrap; }
  .community-join-callout>.btn { margin-left:50px; }
  .community-composer-prompt { gap:8px; padding:10px; }
  .community-composer-action { padding:7px; font-size:0; }
  .community-composer-action svg { width:15px; height:15px; }
  .community-about-grid { grid-template-columns:1fr; }
  .community-about-intro { grid-column:auto; }
  .community-request-row { flex-wrap:wrap; }
  .community-request-row .folder-info { flex:1; min-width:calc(100% - 60px); }
  .community-request-row .btn { flex:1; }
  .comm-banner { height:110px; }
}

/* Community node system */
.community-page .scroll {
  background:
    radial-gradient(ellipse at 4% 0%,color-mix(in srgb,var(--community-accent) 8%,transparent),transparent 35%),
    linear-gradient(180deg,var(--sf2),var(--bg));
}
.community-nav {
  display:flex; align-items:center; gap:11px; min-height:57px; padding:7px 16px;
  border-bottom:1px solid var(--bd); background:color-mix(in srgb,var(--sf) 92%,transparent);
}
.community-nav .ib { border:1px solid var(--bd2); border-radius:12px; background:var(--sf2); }
.community-crumb span { display:flex; align-items:center; gap:7px; font:600 8px var(--fm); letter-spacing:.13em; }
.community-crumb span i, .community-cover-title>span i { display:inline-block; width:4px; height:4px; border-radius:50%; background:var(--ac); box-shadow:0 0 9px var(--ac); }
.community-crumb strong { font-size:12px; }
.community-notification { display:inline-flex; align-items:center; gap:7px; padding:8px 10px; border:1px solid var(--bd2); border-radius:11px; color:var(--t4); background:var(--sf2); font:600 10px var(--fb); cursor:pointer; }
.community-notification:hover, .community-notification.active { border-color:var(--as3); color:var(--ac); background:var(--as); }
.community-notification svg { width:14px; height:14px; }
.community-cover {
  height:228px; background:
    radial-gradient(ellipse at 86% 55%,color-mix(in srgb,var(--community-accent) 45%,transparent),transparent 31%),
    radial-gradient(ellipse at 13% 110%,color-mix(in srgb,var(--g500) 36%,transparent),transparent 45%),
    linear-gradient(116deg,#071109 1%,#0d2111 54%,#101b12);
  background-size:cover; background-position:center;
}
[data-theme=light] .community-cover {
  background:
    radial-gradient(ellipse at 86% 55%,color-mix(in srgb,var(--community-accent) 43%,transparent),transparent 31%),
    radial-gradient(ellipse at 13% 110%,color-mix(in srgb,var(--g400) 42%,transparent),transparent 45%),
    linear-gradient(116deg,#102416 1%,#19391d 54%,#101b12);
}
.community-cover::before {
  inset:-20%; opacity:.16; transform:rotate(-13deg);
  background:repeating-linear-gradient(0deg,transparent 0 24px,rgba(204,255,174,.3) 25px,transparent 26px 50px);
  mask-image:linear-gradient(90deg,transparent,#000 15%,#000 88%,transparent);
}
.community-cover-grid {
  opacity:.19;
  background:
    linear-gradient(rgba(211,255,188,.17) 1px,transparent 1px),
    linear-gradient(90deg,rgba(211,255,188,.17) 1px,transparent 1px);
  background-size:34px 34px;
  mask-image:linear-gradient(180deg,#000 0%,transparent 100%);
}
.community-cover-top { top:17px; left:24px; right:24px; justify-content:space-between; }
.community-cover-chip {
  padding:6px 9px; border-color:rgba(217,255,207,.16); border-radius:8px;
  background:rgba(1,12,4,.48); font:500 8px var(--fm); letter-spacing:.04em; text-transform:uppercase;
}
.community-cover-chip svg { width:11px; height:11px; color:#a6f06a; }
.community-cover-title { position:absolute; z-index:2; left:25px; bottom:24px; max-width:66%; color:white; }
.community-cover-title>span { display:flex; align-items:center; gap:8px; margin-bottom:7px; color:#a8d69b; font:500 8px var(--fm); letter-spacing:.15em; }
.community-cover-title h1 { margin:0; overflow-wrap:anywhere; font-family:var(--fd); font-size:clamp(27px,4vw,39px); font-weight:850; letter-spacing:-.045em; line-height:1.02; text-shadow:0 2px 18px rgba(0,0,0,.26); }
.community-cover-ornament { position:absolute; z-index:2; top:48px; right:clamp(32px,10%,92px); display:grid; place-items:center; width:126px; height:126px; border:1px solid rgba(197,255,157,.2); border-radius:50%; }
.community-cover-ornament::before, .community-cover-ornament::after { position:absolute; border:1px solid rgba(197,255,157,.21); border-radius:50%; content:""; }
.community-cover-ornament::before { inset:12px; }
.community-cover-ornament::after { inset:29px; border-style:dashed; opacity:.7; }
.community-cover-ornament i { position:absolute; width:5px; height:5px; border:1px solid #c1ff91; border-radius:50%; background:#8bdc58; box-shadow:0 0 10px rgba(166,240,106,.8); }
.community-cover-ornament i:nth-child(1) { top:10px; left:50%; }
.community-cover-ornament i:nth-child(2) { top:30px; right:16px; }
.community-cover-ornament i:nth-child(3) { right:13px; bottom:33px; }
.community-cover-ornament i:nth-child(4) { bottom:10px; left:48%; }
.community-cover-ornament i:nth-child(5) { bottom:34px; left:14px; }
.community-cover-ornament i:nth-child(6) { top:31px; left:16px; }
.community-mark {
  z-index:3; left:max(22px,calc((100% - 1000px)/2)); right:auto; bottom:-48px;
  width:94px; height:94px; transform:none; border:4px solid var(--sf2);
  border-radius:24px; clip-path:none; background:linear-gradient(145deg,color-mix(in srgb,var(--community-accent) 72%,var(--g800)),var(--g800));
  box-shadow:0 10px 32px rgba(0,0,0,.23); font-size:38px;
}
.community-profile { max-width:none; padding:62px 24px 0 150px; }
.community-profile-main { align-items:center; gap:12px; }
.community-profile-copy { display:flex; align-items:center; gap:11px; min-width:0; }
.community-title-row { display:flex; flex-shrink:0; align-items:center; gap:6px; }
.community-membership { display:inline-flex; align-items:center; gap:6px; padding:6px 9px; border:1px solid var(--bd2); border-radius:7px; color:var(--t3); background:var(--sf); font:500 8px var(--fm); letter-spacing:.06em; text-transform:uppercase; white-space:nowrap; }
.community-membership i { width:6px; height:6px; border-radius:50%; background:var(--community-accent); box-shadow:0 0 8px var(--community-accent); }
.community-owner-badge { padding:6px 8px; border-radius:7px; font:500 8px var(--fm); letter-spacing:.035em; white-space:nowrap; }
.community-profile-actions { gap:6px; }
.community-icon-action { width:35px; height:35px; border-radius:10px; }
.community-follow-btn, .community-post-btn, .community-cancel-btn { min-height:35px; padding:0 11px; font-size:10px; }
.community-metrics {
  display:grid; grid-template-columns:1fr 1fr auto; align-items:center; gap:0;
  margin-top:16px; padding:12px 0; border-top:1px solid var(--bd); border-bottom:1px solid var(--bd);
}
.community-metric { min-width:0; gap:3px; padding:0 15px; border:0; border-radius:0; background:none; box-shadow:none; }
.community-metric:first-child { padding-left:0; }
.community-metric+.community-metric { border-left:1px solid var(--bd2); }
.community-metric strong { padding-left:2px; }
.community-metric span { color:var(--t5); font:500 8px var(--fm); letter-spacing:.09em; }
.community-metric strong { display:flex; align-items:center; gap:7px; color:var(--t1); font-family:var(--fd); font-size:20px; line-height:1.15; }
.community-metric-access strong { font-family:var(--fb); font-size:11px; font-weight:700; }
.community-metric-access strong i { width:6px; height:6px; border-radius:50%; background:var(--gold); }
.community-metric-access strong i.open { background:#82d74b; box-shadow:0 0 7px rgba(130,215,75,.55); }
.community-view-tabs { max-width:none; gap:0; margin:0 24px; padding:0; border-color:var(--bd2); }
.community-view-tabs button { min-height:47px; padding:0 13px; font-size:10px; }
.community-view-tabs button::after { right:0; left:0; height:2px; }
.community-view-tabs button span { font-family:var(--fm); }
.community-content { max-width:none; padding:18px 24px 28px; }
.community-join-callout, .community-composer-prompt, .community-status-note {
  border-color:var(--bd2); border-radius:13px; background:linear-gradient(115deg,var(--sf),color-mix(in srgb,var(--community-accent) 4%,var(--sf2)));
}
.community-join-callout { min-height:68px; }
.community-join-icon { flex-basis:35px; width:35px; height:35px; border:1px solid var(--bd); border-radius:11px; }
.community-join-copy strong { font-size:11px; }
.community-join-copy span { font-size:10px; }
.community-composer-prompt { min-height:57px; border-radius:14px; }
.community-composer-action { border-radius:8px; font:500 9px var(--fm); letter-spacing:.04em; text-transform:uppercase; }
.community-feed-heading h2 { font-size:16px; }
.community-feed-heading .community-eyebrow { font-family:var(--fm); }
.community-empty, .community-locked-feed {
  min-height:242px; justify-content:center; border:1px solid var(--bd2); border-radius:15px;
  background:
    linear-gradient(rgba(110,181,89,.035) 1px,transparent 1px),
    linear-gradient(90deg,rgba(110,181,89,.035) 1px,transparent 1px),
    radial-gradient(ellipse at 50% 0%,color-mix(in srgb,var(--community-accent) 8%,transparent),transparent 67%),
    var(--sf);
  background-size:24px 24px,24px 24px,auto,auto;
}
.community-empty-orbit { width:58px; height:58px; border:1px solid color-mix(in srgb,var(--community-accent) 42%,var(--bd)); border-radius:18px 18px 25px 25px; background:linear-gradient(145deg,color-mix(in srgb,var(--community-accent) 16%,var(--sf)),var(--sf)); box-shadow:0 0 36px color-mix(in srgb,var(--community-accent) 12%,transparent); }
.community-empty h2 { font-size:17px; }
.community-empty p { font-size:11px; }
.community-about-grid { gap:10px; }
.community-info-card, .community-owner-panel { border-color:var(--bd2); border-radius:14px; background:linear-gradient(145deg,var(--sf),var(--sf2)); box-shadow:none; }
.community-about-intro { padding:19px; background:radial-gradient(ellipse at 92% 0%,color-mix(in srgb,var(--community-accent) 9%,transparent),transparent 48%),linear-gradient(145deg,var(--sf),var(--sf2)); }
.community-about-intro h2 { font-size:20px; }
.community-info-title h3 { font-size:12px; }
.community-owner-heading h2 { font-size:16px; }
.community-request-row { border-color:var(--bd); }
.community-right-rail { gap:10px; padding:14px 12px; background:linear-gradient(180deg,color-mix(in srgb,var(--community-accent) 4%,var(--sf2)),var(--bg)); }
.community-rail-identity, .community-rail-panel { overflow:hidden; border:1px solid var(--bd2); border-radius:14px; background:linear-gradient(150deg,var(--sf),var(--sf2)); }
.community-rail-identity { position:relative; padding:17px 15px; background:radial-gradient(ellipse at 100% 0%,color-mix(in srgb,var(--community-accent) 11%,transparent),transparent 47%),linear-gradient(145deg,var(--sf),var(--sf2)); }
.community-rail-node { display:grid; place-items:center; width:43px; height:48px; margin-bottom:14px; border:1px solid color-mix(in srgb,var(--community-accent) 48%,var(--bd)); border-radius:12px 12px 17px 17px; clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%); background:linear-gradient(145deg,color-mix(in srgb,var(--community-accent) 66%,#bcf16b),var(--g700)); font-size:21px; }
.community-rail-identity h2 { margin:5px 0 9px; overflow-wrap:anywhere; color:var(--t1); font-family:var(--fd); font-size:18px; font-weight:850; letter-spacing:-.035em; line-height:1.1; }
.community-rail-identity .community-eyebrow { font:500 8px var(--fm); }
.community-rail-membership { display:inline-flex; align-items:center; gap:6px; padding:5px 7px; border:1px solid var(--as3); border-radius:6px; color:var(--ac); background:var(--as); font:500 8px var(--fm); letter-spacing:.04em; text-transform:uppercase; }
.community-rail-membership i { width:5px; height:5px; border-radius:50%; background:var(--ac); box-shadow:0 0 8px var(--ac); }
.community-rail-stats { display:grid; grid-template-columns:1fr 1fr; overflow:hidden; border:1px solid var(--bd2); border-radius:13px; background:var(--sf); }
.community-rail-stats>div { display:flex; flex-direction:column; gap:4px; padding:12px; }
.community-rail-stats>div+div { border-left:1px solid var(--bd); }
.community-rail-stats strong { color:var(--t1); font-family:var(--fd); font-size:21px; font-weight:850; line-height:1; }
.community-rail-stats span { color:var(--t5); font:500 7px var(--fm); letter-spacing:.1em; }
.community-rail-panel { padding:13px; }
.community-rail-heading { display:flex; align-items:center; justify-content:space-between; margin-bottom:9px; }
.community-rail-heading .community-eyebrow { font:500 8px var(--fm); }
.community-rail-heading svg { width:13px; height:13px; color:var(--ac); }
.community-rail-row { display:flex; justify-content:space-between; gap:8px; padding:8px 0; border-top:1px solid var(--bd); color:var(--t4); font-size:9px; }
.community-rail-row strong { color:var(--t2); font-size:9px; font-weight:650; text-align:right; }
.community-rail-row strong.is-open { color:var(--ac); }
.community-rail-row strong.is-paused { color:var(--gold-b); }
.community-rail-actions { padding:13px 10px 9px; }
.community-steward { display:flex; align-items:center; gap:8px; padding:7px 3px 11px; }
.community-steward-icon { display:grid; place-items:center; width:30px; height:30px; border:1px solid var(--bd2); border-radius:9px; color:var(--ac); background:var(--as); }
.community-steward-icon svg { width:14px; height:14px; }
.community-steward>span:last-child { display:flex; min-width:0; flex-direction:column; gap:3px; }
.community-steward small { color:var(--t5); font:500 7px var(--fm); letter-spacing:.08em; }
.community-steward strong { overflow:hidden; color:var(--t2); font-size:9px; text-overflow:ellipsis; white-space:nowrap; }
.community-rail-action { display:flex; align-items:center; gap:8px; width:100%; min-height:35px; padding:0 8px; border:0; border-top:1px solid var(--bd); color:var(--t3); background:transparent; font:600 9px var(--fb); text-align:left; cursor:pointer; }
.community-rail-action:hover { color:var(--ac); }
.community-rail-action svg { width:13px; height:13px; }
.community-rail-action.primary { margin:5px 0; padding:0 9px; border:1px solid var(--as3); border-radius:9px; color:var(--ac); background:var(--as); }
.community-rail-action b { display:grid; place-items:center; min-width:17px; height:17px; margin-left:auto; border-radius:50%; color:var(--g950); background:var(--ac); font:700 8px var(--fm); }
.community-rail-action-state { margin-left:auto; color:var(--t5); font:500 7px var(--fm); }
.community-rail-action>svg:last-child { margin-left:auto; }
.community-discovery-head { display:flex; align-items:flex-end; justify-content:space-between; gap:15px; margin:6px 0 20px; padding:18px; border:1px solid var(--bd2); border-radius:16px; background:radial-gradient(ellipse at 90% 0%,color-mix(in srgb,var(--ac) 11%,transparent),transparent 48%),linear-gradient(145deg,var(--sf),var(--sf2)); }
.community-discovery-head .community-eyebrow { font:500 8px var(--fm); }
.community-discovery-head h1 { margin:6px 0 3px; color:var(--t1); font-family:var(--fd); font-size:22px; font-weight:850; letter-spacing:-.04em; line-height:1.05; }
.community-discovery-head p { max-width:390px; margin:0; color:var(--t4); font-size:10px; line-height:1.5; }
.community-discovery-head>.btn { flex-shrink:0; white-space:nowrap; }
.comm-card { border-color:var(--bd2); border-radius:14px; }
.comm-banner { height:116px; }
.comm-card-mark { border-radius:16px 16px 20px 20px; clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%); }
.comm-body { padding:34px 13px 8px; }
.comm-name { margin-top:0; font-family:var(--fd); font-size:13px; font-weight:800; }
.comm-description { font-size:10px; }
.comm-card-actions { padding:0 13px 13px; }
.community-popover { width:282px !important; overflow:hidden; padding:0; border-color:var(--bd3); border-radius:15px; }
.community-popover-cover { position:relative; display:grid; place-items:center; height:88px; overflow:hidden; background-size:cover !important; background-position:center !important; }
.community-popover-cover::before { position:absolute; inset:0; background:linear-gradient(rgba(143,226,119,.11) 1px,transparent 1px),linear-gradient(90deg,rgba(143,226,119,.11) 1px,transparent 1px); background-size:22px 22px; content:""; }
.community-popover-category { position:absolute; z-index:1; top:8px; left:9px; display:inline-flex; align-items:center; gap:5px; padding:5px 7px; border:1px solid rgba(255,255,255,.18); border-radius:6px; color:white; background:rgba(2,12,4,.48); font:500 7px var(--fm); letter-spacing:.07em; text-transform:uppercase; }
.community-popover-category svg { width:10px; height:10px; color:#a8ef75; }
.community-popover-mark { position:relative; z-index:1; display:grid; place-items:center; width:43px; height:48px; border:1px solid rgba(197,255,157,.55); border-radius:12px 12px 17px 17px; clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%); background:linear-gradient(145deg,#b5f45e,#34aa51); box-shadow:0 0 23px rgba(124,223,80,.3); font-size:22px; }
.community-popover-content { padding:13px; }
.community-popover-name { color:var(--t1); font-family:var(--fd); font-size:15px; font-weight:850; letter-spacing:-.025em; }
.community-popover-access { display:flex; align-items:center; gap:5px; margin-top:5px; color:var(--t5); font:500 7px var(--fm); letter-spacing:.04em; text-transform:uppercase; }
.community-popover-access svg { width:10px; height:10px; color:var(--ac); }
.community-popover-access i { width:3px; height:3px; margin:0 2px; border-radius:50%; background:var(--t5); }
.community-popover-stats { display:flex; gap:14px; padding:10px 0; margin-top:10px; border-top:1px solid var(--bd); border-bottom:1px solid var(--bd); color:var(--t5); font-size:9px; }
.community-popover-stats b { color:var(--t1); font-family:var(--fd); font-size:12px; }
.community-popover-description { margin:10px 0 12px; color:var(--t3); font-size:10px; line-height:1.55; }
.community-popover-actions { display:flex; gap:7px; }
.community-popover-actions .pp-btn { min-height:34px; border-radius:9px; font-size:9px; }
.community-popover-actions .pp-btn:first-child { flex:1.35; }
.community-popover-actions .pp-btn:last-child { flex:1; }
@media(max-width:760px) {
  .community-cover-title { left:18px; bottom:19px; max-width:70%; }
  .community-cover-title h1 { font-size:30px; }
  .community-cover-top { left:17px; right:17px; }
  .community-profile { padding:17px 16px 0; }
  .community-view-tabs { margin:0 16px; }
  .community-content { padding:15px 16px 25px; }
}
@media(max-width:520px) {
  .community-nav { min-height:52px; padding:6px 10px; }
  .community-notification { width:34px; height:34px; justify-content:center; padding:0; }
  .community-notification span { display:none; }
  .community-cover { height:194px; }
  .community-cover-title { left:15px; bottom:19px; max-width:72%; }
  .community-cover-title h1 { font-size:26px; }
  .community-cover-title>span { font-size:7px; letter-spacing:.09em; }
  .community-cover-top { top:12px; left:12px; right:12px; }
  .community-cover-chip { gap:4px; padding:5px 6px; font-size:7px; }
  .community-cover-ornament { top:52px; right:17px; width:84px; height:84px; }
  .community-cover-ornament::before { inset:9px; }
  .community-cover-ornament::after { inset:20px; }
  .community-cover-ornament i:nth-child(2) { top:19px; right:10px; }
  .community-cover-ornament i:nth-child(3) { right:9px; bottom:22px; }
  .community-cover-ornament i:nth-child(5) { bottom:22px; left:9px; }
  .community-cover-ornament i:nth-child(6) { top:19px; left:10px; }
  .community-mark { right:calc(17px + 23px); left:16px; bottom:-12px; width:52px; height:52px; border-radius:14px; font-size:22px; }
  .community-profile { padding:24px 13px 0; }
  .community-profile-main { align-items:flex-start; flex-direction:column; gap:12px; }
  .community-profile-copy { align-items:flex-start; flex-direction:column; gap:7px; }
  .community-profile-actions { width:100%; justify-content:flex-start; }
  .community-metrics { grid-template-columns:1fr 1fr; }
  .community-metric { padding:0 9px; }
  .community-metric span { font-size:7px; }
  .community-metric strong { font-size:17px; }
  .community-metric-access { display:none; }
  .community-view-tabs { margin:0 13px; }
  .community-view-tabs button { gap:5px; padding:0 6px; font-size:9px; }
  .community-content { padding:13px 12px 22px; }
  .community-discovery-head { align-items:flex-start; flex-direction:column; padding:15px; }
  .community-discovery-head>.btn { align-self:flex-start; }
}

/* Keep the community surface readable: solid layers, quiet borders, no glow. */
.main-shell.community-layout .section-host { flex:1 1 auto; max-width:none; }
.main-shell.community-layout .community-right-rail {
  flex:0 0 246px; width:246px; min-width:0; max-width:246px;
  border-left:1px solid var(--bd2); background:var(--bg);
}
.community-page, .community-page .scroll { background:var(--bg); }
.community-page::before { display:none; }
.community-page .scroll {
  background-color:var(--bg);
  background-image:
    radial-gradient(circle,rgba(120,170,99,.18) 1px,transparent 1.2px),
    linear-gradient(rgba(120,170,99,.035) 1px,transparent 1px),
    linear-gradient(90deg,rgba(120,170,99,.035) 1px,transparent 1px);
  background-size:26px 26px,52px 52px,52px 52px;
}
.community-nav { background:var(--sf); }
.community-cover {
  height:202px; background-color:#17241a; background-image:none;
}
.community-cover::before {
  inset:0; z-index:1; opacity:1; transform:none; mask-image:none;
  background:rgba(0,0,0,.42);
}
.community-cover-grid {
  display:block; z-index:2; opacity:.8; pointer-events:none;
  background-image:
    radial-gradient(circle,rgba(226,242,214,.62) 1px,transparent 1.4px),
    linear-gradient(rgba(226,242,214,.12) 1px,transparent 1px),
    linear-gradient(90deg,rgba(226,242,214,.12) 1px,transparent 1px);
  background-repeat:repeat; background-size:22px 22px,88px 88px,88px 88px;
}
.community-cover-ornament { display:none; }
.community-cover-title { z-index:3; }
.community-cover-title h1 { text-shadow:none; }
.community-cover-title>span i, .community-crumb span i { background:#a8c47d; box-shadow:none; }
.community-cover-chip { background:rgba(0,0,0,.52); backdrop-filter:none; }
.community-cover-chip svg { color:#b6cf8a; }
.community-mark {
  z-index:3; left:max(22px,calc((100% - 1000px)/2)); right:auto; bottom:-48px;
  width:94px; height:94px; transform:none; border:4px solid var(--sf2);
  border-radius:24px; clip-path:none; background:linear-gradient(145deg,color-mix(in srgb,var(--community-accent) 72%,var(--g800)),var(--g800));
  box-shadow:0 10px 32px rgba(0,0,0,.23); font-size:38px;
}
.community-profile { padding:62px 24px 19px 148px; }
.community-profile-main { align-items:flex-start; }
.community-profile-copy { align-items:flex-start; flex-direction:column; gap:8px; }
.community-membership { border-radius:6px; background:var(--sf); }
.community-membership i { box-shadow:none; }
.community-owner-badge { border-radius:6px; box-shadow:none; }
.community-metrics { margin-top:14px; border-color:var(--bd2); }
.community-metric { background:transparent; box-shadow:none; }
.community-metric span, .community-eyebrow, .community-crumb span { letter-spacing:.08em; }
.community-view-tabs { border-color:var(--bd2); }
.community-view-tabs button.active::after { background:var(--ac); }
.community-join-callout, .community-composer-prompt, .community-status-note,
.community-empty, .community-locked-feed, .community-info-card, .community-owner-panel,
.community-rail-identity, .community-rail-stats, .community-rail-panel, .community-discovery-head,
.comm-card, .community-popover {
  background:var(--sf); background-image:none; box-shadow:none;
}
.community-join-callout.pending { background:var(--sf2); }
.community-page .btn-p, .community-discovery-head .btn-p, .comm-card .btn-p,
.community-popover .pp-btn.primary {
  border:1px solid #456f3c; background:#456f3c; box-shadow:none;
}
.community-page .btn-p:hover:not(:disabled), .community-discovery-head .btn-p:hover:not(:disabled),
.comm-card .btn-p:hover:not(:disabled), .community-popover .pp-btn.primary:hover {
  transform:none; border-color:#365b30; background:#365b30;
}
.community-page .btn-g, .comm-card .btn-g { background:var(--sf2); box-shadow:none; }
.community-join-icon, .community-info-icon, .community-locked-icon, .community-empty-orbit,
.community-steward-icon { background:var(--sf2); box-shadow:none; }
.community-composer-prompt:hover { transform:none; box-shadow:none; border-color:var(--bd3); }
.community-empty, .community-locked-feed { background:var(--sf); }
.community-empty-orbit { border-radius:16px; }
.community-about-intro, .community-rail-identity { background:var(--sf); }
.community-rail-node { clip-path:none; border-radius:12px; background:#314331; box-shadow:none; }
.community-rail-membership { background:var(--sf2); }
.community-rail-action.primary { background:var(--sf2); }
.community-popover { backdrop-filter:none; -webkit-backdrop-filter:none; }
.community-discovery-head { border-radius:12px; }
.comm-card:hover { transform:none; box-shadow:none; }
.comm-banner { background-color:#26382a; }
.comm-banner::after { background:rgba(0,0,0,.22); }
.comm-card-category, .comm-card-privacy { background:rgba(0,0,0,.56); backdrop-filter:none; }
.comm-card-mark { border-radius:14px; clip-path:none; background:rgba(18,35,21,.86); box-shadow:none; backdrop-filter:none; }
.community-popover-cover { background-color:#223326; }
.community-popover-cover::before {
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='56' viewBox='0 0 72 56'%3E%3Cg fill='none' stroke='%23d7e5c8' stroke-opacity='.2'%3E%3Cpath d='M-10 12C6 2 20 2 34 12s28 10 42 0'/%3E%3Cpath d='M-10 20C6 10 20 10 34 20s28 10 42 0'/%3E%3Cpath d='M-10 38c14-11 28-11 42 0s28 11 42 0'/%3E%3Cpath d='M-10 46c14-11 28-11 42 0s28 11 42 0'/%3E%3C/g%3E%3C/svg%3E");
  background-repeat:repeat;
}
.social-action-error { color:var(--red); border-color:color-mix(in srgb,var(--red) 34%,var(--bd)); background:color-mix(in srgb,var(--red) 8%,var(--sf)); }
.social-action-error svg { color:var(--red); }
.community-popover-mark { border-radius:13px; clip-path:none; background:#527445; box-shadow:none; }
.community-popover-cover::before {
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='26' height='26' viewBox='0 0 26 26'%3E%3Cpath d='M0 0h26M0 0v26' stroke='%23d7e5c8' stroke-opacity='.25'/%3E%3Ccircle cx='2' cy='2' r='1.4' fill='%23d7e5c8' fill-opacity='.6'/%3E%3C/svg%3E");
  background-size:26px 26px;
}
.market-filterbar { display:flex; flex:1 1 100%; flex-wrap:wrap; gap:7px; }
.market-filterbar .field { flex:1 1 132px; min-width:110px; }
.labor-contract-list { display:grid; gap:12px; }
.labor-contract-card { display:grid; gap:12px; padding:16px; border:1px solid var(--bd2); border-radius:var(--r14); background:var(--sf); }
.labor-contract-head { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
.labor-contract-head h2 { margin-top:4px; color:var(--t1); font:750 16px var(--fd); }
.labor-contract-status { padding:5px 8px; border:1px solid var(--bd2); border-radius:var(--rf); color:var(--t3); font:600 10px var(--fm); text-transform:capitalize; }
.labor-contract-status.status-accepted, .labor-contract-status.status-in_progress { border-color:var(--as3); color:var(--ac); background:var(--as); }
.labor-contract-status.status-completed { border-color:var(--bd3); color:var(--t2); }
.labor-contract-meta { display:flex; flex-wrap:wrap; gap:8px 16px; color:var(--t3); font-size:11px; }
.labor-contract-meta strong { color:var(--t1); }
.labor-contract-card>p { color:var(--t3); font-size:12px; line-height:1.55; }
.labor-contract-actions { display:flex; align-items:center; flex-wrap:wrap; gap:8px; }
.labor-contract-actions>span { flex:1; color:var(--t3); font-size:11px; }
.labor-contract-rating { display:flex; align-items:flex-end; flex-wrap:wrap; gap:8px; color:var(--t3); font-size:11px; }
.labor-contract-rating label { display:flex; flex-direction:column; gap:5px; }
.labor-contract-rating .field { min-width:140px; }
.community-icon-action:hover { border-color:var(--bd3); color:var(--ac); }
.community-rail-row strong.is-paused { color:var(--gold-b); }
.root-hd { background:var(--sf); }
.right-rail { background:var(--bg); }
.sup-window-notifications { background:var(--bg); }
.profile-btn, .dd-av, .av-g, .coming-soon-ico-wrap,
.btn-p, .pp-btn.primary, .send-btn { background:var(--g500); }
.btn-p:hover:not(:disabled), .pp-btn.primary:hover, .send-btn:hover { background:var(--g450); }
.btn-g { background:var(--sf); background-image:none; }
.btn-p, .pp-btn.primary, .send-btn { box-shadow:none; }
.main { background:var(--bg); }
.main::before {
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Ccircle cx='2' cy='2' r='1.15' fill='%235b8147' fill-opacity='.42'/%3E%3C/svg%3E");
  background-size:28px 28px; opacity:.5;
}
.main-farm::before, .main-labs::before {
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 44 44'%3E%3Cpath d='M0 0h44M0 0v44' stroke='%235b8147' stroke-opacity='.14'/%3E%3C/svg%3E");
  background-size:44px 44px; mask-image:none;
}
.main-link::before, .main-wallet::before, .main-messages::before, .main-account::before {
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='26' height='26' viewBox='0 0 26 26'%3E%3Ccircle cx='2' cy='2' r='1.1' fill='%235b8147' fill-opacity='.38'/%3E%3C/svg%3E");
  background-size:26px 26px;
}
[data-theme=dark] .main::before,
[data-theme=dark] .main-link::before, [data-theme=dark] .main-wallet::before,
[data-theme=dark] .main-messages::before, [data-theme=dark] .main-account::before {
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Ccircle cx='2' cy='2' r='1.15' fill='%23a6d47c' fill-opacity='.52'/%3E%3C/svg%3E");
}
[data-theme=dark] .main-farm::before, [data-theme=dark] .main-labs::before {
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 44 44'%3E%3Cpath d='M0 0h44M0 0v44' stroke='%23a6d47c' stroke-opacity='.14'/%3E%3C/svg%3E");
}
.scroll { background-image:none; }
.sub-hd { background:var(--sf); }
.card, .post-card, .compose-box, .comm-card, .rail-card, .item-card, .inv-card,
.stat-tile, .labs-feat, .set-row, .w-mini, .mkt-card, .bio-card,
.community-info-card, .community-owner-panel, .community-rail-panel {
  background:var(--sf); background-image:none;
}
.ai-me, .bub-me { background:var(--g500); }
.profile-banner { background:var(--g800); }
.profile-av-lg { background:var(--g500); }
.rail-card .rail-copy { background:var(--sf2); }
.bio-card::before, .mkt-card.up::before, .mkt-card.dn::before, .w-mini::before { background:var(--ac); }
.pf { background:var(--ac); }
.farm-detail-hero {
  background-color:var(--g800);
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3E%3Ccircle cx='2' cy='2' r='1.2' fill='%23c4e6ad' fill-opacity='.38'/%3E%3Ccircle cx='17' cy='17' r='1.2' fill='%23c4e6ad' fill-opacity='.38'/%3E%3C/svg%3E");
  background-size:30px 30px;
}
.coming-soon-card::before, .item-thumb::after, .inv-banner::after,
.mkt-hero::before, .w-card::before, .sup-hero::before,
.acc-hero::before, .ist-buy-hero::before, .auth-shell::before,
.auth-landing::before { background:none; }
.gvp-cinematic { background:rgba(0,0,0,.12); }
.item-thumb, .inv-banner, .mkt-hero, .w-card, .txp-hd,
.sr-hero, .acc-hero, .sup-hero, .ist-buy-hero {
  background-color:var(--g800); background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3E%3Cpath d='M0 0h30M0 0v30' stroke='%23c4e6ad' stroke-opacity='.14'/%3E%3C/svg%3E");
  background-size:30px 30px;
}
.labs-hero { background:var(--g800); }
.labs-hero-grid {
  opacity:.34;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='42' height='42' viewBox='0 0 42 42'%3E%3Cpath d='M0 0h42M0 0v42' stroke='%23ffffff' stroke-opacity='.15'/%3E%3C/svg%3E");
  background-size:42px 42px;
}
.auth-shell { background:#080a09; }
.isa-grid { display:none; }
.auth-shell::after { background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'%3E%3Ccircle cx='2' cy='2' r='1.15' fill='%23ffffff' fill-opacity='.28'/%3E%3C/svg%3E"); }
.auth-btn-primary { background:#72cb72; color:#081108; border-color:#72cb72; }
.auth-btn-primary:hover { background:#a8dfa8; box-shadow:none; }
.isa-smoke { display:none; }
.isa-title { background:none; color:var(--t1); -webkit-text-fill-color:currentColor; text-shadow:none; }
.community-empty, .community-locked-feed {
  background-color:var(--sf);
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3E%3Ccircle cx='2' cy='2' r='1.15' fill='%235b8147' fill-opacity='.36'/%3E%3C/svg%3E");
  background-size:30px 30px;
}
@media(min-width:1001px) and (max-width:1200px) {
  .main-shell.community-layout .community-right-rail { display:none; }
}
@media(min-width:761px) {
  .community-cover-chip { font-size:9px; }
  .community-cover-title>span, .community-rail-identity .community-eyebrow,
  .community-rail-heading .community-eyebrow, .community-steward small { font-size:9px; }
  .community-membership, .community-owner-badge, .community-metric span,
  .community-rail-stats span, .community-rail-row, .community-rail-row strong,
  .community-rail-action, .community-popover-access { font-size:10px; }
  .community-crumb span { font-size:9px; }
  .community-view-tabs button, .community-follow-btn, .community-post-btn { font-size:11px; }
}
.comm-stats { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:12px; }
.comm-stat { display:grid; grid-template-columns:18px 1fr; grid-template-rows:auto auto; align-items:center; column-gap:6px; padding:8px 9px; border:1px solid var(--bd); border-radius:9px; background:var(--sf2); }
.comm-stat svg { grid-row:1/3; width:14px; height:14px; color:var(--ac); }
.comm-stat strong { color:var(--t1); font-family:var(--fd); font-size:12px; line-height:1.1; }
.comm-stat small { color:var(--t5); font-size:8px; }
.community-members-heading { display:flex; align-items:flex-end; justify-content:space-between; gap:12px; margin-bottom:15px; }
.community-members-heading h2 { margin:4px 0 0; color:var(--t1); font:800 18px var(--fd); }
.community-members-heading>span { color:var(--t4); font-size:10px; }
.community-members-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:10px; }
.community-member-card { display:flex; min-width:0; align-items:center; flex-direction:column; gap:7px; padding:16px 12px; border:1px solid var(--bd2); border-radius:12px; color:var(--t1); background:var(--sf); text-align:center; cursor:pointer; transition:border-color .16s,transform .16s; }
.community-member-card:hover { transform:translateY(-2px); border-color:var(--ac); }
.community-member-card strong { max-width:100%; overflow:hidden; font-size:12px; text-overflow:ellipsis; white-space:nowrap; }
.community-member-card>span { color:var(--t4); font-size:10px; }
.community-member-card small { display:flex; align-items:center; gap:5px; margin-top:2px; color:var(--t5); font-size:9px; }
.community-member-card small svg { width:11px; height:11px; }
.community-members-tools { display:grid; grid-column:1/-1; grid-template-columns:minmax(0,1fr) 180px; gap:8px; margin-bottom:2px; }
.post-img img, .post-view-img img { display:block; width:100%; height:100%; object-fit:cover; }
.post-location { display:flex; align-items:center; gap:6px; margin-top:9px; color:var(--t4); font-size:10px; }
.post-location svg { width:13px; height:13px; color:var(--ac); }
.post-view-location { margin-top:0; }
.compose-tools { display:flex; gap:4px; }
.compose-tools .ib.active { color:var(--ac); background:var(--as); }
.compose-attachment-preview { position:relative; width:min(260px,100%); margin:8px 0 12px; }
.compose-attachment-preview img { display:block; width:100%; max-height:190px; border:1px solid var(--bd2); border-radius:10px; object-fit:cover; }
.compose-attachment-preview .ib { position:absolute; top:7px; right:7px; background:var(--sf); }
.compose-location-field { display:flex; align-items:center; gap:7px; margin:8px 0 12px; }
.compose-location-field>svg { width:15px; height:15px; flex:0 0 auto; color:var(--ac); }
.compose-location-field .field { flex:1; min-width:0; }
.compose-emoji-picker { display:grid; grid-template-columns:repeat(8,34px); gap:4px; width:max-content; max-width:100%; padding:7px; margin:8px 0 12px; border:1px solid var(--bd2); border-radius:10px; background:var(--sf); }
.compose-emoji-picker button { display:grid; place-items:center; width:34px; height:34px; border:0; border-radius:8px; background:var(--sf2); font-size:18px; cursor:pointer; }
.compose-emoji-picker button:hover { background:var(--as); }
.listing-image-preview { display:block; width:100%; max-height:180px; margin-top:8px; border:1px solid var(--bd2); border-radius:10px; object-fit:cover; }
.ith-icon img { display:block; width:100%; height:100%; object-fit:cover; }
.listing-detail-image { display:grid; place-items:center; width:100%; height:180px; overflow:hidden; margin-bottom:14px; border:1px solid var(--bd2); border-radius:12px; background:var(--sf2); font-size:48px; }
.listing-detail-image img { width:100%; height:100%; object-fit:cover; }
.buy-item-image { width:58px; height:58px; flex:0 0 auto; border:1px solid var(--bd2); border-radius:9px; object-fit:cover; }
@media(max-width:520px) {
  .community-members-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .community-member-card { padding:13px 8px; }
  .community-members-tools { grid-template-columns:1fr; }
  .compose-emoji-picker { grid-template-columns:repeat(6,34px); }
}
`;

export default CSS;