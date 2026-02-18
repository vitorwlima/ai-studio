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
- [ ] render markdown properly
- [ ] try out the smoothText from convex: https://docs.convex.dev/agents/streaming#text-smoothing-with-smoothtext-and-usesmoothtext
- [ ] animate sidebar thread list reordering

### UI/UX
- [ ] make sidebar collapsible
- [ ] rethink/polish whole ui
  - [ ] improve reasoning container / messages list
  - [ ] improve scrolls

### Structure
- [ ] set up proper monorepo to fix convex workarounds. should allow for mobile app and desktop app to reuse the same backend easily.
- [ ] add better eslint/prettier and tailwind prettier plugin for classnames ordering
- [ ] update convex agent and ai sdk to v6 when the version is available: https://github.com/get-convex/agent/pull/216
- [ ] add better env variables management/validation
- [ ] landing page
- [ ] implement payment (fixed 4$/month for structure (you can clone and host it for free), plus byok pricing only. goated model)
- [ ] add agents.md
- [ ] add license
- [ ] open source it and post it
- [ ] browser search tool
- [ ] error handling (test invalid key or with no funds)
