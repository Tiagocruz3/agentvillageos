// AgentVerse OS — a construction & management dock builds your AI city.
// Place agents, buildings, integrations, workflows & decor on an iso grid.
// Every building opens its own modal app; the Town Hall is the OS control center.
import { STR } from "./strings.js";

/* ============================== CONFIG ============================== */
const HW = 64, HH = 32, GRID = 16, STEP = 1000 / 60, MOVE = 120;
const SAVE_KEY = "agentverse_v3";
const ZMIN = 0.4, ZMAX = 2.3;

/* ============================== PROVIDERS (chat models) ============================== */
const PROVIDERS = {
  openai:     { name: "OpenAI",    color: "#10a37f", api: "openai",    endpoint: "https://api.openai.com/v1/chat/completions",                 model: "gpt-4o-mini",            avatar: "agent_openai" },
  anthropic:  { name: "Claude",    color: "#d97757", api: "anthropic", endpoint: "https://api.anthropic.com/v1/messages",                      model: "claude-3-5-haiku-latest", avatar: "agent_anthropic" },
  openrouter: { name: "OpenRouter",color: "#6467f2", api: "openai",    endpoint: "https://openrouter.ai/api/v1/chat/completions",              model: "openai/gpt-4o-mini",     avatar: "agent_openrouter" },
  grok:       { name: "Grok",      color: "#1d1d1f", api: "openai",    endpoint: "https://api.x.ai/v1/chat/completions",                       model: "grok-2-latest",          avatar: "agent_grok" },
  gemini:     { name: "Gemini",    color: "#4285f4", api: "openai",    endpoint: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", model: "gemini-1.5-flash", avatar: null },
  deepseek:   { name: "DeepSeek",  color: "#4d6bfe", api: "openai",    endpoint: "https://api.deepseek.com/v1/chat/completions",               model: "deepseek-chat",          avatar: null },
  lmstudio:   { name: "LM Studio", color: "#8b5cf6", api: "openai",    endpoint: "http://localhost:1234/v1/chat/completions",                  model: "local-model",            avatar: null, local: true },
  ollama:     { name: "Ollama",    color: "#ca6f1e", api: "openai",    endpoint: "http://localhost:11434/v1/chat/completions",                 model: "llama3.1",               avatar: null, local: true },
};
const PROVIDER_ORDER = ["openai", "anthropic", "gemini", "deepseek", "openrouter", "grok", "lmstudio", "ollama"];

/* ============================== AGENT ROLES ============================== */
const ROLES = {
  chat:      { label: "Chat Agent",      emoji: "💬", color: "#5ab0ff" },
  research:  { label: "Research Agent",  emoji: "🔬", color: "#9b6bff" },
  developer: { label: "Developer Agent", emoji: "💻", color: "#ffb24d" },
  design:    { label: "Design Agent",    emoji: "🎨", color: "#3fd0c9" },
  marketing: { label: "Marketing Agent", emoji: "📣", color: "#ff6b9d" },
  sales:     { label: "Sales Agent",     emoji: "🤝", color: "#7fd07f" },
};
const ROLE_ORDER = ["chat", "research", "developer", "design", "marketing", "sales"];
const AGENT_NAMES = ["Nova", "Pixel", "Maya", "Atlas", "Echo", "Sage", "Juno", "Rex", "Iris", "Cleo", "Orion", "Vera"];

/* ============================== BUILDING CATALOGS ============================== */
// kind: building | workflow | integration | decoration
const CATALOG = {
  // core buildings
  town_hall:       { kind: "building", name: "Town Hall",        emoji: "🏛️", color: "#5ab0ff", cost: 0,   size: "4x4", sprite: "bld_town_hall", os: true },
  research_lab:    { kind: "building", name: "Research Lab",      emoji: "🔬", color: "#9b6bff", cost: 500, size: "3x3", sprite: "bld_research_lab" },
  social_hub:      { kind: "building", name: "Social Hub",        emoji: "📣", color: "#ff6b9d", cost: 500, size: "3x3", sprite: "bld_social_hub" },
  builder_workshop:{ kind: "building", name: "Builder Workshop",  emoji: "🛠️", color: "#ffb24d", cost: 600, size: "3x3", sprite: "bld_builder_workshop" },
  design_studio:   { kind: "building", name: "Design Studio",     emoji: "🎨", color: "#3fd0c9", cost: 500, size: "3x3", sprite: "bld_design_studio" },
  sales_center:    { kind: "building", name: "Sales Center",      emoji: "🤝", color: "#33c06a", cost: 500, size: "3x3", sprite: "bld_sales_center" },
  finance_office:  { kind: "building", name: "Finance Office",    emoji: "🏦", color: "#caa53a", cost: 700, size: "3x3", sprite: "bld_finance_office" },
  media_studio:    { kind: "building", name: "Media Studio",      emoji: "🎙️", color: "#9b59b6", cost: 600, size: "3x3", sprite: "bld_media_studio" },
  support_center:  { kind: "building", name: "Support Center",    emoji: "🎧", color: "#4aa3df", cost: 400, size: "3x3", sprite: "bld_support_center" },
  // workflow buildings (procedural art)
  lead_gen:        { kind: "workflow", name: "Lead Generation Center", emoji: "🧲", color: "#e67e22", cost: 900,  size: "3x3" },
  tiktok_factory:  { kind: "workflow", name: "TikTok Factory",         emoji: "🎵", color: "#ff4d6d", cost: 1000, size: "3x3" },
  website_factory: { kind: "workflow", name: "Website Factory",        emoji: "🌐", color: "#3498db", cost: 1000, size: "3x3" },
  automation_factory:{ kind: "workflow", name: "Automation Factory",   emoji: "⚙️", color: "#7f8c8d", cost: 1100, size: "3x3" },
  podcast_factory: { kind: "workflow", name: "Podcast Factory",        emoji: "🎧", color: "#9b59b6", cost: 900,  size: "3x3" },
  course_factory:  { kind: "workflow", name: "Course Factory",         emoji: "🎓", color: "#16a085", cost: 1000, size: "3x3" },
  // integration buildings (some map to a provider via .provider)
  openai_lab:      { kind: "integration", name: "OpenAI Lab",     emoji: "✸", color: "#10a37f", cost: 300, size: "2x2", sprite: "bld_openai",     provider: "openai" },
  claude_lab:      { kind: "integration", name: "Claude Lab",     emoji: "✦", color: "#d97757", cost: 300, size: "2x2", sprite: "bld_anthropic",  provider: "anthropic" },
  openrouter_hub:  { kind: "integration", name: "OpenRouter Hub", emoji: "⮂", color: "#6467f2", cost: 300, size: "2x2", sprite: "bld_openrouter", provider: "openrouter" },
  grok_lab:        { kind: "integration", name: "Grok Lab",       emoji: "𝕏", color: "#1d1d1f", cost: 300, size: "2x2", sprite: "bld_grok",       provider: "grok" },
  github_center:   { kind: "integration", name: "GitHub Center",      emoji: "🐙", color: "#6e5494", cost: 300, size: "2x2", tool: "github" },
  vercel_center:   { kind: "integration", name: "Vercel Deploy Center",emoji: "▲", color: "#111111", cost: 300, size: "2x2", tool: "vercel" },
  supabase_center: { kind: "integration", name: "Supabase Data Center",emoji: "⚡", color: "#3ecf8e", cost: 300, size: "2x2", tool: "supabase" },
  lmstudio_node:   { kind: "integration", name: "LM Studio Node",     emoji: "🖥️", color: "#8b5cf6", cost: 0,   size: "2x2", provider: "lmstudio" },
  ollama_cluster:  { kind: "integration", name: "Ollama Cluster",     emoji: "🦙", color: "#ca6f1e", cost: 0,   size: "2x2", provider: "ollama" },
  n8n_hub:         { kind: "integration", name: "n8n Automation Hub", emoji: "🔗", color: "#ea4b71", cost: 300, size: "2x2", tool: "n8n" },
  // decorations (procedural)
  road:    { kind: "decoration", name: "Road",     emoji: "🛣️", color: "#b9b2a4", cost: 20 },
  tree:    { kind: "decoration", name: "Tree",     emoji: "🌳", color: "#3c9a4e", cost: 30 },
  fountain:{ kind: "decoration", name: "Fountain", emoji: "⛲", color: "#5fc8e8", cost: 120 },
  park:    { kind: "decoration", name: "Park",     emoji: "🌷", color: "#7ec85f", cost: 80 },
  sign:    { kind: "decoration", name: "Sign",     emoji: "🪧", color: "#caa06a", cost: 25 },
  bench:   { kind: "decoration", name: "Bench",    emoji: "🪑", color: "#9a6b3a", cost: 40 },
};
const LIB = {
  buildings: ["research_lab","social_hub","builder_workshop","design_studio","sales_center","finance_office","media_studio","support_center","town_hall"],
  workflows: ["lead_gen","tiktok_factory","website_factory","automation_factory","podcast_factory","course_factory"],
  integrations: ["openai_lab","claude_lab","openrouter_hub","grok_lab","github_center","vercel_center","supabase_center","lmstudio_node","ollama_cluster","n8n_hub"],
  decorations: ["road","tree","fountain","park","sign","bench"],
};
// integration tools shown in Town Hall → Integrations
const TOOLS_CATALOG = ["github","vercel","supabase","stripe","google","discord","slack","canva","figma","notion"];
const TOOL_EMOJI = { github:"🐙", vercel:"▲", supabase:"⚡", stripe:"💳", google:"🔎", discord:"🎮", slack:"💬", canva:"🎨", figma:"🎯", notion:"📝", n8n:"🔗", openai:"✸", tiktok:"🎵", instagram:"📸" };

/* ============================== ASSETS ============================== */
const CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_3FNORjZACwRQB6VtB4tX0jmJWhf/";
const ASSET_URL = {
  grass:            CDN + "hf_20260622_054509_a2f36dd7-7c2b-4eeb-b7db-5712dbe21acc.png",
  t_grass2:         CDN + "hf_20260622_070953_bc88ccbb-4f4a-4b62-a4c0-2904a3a521d8.png",
  t_flowers:        CDN + "hf_20260622_070956_abb1f87f-8dc0-4a54-9f2c-e20f63b9079c.png",
  t_dirt:           CDN + "hf_20260622_070959_3f5054fe-5f6c-457a-93f0-a01338cb63e4.png",
  t_water:          CDN + "hf_20260622_071002_e19ccc85-79cf-45a8-8c0f-3afa1cdcee4a.png",
  t_sand:           CDN + "hf_20260622_071004_4fdbff07-3425-4bb4-80d5-788f1fbcdf7a.png",
  bld_openai:       CDN + "hf_20260622_054927_9d92734e-761e-4d92-a162-c20dec3d291d.png",
  bld_anthropic:    CDN + "hf_20260622_054928_14620f0b-cf7c-4df4-93a5-465e30557729.png",
  bld_openrouter:   CDN + "hf_20260622_054929_eb3da634-49a7-4bb1-ae46-dfc0c7b70769.png",
  bld_grok:         CDN + "hf_20260622_054931_191c8f8e-869a-4047-a3b0-6bd46a46c373.png",
  agent_openai:     CDN + "hf_20260622_054932_405b0c2a-e7a9-4567-b88e-c8057033277a.png",
  agent_anthropic:  CDN + "hf_20260622_054933_9d651849-2dcb-4fe1-b021-c1c7ac4911da.png",
  agent_openrouter: CDN + "hf_20260622_054934_35a2d3c4-486d-4b69-a48a-bc50ef23cf97.png",
  agent_grok:       CDN + "hf_20260622_054935_2f8b12ce-86bf-4b88-8e88-87c29ee0b14a.png",
  // core building sprites (filled after background removal)
  bld_town_hall:        CDN + "hf_20260622_060301_bac1c9f8-ae3a-4ef0-8fae-1d1659b75600.png",
  bld_research_lab:     CDN + "hf_20260622_060302_b0cf20a8-8445-45f7-924e-a1b4a692c796.png",
  bld_social_hub:       CDN + "hf_20260622_060304_42376e88-6a0c-46e8-955e-3213f5f1cc47.png",
  bld_builder_workshop: CDN + "hf_20260622_060305_6b526bb5-ec3a-4e40-9718-63944066f106.png",
  bld_design_studio:    CDN + "hf_20260622_060307_2908bec6-00dc-4eb2-9a4e-9f6aa1907def.png",
  bld_sales_center:     CDN + "hf_20260622_060308_c1c51057-2431-49d2-b1af-49f04c9d19bf.png",
  bld_finance_office:   CDN + "hf_20260622_060309_59343d03-dc89-43e7-a207-f674331cf79c.png",
  bld_media_studio:     CDN + "hf_20260622_060310_d1ae0a0f-16d0-41d1-a0bf-02a0d3ec6b16.png",
  bld_support_center:   CDN + "hf_20260622_060311_d0ab0a94-1a89-45eb-ad74-2a3dd77931cf.png",
};
const IMG = {};
function loadImage(src) { return new Promise(r => { if (!src || src[0] === "_") return r(null); const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; }); }
async function loadAssets() { await Promise.all(Object.entries(ASSET_URL).map(async ([k, u]) => { const im = await loadImage(u); if (im) IMG[k] = im; })); }
function agentAvatarUrl(provider) { const a = PROVIDERS[provider]?.avatar; return a ? ASSET_URL[a] : null; }

/* ============================== ISO / CAMERA ============================== */
function isoCenter(gx, gy) { return { x: (gx - gy) * HW, y: (gx + gy) * HH }; }
function worldToCell(wx, wy) { return { gx: (wx / HW + wy / HH) / 2, gy: (wy / HH - wx / HW) / 2 }; }
const cam = { x: 0, y: 0, zoom: 1, tx: 0, ty: 0, tzoom: 1 };
let view = { w: 0, h: 0 };
function w2s(wx, wy) { return { x: (wx - cam.x) * cam.zoom + view.w / 2, y: (wy - cam.y) * cam.zoom + view.h / 2 }; }
function s2w(sx, sy) { return { x: (sx - view.w / 2) / cam.zoom + cam.x, y: (sy - view.h / 2) / cam.zoom + cam.y }; }

/* ============================== STATE ============================== */
let S = null, now = 0, place = null, move = null, hoverCell = null;
const $ = s => document.querySelector(s);

function fresh() {
  const s = { coins: 3000, buildings: [], agents: [], decos: [], keys: {}, endpoints: {}, integrations: {}, customAgents: [], nextId: 1, seenHelp: false, lastCollect: 0 };
  // Town Hall auto-placed at center as the OS control center
  s.buildings.push({ id: s.nextId++, kind: "building", type: "town_hall", gx: 8, gy: 8, level: 1, name: "Town Hall", disabled: false, workers: [] });
  return s;
}
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (!s || !s.buildings) return null;
    s.decos = s.decos || []; s.customAgents = s.customAgents || []; s.integrations = s.integrations || {}; s.endpoints = s.endpoints || {};
    for (const a of s.agents) { a.path = a.path || []; a.status = "idle"; a.wait = 0; a.chatting = false; }
    return s;
  } catch (e) { return null; }
}

/* ============================== HELPERS ============================== */
function occupied(gx, gy) { return S.buildings.some(b => b.gx === gx && b.gy === gy); }
function buildingAt(gx, gy) { return S.buildings.find(b => b.gx === gx && b.gy === gy); }
function townHall() { return S.buildings.find(b => b.type === "town_hall"); }
function providerConnected(p) { const v = S.keys[p]; return !!(v && v.trim()) || PROVIDERS[p]?.local; }
function spend(n) { if (S.coins < n) { toast(STR.no_coins); return false; } S.coins -= n; return true; }

/* ============================== PLACEMENT ============================== */
function startPlace(spec) { // {kind:'building'|'agent', type?, role?, provider?, dup?}
  place = spec; move = null;
  const name = spec.kind === "agent" ? (ROLES[spec.role]?.label || "Agent") : CATALOG[spec.type].name;
  const pb = $("#placebar"); pb.textContent = STR.place_hint(name); pb.classList.add("show");
  closeModal(); updateHint();
}
function cancelPlace() { place = null; $("#placebar").classList.remove("show"); updateHint(); }
function startMove(id) { move = id; place = null; const pb = $("#placebar"); pb.textContent = STR.move_hint; pb.classList.add("show"); closeModal(); }
function cancelMove() { move = null; $("#placebar").classList.remove("show"); }

function doPlaceAt(gx, gy) {
  if (gx < 0 || gy < 0 || gx >= GRID || gy >= GRID) return;
  if (move != null) {
    if (occupied(gx, gy)) { toast(STR.place_blocked); return; }
    const b = S.buildings.find(x => x.id === move); if (b) { b.gx = gx; b.gy = gy; }
    cancelMove(); save(); return;
  }
  if (!place) return;
  if (place.kind === "agent") {
    spawnAgent(place.role, place.provider, place.name);
    if (!place.cont) cancelPlace(); save(); return;
  }
  const cat = CATALOG[place.type];
  if (cat.kind === "decoration") {
    if (S.decos.some(d => d.gx === gx && d.gy === gy) || occupied(gx, gy)) { toast(STR.place_blocked); return; }
    if (!spend(cat.cost)) return;
    S.decos.push({ id: S.nextId++, type: place.type, gx, gy });
    toast(STR.placed(cat.name)); save(); return; // decorations stay in place mode for quick multi-place? no:
  }
  if (isWater(gx, gy)) { toast("Can't build on water."); return; }
  if (occupied(gx, gy)) { toast(STR.place_blocked); return; }
  if (!spend(cat.cost)) return;
  const b = { id: S.nextId++, kind: cat.kind, type: place.type, gx, gy, level: 1, name: cat.name, disabled: false, workers: [] };
  S.buildings.push(b);
  cancelPlace(); toast(STR.placed(cat.name)); openBuilding(b.id); save();
}

function spawnAgent(role, provider, name) {
  const c = isoCenter(8 + (Math.random() * 4 - 2), 8 + (Math.random() * 4 - 2));
  const a = { id: S.nextId++, role: role || "chat", provider: provider || "openai", name: name || AGENT_NAMES[S.nextId % AGENT_NAMES.length],
    personality: "helpful and friendly", wx: c.x, wy: c.y, path: [], status: "idle", wait: 0, flip: false, bob: Math.random() * 6.28, chatting: false, history: [], buildingId: null };
  S.agents.push(a); toast(`${a.name} joined the city`); save(); return a;
}

/* ============================== SIM ============================== */
function rndCell() { for (let i = 0; i < 10; i++) { const g = [Math.floor(Math.random() * GRID), Math.floor(Math.random() * GRID)]; if (!occupied(g[0], g[1])) return g; } return [8, 8]; }
function routeTo(a, cell) { const cur = worldToCell(a.wx, a.wy); let cx = Math.round(cur.gx), cy = Math.round(cur.gy); const p = []; while (cx !== cell[0]) { cx += Math.sign(cell[0] - cx); p.push(isoCenter(cx, cy)); } while (cy !== cell[1]) { cy += Math.sign(cell[1] - cy); p.push(isoCenter(cx, cy)); } a.path = p; }
function step(dt) {
  now += dt;
  cam.x += (cam.tx - cam.x) * Math.min(1, dt * 10); cam.y += (cam.ty - cam.y) * Math.min(1, dt * 10); cam.zoom += (cam.tzoom - cam.zoom) * Math.min(1, dt * 10);
  for (const a of S.agents) {
    a.bob += dt * 6;
    if (a.chatting) { a.path = []; continue; }
    if (a.status === "walking") {
      const t = a.path[0];
      if (!t) { a.status = "idle"; a.wait = 1 + Math.random() * 2.5; }
      else { const dx = t.x - a.wx, dy = t.y - a.wy, d = Math.hypot(dx, dy); a.flip = (t.x - a.wx) - (t.y - a.wy) < 0; const s = MOVE * dt; if (d <= s) { a.wx = t.x; a.wy = t.y; a.path.shift(); } else { a.wx += dx / d * s; a.wy += dy / d * s; } }
    } else { a.wait -= dt; if (a.wait <= 0) { routeTo(a, rndCell()); a.status = "walking"; } }
  }
}

/* ============================== RENDER ============================== */
let groundCanvas = null, gOrig = { x: 0, y: 0 };
function diamond(g, px, py, hw, hh, fill, stroke) { g.beginPath(); g.moveTo(px, py - hh); g.lineTo(px + hw, py); g.lineTo(px, py + hh); g.lineTo(px - hw, py); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.stroke(); } }
/* ============================== TERRAIN MAP ============================== */
const TILE_COL = { grass: "#74b257", t_grass2: "#6aa64e", t_flowers: "#7cc05f", t_dirt: "#c8a06a", t_water: "#49c4d6", t_sand: "#e8d59a" };
let TMAP = null;
function h2(x, y) { let n = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263); n = Math.imul(n ^ (n >>> 13), 1274126177); n ^= n >>> 16; return (n >>> 0) / 4294967296; }
function vnoise(x, y, s) { const fx = x / s, fy = y / s, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0; const sm = t => t * t * (3 - 2 * t); const lp = (a, b, t) => a + (b - a) * sm(t); return lp(lp(h2(x0, y0), h2(x0 + 1, y0), tx), lp(h2(x0, y0 + 1), h2(x0 + 1, y0 + 1), tx), ty); }
function buildTerrain() {
  TMAP = []; const cx = 8, cy = 8;
  // a few ponds with organic noisy edges (kept away from the town center)
  const ponds = [[3, 12, 2.6], [13, 4, 2.3], [12, 13, 1.8]];
  for (let x = 0; x < GRID; x++) { TMAP[x] = []; for (let y = 0; y < GRID; y++) {
    let dmin = 99; for (const [px, py, pr] of ponds) { const r = pr + (h2(x, y) - 0.5) * 0.9; dmin = Math.min(dmin, Math.hypot(x - px, y - py) - r); }
    const nearCenter = Math.max(Math.abs(x - cx), Math.abs(y - cy)) <= 2;
    const biome = h2(Math.floor(x / 3) + 11, Math.floor(y / 3) + 5); // coarse biome regions
    const cell = h2(x + 7, y + 3); // per-cell variation
    let k;
    if (!nearCenter && dmin < 0) k = "t_water";
    else if (!nearCenter && dmin < 1.0) k = "t_sand";
    else if (biome > 0.82) k = cell > 0.32 ? "t_flowers" : "t_grass2";   // flower meadow patch
    else if (biome < 0.18) k = cell > 0.4 ? "t_dirt" : "t_grass2";       // dirt patch
    else k = cell > 0.5 ? "grass" : "t_grass2";                          // varied grassland
    TMAP[x][y] = k;
  } }
}
function tileAt(gx, gy) { return (TMAP && TMAP[gx] && TMAP[gx][gy]) || "grass"; }
function isWater(gx, gy) { return tileAt(gx, gy) === "t_water"; }

function buildGround() {
  let mnX = 1e9, mnY = 1e9, mxX = -1e9, mxY = -1e9;
  for (let x = 0; x < GRID; x++) for (let y = 0; y < GRID; y++) { const c = isoCenter(x, y); mnX = Math.min(mnX, c.x - HW); mxX = Math.max(mxX, c.x + HW); mnY = Math.min(mnY, c.y - HH); mxY = Math.max(mxY, c.y + HH); }
  const pad = 8; gOrig = { x: -mnX + pad, y: -mnY + pad };
  const cv = document.createElement("canvas"); cv.width = (mxX - mnX) + pad * 2; cv.height = (mxY - mnY) + pad * 2;
  const g = cv.getContext("2d"); const grass = IMG.grass;
  for (let sum = 0; sum <= (GRID - 1) * 2; sum++) for (let x = 0; x < GRID; x++) { const y = sum - x; if (y < 0 || y >= GRID) continue;
    const c = isoCenter(x, y), px = c.x + gOrig.x, py = c.y + gOrig.y;
    const key = tileAt(x, y), tImg = IMG[key] || IMG.grass;
    g.save(); g.beginPath(); g.moveTo(px, py - HH); g.lineTo(px + HW, py); g.lineTo(px, py + HH); g.lineTo(px - HW, py); g.closePath(); g.clip();
    if (tImg) g.drawImage(tImg, px - HW, py - HH, HW * 2, HH * 2); else { g.fillStyle = TILE_COL[key] || "#79b85c"; g.fill(); }
    g.fillStyle = (x + y) % 2 ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.04)"; g.fillRect(px - HW, py - HH, HW * 2, HH * 2); g.restore();
    g.lineWidth = 1.3; diamond(g, px, py, HW, HH, null, "rgba(40,60,35,0.22)");
  }
  groundCanvas = cv;
}
function roundRect(ctx, x, y, w, h, r, fill) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); }

function render(ctx) {
  ctx.clearRect(0, 0, view.w, view.h);
  const sky = ctx.createLinearGradient(0, 0, 0, view.h); sky.addColorStop(0, "#bfe6ff"); sky.addColorStop(1, "#dff0d6"); ctx.fillStyle = sky; ctx.fillRect(0, 0, view.w, view.h);
  if (groundCanvas) { const o = w2s(-gOrig.x, -gOrig.y); ctx.drawImage(groundCanvas, o.x, o.y, groundCanvas.width * cam.zoom, groundCanvas.height * cam.zoom); }
  // highlight
  const hl = move != null ? hoverCell : (place ? hoverCell : null);
  if (hl && hl[0] >= 0 && hl[1] >= 0 && hl[0] < GRID && hl[1] < GRID) { const c = isoCenter(hl[0], hl[1]), s = w2s(c.x, c.y); const ok = !occupied(hl[0], hl[1]); ctx.save(); ctx.globalAlpha = .5 + .2 * Math.sin(now * 5); ctx.lineWidth = 2.5; diamond(ctx, s.x, s.y, HW * cam.zoom, HH * cam.zoom, ok ? "rgba(127,208,127,.3)" : "rgba(255,99,99,.3)", ok ? "#7fd07f" : "#ff6363"); ctx.restore(); }
  // decorations (under buildings)
  for (const d of S.decos) drawDeco(ctx, d);
  // depth-sorted buildings + agents
  const draw = [];
  for (const b of S.buildings) { const c = isoCenter(b.gx, b.gy); draw.push({ k: "b", depth: b.gx + b.gy, wy: c.y, b }); }
  for (const a of S.agents) { const cc = worldToCell(a.wx, a.wy); draw.push({ k: "a", depth: cc.gx + cc.gy + .5, wy: a.wy, a }); }
  draw.sort((p, q) => p.depth - q.depth || p.wy - q.wy);
  for (const it of draw) it.k === "b" ? drawBuilding(ctx, it.b) : drawAgent(ctx, it.a);
}
function drawDeco(ctx, d) {
  const cat = CATALOG[d.type], c = isoCenter(d.gx, d.gy), s = w2s(c.x, c.y), z = cam.zoom;
  if (d.type === "road") { diamond(ctx, s.x, s.y, HW * .9 * z, HH * .9 * z, "#bdb6a8"); diamond(ctx, s.x, s.y, HW * .66 * z, HH * .66 * z, "#cdc7ba"); return; }
  diamond(ctx, s.x, s.y, HW * .5 * z, HH * .5 * z, "rgba(0,0,0,.12)");
  ctx.font = `${Math.round(30 * z)}px serif`; ctx.textAlign = "center"; ctx.fillText(cat.emoji, s.x, s.y + 6 * z);
}
function drawBuilding(ctx, b) {
  const cat = CATALOG[b.type], c = isoCenter(b.gx, b.gy), s = w2s(c.x, c.y), z = cam.zoom;
  const img = IMG[cat.sprite], w = (cat.kind === "integration" ? 2.4 : cat.os ? 3.3 : 3) * HW * z;
  if (b.disabled) ctx.globalAlpha = 0.45;
  // active glow for connected provider labs / town hall
  const lit = cat.os || (cat.provider && providerConnected(cat.provider));
  if (lit && !b.disabled) { ctx.save(); ctx.globalAlpha = .28 + .14 * Math.sin(now * 3); ctx.fillStyle = cat.color; ctx.beginPath(); ctx.ellipse(s.x, s.y, w * .5, w * .28, 0, 0, 6.28); ctx.fill(); ctx.restore(); }
  if (img) { const h = w * (img.height / img.width); ctx.drawImage(img, s.x - w / 2, s.y - h + HH * z, w, h); }
  else { // procedural low-poly block
    const bw = HW * 1.1 * z, bh = HW * 1.2 * z;
    diamond(ctx, s.x, s.y, HW * .9 * z, HH * .9 * z, "rgba(0,0,0,.12)");
    roundRect(ctx, s.x - bw / 2, s.y - bh, bw, bh, 6 * z, "#f0ece4");
    roundRect(ctx, s.x - bw / 2, s.y - bh - 10 * z, bw, 16 * z, 5 * z, cat.color); // roof band
    ctx.font = `${Math.round(26 * z)}px serif`; ctx.textAlign = "center"; ctx.fillText(cat.emoji, s.x, s.y - bh * .4);
  }
  ctx.globalAlpha = 1;
  // nameplate
  ctx.textAlign = "center"; ctx.font = `700 ${Math.round(11 * z)}px Inter, sans-serif`;
  const label = b.name || cat.name, tw = ctx.measureText(label).width + 16 * z, ly = s.y - (cat.os ? 2.5 : cat.kind === "integration" ? 1.9 : 2.25) * HW * z;
  roundRect(ctx, s.x - tw / 2, ly, tw, 19 * z, 7 * z, cat.color); ctx.fillStyle = "#fff"; ctx.fillText(label, s.x, ly + 14 * z);
  // level pips
  for (let i = 0; i < (b.level || 1); i++) { ctx.fillStyle = "#ffd34d"; ctx.beginPath(); ctx.arc(s.x - (b.level - 1) * 4 * z + i * 8 * z, ly - 6 * z, 2.1 * z, 0, 6.28); ctx.fill(); }
}
function drawAgent(ctx, a) {
  const role = ROLES[a.role] || ROLES.chat, prov = PROVIDERS[a.provider], s = w2s(a.wx, a.wy), z = cam.zoom;
  const bob = Math.sin(a.bob) * (a.status === "walking" ? 3 : 1.4);
  ctx.save(); ctx.globalAlpha = .25; ctx.fillStyle = "#000"; ctx.beginPath(); ctx.ellipse(s.x, s.y, 14 * z, 6 * z, 0, 0, 6.28); ctx.fill(); ctx.restore();
  const img = prov && IMG[prov.avatar]; const w = HW * 1.05 * z;
  if (img) { const h = w * (img.height / img.width); ctx.save(); ctx.translate(s.x, s.y - bob); if (a.flip) ctx.scale(-1, 1); ctx.drawImage(img, -w / 2, -h, w, h); ctx.restore(); }
  else { // procedural agent: colored capsule + role emoji
    ctx.save(); ctx.translate(s.x, s.y - bob);
    roundRect(ctx, -10 * z, -34 * z, 20 * z, 30 * z, 8 * z, role.color); ctx.font = `${Math.round(15 * z)}px serif`; ctx.textAlign = "center"; ctx.fillText(role.emoji, 0, -14 * z); ctx.restore();
  }
  ctx.textAlign = "center"; ctx.font = `700 ${Math.round(10 * z)}px Inter, sans-serif`;
  const tag = a.name, tw = ctx.measureText(tag).width + 14 * z, ty = s.y - w * 1.5 - bob;
  roundRect(ctx, s.x - tw / 2, ty, tw, 16 * z, 6 * z, role.color); ctx.fillStyle = "#fff"; ctx.fillText(tag, s.x, ty + 12 * z);
  ctx.globalAlpha = .85; ctx.font = `${Math.round(12 * z)}px serif`; ctx.fillText("💬", s.x + tw / 2 + 8 * z, ty + 12 * z); ctx.globalAlpha = 1;
}

/* ============================== UI HELPERS ============================== */
function modal(html, cls) { const m = $("#modal"); m.innerHTML = `<div class="sheet ${cls || ""}">${html}</div>`; m.classList.add("open"); }
function closeModal() { $("#modal").classList.remove("open"); $("#modal").innerHTML = ""; chatAgentId && (function(){ const a = S.agents.find(x=>x.id===chatAgentId); if(a)a.chatting=false; chatAgentId=null; })(); }
function toast(t) { const e = $("#toast"); e.textContent = t; e.classList.add("show"); clearTimeout(toast._t); toast._t = setTimeout(() => e.classList.remove("show"), 1900); }
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function head(title, sub) { return `<div class="phead"><h2>${esc(title)}${sub ? `<div class="muted" style="font-weight:600">${esc(sub)}</div>` : ""}</h2><button class="x" data-act="close">✕</button></div>`; }

/* ============================== DOCK ============================== */
const DOCK = [
  { c: "agents", emoji: "🤖", label: STR.cat_agents },
  { c: "buildings", emoji: "🏢", label: STR.cat_buildings },
  { c: "workflows", emoji: "⚡", label: STR.cat_workflows },
  { c: "integrations", emoji: "🔌", label: STR.cat_integrations },
  { c: "decorations", emoji: "🌳", label: STR.cat_decorations },
  { c: "marketplace", emoji: "🛒", label: STR.cat_marketplace },
];
function buildDock() {
  $("#dock").innerHTML = DOCK.map(d => `<div class="dockitem" data-cat="${d.c}"><div class="dockicon">${d.emoji}</div><small>${d.label}</small></div>`).join("")
    + `<div class="docksep"></div>`
    + `<div class="dockitem" data-cat="townhall"><div class="dockicon" style="background:#274b73">🏛️</div><small>${STR.townhall}</small></div>`
    + `<div class="dockitem" data-act="center"><div class="dockicon">🎯</div><small>${STR.center}</small></div>`
    + `<div class="dockitem" data-act="help"><div class="dockicon">?</div><small>${STR.help}</small></div>`;
}
function updateHint() { const h = $("#hint"); if (S.buildings.length <= 1 && S.agents.length === 0 && !place) { h.textContent = STR.empty_hint; h.classList.remove("hide"); } else h.classList.add("hide"); }

/* ============================== LIBRARIES ============================== */
function catCard(type) { const c = CATALOG[type]; return `<button class="libitem" data-act="build" data-build="${type}"><div class="libicon" style="background:${c.color}">${c.emoji}</div><div class="grow"><b>${c.name}</b><div class="muted">${STR.cost}: ${c.cost} 🪙 · ${STR.size}: ${c.size}</div></div></button>`; }
function openLibrary(cat) {
  if (cat === "townhall") return openTownHall();
  if (cat === "marketplace") return openMarketplace();
  if (cat === "agents") return openAgentLibrary();
  const map = { buildings: [STR.building_library, LIB.buildings], workflows: [STR.workflow_library, LIB.workflows], integrations: [STR.integration_library, LIB.integrations], decorations: [STR.decoration_library, LIB.decorations] };
  const [title, list] = map[cat];
  modal(head(title) + `<div class="scroll lib">${list.map(catCard).join("")}</div>`);
}
function openAgentLibrary() {
  const tpl = (role) => { const r = ROLES[role]; return `<button class="libitem" data-act="placeagent" data-agent="${role}"><div class="libicon" style="background:${r.color}">${r.emoji}</div><div class="grow"><b>${r.label}</b><div class="muted">Walks your city · chat anytime</div></div></button>`; };
  const customs = (S.customAgents || []).map((a, i) => `<button class="libitem" data-act="placecustom" data-custom="${i}"><div class="libicon" style="background:${(ROLES[a.role]||ROLES.chat).color}">${(ROLES[a.role]||ROLES.chat).emoji}</div><div class="grow"><b>${esc(a.name)}</b><div class="muted">${esc((ROLES[a.role]||ROLES.chat).label)} · ${esc(PROVIDERS[a.provider]?.name||a.provider)}</div></div></button>`).join("") || `<p class="muted" style="padding:4px">${STR.custom_agents}: none yet.</p>`;
  modal(head(STR.agent_library) + `<div class="scroll lib">${ROLE_ORDER.map(tpl).join("")}<div class="sub">${STR.custom_agents}</div>${customs}</div>`
    + `<div class="frow"><button class="btn ghost" data-act="importagent">${STR.import_agent}</button><button class="btn primary" data-act="createagent">${STR.create_agent}</button></div>`);
}
function openMarketplace() {
  const items = ["Buy Agents", "Buy Buildings", "Buy Workflows", "Buy Plugins", "Import Assets"];
  modal(head(STR.marketplace) + `<div class="scroll">${items.map(i => `<div class="card"><div class="grow"><b>${i}</b><div class="muted">${STR.soon}</div></div><span class="pill muted">${STR.soon}</span></div>`).join("")}</div>`);
}

/* ============================== AGENT CREATE / IMPORT ============================== */
function openCreateAgent() {
  const roles = ROLE_ORDER.map(r => `<option value="${r}">${ROLES[r].label}</option>`).join("");
  const provs = PROVIDER_ORDER.map(p => `<option value="${p}">${PROVIDERS[p].name}</option>`).join("");
  modal(head(STR.create_agent) + `<div class="form scroll">
    <label class="field">${STR.f_name}<input id="a_name" placeholder="Nova"></label>
    <label class="field">${STR.f_role}<select id="a_role">${roles}</select></label>
    <label class="field">${STR.f_provider}<select id="a_prov">${provs}</select></label>
    <label class="field">${STR.f_personality}<input id="a_pers" placeholder="curious, upbeat, ships fast"></label>
  </div><div class="frow"><button class="btn ghost" data-act="close">${STR.cancel}</button><button class="btn primary" data-act="docreateagent">${STR.create_agent}</button></div>`);
}
function doCreateAgent() {
  const a = { name: $("#a_name").value.trim() || "Agent", role: $("#a_role").value, provider: $("#a_prov").value, personality: $("#a_pers").value.trim() };
  S.customAgents.push(a); save();
  startPlace({ kind: "agent", role: a.role, provider: a.provider, name: a.name });
}
function openImportAgent() {
  modal(head(STR.import_agent) + `<div class="form"><p class="muted">Paste an agent JSON (name, role, provider).</p>
    <textarea id="a_json" rows="5" placeholder='${STR.import_ph}'></textarea><span id="a_stat" class="muted"></span></div>
    <div class="frow"><button class="btn ghost" data-act="close">${STR.cancel}</button><button class="btn primary" data-act="doimportagent">${STR.import_agent}</button></div>`);
}
function doImportAgent() {
  try { const j = JSON.parse($("#a_json").value); const role = ROLES[j.role] ? j.role : (String(j.role||"").match(/research|dev|design|market|sales/)?.[0] || "chat");
    const prov = PROVIDERS[j.provider] ? j.provider : "openai";
    const a = { name: j.name || "Imported", role: role === "dev" ? "developer" : role === "market" ? "marketing" : role, provider: prov, personality: j.personality || j.backstory || "" };
    S.customAgents.push(a); save(); startPlace({ kind: "agent", role: a.role, provider: a.provider, name: a.name });
  } catch (e) { $("#a_stat").textContent = STR.import_err; }
}

/* ============================== BUILDING MODAL ============================== */
let bldTab = "t_workers";
function openBuilding(id) {
  const b = S.buildings.find(x => x.id === id); if (!b) return;
  if (CATALOG[b.type].os) return openTownHall();
  bldTab = "t_workers"; renderBuilding(b);
}
function renderBuilding(b) {
  const cat = CATALOG[b.type];
  const tabs = ["t_workers", "t_tools", "t_analytics", "t_settings"];
  const tabbar = tabs.map(t => `<button class="tab ${bldTab === t ? "on" : ""}" data-btab="${t}" data-id="${b.id}">${STR[t]}</button>`).join("");
  let body = "";
  if (bldTab === "t_workers") body = workersTab(b);
  else if (bldTab === "t_tools") body = toolsTab(b);
  else if (bldTab === "t_analytics") body = analyticsTab(b);
  else body = settingsTab(b);
  modal(head((b.name || cat.name), `${cat.name} · Lv ${b.level}`) +
    `<div class="tabbar">${tabbar}</div><div class="scroll tabbody">${body}</div>`, "big");
}
function workersTab(b) {
  const list = (b.workers || []).map(aid => { const a = S.agents.find(x => x.id === aid); if (!a) return ""; const r = ROLES[a.role] || ROLES.chat;
    return `<div class="card"><div class="libicon sm" style="background:${r.color}">${r.emoji}</div><div class="grow"><b>${esc(a.name)}</b><div class="muted">${r.label} · ${PROVIDERS[a.provider]?.name||a.provider}</div></div><button class="btn ghost" data-act="unassign" data-id="${b.id}" data-aid="${a.id}">${STR.remove}</button></div>`; }).join("");
  return (list || `<p class="muted">${STR.no_workers}</p>`) + `<button class="btn primary full" data-act="assignpick" data-id="${b.id}">${STR.assign}</button>`;
}
function toolsTab(b) {
  const cat = CATALOG[b.type]; const def = { research_lab: ["openai", "google", "notion"], social_hub: ["tiktok", "instagram", "canva", "openai"], builder_workshop: ["github", "vercel", "supabase", "openai"], design_studio: ["canva", "figma", "openai"], sales_center: ["stripe", "slack", "openai"], finance_office: ["stripe", "notion"], media_studio: ["canva", "openai"], support_center: ["slack", "discord", "openai"] }[b.type] || ["openai"];
  return `<div class="sub">${STR.installed}</div>` + def.map(t => `<div class="card"><div class="libicon sm">${TOOL_EMOJI[t] || "🔧"}</div><div class="grow"><b>${t}</b></div><span class="pill ok">on</span></div>`).join("") + `<button class="btn ghost full" data-act="soon">${STR.add_tool}</button>`;
}
function analyticsTab(b) {
  const seed = (b.id * 97 + b.level * 31); const r = n => (seed * n % 900 + 100) * b.level;
  const rows = { research_lab: [["Reports", r(3)], ["Sources cited", r(7)]], social_hub: [["Posts created", r(3)], ["Followers gained", r(9)], ["Revenue", "$" + r(5)]], builder_workshop: [["Apps shipped", r(2) % 40], ["Commits", r(11)]], design_studio: [["Designs", r(4)], ["Assets exported", r(6)]], sales_center: [["Deals", r(2) % 60], ["Revenue", "$" + r(8)]], finance_office: [["Invoices", r(3)], ["Cash flow", "$" + r(7)]], media_studio: [["Episodes", r(2) % 30], ["Listens", r(12)]], support_center: [["Tickets solved", r(6)], ["CSAT", (80 + seed % 19) + "%"]] }[b.type] || [["Tasks done", r(3)], ["Coins earned", r(5)]];
  return rows.map(([k, v]) => `<div class="card"><div class="grow"><b>${v}</b><div class="muted">${k}</div></div></div>`).join("");
}
function settingsTab(b) {
  const cat = CATALOG[b.type]; const maxed = b.level >= 5; const upCost = 200 * b.level;
  return `<label class="field">${STR.bld_name}<input id="bn" value="${esc(b.name || cat.name)}"></label>
    <button class="btn ghost full" data-act="savename" data-id="${b.id}">${STR.save}</button>
    <div class="sub">${STR.level} ${b.level}</div>
    ${maxed ? `<p class="muted">${STR.maxed}</p>` : `<button class="btn primary full" data-act="upgrade" data-id="${b.id}">${STR.upgrade_to(b.level + 1, upCost)}</button>`}
    <div class="sub">${STR.permissions} · ${STR.limits} · ${STR.notifications}</div>
    <div class="card"><div class="grow">${STR.notifications}</div><span class="pill ok">on</span></div>
    <button class="btn danger full" data-act="delask" data-id="${b.id}">${STR.qm_delete}</button>`;
}
function openAssignPick(id) {
  const idle = S.agents.filter(a => !a.buildingId);
  const list = idle.length ? idle.map(a => { const r = ROLES[a.role] || ROLES.chat; return `<button class="card pick" data-act="assigndo" data-id="${id}" data-aid="${a.id}"><div class="libicon sm" style="background:${r.color}">${r.emoji}</div><div class="grow"><b>${esc(a.name)}</b><div class="muted">${r.label}</div></div></button>`; }).join("") : `<p class="muted">No idle agents. Place one from the Agents dock.</p>`;
  modal(head(STR.assign_pick) + `<div class="scroll">${list}</div>`);
}

/* ============================== TOWN HALL (OS) ============================== */
let thTab = "th_dashboard";
function openTownHall() { thTab = "th_dashboard"; renderTownHall(); }
function renderTownHall() {
  const tabs = ["th_dashboard", "th_providers", "th_integrations", "th_agents", "th_buildings", "th_economy", "th_system"];
  const tabbar = tabs.map(t => `<button class="tab ${thTab === t ? "on" : ""}" data-thtab="${t}">${STR[t]}</button>`).join("");
  let body = "";
  if (thTab === "th_dashboard") body = thDash();
  else if (thTab === "th_providers") body = thProviders();
  else if (thTab === "th_integrations") body = thIntegrations();
  else if (thTab === "th_agents") body = thAgents();
  else if (thTab === "th_buildings") body = thBuildings();
  else if (thTab === "th_economy") body = thEconomy();
  else body = thSystem();
  modal(head("Town Hall", "AgentVerse OS — control center") + `<div class="tabbar wrap">${tabbar}</div><div class="scroll tabbody">${body}</div>`, "big");
}
function thDash() {
  const conn = PROVIDER_ORDER.filter(providerConnected).length;
  const cards = [["🪙 " + S.coins, STR.coins], ["🏢 " + S.buildings.length, "Buildings"], ["🤖 " + S.agents.length, "Agents"], ["🔌 " + conn, "Models connected"]];
  return `<div class="grid2">${cards.map(([v, k]) => `<div class="card"><div class="grow"><b style="font-size:20px">${v}</b><div class="muted">${k}</div></div></div>`).join("")}</div>`;
}
function thProviders() {
  return PROVIDER_ORDER.map(p => { const pr = PROVIDERS[p]; const on = providerConnected(p);
    return `<div class="card"><div class="libicon sm" style="background:${pr.color}">${(pr.name[0])}</div><div class="grow"><b>${pr.name}</b><div class="muted">${on ? STR.connected : STR.not_connected}${pr.local ? " · local" : ""}</div></div><button class="btn ${on ? "ghost" : "primary"}" data-act="connectprov" data-p="${p}">${STR.connect}</button></div>`; }).join("") + `<p class="muted">${STR.key_note}</p>`;
}
function openConnectProvider(p) {
  const pr = PROVIDERS[p]; const local = pr.local;
  modal(head(pr.name, STR.connect) + `<div class="form">
    ${local ? `<label class="field">${STR.endpoint}<input id="pk" value="${esc(S.endpoints[p] || pr.endpoint)}"></label>` : `<label class="field">${STR.api_key}<input id="pk" type="password" placeholder="${pr.name} key" value="${esc(S.keys[p] || "")}"></label>`}
    <p class="muted">${STR.key_note}</p></div>
    <div class="frow"><button class="btn ghost" data-act="backth">${STR.cancel}</button><button class="btn primary" data-act="saveprov" data-p="${p}">${STR.save}</button></div>`);
}
function saveProvider(p) { const v = $("#pk").value.trim(); if (PROVIDERS[p].local) S.endpoints[p] = v || PROVIDERS[p].endpoint; else S.keys[p] = v; save(); toast(PROVIDERS[p].name + " " + STR.connected.toLowerCase()); openTownHall(); }
function thIntegrations() {
  return TOOLS_CATALOG.map(t => { const on = S.integrations[t]; return `<div class="card"><div class="libicon sm">${TOOL_EMOJI[t] || "🔧"}</div><div class="grow"><b>${t[0].toUpperCase() + t.slice(1)}</b><div class="muted">${on ? STR.connected : STR.not_connected}</div></div><button class="btn ${on ? "ghost" : "primary"}" data-act="toggleint" data-t="${t}">${on ? "Disconnect" : STR.connect}</button></div>`; }).join("");
}
function thAgents() {
  if (!S.agents.length) return `<p class="muted">No agents yet. Build some from the Agents dock.</p>`;
  return S.agents.map(a => { const r = ROLES[a.role] || ROLES.chat; const b = a.buildingId && S.buildings.find(x => x.id === a.buildingId); return `<div class="card"><div class="libicon sm" style="background:${r.color}">${r.emoji}</div><div class="grow"><b>${esc(a.name)}</b><div class="muted">${r.label} · ${PROVIDERS[a.provider]?.name||a.provider}${b ? " · " + esc(b.name) : " · roaming"}</div></div><button class="btn ghost" data-act="chatfrom" data-aid="${a.id}">${STR.chat}</button></div>`; }).join("");
}
function thBuildings() {
  return S.buildings.map(b => { const c = CATALOG[b.type]; return `<div class="card"><div class="libicon sm" style="background:${c.color}">${c.emoji}</div><div class="grow"><b>${esc(b.name || c.name)}</b><div class="muted">${c.name} · Lv ${b.level} · (${b.gx},${b.gy})</div></div><button class="btn ghost" data-act="openbld" data-id="${b.id}">${STR.qm_open}</button></div>`; }).join("");
}
function thEconomy() {
  const can = Date.now() - (S.lastCollect || 0) > 60000;
  return `<div class="card"><div class="grow"><b style="font-size:22px">🪙 ${S.coins}</b><div class="muted">${STR.coins}</div></div></div>
    <div class="card"><div class="grow"><b>+${100 + S.buildings.length * 20}/day</b><div class="muted">Estimated income (buildings)</div></div></div>
    <button class="btn primary full" data-act="collect" ${can ? "" : "disabled"}>${STR.collect}${can ? "" : " (wait)"}</button>`;
}
function thSystem() {
  return `<div class="card"><div class="grow"><b>${STR.title}</b><div class="muted">v3 · low-poly</div></div></div>
    <button class="btn danger full" data-act="resettown">${STR.reset_town}</button>`;
}

/* ============================== CHAT ============================== */
let chatAgentId = null;
function openChat(aid) {
  const a = S.agents.find(x => x.id === aid); if (!a) return; chatAgentId = aid; a.chatting = true;
  const r = ROLES[a.role] || ROLES.chat, prov = PROVIDERS[a.provider]; const live = providerConnected(a.provider);
  const av = agentAvatarUrl(a.provider);
  modal(`<div class="phead"><div class="bavatar" style="background:${av ? `center/contain no-repeat url(${av})` : r.color}">${av ? "" : r.emoji}</div><h2>${esc(a.name)}<div class="muted" style="font-weight:600">${r.label} · ${prov?.name||a.provider} · ${live ? STR.live_note(prov?.name||a.provider) : STR.demo_note}</div></h2><button class="x" data-act="closechat">✕</button></div>
    <div class="chat"><div class="msgs" id="msgs"></div><div class="composer"><textarea id="ci" rows="1" placeholder="${STR.chat_ph}"></textarea><button class="btn primary" data-act="send">${STR.send}</button></div></div>`);
  renderMsgs(a); const ci = $("#ci"); ci.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }); ci.focus();
}
function closeChat() { const a = S.agents.find(x => x.id === chatAgentId); if (a) a.chatting = false; chatAgentId = null; $("#modal").classList.remove("open"); $("#modal").innerHTML = ""; save(); }
function renderMsgs(a) {
  const m = $("#msgs"); if (!m) return; const r = ROLES[a.role] || ROLES.chat;
  if (!a.history.length) m.innerHTML = `<div class="bubble bot">Hi! I'm ${esc(a.name)}, your ${r.label}. ${providerConnected(a.provider) ? "Ask me anything." : `Connect ${PROVIDERS[a.provider]?.name||a.provider} in the Town Hall for live answers — I'll use demo mode for now.`}</div>`;
  else m.innerHTML = a.history.map(h => h.role === "note" ? `<div class="bubble note">${esc(h.content)}</div>` : `<div class="bubble ${h.role === "user" ? "user" : "bot"}">${esc(h.content)}</div>`).join("");
  m.scrollTop = m.scrollHeight;
}
async function sendChat() {
  const a = S.agents.find(x => x.id === chatAgentId); if (!a) return; const ci = $("#ci"); const text = ci.value.trim(); if (!text) return; ci.value = "";
  a.history.push({ role: "user", content: text }); renderMsgs(a); save();
  const m = $("#msgs"); const tp = document.createElement("div"); tp.className = "typing"; tp.textContent = a.name + " " + STR.typing; m.appendChild(tp); m.scrollTop = m.scrollHeight;
  const reply = await getReply(a, text); tp.remove();
  a.history.push({ role: "assistant", content: reply.text }); if (reply.note) a.history.push({ role: "note", content: reply.note });
  renderMsgs(a); save();
}
async function getReply(a, text) {
  const prov = PROVIDERS[a.provider]; const key = (S.keys[a.provider] || "").trim(); const endpoint = S.endpoints[a.provider] || prov.endpoint;
  const sys = `You are ${a.name}, a friendly ${(ROLES[a.role]||ROLES.chat).label} living in AgentVerse OS, a game town. ${a.personality||""} Be helpful and concise.`;
  const hist = a.history.filter(h => h.role === "user" || h.role === "assistant").slice(-12).map(h => ({ role: h.role, content: h.content }));
  if (providerConnected(a.provider)) {
    try { const t = await callLLM(prov, key, endpoint, sys, hist); if (t && t.trim()) return { text: t.trim() }; return { text: simReply(a, text), note: STR.err_note(prov.name) }; }
    catch (e) { return { text: simReply(a, text), note: STR.err_note(prov.name) }; }
  }
  return { text: simReply(a, text) };
}
async function callLLM(prov, key, endpoint, sys, hist) {
  if (prov.api === "anthropic") {
    const res = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" }, body: JSON.stringify({ model: prov.model, max_tokens: 600, system: sys, messages: hist }) });
    if (!res.ok) throw new Error("http " + res.status); const j = await res.json(); return (j.content || []).map(c => c.text || "").join("");
  }
  const headers = { "content-type": "application/json" }; if (key) headers["authorization"] = "Bearer " + key;
  if (prov.name === "OpenRouter") { headers["HTTP-Referer"] = location.origin; headers["X-Title"] = "AgentVerse OS"; }
  const res = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify({ model: prov.model, messages: [{ role: "system", content: sys }, ...hist] }) });
  if (!res.ok) throw new Error("http " + res.status); const j = await res.json(); return j.choices?.[0]?.message?.content || "";
}
function simReply(a, text) {
  const r = ROLES[a.role] || ROLES.chat; const t = text.toLowerCase();
  if (/hello|hi|hey/.test(t)) return `Hey! ${a.name} here, your ${r.label}. What are we working on?`;
  if (/\?$/.test(text)) return `Good question. Connect ${PROVIDERS[a.provider]?.name||a.provider} in the Town Hall and I'll answer for real — for now (demo) I'd tackle "${text}" step by step.`;
  return `Got it — "${text}". I'm in demo mode; connect ${PROVIDERS[a.provider]?.name||a.provider} in the Town Hall for live ${r.label} answers.`;
}

/* ============================== QUICK MENU ============================== */
function openCtx(id, sx, sy) {
  const b = S.buildings.find(x => x.id === id); if (!b) return;
  const items = [["qm_open", "open"], ["qm_move", "move"], ["qm_upgrade", "upgrade"], ["qm_duplicate", "dup"], ["qm_settings", "settings"], [b.disabled ? "qm_enable" : "qm_disable", "disable"], ["qm_delete", "delask"]];
  const c = $("#ctx"); c.innerHTML = items.map(([k, a]) => `<button data-act="${a}" data-id="${id}" class="${a === "delask" ? "danger" : ""}">${STR[k]}</button>`).join("");
  c.style.left = Math.min(sx, innerWidth - 160) + "px"; c.style.top = Math.min(sy, innerHeight - 280) + "px"; c.classList.add("show");
}
function closeCtx() { $("#ctx").classList.remove("show"); }

/* ============================== EVENTS ============================== */
function wire() {
  buildDock();
  $("#dock").addEventListener("click", e => { const it = e.target.closest(".dockitem"); if (!it) return; closeCtx(); if (it.dataset.cat) openLibrary(it.dataset.cat); else if (it.dataset.act === "center") centerCam(); else if (it.dataset.act === "help") openHelp(); });
  $("#placebar").addEventListener("click", () => { place ? cancelPlace() : cancelMove(); });
  document.body.addEventListener("click", e => {
    const t = e.target.closest("[data-act]"); if (!t) return; const act = t.dataset.act, id = +t.dataset.id;
    if (act === "close") closeModal();
    else if (act === "closechat") closeChat();
    else if (act === "build") { startPlace({ kind: "building", type: t.dataset.build }); }
    else if (act === "placeagent") { startPlace({ kind: "agent", role: t.dataset.agent, provider: "openai" }); }
    else if (act === "placecustom") { const a = S.customAgents[+t.dataset.custom]; if (a) startPlace({ kind: "agent", role: a.role, provider: a.provider, name: a.name }); }
    else if (act === "agentlib") openAgentLibrary();
    else if (act === "createagent") openCreateAgent();
    else if (act === "docreateagent") doCreateAgent();
    else if (act === "importagent") openImportAgent();
    else if (act === "doimportagent") doImportAgent();
    else if (act === "btab") { bldTab = t.dataset.btab; renderBuilding(S.buildings.find(x => x.id === id)); }
    else if (act === "thtab") { thTab = t.dataset.thtab; renderTownHall(); }
    else if (act === "assignpick") openAssignPick(id);
    else if (act === "assigndo") { const b = S.buildings.find(x => x.id === id); const a = S.agents.find(x => x.id === +t.dataset.aid); if (b && a) { a.buildingId = b.id; if (!b.workers.includes(a.id)) b.workers.push(a.id); } save(); bldTab = "t_workers"; renderBuilding(b); }
    else if (act === "unassign") { const b = S.buildings.find(x => x.id === id); const aid = +t.dataset.aid; if (b) b.workers = b.workers.filter(w => w !== aid); const a = S.agents.find(x => x.id === aid); if (a) a.buildingId = null; save(); renderBuilding(b); }
    else if (act === "savename") { const b = S.buildings.find(x => x.id === id); if (b) b.name = $("#bn").value.trim() || CATALOG[b.type].name; save(); toast("Saved"); }
    else if (act === "upgrade") { const b = S.buildings.find(x => x.id === id); if (b && b.level < 5 && spend(200 * b.level)) { b.level++; save(); renderBuilding(b); } }
    else if (act === "delask") openDelete(id);
    else if (act === "deldo") { doDelete(id); }
    else if (act === "soon") toast(STR.soon);
    // town hall
    else if (act === "connectprov") openConnectProvider(t.dataset.p);
    else if (act === "saveprov") saveProvider(t.dataset.p);
    else if (act === "backth") openTownHall();
    else if (act === "toggleint") { const k = t.dataset.t; S.integrations[k] = !S.integrations[k]; save(); renderTownHall(); }
    else if (act === "chatfrom") { closeModal(); openChat(+t.dataset.aid); }
    else if (act === "openbld") { openBuilding(id); }
    else if (act === "collect") { S.coins += 100 + S.buildings.length * 20; S.lastCollect = Date.now(); save(); renderTownHall(); toast("Income collected!"); }
    else if (act === "resettown") { if (confirm(STR.reset_confirm)) { S = fresh(); save(); closeModal(); centerCam(); updateHint(); } }
    // quick menu
    else if (act === "open") { closeCtx(); openBuilding(id); }
    else if (act === "move") { closeCtx(); startMove(id); }
    else if (act === "dup") { closeCtx(); const b = S.buildings.find(x => x.id === id); if (b) startPlace({ kind: "building", type: b.type }); }
    else if (act === "settings") { closeCtx(); bldTab = "t_settings"; renderBuilding(S.buildings.find(x => x.id === id)); }
    else if (act === "disable") { closeCtx(); const b = S.buildings.find(x => x.id === id); if (b && b.type !== "town_hall") { b.disabled = !b.disabled; save(); } }
  });
}
function openDelete(id) { const b = S.buildings.find(x => x.id === id); if (!b) return; if (b.type === "town_hall") { toast("The Town Hall can't be removed."); return; } const refund = Math.round(CATALOG[b.type].cost * 0.5); modal(head(STR.del_title) + `<p class="muted">${STR.del_refund(refund)}</p><div class="frow"><button class="btn ghost" data-act="close">${STR.cancel}</button><button class="btn danger" data-act="deldo" data-id="${id}">${STR.confirm}</button></div>`); }
function doDelete(id) { const b = S.buildings.find(x => x.id === id); if (!b || b.type === "town_hall") return; S.coins += Math.round(CATALOG[b.type].cost * 0.5); for (const aid of b.workers || []) { const a = S.agents.find(x => x.id === aid); if (a) a.buildingId = null; } S.buildings = S.buildings.filter(x => x.id !== id); save(); closeModal(); }
function openHelp() { modal(head(STR.help_title) + `<div class="scroll"><ol class="help">${STR.help_body.map(t => `<li>${t}</li>`).join("")}</ol></div><button class="btn primary full" data-act="close">${STR.close}</button>`); S.seenHelp = true; save(); }

/* ============================== INPUT ============================== */
let drag = null, lpTimer = null, lpFired = false;
function setupInput(canvas) {
  canvas.addEventListener("mousedown", e => { drag = { x: e.clientX, y: e.clientY, sx: cam.tx, sy: cam.ty, moved: false }; });
  addEventListener("mousemove", e => { const w = s2w(e.clientX, e.clientY); const c = worldToCell(w.x, w.y); hoverCell = [Math.round(c.gx), Math.round(c.gy)]; if (!drag) return; if (Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 4) drag.moved = true; cam.tx = drag.sx - (e.clientX - drag.x) / cam.zoom; cam.ty = drag.sy - (e.clientY - drag.y) / cam.zoom; clampCam(); });
  addEventListener("mouseup", e => { if (drag && !drag.moved) pick(e.clientX, e.clientY); drag = null; });
  canvas.addEventListener("contextmenu", e => { e.preventDefault(); const w = s2w(e.clientX, e.clientY); const c = worldToCell(w.x, w.y); const b = buildingAt(Math.round(c.gx), Math.round(c.gy)); if (b) openCtx(b.id, e.clientX, e.clientY); });
  canvas.addEventListener("wheel", e => { e.preventDefault(); zoomAt(e.clientX, e.clientY, Math.pow(1.0015, -e.deltaY)); }, { passive: false });
  let pinch = null;
  canvas.addEventListener("touchstart", e => {
    closeCtx();
    if (e.touches.length === 1) { const t = e.touches[0]; drag = { x: t.clientX, y: t.clientY, sx: cam.tx, sy: cam.ty, moved: false }; const w = s2w(t.clientX, t.clientY); const c = worldToCell(w.x, w.y); hoverCell = [Math.round(c.gx), Math.round(c.gy)]; lpFired = false; clearTimeout(lpTimer); lpTimer = setTimeout(() => { const cc = worldToCell(s2w(t.clientX, t.clientY).x, s2w(t.clientX, t.clientY).y); const b = buildingAt(Math.round(cc.gx), Math.round(cc.gy)); if (b && drag && !drag.moved) { lpFired = true; openCtx(b.id, t.clientX, t.clientY); } }, 480); }
    else { pinch = tdist(e); drag = null; clearTimeout(lpTimer); }
  }, { passive: false });
  canvas.addEventListener("touchmove", e => { e.preventDefault(); if (e.touches.length === 1 && drag) { const t = e.touches[0]; if (Math.abs(t.clientX - drag.x) + Math.abs(t.clientY - drag.y) > 4) { drag.moved = true; clearTimeout(lpTimer); } cam.tx = drag.sx - (t.clientX - drag.x) / cam.zoom; cam.ty = drag.sy - (t.clientY - drag.y) / cam.zoom; clampCam(); } else if (e.touches.length === 2 && pinch) { const d = tdist(e), m = tmid(e); zoomAt(m.x, m.y, d / pinch); pinch = d; } }, { passive: false });
  canvas.addEventListener("touchend", e => { clearTimeout(lpTimer); if (drag && !drag.moved && !lpFired && e.changedTouches.length) { const t = e.changedTouches[0]; pick(t.clientX, t.clientY); } drag = null; pinch = null; }, { passive: false });
  const keys = new Set(); addEventListener("keydown", e => { keys.add(e.code); if (e.code === "Escape") { closeCtx(); if (chatAgentId) closeChat(); else if ($("#modal").classList.contains("open")) closeModal(); else if (place) cancelPlace(); else if (move != null) cancelMove(); } }); addEventListener("keyup", e => keys.delete(e.code)); setupInput._keys = keys;
}
function tdist(e) { const a = e.touches[0], b = e.touches[1]; return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
function tmid(e) { const a = e.touches[0], b = e.touches[1]; return { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 }; }
function zoomAt(sx, sy, f) { const b = s2w(sx, sy); cam.tzoom = Math.max(ZMIN, Math.min(ZMAX, cam.tzoom * f)); cam.zoom = cam.tzoom; const a = s2w(sx, sy); cam.tx += b.x - a.x; cam.ty += b.y - a.y; clampCam(); }
function clampCam() { cam.tx = Math.max(-1200, Math.min(1200, cam.tx)); cam.ty = Math.max(-300, Math.min(1300, cam.ty)); }
function centerCam() { const th = townHall(); const c = th ? isoCenter(th.gx, th.gy) : { x: 0, y: (GRID - 1) * HH }; cam.tx = c.x; cam.ty = c.y; cam.tzoom = 0.8; }
function pollKeys(dt) { const k = setupInput._keys; if (!k) return; const sp = 340 * dt / cam.zoom; if (k.has("KeyW") || k.has("ArrowUp")) cam.ty -= sp; if (k.has("KeyS") || k.has("ArrowDown")) cam.ty += sp; if (k.has("KeyA") || k.has("ArrowLeft")) cam.tx -= sp; if (k.has("KeyD") || k.has("ArrowRight")) cam.tx += sp; for (const gp of navigator.getGamepads?.() || []) if (gp) { if (Math.abs(gp.axes[0]) > .15) cam.tx += gp.axes[0] * sp; if (Math.abs(gp.axes[1]) > .15) cam.ty += gp.axes[1] * sp; } clampCam(); }
function pick(sx, sy) {
  closeCtx();
  const w = s2w(sx, sy), c = worldToCell(w.x, w.y), gx = Math.round(c.gx), gy = Math.round(c.gy);
  if (place || move != null) { doPlaceAt(gx, gy); return; }
  let best = null, bd = 38; for (const a of S.agents) { const s = w2s(a.wx, a.wy); const d = Math.hypot(s.x - sx, s.y - sy - 24); if (d < bd) { bd = d; best = a; } }
  if (best) { openChat(best.id); return; }
  const b = buildingAt(gx, gy); if (b) openBuilding(b.id);
}

/* ============================== HUD / LOOP ============================== */
const cache = {}; function setText(id, v) { if (cache[id] !== v) { cache[id] = v; $(id).textContent = v; } }
function updateHUD() { setText("#h_coins", S.coins); setText("#h_b", S.buildings.length); setText("#h_a", S.agents.length); }
function setupCanvas(canvas, ctx) { const DPR = 2; function resize() { const d = Math.min(devicePixelRatio || 1, DPR); view.w = innerWidth; view.h = innerHeight; canvas.width = view.w * d; canvas.height = view.h * d; canvas.style.width = view.w + "px"; canvas.style.height = view.h + "px"; ctx.setTransform(d, 0, 0, d, 0, 0); } addEventListener("resize", resize); addEventListener("orientationchange", resize); resize(); }

async function main() {
  const canvas = $("#c"), ctx = canvas.getContext("2d");
  setupCanvas(canvas, ctx); await loadAssets(); buildTerrain(); buildGround();
  S = load() || fresh(); centerCam(); cam.x = cam.tx; cam.y = cam.ty; cam.zoom = cam.tzoom;
  wire(); setupInput(canvas); updateHint();
  if (!S.seenHelp) openHelp();
  setInterval(save, 8000);
  let last = performance.now(), acc = 0, paused = false, frames = 0, fpsAt = last;
  const dev = new URLSearchParams(location.search).has("dev"); if (dev) { $("#dev").style.display = "block"; window.AV = { state: () => S, openChat, openBuilding, openTownHall, startPlace, doPlaceAt, CATALOG, PROVIDERS }; }
  addEventListener("blur", () => paused = true); addEventListener("focus", () => { paused = false; last = performance.now(); });
  function frame(t) { requestAnimationFrame(frame); if (paused) { last = t; return; } acc += t - last; last = t; if (acc > 250) acc = 250; pollKeys(STEP / 1000); while (acc >= STEP) { step(STEP / 1000); acc -= STEP; } render(ctx); updateHUD(); if (dev && (frames++, t - fpsAt >= 500)) { $("#dev").textContent = Math.round(frames * 1000 / (t - fpsAt)) + " fps · " + S.buildings.length + "b " + S.agents.length + "a"; frames = 0; fpsAt = t; } }
  requestAnimationFrame(frame);
}
main();
