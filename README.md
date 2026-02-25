# AI Studio

AI Studio is an open-source AI chat that allows you to chat with all available LLMs.

## Roadmap

### Main features
- [x] add react router 14/02/2026
- [x] install tailwind 14/02/2026
- [x] add clerk auth on fe (locked pages + sign in/up) 14/02/2026
- [x] add clerk auth on convex be 14/02/2026
- [x] add basic ui with sidebar 14/02/2026
- [x] add chat container (use hardcoded openrouter key for now) 15/02/2026
- [x] sort thread by date in the list (if animated would be cool) 16/02/2026
- [x] improve auto scroll behavior (may have to improve later but its done) 16/02/2026
- [x] improve input box (make it textarea expandable) 16/02/2026
- [x] add editable BYOK (gotta encrypt it) 16/02/2026
- [x] add user/settings button at the end of the sidebar (or top right of the screen?) 16/02/2026
- [x] add model selector 17/02/2026
- [x] add ability to delete thread 17/02/2026
- [x] add ability to edit thread title 17/02/2026

### Later
- [x] render markdown properly 18/02/2026
- [x] try out the smoothText from convex: https://docs.convex.dev/agents/streaming#text-smoothing-with-smoothtext-and-usesmoothtext (update: works great) 18/02/2026
- [x] add reasoning selector (off, low, medium, high) 18/02/2026
- [x] error handling 18/02/2026

### UI/UX
- [x] make sidebar collapsible 18/02/2026
- [x] rethink/polish whole ui (a lot of work to do still but good enough mvp) 18/02/2026

### MVP
- [x] landing page 19/02/2026
- [x] implement payment (fixed 4$/month for structure (you can clone and host it for free), plus byok pricing only. goated model) 19/02/2026 (fixed on 21/02/2026 -> moved to stripe with convex component as clerk billing doesn't work on brazil.)
- [x] set up prod 21/02/2026
- [x] improve settings and user management (can not logout yet lol)
- [ ] add agents.md
- [ ] add license
- [ ] open source it and post it

### Structure
- [x] set up proper monorepo to fix convex workarounds. should allow for mobile app and desktop app to reuse the same backend easily. 19/02/2026
- [ ] add better eslint/prettier and tailwind prettier plugin for classnames ordering
- [ ] update convex agent and ai sdk to v6 when the version is available: https://github.com/get-convex/agent/pull/216
- [ ] add better env variables management/validation

## Extra features
- [x] sidebar mobile responsive (and another UX/UI overhaul, for reals now)
- [ ] better pay wall (let user see whole website, just cant send message)
- [ ] browser search tool (most necessary IMO)
- [ ] file uploads
- [ ] add a button or something to "add SOTA models" that auto-adds latest gpt, claude, etc. (maybe a button to add main open weight models too)
- [ ] image generation
- [ ] folder separation for the chats

## Future
- [ ] desktop app
- [ ] mobile app
