# Numeric thresholds (frozen before content)

## Performance budget (weakest target = mobile browser)
- ≥ 60 fps. Static ground pre-rendered once to an offscreen canvas, blitted per frame.
- Per-frame dynamic draws = buildings (5) + agents (typically < 30) + FX — well under budget.
- DPR capped at 2. Pause on blur. Fixed-timestep sim at 60 Hz, decoupled from render.

## Agency metrics (frozen)
- Tile: 128×64 px (iso 2:1). Grid: 13×13. Agent move speed: 135 world u/s.
- Building footprint anchor: bottom-center on its plot cell; sprite width ≈ 3 half-tiles.

## Balance numbers (data, tuned one at a time)
- Start coins: 120. Free agents: 3, then hire cost = 80 × (1 + 0.6·(n−3)).
- Mission reward base 28–60; reward × buildingOutputMult × (role-match ? 1.5) × (1 + 0.05·(lvl−1)).
- Role-match also ×0.65 duration. Agent speed-up: duration ÷ (1 + 0.08·(lvl−1)).
- Building upgrade cost: 120 × level^1.6, max level 5, +25% output per level.
- XP to level L: 80 + 60·L. Missions spawn every 22 s up to 6 open.

## Forgiveness / feedback windows
- Tap pick radius: 36 px (agents), 0.7 cell (buildings). Drag threshold: 4 px before pan (so taps register).
- Every action acknowledged immediately (toast / floating text); rewards float up on completion at Town Hall.
