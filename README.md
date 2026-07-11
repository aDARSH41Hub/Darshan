# Darshan

**AI-personalized, safety-aware travel planning — with a creator layer for hyperlocal knowledge that no OTA or map API has.**

> Status: 🚧 Phase 0 complete (research + design, PDD v2 locked). Implementation starting at Milestone 1.

## The Idea

A person who actually lives near the Chandrashila trek knows *today* whether the Tungnath temple gate is open, how much snow is on the route, and the cheapest real way to get there. No booking site or map API has that. Darshan combines:

1. **AI-personalized itinerary planning** (LLM-generated, with a deterministic fallback)
2. **A genuinely trained crowd-prediction model** (on honestly-labeled synthetic data — see [`ml/crowd_model/README.md`](ml/crowd_model/README.md))
3. **A creator layer**: profiles, followers, blog/photo posts tagged to state zones, and a distinct-by-design reaction system (Bloom / Pollinate / Root)
4. **Safety-first real-time traveler matching**, opt-in only, with non-negotiable safety guardrails baked into the feature's definition of done (see below)
5. **Multilingual chatbot + voice I/O** via the Web Speech API

Full research, competitive analysis, and scope reasoning: [`docs/PDD.md`](docs/PDD.md).

## What's Real vs. Simulated (Read This First)

This project is explicit about what's genuinely integrated vs. what stands in for institutional access a student project can't obtain:

| Component | Status |
|---|---|
| Google Maps/Places, LLM APIs, Razorpay (sandbox), Cloudinary (photo + video) | **Real, self-serve integrations** |
| Content moderation | **Real** — OpenAI Moderation API + human-review queue (see [`docs/threat-model.md`](docs/threat-model.md)) |
| Crowd prediction model | **Real trained model**, on synthetic data calibrated to public footfall figures |
| Safety/scam alerts | Public data/news feed, **labeled simulated** stand-in for an official integration |
| NDTM / IRCTC government APIs | **Not integrated** — no public developer access exists for either; designed-for only |
| UPI/payments | **Sandbox/test mode only** — no real merchant KYC |
| Temple crowd-data partnership | **Genuine outreach attempted** (see [`docs/research/partnership-outreach-log.md`](docs/research/partnership-outreach-log.md)) — outcome logged honestly either way; synthetic data ships regardless |

## Non-Negotiable: Proximity Feature Safety

The real-time nearby-traveler matching feature ships with these as part of its definition of done, not as optional polish:

1. Opt-in only — never background/default-on location tracking
2. Coarse proximity only ("within 2km") — exact coordinates never shown to another user
3. Chat unlocks only on mutual accept
4. Block/report ships in the same release
5. No location history retention after opt-out

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Real-time | Socket.IO + Redis |
| Database | MongoDB Atlas |
| AI | OpenAI/Claude API (itinerary, chatbot, translation) |
| Maps | Google Places/Maps API |
| Voice | Web Speech API (browser-native) |
| Photos | Cloudinary |
| Payments | Razorpay (sandbox) |
| Crowd ML | scikit-learn / PyTorch (regression or LSTM) |

## Repository Structure

```
Darshan/
├── docs/               # PDD, architecture, research
├── frontend/           # React + Vite app
├── backend/
│   ├── src/routes/, models/
│   └── src/services/    # itinerary, recommender, crowd, alerts, social, proximity, chat
├── ml/crowd_model/      # crowd prediction training (synthetic data, real model)
└── tests/
```

## Setup

```bash
git clone <your-repo-url>
cd Darshan
cd backend && npm install
cd ../frontend && npm install
```

## Roadmap

*(v3 — full-year scope with explicit buffer weeks; see [`docs/PDD.md` §13](docs/PDD.md#13-project-timeline-and-milestones-full-year-v3) for reasoning)*

| Milestone | Status |
|---|---|
| M0 — Research & PDD | ✅ Complete (v3) |
| M1 — Environment & repo | ✅ Complete |
| M2 — Backend core | ⬜ Planned |
| M3 — Frontend core | ⬜ Planned |
| M4 — Maps integration | ⬜ Planned |
| M5 — AI itinerary generation | ⬜ Planned |
| M6 — Recommender | ⬜ Planned |
| M7 — Crowd prediction model | ⬜ Planned |
| *Buffer after M7* | ⬜ Planned |
| M8 — Multilingual chatbot + voice | ⬜ Planned |
| *Buffer after M8* | ⬜ Planned |
| M9 — Creator profiles & follow | ⬜ Planned |
| M10 — Blog/photo/video posts + zones | ⬜ Planned |
| M11 — Reaction system | ⬜ Planned |
| M12 — Real-time proximity + chat (safety-first) | ⬜ Planned |
| *Buffer after M12* | ⬜ Planned |
| M13 — Sponsored posts + payments | ⬜ Planned |
| M14 — Real content moderation | ⬜ Planned |
| M15 — Beta testing & iteration | ⬜ Planned |
| M16 — Testing, docs, deployment | ⬜ Planned |
| M17 — Publication & interview prep | ⬜ Planned |

**35 of 52 available weeks scheduled** — the rest is intentional slack, not padding. Parallel, non-blocking: temple-partnership outreach (see [`docs/research/partnership-outreach-log.md`](docs/research/partnership-outreach-log.md)).

## License

MIT — see [LICENSE](LICENSE).
