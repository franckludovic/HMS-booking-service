require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3004,
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  jwtPublicKeyPath: process.env.JWT_PUBLIC_KEY_PATH,
  jwtIssuer: process.env.JWT_ISSUER,
  jwtAudience: process.env.JWT_AUDIENCE,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
};
