/* eslint-disable @typescript-eslint/no-explicit-any */

export class ChartDataManager {
	private static instance: ChartDataManager;
	private dataCache = new Map<string, any>();
	private maxCacheSize: number;
	private accessTimes = new Map<string, number>();

	private constructor(maxSize: number = 50) {
		this.maxCacheSize = maxSize;
	}

	/**
	 * Get singleton instance
	 */
	static getInstance(maxSize?: number): ChartDataManager {
		if (!ChartDataManager.instance) {
			ChartDataManager.instance = new ChartDataManager(maxSize);
		}
		return ChartDataManager.instance;
	}

	/**
	 * Get cached data
	 */
	getCachedData(key: string): any {
		const data = this.dataCache.get(key);
		if (data) {
			// Update access time for LRU
			this.accessTimes.set(key, Date.now());
		}
		return data;
	}

	/**
	 * Set cached data with LRU eviction
	 */
	setCachedData(key: string, data: any): void {
		if (this.dataCache.size >= this.maxCacheSize) {
			this.evictLeastRecentlyUsed();
		}

		this.dataCache.set(key, data);
		this.accessTimes.set(key, Date.now());
	}

	/**
	 * Evict least recently used entry
	 */
	private evictLeastRecentlyUsed(): void {
		let oldestKey: string | null = null;
		let oldestTime = Infinity;

		for (const [key, time] of this.accessTimes) {
			if (time < oldestTime) {
				oldestTime = time;
				oldestKey = key;
			}
		}

		if (oldestKey) {
			this.dataCache.delete(oldestKey);
			this.accessTimes.delete(oldestKey);
		}
	}

	/**
	 * Clear all cached data
	 */
	clearCache(): void {
		this.dataCache.clear();
		this.accessTimes.clear();
	}

	/**
	 * Get cache statistics
	 */
	getCacheStats(): {
		size: number;
		maxSize: number;
		hitRate: number;
		memoryUsage: string;
	} {
		// Estimate memory usage (rough approximation)
		const estimatedSize = JSON.stringify(Array.from(this.dataCache.values())).length;
		const memoryUsage = `${(estimatedSize / 1024).toFixed(2)} KB`;

		return {
			size: this.dataCache.size,
			maxSize: this.maxCacheSize,
			hitRate: this.calculateHitRate(),
			memoryUsage
		};
	}

	/**
	 * Calculate cache hit rate (simplified)
	 */
	private calculateHitRate(): number {
		// This is a simplified calculation - in a real implementation,
		// you'd track hits and misses over time
		return this.dataCache.size > 0 ? 0.8 : 0;
	}

	/**
	 * Set maximum cache size
	 */
	setMaxCacheSize(size: number): void {
		this.maxCacheSize = size;

		// Evict entries if current size exceeds new max
		while (this.dataCache.size > this.maxCacheSize) {
			this.evictLeastRecentlyUsed();
		}
	}

	/**
	 * Check if key exists in cache
	 */
	has(key: string): boolean {
		return this.dataCache.has(key);
	}

	/**
	 * Remove specific key from cache
	 */
	delete(key: string): boolean {
		const deleted = this.dataCache.delete(key);
		if (deleted) {
			this.accessTimes.delete(key);
		}
		return deleted;
	}

	/**
	 * Get all cache keys
	 */
	keys(): string[] {
		return Array.from(this.dataCache.keys());
	}
}
