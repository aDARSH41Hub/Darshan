# Architecture

Full context and rationale: see [PDD.md](./PDD.md).

## System Diagram

```mermaid
flowchart TD
    A[React Frontend] --> B[Express API Gateway]
    B --> C[Auth Service]
    B --> D[Itinerary Service<br/>LLM + fallback]
    B --> E[Recommender Service]
    B --> F[Crowd Prediction Service]
    B --> G[Safety Alert Service<br/>labeled simulated feed]
    B --> H[Payment Service<br/>Razorpay sandbox]
    B --> P[Social Service<br/>profiles, follow, posts, reactions]
    B --> Q[Proximity Service<br/>opt-in, coarse location only]
    B --> R[Chat Service<br/>Socket.IO, mutual-accept only]
    B --> S[Chatbot/Voice Service<br/>LLM + Web Speech API]
    C --> I[(MongoDB Atlas)]
    D --> I
    E --> I
    F --> I
    P --> I
    Q --> I
    R --> T[(Redis - active session state)]
    D --> J[OpenAI/Claude API]
    S --> J
    B --> K[Google Maps/Places API]
    F --> L[Synthetic crowd dataset]
    G --> M[Public news/dataset feed - labeled simulated]
    P --> N[Cloudinary - photo storage]
```

## Non-Negotiable Safety Design (Proximity Feature)

These are acceptance criteria for Milestone 12, not optional polish:

1. Opt-in only — never background or default-on location tracking
2. Coarse proximity buckets shown ("within 2km") — exact coordinates never exposed to another user
3. Chat unlocks only on mutual accept — no one-sided visibility into chat-ready contacts
4. Block/report ships in the same release as the feature itself
5. No location history retention once a user opts out or logs off

## Design Principles

1. **Honesty over impressiveness**: every simulated data source (crowd feed, safety alerts, NDTM/IRCTC references) is labeled as such in-app and in docs — never presented as live institutional integration.
2. **Config-driven, not hardcoded**: API keys, thresholds, and feature flags live in environment config, not inline in code.
3. **Modular services**: itinerary, recommender, crowd, alerts, social, proximity, and chat are independently developed and testable services behind a single API gateway.
