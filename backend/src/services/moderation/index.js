/**
 * moderation service — Milestone 14.
 *
 * Every post (text, photo, video) passes through this service before
 * publishing. Uses the OpenAI Moderation API (real, free, self-serve —
 * unlike NDTM/IRCTC, there's no reason to fake this one). Flagged content
 * routes to a human-review queue rather than auto-publish or auto-reject.
 *
 * Design contract:
 *
 *   moderate(content: { text?, imageURL?, videoURL? }) -> ModerationResult
 *
 * where ModerationResult = { status: 'approved' | 'flagged', reasons: [] }
 *
 * See docs/threat-model.md for why sponsored (paid) posts get a stricter
 * review bar than organic content.
 */

// TODO (M14): implement OpenAI Moderation API integration
// TODO (M14): implement human-review escalation queue for flagged content
module.exports = {};
