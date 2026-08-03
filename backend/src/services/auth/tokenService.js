// backend/src/services/auth/tokenService.js
const crypto = require('crypto');
const RefreshToken = require('../../models/RefreshToken');
const {
  generateAccessToken,
  generateRefreshToken,
  //verifyRefreshToken,
} = require('../../utils/jwt');

// simple hash so we don't store raw JWTs in DB
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const storeRefreshToken = async (userId, token, expiresAt, replacedByToken = null) => {
  await RefreshToken.create({
    tokenHash: hashToken(token),
    userId,
    expiresAt,
    replacedByToken: replacedByToken ? hashToken(replacedByToken) : null,
  });
};

const revokeRefreshToken = async (token) => {
  await RefreshToken.updateOne(
    { tokenHash: hashToken(token) },
    { $set: { replacedByToken: 'revoked-manual' } }
  );
};

const isTokenRevoked = async (token) => {
  const record = await RefreshToken.findOne({ tokenHash: hashToken(token) });
  if (!record) return true; // if not in DB, we don't trust it
  return !!record.replacedByToken; // non-null means revoked/rotated
};

const rotateRefreshToken = async (oldToken, userId) => {
  const payload = { id: userId.toString() }; // minimal payload
  const newRefreshToken = generateRefreshToken(payload);
  const newAccessToken = generateAccessToken(payload);

  // mark old as rotated, store new
  await RefreshToken.updateOne(
    { tokenHash: hashToken(oldToken) },
    { $set: { replacedByToken: hashToken(newRefreshToken) } }
  );

  // compute expiry from env (e.g., "7d" -> Date)
  const expiresInMs = parseDuration(process.env.JWT_REFRESH_EXPIRES_IN || '7d');
  await storeRefreshToken(userId, newRefreshToken, new Date(Date.now() + expiresInMs));

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

// helper: "7d" -> ms. crude but works for our env values
function parseDuration(str) {
  const num = parseInt(str, 10);
  if (str.includes('d')) return num * 24 * 60 * 60 * 1000;
  if (str.includes('h')) return num * 60 * 60 * 1000;
  if (str.includes('m')) return num * 60 * 1000;
  return num * 1000;
}

module.exports = {
  hashToken,
  storeRefreshToken,
  revokeRefreshToken,
  isTokenRevoked,
  rotateRefreshToken,
};