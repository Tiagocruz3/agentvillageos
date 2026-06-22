# AgentVerse OS

A living **AI city** browser game. Tap a grid square to open the build dock and
place a provider building — **OpenAI · Anthropic · OpenRouter · Grok**. Click a
building and paste a valid API key to bring it to life: a provider-styled AI
agent walks out into your village. Click any walking agent to open a
ChatGPT/Claude-style chat and talk to it — calls go straight to the provider in
the browser (where CORS allows), with an in-character demo fallback otherwise.

Built with the Higgsfield game pipeline. Bright low-poly "tycoon" art.
**Live:** https://bright-lily-830.higgsfield.gg/

## Run locally
```bash
cd agentverse        # if inside the autotube monorepo; otherwise repo root
python3 -m http.server 8099
# open http://localhost:8099  (add ?dev=1 for the FPS/debug overlay)
```
ES modules need a server — opening `index.html` over `file://` won't load.

## Layout
```
index.html     # canvas + dock + chat/modal UI shell
game.js        # iso renderer, placement, agents, chat (real provider calls + fallback)
strings.js     # all player-visible strings (i18n-ready)
logic.js       # solo rules-module stub (required by the Higgsfield apps engine)
design/        # plan.md · assets.csv · thresholds.md
dist/          # packaged game.zip for Higgsfield deploy
```

## How it works
- **Providers** (`PROVIDERS` in `game.js`): name, color, sprite, API endpoint, model, wire protocol.
- **Place** → building stored on the tapped grid cell. **Key** → spawns a wandering agent.
- **Chat** → `callLLM()` posts to the provider (OpenAI/OpenRouter/Grok = OpenAI-style, Anthropic = Messages API with the browser-access header). Failures fall back to `simReply()`.
- Art is served from Higgsfield's CDN; the town persists in `localStorage`.

> **Security:** API keys are stored only in your browser's localStorage and sent
> directly to the provider. Use spend-capped keys.

## Deploy
Zip `index.html`, `game.js`, `strings.js`, `logic.js`, `design/` at the archive
root and deploy via the Higgsfield `deploy_game` flow (pass the existing
`game_id` to update in place).
