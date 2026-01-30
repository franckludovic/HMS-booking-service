class RedisLock {
  constructor(redisClient) {
    this.redis = redisClient;
  }

  /**
   * Acquire a distributed lock
   * @param {string} key - Lock key
   * @param {number} ttl - Time to live in milliseconds (default: 30000ms = 30s)
   * @returns {boolean} - True if lock acquired, false if already locked
   */
  async acquire(key, ttl = 30000) {
    try {
      const result = await this.redis.set(key, 'locked', 'NX', 'PX', ttl);
      return result === 'OK';
    } catch (error) {
      console.error('Error acquiring lock:', error);
      return false;
    }
  }

  /**
   * Release a distributed lock
   * @param {string} key - Lock key
   * @returns {number} - Number of keys deleted (1 if lock was released, 0 if not)
   */
  async release(key) {
    try {
      return await this.redis.del(key);
    } catch (error) {
      console.error('Error releasing lock:', error);
      return 0;
    }
  }

  /**
   * Extend lock TTL
   * @param {string} key - Lock key
   * @param {number} ttl - New TTL in milliseconds
   * @returns {boolean} - True if extended, false if lock doesn't exist
   */
  async extend(key, ttl = 30000) {
    try {
      const result = await this.redis.pexpire(key, ttl);
      return result === 1;
    } catch (error) {
      console.error('Error extending lock:', error);
      return false;
    }
  }
}

module.exports = RedisLock;
