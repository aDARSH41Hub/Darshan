# Threat Model

Full context: see [PDD.md §7](./PDD.md#7-security-threat-model-new-section).

This is a solo-student-appropriate threat model, not an enterprise one — scoped honestly, not padded to look more sophisticated than it is. It focuses on the attack surface introduced specifically by the social/proximity/chat features, since the core CRUD/auth surface is standard and well-understood.

## Threats & Mitigations

| # | Threat | Mitigation | Milestone |
|---|---|---|---|
| 1 | Fake profile used to lure a solo traveler into an unsafe meetup | Report/block ships with the feature (not after); new accounts (<24hrs old) excluded from appearing in "nearby" results | M12 |
| 2 | Location inference via repeated coarse-bucket queries (triangulation attack) | Rate-limit proximity queries per user per time window; consistent bucket rounding rather than precise-distance responses that could be reverse-engineered | M12 |
| 3 | Chat abuse/harassment after a mutual match | Reports from chat feed the same moderation queue as post content; repeated reports on one account trigger manual review | M12, M14 |
| 4 | Fake "promoted" post used for a scam (fake hotel/business listing) | Sponsored posts require passing the same moderation check as organic content, **plus** manual review before going live — a higher bar than organic, since real money/trust is implied | M13, M14 |
| 5 | JWT theft / session hijacking | Short-lived tokens, HTTPS-only, standard practice (NFR3) | M2 |
| 6 | Moderation queue itself becomes a bottleneck / gets ignored under time pressure | NFR14 — a defined (even if informal, solo-operator) response process is part of the feature's definition of done, same principle as the proximity safety requirements | M14 |

## What This Threat Model Deliberately Does NOT Cover

Being honest about scope here is itself part of doing this correctly:

- Enterprise-grade penetration testing (out of scope for a solo build; a manual spot-check against the table above before calling M12/M14 done is the realistic bar)
- DDoS/infrastructure-level attacks (relying on the hosting platform's default protections — Vercel/Render — not building custom mitigation)
- Payment fraud beyond what Razorpay's own sandbox/production tooling already handles (Darshan never touches real payment data directly, by design)

## Self-Test Checklist (run before marking M12 complete)

- [ ] Attempt to view another test account's precise coordinates through the API directly (not just the UI) — confirm it's genuinely never returned, not just hidden client-side
- [ ] Attempt to see a "nearby" user's chat-readiness without them accepting a request first
- [ ] Create a brand-new test account and confirm it does NOT appear in another user's "nearby" list within the first 24 hours
- [ ] File a test report and confirm it lands somewhere you'd actually see it (not silently dropped)
