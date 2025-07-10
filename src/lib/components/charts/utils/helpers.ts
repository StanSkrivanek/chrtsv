// File: src/lib/components/charts/utils/helpers.ts

/**
 * Throttle function that limits how often a function can be called
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
	func: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timeoutId: number | null = null;
	let lastExecTime = 0;

	return (...args: Parameters<T>) => {
		const currentTime = Date.now();

		if (currentTime - lastExecTime > delay) {
			func(...args);
			lastExecTime = currentTime;
		} else {
			if (timeoutId) clearTimeout(timeoutId);
			timeoutId = setTimeout(
				() => {
					func(...args);
					lastExecTime = Date.now();
				},
				delay - (currentTime - lastExecTime)
			);
		}
	};
}

/**
 * Debounce function that delays execution until after wait time
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
	func: T,
	wait: number,
	immediate: boolean = false
): (...args: Parameters<T>) => void {
	let timeout: number | null = null;

	return (...args: Parameters<T>) => {
		const callNow = immediate && !timeout;

		if (timeout) clearTimeout(timeout);

		timeout = setTimeout(() => {
			timeout = null;
			if (!immediate) func(...args);
		}, wait);

		if (callNow) func(...args);
	};
}

/**
 * Memoization function with LRU cache
 */
export function memoize<T extends (...args: unknown[]) => unknown>(fn: T, maxSize: number = 100): T {
	const cache = new Map();
	const accessOrder: string[] = [];

	return ((...args: Parameters<T>) => {
		const key = JSON.stringify(args);

		if (cache.has(key)) {
			// Move to end (most recently used)
			const index = accessOrder.indexOf(key);
			if (index > -1) {
				accessOrder.splice(index, 1);
			}
			accessOrder.push(key);
			return cache.get(key);
		}

		const result = fn(...args);

		// Add to cache
		cache.set(key, result);
		accessOrder.push(key);

		// Remove least recently used if over limit
		if (cache.size > maxSize) {
			const lruKey = accessOrder.shift();
			cache.delete(lruKey);
		}

		return result;
	}) as T;
}

/**
 * Binary search for finding nearest value in sorted array
 */
export function binarySearchNearest<T>(
	array: T[],
	target: number,
	getValue: (item: T, index: number) => number
): number {
	let left = 0;
	let right = array.length - 1;
	let closest = 0;
	let minDistance = Infinity;

	while (left <= right) {
		const mid = Math.floor((left + right) / 2);
		const midValue = getValue(array[mid], mid);
		const distance = Math.abs(target - midValue);

		if (distance < minDistance) {
			minDistance = distance;
			closest = mid;
		}

		if (midValue < target) {
			left = mid + 1;
		} else {
			right = mid - 1;
		}
	}

	return closest;
}

/**
 * Format numbers for display
 */
export function formatNumber(
	value: number,
	options: {
		decimals?: number;
		useAbbreviation?: boolean;
		locale?: string;
	} = {}
): string {
	const { decimals = 1, useAbbreviation = true, locale = 'en-US' } = options;

	if (!useAbbreviation) {
		return new Intl.NumberFormat(locale, {
			minimumFractionDigits: 0,
			maximumFractionDigits: decimals
		}).format(value);
	}

	const abs = Math.abs(value);
	const sign = value < 0 ? '-' : '';

	if (abs >= 1000000000) {
		return sign + (abs / 1000000000).toFixed(decimals) + 'B';
	} else if (abs >= 1000000) {
		return sign + (abs / 1000000).toFixed(decimals) + 'M';
	} else if (abs >= 1000) {
		return sign + (abs / 1000).toFixed(decimals) + 'k';
	} else {
		return sign + abs.toFixed(decimals);
	}
}

/**
 * Generate contrasting color for text on background
 */
export function getContrastColor(hexColor: string): string {
	// Remove # if present
	const color = hexColor.replace('#', '');

	// Convert to RGB
	const r = parseInt(color.substr(0, 2), 16);
	const g = parseInt(color.substr(2, 2), 16);
	const b = parseInt(color.substr(4, 2), 16);

	// Calculate luminance
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

	return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Generate accessible color palette
 */
export function generateAccessibleColors(count: number): string[] {
	const baseColors = [
		'#1f77b4',
		'#ff7f0e',
		'#2ca02c',
		'#d62728',
		'#9467bd',
		'#8c564b',
		'#e377c2',
		'#7f7f7f',
		'#bcbd22',
		'#17becf',
		'#aec7e8',
		'#ffbb78'
	];

	if (count <= baseColors.length) {
		return baseColors.slice(0, count);
	}

	// Generate additional colors using HSL
	const colors = [...baseColors];
	const hueStep = 360 / (count - baseColors.length);

	for (let i = baseColors.length; i < count; i++) {
		const hue = (i - baseColors.length) * hueStep;
		const saturation = 70 + (i % 3) * 10; // 70-90%
		const lightness = 45 + (i % 2) * 10; // 45-55%
		colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
	}

	return colors;
}

/**
 * Check if device supports touch
 */
export function isTouchDevice(): boolean {
	if (typeof window === 'undefined') return false;

	return (
		'ontouchstart' in window ||
		navigator.maxTouchPoints > 0 ||
		('msMaxTouchPoints' in navigator && ((navigator as unknown) as {msMaxTouchPoints: number}).msMaxTouchPoints > 0)
	);
}

/**
 * Get device pixel ratio safely
 */
export function getDevicePixelRatio(): number {
	if (typeof window === 'undefined') return 1;
	return window.devicePixelRatio || 1;
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, factor: number): number {
	return start + (end - start) * factor;
}

/**
 * Check if point is inside rectangle
 */
export function isPointInRect(
	point: { x: number; y: number },
	rect: { x: number; y: number; width: number; height: number }
): boolean {
	return (
		point.x >= rect.x &&
		point.x <= rect.x + rect.width &&
		point.y >= rect.y &&
		point.y <= rect.y + rect.height
	);
}

/**
 * Calculate distance between two points
 */
export function distance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
	const dx = p2.x - p1.x;
	const dy = p2.y - p1.y;
	return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Sample array by taking every nth element
 */
export function sampleArray<T>(array: T[], sampleRate: number): T[] {
	if (sampleRate <= 1) return array;

	const sampled: T[] = [];
	for (let i = 0; i < array.length; i += sampleRate) {
		sampled.push(array[i]);
	}

	// Always include the last element
	if (array.length > 0 && sampled[sampled.length - 1] !== array[array.length - 1]) {
		sampled.push(array[array.length - 1]);
	}

	return sampled;
}

/**
 * Deep clone object (simple implementation)
 */
export function deepClone<T>(obj: T): T {
	if (obj === null || typeof obj !== 'object') return obj;
	if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
	if (obj instanceof Array) return obj.map((item) => deepClone(item)) as unknown as T;
	if (typeof obj === 'object') {
		const cloned = {} as Record<string, unknown>;
		for (const key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				cloned[key] = deepClone(obj[key as keyof T]);
			}
		}
		return cloned as T;
	}
	return obj;
}
