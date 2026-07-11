/**
 * Milestone 0 sanity test — the only real test in the initial scaffold.
 * Verifies the health-check endpoint so CI has a genuine passing test
 * from the first commit. More tests get added per-service as each
 * milestone is implemented.
 */

const request = require("supertest");
const { createApp } = require("../src/app");

const app = createApp();

describe("GET /health", () => {
  it("returns status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});
