// Optimized path generation with better performance
class PathGenerator {
	private static pathCache = new Map<string, string>();

	static createStraightPath(points: Array<{ x: number; y: number }>): string {
		if (points.length === 0) return '';

		// Use array join instead of string concatenation
		const pathSegments = [`M${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`];

		for (let i = 1; i < points.length; i++) {
			pathSegments.push(`L${points[i].x.toFixed(2)},${points[i].y.toFixed(2)}`);
		}

		return pathSegments.join('');
	}

	static createSmoothPath(points: Array<{ x: number; y: number }>, tension: number = 0.3): string {
		if (points.length < 2) return this.createStraightPath(points);

		// Cache key for memoization
		const cacheKey = `${points.map((p) => `${p.x},${p.y}`).join('|')}_${tension}`;

		if (this.pathCache.has(cacheKey)) {
			return this.pathCache.get(cacheKey)!;
		}

		const pathSegments = [`M${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`];
		const optimizedTension = Math.max(0, Math.min(1, tension)) * 0.5;

		for (let i = 0; i < points.length - 1; i++) {
			const p0 = i === 0 ? points[0] : points[i - 1];
			const p1 = points[i];
			const p2 = points[i + 1];
			const p3 = i === points.length - 2 ? points[points.length - 1] : points[i + 2];

			const cp1x = p1.x + (p2.x - p0.x) * optimizedTension;
			const cp1y = p1.y + (p2.y - p0.y) * optimizedTension;
			const cp2x = p2.x - (p3.x - p1.x) * optimizedTension;
			const cp2y = p2.y - (p3.y - p1.y) * optimizedTension;

			pathSegments.push(
				`C${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`
			);
		}

		const result = pathSegments.join('');

		// Limit cache size to prevent memory leaks
		if (this.pathCache.size > 100) {
			const firstKey = this.pathCache.keys().next().value;
			this.pathCache.delete(firstKey);
		}

		this.pathCache.set(cacheKey, result);
		return result;
	}

	static clearCache() {
		this.pathCache.clear();
	}
}

// Optimized data processing with memoization
function memoize<T extends (...args: any[]) => any>(fn: T): T {
	const cache = new Map();

	return ((...args: any[]) => {
		const key = JSON.stringify(args);

		if (cache.has(key)) {
			return cache.get(key);
		}

		const result = fn(...args);

		// Limit cache size
		if (cache.size > 50) {
			const firstKey = cache.keys().next().value;
			cache.delete(firstKey);
		}

		cache.set(key, result);
		return result;
	}) as T;
}

// Memoized helper functions
const memoizedGetAllXValues = memoize((lines: LineData[], xKey: string) => {
	const xValues: string[] = [];
	const seen = new Set<string>();

	if (lines.length > 0) {
		lines[0].data.forEach((d: Record<string, any>) => {
			const value = String(d[xKey]);
			if (!seen.has(value)) {
				seen.add(value);
				xValues.push(value);
			}
		});
	}

	lines.forEach((line: LineData) => {
		line.data.forEach((d: Record<string, any>) => {
			const value = String(d[xKey]);
			if (!seen.has(value)) {
				seen.add(value);
				xValues.push(value);
			}
		});
	});

	const firstValue = xValues[0];
	if (firstValue && parseDate(firstValue)) {
		return xValues.sort((a, b) => {
			const dateA = parseDate(a);
			const dateB = parseDate(b);
			if (dateA && dateB) {
				return dateA.getTime() - dateB.getTime();
			}
			return 0;
		});
	}

	return xValues;
});

const memoizedGetAllYValues = memoize((lines: LineData[], yKey: string) => {
	const yValues: number[] = [];
	lines.forEach((line: LineData) => {
		line.data.forEach((d: Record<string, any>) => {
			yValues.push(Number(d[yKey]));
		});
	});
	return yValues;
});

// Optimized Y-axis tick generation
const memoizedGenerateYTicks = memoize(
	(yMin: number, yMax: number, tickCount: number, hasNegatives: boolean, doubleTicks: boolean) => {
		const effectiveTickCount = hasNegatives && doubleTicks ? tickCount * 2 : tickCount;
		const tickValues = new Set<number>();

		for (let i = 0; i <= effectiveTickCount; i++) {
			const value = yMin + (i / effectiveTickCount) * (yMax - yMin);
			tickValues.add(Number(value.toFixed(2)));
		}

		if (hasNegatives && yMin < 0 && yMax > 0) {
			tickValues.add(0);
		}

		return Array.from(tickValues).sort((a, b) => b - a);
	}
);
