import Redis from 'ioredis';

// Configure Redis with options to reduce unnecessary operations
export const redisClient = new Redis(
  process.env.REDIS_DATABASE_URI ??
  'rediss://default:@(User).upstash.io:6379',
  {
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,

    keepAlive: 0,
  }
);

redisClient.connect().catch((err) => {
  console.error('Redis initial connection error:', err.message);
});
