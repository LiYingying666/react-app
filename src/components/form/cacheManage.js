// 首先创建一个简单的缓存管理器
class CacheManager {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // 检查缓存是否过期（这里设置 5 分钟过期）
    if (Date.now() - item.timestamp > 5 * 60 * 1000) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  set(key, value) {
    // 如果缓存已满，删除最早的项
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  clear() {
    this.cache.clear();
  }
}
export default CacheManager;
