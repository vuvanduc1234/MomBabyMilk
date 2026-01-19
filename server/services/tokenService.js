const RefreshToken = require('../models/RefreshTokenModel');

async function saveRefreshToken(userId, token, expiresInDays = 7) {
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
  const doc = new RefreshToken({ token, user: userId, expiresAt });
  return doc.save();
}

async function findRefreshToken(token) {
  return RefreshToken.findOne({ token, revoked: false }).exec();
}

async function removeRefreshToken(token) {
  // bạn có thể dùng deleteOne hoặc đánh dấu revoked = true
  return RefreshToken.deleteOne({ token }).exec();
}

async function replaceRefreshToken(userId, oldToken, newToken, expiresInDays = 7) {
  await RefreshToken.deleteOne({ token: oldToken, user: userId }).exec();
  return saveRefreshToken(userId, newToken, expiresInDays);
}

module.exports = { saveRefreshToken, findRefreshToken, replaceRefreshToken, removeRefreshToken };