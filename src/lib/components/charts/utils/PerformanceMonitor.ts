
export class PerformanceMonitor {
	private renderTimes: number[] = [];
	private maxSamples: number;
	private hitCount = 0;
	private missCount = 0;
	private isEnabled: boolean;

	constructor(maxSamples: number = 100, enabled: boolean = true) {
		this.maxSamples = maxSamples;
		this.isEnabled = enabled && typeof performance !== 'undefined';
	}

	/**
	 * Start timing a render operation
	 */
	startRender(): number {
		if (!this.isEnabled) return 0;
		return performance.now();
	}

	/**
	 * End timing a render operation
	 */
	endRender(startTime: number): void {
		if (!this.isEnabled || startTime === 0) return;

		const renderTime = performance.now() - startTime;
		this.renderTimes.push(renderTime);

		if (this.renderTimes.length > this.maxSamples) {
			this.renderTimes.shift();
		}

		// Warn if renders are consistently slow
		if (this.renderTimes.length >= 10) {
			const avgRenderTime = this.getAverageRenderTime();
			if (avgRenderTime > 16) {
				// 60fps threshold
				console.warn(
					`Chart rendering is slow: ${avgRenderTime.toFixed(2)}ms average (target: <16ms for 60fps)`
				);
			}
		}
	}

	/**
	 * Record cache hit
	 */
	recordCacheHit(): void {
		this.hitCount++;
	}

	/**
	 * Record cache miss
	 */
	recordCacheMiss(): void {
		this.missCount++;
	}

	/**
	 * Get average render time
	 */
	getAverageRenderTime(): number {
		if (this.renderTimes.length === 0) return 0;
		return this.renderTimes.reduce((a, b) => a + b) / this.renderTimes.length;
	}

	/**
	 * Get maximum render time
	 */
	getMaxRenderTime(): number {
		return this.renderTimes.length > 0 ? Math.max(...this.renderTimes) : 0;
	}

	/**
	 * Get minimum render time
	 */
	getMinRenderTime(): number {
		return this.renderTimes.length > 0 ? Math.min(...this.renderTimes) : 0;
	}

	/**
	 * Get 95th percentile render time
	 */
	get95thPercentileRenderTime(): number {
		if (this.renderTimes.length === 0) return 0;

		const sorted = [...this.renderTimes].sort((a, b) => a - b);
		const index = Math.floor(sorted.length * 0.95);
		return sorted[index];
	}

	/**
	 * Get cache hit rate
	 */
	getCacheHitRate(): number {
		const total = this.hitCount + this.missCount;
		return total > 0 ? this.hitCount / total : 0;
	}

	/**
	 * Get performance summary
	 */
	getPerformanceSummary(): {
		renderCount: number;
		avgRenderTime: number;
		maxRenderTime: number;
		minRenderTime: number;
		p95RenderTime: number;
		cacheHitRate: number;
		fps: number;
		isHealthy: boolean;
	} {
		const avgRenderTime = this.getAverageRenderTime();
		const maxRenderTime = this.getMaxRenderTime();
		const minRenderTime = this.getMinRenderTime();
		const p95RenderTime = this.get95thPercentileRenderTime();
		const cacheHitRate = this.getCacheHitRate();
		const fps = avgRenderTime > 0 ? 1000 / avgRenderTime : 0;
		const isHealthy = avgRenderTime < 16 && p95RenderTime < 33; // 60fps avg, 30fps p95

		return {
			renderCount: this.renderTimes.length,
			avgRenderTime,
			maxRenderTime,
			minRenderTime,
			p95RenderTime,
			cacheHitRate,
			fps,
			isHealthy
		};
	}

	/**
	 * Reset all metrics
	 */
	reset(): void {
		this.renderTimes = [];
		this.hitCount = 0;
		this.missCount = 0;
	}

	/**
	 * Enable/disable monitoring
	 */
	setEnabled(enabled: boolean): void {
		this.isEnabled = enabled && typeof performance !== 'undefined';
	}

	/**
	 * Log performance summary to console
	 */
	logSummary(): void {
		if (!this.isEnabled) {
			console.log('Performance monitoring is disabled');
			return;
		}

		const summary = this.getPerformanceSummary();

		console.group('Chart PERFORMANCE SUMMARY');
		console.log(`Health Status: ${summary.isHealthy ? 'Healthy' : 'Needs Optimization'}`);
		console.log(`Render Count: ${summary.renderCount}`);
		console.log(`Average Render Time: ${summary.avgRenderTime.toFixed(2)}ms`);
		console.log(`Effective FPS: ${summary.fps.toFixed(1)}`);
		console.log(`95th Percentile: ${summary.p95RenderTime.toFixed(2)}ms`);
		console.log(`Cache Hit Rate: ${(summary.cacheHitRate * 100).toFixed(1)}%`);
		console.log(
			`⚡ Min/Max Render: ${summary.minRenderTime.toFixed(2)}ms / ${summary.maxRenderTime.toFixed(2)}ms`
		);

		if (!summary.isHealthy) {
			console.warn('💡 Consider optimizations:');
			if (summary.avgRenderTime > 16) {
				console.warn('  • Reduce data points or enable Canvas mode');
			}
			if (summary.cacheHitRate < 0.7) {
				console.warn('  • Increase cache size or improve memoization');
			}
			if (summary.p95RenderTime > 33) {
				console.warn('  • Enable data sampling for large datasets');
			}
		}

		console.groupEnd();
	}

	/**
	 * Start automatic logging at intervals
	 */
	startAutoLogging(intervalMs: number = 10000): () => void {
		const interval = setInterval(() => {
			if (this.renderTimes.length > 0) {
				this.logSummary();
			}
		}, intervalMs);

		return () => clearInterval(interval);
	}
}
