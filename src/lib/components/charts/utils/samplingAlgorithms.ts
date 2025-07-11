/**
 * Data Sampling Algorithms for Large Datasets in Line Charts
 *
 * This utility provides various sampling algorithms optimized for time series
 * and line chart visualization with large datasets.
 */

// Types
export interface DataPoint {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: any;
}

export interface Point2D {
	x: number;
	y: number;
}

export type SamplingAlgorithm =
	| 'uniform'
	| 'peaks'
	| 'douglasPeucker'
	| 'visvalingam'
	| 'lttb'
	| 'adaptive'
	| 'hybrid';

export interface SamplingConfig {
	algorithm: SamplingAlgorithm;
	targetPoints: number;
	epsilon?: number; // For Douglas-Peucker
	xKey?: string;
	yKey?: string;
}

/**
 * 1. UNIFORM SAMPLING
 * Takes evenly spaced points across the dataset
 * Best for: Smooth, gradual trends
 */
export function uniformSampling<T extends DataPoint>(data: T[], targetPoints: number): T[] {
	if (data.length <= targetPoints) return data;

	const step = data.length / targetPoints;
	const sampled: T[] = [];

	for (let i = 0; i < targetPoints; i++) {
		const index = Math.round(i * step);
		if (index < data.length) {
			sampled.push(data[index]);
		}
	}

	// Always include first and last points
	if (sampled.length > 0) {
		sampled[0] = data[0];
		sampled[sampled.length - 1] = data[data.length - 1];
	}

	return sampled;
}

/**
 * 2. PEAK-PRESERVING SAMPLING
 * Detects and preserves local maxima and minima
 * Best for: Volatile data with important peaks/valleys
 */
export function peaksSampling<T extends DataPoint>(
	data: T[],
	targetPoints: number,
	yKey: string = 'value'
): T[] {
	if (data.length <= targetPoints || data.length <= 3) return data;

	const peaks: { index: number; importance: number }[] = [];

	// Find local peaks and valleys
	for (let i = 1; i < data.length - 1; i++) {
		const prev = Number(data[i - 1][yKey]);
		const curr = Number(data[i][yKey]);
		const next = Number(data[i + 1][yKey]);

		const isPeak = curr > prev && curr > next;
		const isValley = curr < prev && curr < next;

		if (isPeak || isValley) {
			const importance = Math.abs(curr - (prev + next) / 2);
			peaks.push({ index: i, importance });
		}
	}

	// Sort by importance and select top peaks
	peaks.sort((a, b) => b.importance - a.importance);
	const selectedIndices = new Set([0, data.length - 1]);

	const availableSlots = targetPoints - 2;
	for (let i = 0; i < Math.min(peaks.length, availableSlots); i++) {
		selectedIndices.add(peaks[i].index);
	}

	// Fill remaining slots with uniform sampling
	if (selectedIndices.size < targetPoints) {
		const remaining = targetPoints - selectedIndices.size;
		const step = data.length / remaining;

		for (let i = 1; i < remaining; i++) {
			const index = Math.round(i * step);
			if (!selectedIndices.has(index)) {
				selectedIndices.add(index);
			}
		}
	}

	const sortedIndices = Array.from(selectedIndices).sort((a, b) => a - b);
	return sortedIndices.map((i) => data[i]);
}

/**
 * 3. DOUGLAS-PEUCKER ALGORITHM
 * Recursively simplifies lines by removing points that don't significantly change shape
 * Best for: Geographic data, maintaining visual accuracy
 */
export function douglasPeuckerSampling(points: Point2D[], epsilon: number = 1.0): Point2D[] {
	if (points.length <= 2) return points;

	// Find the point with maximum distance from line segment
	let maxDistance = 0;
	let maxIndex = 0;
	const start = points[0];
	const end = points[points.length - 1];

	for (let i = 1; i < points.length - 1; i++) {
		const distance = perpendicularDistance(points[i], start, end);
		if (distance > maxDistance) {
			maxDistance = distance;
			maxIndex = i;
		}
	}

	if (maxDistance > epsilon) {
		// Recursive call on both segments
		const left = douglasPeuckerSampling(points.slice(0, maxIndex + 1), epsilon);
		const right = douglasPeuckerSampling(points.slice(maxIndex), epsilon);

		// Combine results (remove duplicate middle point)
		return [...left.slice(0, -1), ...right];
	} else {
		// All points between start and end can be removed
		return [start, end];
	}
}

function perpendicularDistance(point: Point2D, lineStart: Point2D, lineEnd: Point2D): number {
	const A = lineEnd.x - lineStart.x;
	const B = lineEnd.y - lineStart.y;
	const C = point.x - lineStart.x;
	const D = point.y - lineStart.y;

	const dot = A * C + B * D;
	const lenSq = A * A + B * B;

	if (lenSq === 0) return Math.sqrt(C * C + D * D);

	const param = dot / lenSq;

	let xx: number, yy: number;

	if (param < 0) {
		xx = lineStart.x;
		yy = lineStart.y;
	} else if (param > 1) {
		xx = lineEnd.x;
		yy = lineEnd.y;
	} else {
		xx = lineStart.x + param * A;
		yy = lineStart.y + param * B;
	}

	const dx = point.x - xx;
	const dy = point.y - yy;
	return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 4. VISVALINGAM-WHYATT ALGORITHM
 * Removes points with smallest "effective area"
 * Best for: Time series with varying detail levels
 */
export function visvalingamSampling(points: Point2D[], targetPoints: number): Point2D[] {
	if (points.length <= targetPoints) return points;

	const areas = calculateTriangleAreas(points);
	const pointsWithArea = points.map((point, index) => ({
		point,
		area: areas[index] || Infinity,
		index
	}));

	// Sort by area (smallest first) but keep first and last
	const removable = pointsWithArea.slice(1, -1).sort((a, b) => a.area - b.area);
	const toRemove = points.length - targetPoints;

	const removeIndices = new Set(removable.slice(0, toRemove).map((item) => item.index));

	return points.filter((_, index) => !removeIndices.has(index));
}

function calculateTriangleAreas(points: Point2D[]): number[] {
	const areas: number[] = [];

	for (let i = 0; i < points.length; i++) {
		if (i === 0 || i === points.length - 1) {
			areas[i] = Infinity; // Never remove first or last point
		} else {
			const p1 = points[i - 1];
			const p2 = points[i];
			const p3 = points[i + 1];
			areas[i] = Math.abs((p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2);
		}
	}

	return areas;
}

/**
 * 5. LARGEST TRIANGLE THREE BUCKETS (LTTB)
 * Divides data into buckets and selects points that form largest triangles
 * Best for: High-frequency time series visualization
 */
export function lttbSampling<T extends DataPoint>(
	data: T[],
	targetPoints: number,
	xKey: string = 'x',
	yKey: string = 'y'
): T[] {
	if (data.length <= targetPoints || targetPoints <= 2) return data;

	const sampled: T[] = [];
	const bucketSize = (data.length - 2) / (targetPoints - 2);

	// Always include first point
	sampled.push(data[0]);

	let bucketStart = 1;

	for (let i = 1; i < targetPoints - 1; i++) {
		const bucketEnd = Math.floor((i + 1) * bucketSize) + 1;

		// Calculate average point for next bucket
		let avgX = 0,
			avgY = 0;
		const avgRangeStart = Math.floor((i + 1) * bucketSize) + 1;
		let avgRangeEnd = Math.floor((i + 2) * bucketSize) + 1;
		avgRangeEnd = Math.min(avgRangeEnd, data.length);

		const avgRangeLength = avgRangeEnd - avgRangeStart;

		for (let j = avgRangeStart; j < avgRangeEnd; j++) {
			avgX += Number(data[j][xKey]);
			avgY += Number(data[j][yKey]);
		}
		avgX /= avgRangeLength;
		avgY /= avgRangeLength;

		// Find point in current bucket that forms largest triangle
		let maxArea = -1;
		let maxAreaPoint = data[bucketStart];

		for (let j = bucketStart; j < bucketEnd; j++) {
			const area = Math.abs(
				(Number(sampled[sampled.length - 1][xKey]) - avgX) *
					(Number(data[j][yKey]) - Number(sampled[sampled.length - 1][yKey])) -
					(Number(sampled[sampled.length - 1][xKey]) - Number(data[j][xKey])) *
						(avgY - Number(sampled[sampled.length - 1][yKey]))
			);

			if (area > maxArea) {
				maxArea = area;
				maxAreaPoint = data[j];
			}
		}

		sampled.push(maxAreaPoint);
		bucketStart = bucketEnd;
	}

	// Always include last point
	sampled.push(data[data.length - 1]);

	return sampled;
}

/**
 * 6. ADAPTIVE SAMPLING
 * Samples more densely where data changes rapidly
 * Best for: Mixed smooth/volatile regions
 */
export function adaptiveSampling<T extends DataPoint>(
	data: T[],
	targetPoints: number,
	yKey: string = 'value'
): T[] {
	if (data.length <= targetPoints) return data;

	// Calculate rate of change (slopes)
	const slopes: number[] = [];
	for (let i = 0; i < data.length - 1; i++) {
		const dy = Number(data[i + 1][yKey]) - Number(data[i][yKey]);
		slopes.push(Math.abs(dy));
	}

	// Calculate weights based on slopes
	const weights = slopes.map((slope) => slope + 0.1); // Add small base weight
	const totalWeight = weights.reduce((sum, w) => sum + w, 0);

	// Distribute points based on weights
	const sampled: T[] = [data[0]]; // Always include first
	let cumulativeWeight = 0;
	let nextThreshold = totalWeight / (targetPoints - 1);

	for (let i = 1; i < data.length - 1; i++) {
		cumulativeWeight += weights[i - 1];

		if (cumulativeWeight >= nextThreshold) {
			sampled.push(data[i]);
			nextThreshold += totalWeight / (targetPoints - 1);
		}
	}

	sampled.push(data[data.length - 1]); // Always include last

	return sampled;
}

/**
 * 7. HYBRID SAMPLING
 * Combines multiple algorithms based on data characteristics
 * Best for: General purpose, unknown data patterns
 */
export function hybridSampling<T extends DataPoint>(
	data: T[],
	targetPoints: number,
	yKey: string = 'value'
): T[] {
	if (data.length <= targetPoints) return data;

	// Analyze data characteristics
	const values = data.map((d) => Number(d[yKey]));
	const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
	const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
	const standardDeviation = Math.sqrt(variance);
	const coefficientOfVariation = standardDeviation / Math.abs(mean);

	// Choose algorithm based on data characteristics
	if (coefficientOfVariation < 0.2) {
		// Low volatility: use uniform sampling
		return uniformSampling(data, targetPoints);
	} else if (coefficientOfVariation > 0.8) {
		// High volatility: use peak-preserving
		return peaksSampling(data, targetPoints, yKey);
	} else {
		// Medium volatility: use LTTB
		return lttbSampling(data, targetPoints, 'x', yKey);
	}
}

/**
 * Main sampling function with configurable algorithm
 */
export function sampleData<T extends DataPoint>(data: T[], config: SamplingConfig): T[] {
	const { algorithm, targetPoints, epsilon = 1.0, xKey = 'x', yKey = 'value' } = config;

	switch (algorithm) {
		case 'uniform':
			return uniformSampling(data, targetPoints);

		case 'peaks':
			return peaksSampling(data, targetPoints, yKey);

		case 'douglasPeucker': {
			// Convert to Point2D format
			const points2D = data.map((d) => ({ x: Number(d[xKey]), y: Number(d[yKey]) }));
			const sampled2D = douglasPeuckerSampling(points2D, epsilon);
			// Convert back to original format (simplified - you might need more sophisticated mapping)
			return sampled2D.map((p) => ({ ...data[0], [xKey]: p.x, [yKey]: p.y })) as T[];
		}

		case 'visvalingam': {
			const pointsVW = data.map((d) => ({ x: Number(d[xKey]), y: Number(d[yKey]) }));
			const sampledVW = visvalingamSampling(pointsVW, targetPoints);
			return sampledVW.map((p) => ({ ...data[0], [xKey]: p.x, [yKey]: p.y })) as T[];
		}

		case 'lttb':
			return lttbSampling(data, targetPoints, xKey, yKey);

		case 'adaptive':
			return adaptiveSampling(data, targetPoints, yKey);

		case 'hybrid':
		default:
			return hybridSampling(data, targetPoints, yKey);
	}
}

/**
 * Utility function to calculate data volatility
 */
export function calculateVolatility<T extends DataPoint>(
	data: T[],
	yKey: string = 'value'
): number {
	if (data.length < 2) return 0;

	const values = data.map((d) => Number(d[yKey]));
	const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
	const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
	const standardDeviation = Math.sqrt(variance);

	return standardDeviation / Math.abs(mean); // Coefficient of variation
}

/**
 * Performance benchmarking utility
 */
export function benchmarkSampling<T extends DataPoint>(
	data: T[],
	algorithms: SamplingAlgorithm[],
	targetPoints: number
): Record<SamplingAlgorithm, { time: number; points: number }> {
	const results: Record<SamplingAlgorithm, { time: number; points: number }> = {} as Record<SamplingAlgorithm, { time: number; points: number }>;

	algorithms.forEach((algorithm) => {
		const start = performance.now();
		const sampled = sampleData(data, { algorithm, targetPoints });
		const end = performance.now();

		results[algorithm] = {
			time: end - start,
			points: sampled.length
		};
	});

	return results;
}
