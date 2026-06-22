// AgentVerse OS is a single-player town management game: all simulation runs
// client-side. The platform still requires a rules module at the archive root,
// so this is the canonical solo stub (build-game.md §1).
export const meta = { game: "agentverse-os", minPlayers: 1, maxPlayers: 1 };
export function setup() { return {}; }
export function validateAction() { return { ok: true }; }
export function applyAction(state) { return state; }
export function isGameOver() { return { over: false }; }
export function viewFor(state) { return state; }
