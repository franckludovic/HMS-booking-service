require('dotenv').config();

const config = {
  port: process.env.PORT || 3004,
  jwtPublicKeyPath: process.env.JWT_PUBLIC_KEY_PATH,
  jwtIssuer: process.env.JWT_ISSUER,
  jwtAudience: process.env.JWT_AUDIENCE,
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  eventBusRedisUrl: process.env.EVENT_BUS_REDIS_URL,
  availabilityServiceUrl: process.env.AVAILABILITY_SERVICE_URL,
  workerProfileServiceUrl: process.env.WORKER_PROFILE_SERVICE_URL
};

module.exports = config;
