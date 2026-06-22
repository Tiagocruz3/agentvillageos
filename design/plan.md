# AgentVerse OS — design plan (MVP / first milestone)

**Experience formula:** the player feels like the founder of a living AI company,
because the town constantly turns their hiring & assignment decisions into agents
that visibly walk, work, and return results that grow the city.

## Profile
- Time: real-time (passive sim) · Space: discrete isometric grid · Agency: disembodied manager
- Conflict: vs system (grow the city) + vs self (optimize) · Outcome: endless w/ player goals
- Players: **solo** (no multiplayer.md needed) · Session: minutes · Engagement: accumulation + expression + management

## Core loop (the 5 validated things)
1. **Town screen** — isometric town: Town Hall, Research Lab, Workshop, Social Media Studio, Design Studio, roads, grass.
2. **Agent creator** — name, role, personality, avatar, model, tools (+ JSON import hook for OpenAI/CrewAI/LangGraph/custom — the Phase-2 plugin seam).
3. **Mission board** — generated missions per building; role-match gives speed + reward bonus.
4. **Agent movement** — idle → walking (routes along roads) → working (progress ring) → returning → complete.
5. **Task execution** — agent produces a result (simulated client-side for the MVP); pays coins + XP; agents level up & work faster; buildings upgrade for bigger output.

## Verbs
Create · Assign · Watch · Collect · Upgrade.

## Economy (sources & sinks)
Source: mission rewards (scaled by building level, role-match, agent level).
Sinks: agent hiring (first 3 free, then escalating cost), building upgrades.

## Camera / input
Pan (drag / WASD / arrows / left-stick), zoom (wheel / pinch / +-), tap to inspect a building or agent.
Keyboard bound to physical `event.code`. Touch + gamepad first-class.

## Honest limits
- Art target is Town-Star-style; delivered as stylized 2.5D isometric sprites (true 3D mesh needs a Meshy key not present).
- "AI task execution" is simulated locally — wiring real OpenAI / tool calls is the next milestone.
- Camera rotation omitted (single-angle sprites); zoom + pan are the meaningful controls.
