# Infinite Sprouts

Agricultural fintech PWA — React + Vite.

```bash
npm install
npm run dev
```

## Structure

```
src/
  App.jsx              # Root — section routing, global state
  index.jsx            # Entry point
  context/             # React context (SocialCtx for user/community state)
  data/                # Seed data
  utils/               # Pure helpers (fmt, pct, nowTime)
  icons/               # All SVG icon components
  styles/              # Global CSS (injected at runtime)
  components/          # Shared primitives: Av, Modal, Toggle, ProgBar, Toasts
  popovers/            # All popovers, action menus, panels:
                       #   ProfilePopover, CommunityPopover,
                       #   PostActionMenu, CommentActionMenu,
                       #   SaveFolderPanel, SharePanel
  overlays/            # Full-screen overlays: SupportSection, NotificationsSection
  sections/
    link/              # Link section (social feed)
      pages/           # ProfilePage, PostView, CommunityFeed
    farm/              # Farm marketplace
      modals/          # BuyModal, TxPortal, InvestModal, FarmDetailModal
    labs/              # Labs — AI Advisor, Market Data, Features
    wallet/            # Wallet — Naira + IST
    messages/          # DM chat
    account/           # Profile + Settings
```
