// File: src/lib/components/charts/utils/PathGenerator.ts

export class PathGenerator {
	private static pathCache = new Map<string, string>();
	private static maxCacheSize = 100;

	/**
	 * Create a straight line path
	 */
	static createStraightPath(points: Array<{ x: number; y: number }>): string {
		if (points.length === 0) return '';

		const pathSegments = [`M${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`];

		for (let i = 1; i < points.length; i++) {
			pathSegments.push(`L${points[i].x.toFixed(2)},${points[i].y.toFixed(2)}`);
		}

		return pathSegments.join('');
	}

	/**
	 * Create smooth curve using optimized Catmull-Rom spline interpolation
	 */
	static createSmoothPath(points: Array<{ x: number; y: number }>, tension: number = 0.3): string {
		if (points.length < 2) return this.createStraightPath(points);

		// Cache key for memoization
		const cacheKey = `${points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('|')}_${tension}`;

		if (this.pathCache.has(cacheKey)) {
			return this.pathCache.get(cacheKey)!;
		}

		// For 2 points, use a proper cubic Bezier curve
		if (points.length === 2) {
			const start = points[0];
			const end = points[1];
			const dx = end.x - start.x;
			const midTension = tension * 0.5;
			const cp1x = start.x + dx * midTension;
			const cp1y = start.y;
			const cp2x = end.x - dx * midTension;
			const cp2y = end.y;

			const result = `M${start.x.toFixed(2)},${start.y.toFixed(2)} C${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${end.x.toFixed(2)},${end.y.toFixed(2)}`;
			this.setCachedPath(cacheKey, result);
			return result;
		}

		const pathSegments = [`M${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`];
		const optimizedTension = Math.max(0, Math.min(1, tension)) * 0.5;

		// Generate smooth curve segments using Catmull-Rom spline
		for (let i = 0; i < points.length - 1; i++) {
			const p0 = i === 0 ? points[0] : points[i - 1];
			const p1 = points[i];
			const p2 = points[i + 1];
			const p3 = i === points.length - 2 ? points[points.length - 1] : points[i + 2];

			// Calculate Catmull-Rom control points
			const cp1x = p1.x + (p2.x - p0.x) * optimizedTension;
			const cp1y = p1.y + (p2.y - p0.y) * optimizedTension;
			const cp2x = p2.x - (p3.x - p1.x) * optimizedTension;
			const cp2y = p2.y - (p3.y - p1.y) * optimizedTension;

			pathSegments.push(
				`C${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`
			);
		}

		const result = pathSegments.join(' ');
		this.setCachedPath(cacheKey, result);
		return result;
	}

	/**
	 * Set cached path with size limit
	 */
	private static setCachedPath(key: string, path: string): void {
		if (this.pathCache.size >= this.maxCacheSize) {
			const firstKey = this.pathCache.keys().next().value;
			if (firstKey !== undefined) {
				this.pathCache.delete(firstKey);
			}
		}
		this.pathCache.set(key, path);
	}

	/**
	 * Clear the path cache
	 */
	static clearCache(): void {
		this.pathCache.clear();
	}

	/**
	 * Get cache statistics
	 */
	static getCacheStats(): { size: number; maxSize: number } {
		return {
			size: this.pathCache.size,
			maxSize: this.maxCacheSize
		};
	}
}
