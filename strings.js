// Player-visible UI chrome. Catalog item names live in game.js data.
export const STR = {
  title: "AgentVerse OS",
  // dock categories
  cat_agents: "Agents", cat_buildings: "Buildings", cat_workflows: "Workflows",
  cat_integrations: "Integrations", cat_decorations: "Decor", cat_marketplace: "Market",
  townhall: "Town Hall", help: "Help", center: "Center",
  // libraries
  agent_library: "Agent Library", building_library: "Building Library",
  workflow_library: "Workflow Buildings", integration_library: "Integration Buildings",
  decoration_library: "Decorations", marketplace: "Marketplace",
  create_agent: "Create Agent", import_agent: "Import Agent",
  custom_agents: "Custom Agents", imported_agents: "Imported Agents",
  // placement
  place_hint: (n) => `Place ${n} — tap an empty square (tap here to cancel)`,
  place_blocked: "That square is taken.",
  no_coins: "Not enough coins.",
  placed: (n) => `${n} placed!`,
  cost: "Cost", size: "Size", coins: "Coins",
  // quick menu
  qm_open: "Open", qm_move: "Move", qm_upgrade: "Upgrade", qm_duplicate: "Duplicate",
  qm_settings: "Settings", qm_disable: "Disable", qm_enable: "Enable", qm_delete: "Delete",
  move_hint: "Tap a new empty square to drop the building (tap here to cancel)",
  del_title: "Delete building?", del_refund: (c) => `Refund ${c} coins. Workers will be reassigned.`,
  confirm: "Confirm", cancel: "Cancel", close: "Close",
  // building modal tabs
  t_workers: "Workers", t_tools: "Tools", t_analytics: "Analytics", t_settings: "Settings",
  assign: "Assign", remove: "Remove", add_tool: "Add Tool", installed: "Installed",
  no_workers: "No agents working here yet.", assign_pick: "Assign an idle agent",
  bld_name: "Building name", permissions: "Permissions", limits: "Resource limits", notifications: "Notifications",
  level: "Level", upgrade_to: (l, c) => `Upgrade to Lv ${l} · ${c} coins`, maxed: "Max level",
  // town hall tabs
  th_dashboard: "Dashboard", th_providers: "AI Providers", th_integrations: "Integrations",
  th_agents: "Agent Registry", th_buildings: "Building Registry", th_system: "System", th_economy: "Economy",
  connect: "Connect", configure: "Configure", usage: "Usage", connected: "Connected", not_connected: "Not connected",
  endpoint: "Endpoint", api_key: "API Key", save: "Save",
  key_note: "Stored only in this browser, sent straight to the provider. Use spend-capped keys.",
  collect: "Collect daily income", reset_town: "Reset town", reset_confirm: "Reset the whole town? Deletes everything.",
  locate: "Locate", chat: "Chat",
  // chat
  chat_ph: "Message your agent…", send: "Send", typing: "typing…",
  live_note: (p) => `live ${p}`, demo_note: "demo mode", err_note: (p) => `couldn't reach live ${p} (key/CORS) — demo reply`,
  // agent create
  f_name: "Name", f_role: "Role", f_provider: "Provider", f_personality: "Personality",
  import_ph: '{"name":"Nova","role":"research","provider":"openai"}', import_ok: "Imported.", import_err: "Couldn't parse that.",
  // onboarding
  empty_hint: "Welcome, founder. Use the dock to build your AI city — place Agents, Buildings, Integrations & Workflows. Tap the Town Hall for the OS control center.",
  soon: "Coming soon",
  help_title: "AgentVerse OS",
  help_body: [
    "The dock at the bottom is your construction & management dock — not an app launcher.",
    "Pick a category (Agents, Buildings, Workflows, Integrations, Decor), choose an item, then tap an empty grid square to place it.",
    "Click any building to open its app (Workers · Tools · Analytics · Settings).",
    "Right-click / long-press a building for quick actions: Open, Move, Upgrade, Duplicate, Disable, Delete.",
    "Connect models & integrations in the Town Hall (the OS control center), then place AI agents and chat with them live.",
    "Drag to pan, scroll / pinch to zoom.",
  ],
};
