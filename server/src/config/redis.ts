import { createClient } from 'redis';
import { env } from './env';

const redisClient = createClient({
  url: env.REDIS_URL
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

// Self-invoking async function to connect
(async () => {
  try {
    await redisClient.connect();
    console.log('Successfully connected to Redis');
  } catch (err) {
    console.error('Could not connect to Redis', err);
  }
})();

export default redisClient;
