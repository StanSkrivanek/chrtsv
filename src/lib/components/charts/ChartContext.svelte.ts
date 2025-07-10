// src/lib/charts/ChartContext.svelte.ts
import { getContext, setContext } from 'svelte';
import type {
	ChartDataPoint,
	ChartConfig,
	ProcessedChartData,
	ChartRegistration,
	ScaleFunction,
	ChartPoint
} from './types/chart.js';
import { createLinearScale, createTimeScale } from './utils/scale.js';
import { debounce, isValidNumber, isValidDate, deepFreeze, createId } from './utils/helpers.js';
import { DEFAULT_CHART_CONFIG } from './types/chart.js';

interface ChartCache {
	readonly key: string;
	readonly data: ProcessedChartData;
	readonly timestamp: number;
}

export class ChartContextManager {
	private readonly _dataCache = new Map<string, ChartCache>();
	private readonly _registeredCharts = new Map<string, ChartRegistration>();
	private _resizeObserver: ResizeObserver | null = null;
	private readonly _maxCacheSize = 10;
	private readonly _cacheExpiry = 5 * 60 * 1000; // 5 minutes

	// Reactive state
	private _config = $state<ChartConfig>(DEFAULT_CHART_CONFIG);
	private _data = $state<readonly ChartDataPoint[]>([]);
	private _isProcessing = $state<boolean>(false);
	private _error = $state<Error | null>(null);

	// ✅ FIXED: Use $derived.by() to get actual value, not function
	private _processedData = $derived.by(() => {
		try {
			this._error = null;
			return this._computeProcessedData();
		} catch (error) {
			this._error = error instanceof Error ? error : new Error('Unknown processing error');
			console.error('Chart processing error:', this._error);
			return null;
		}
	});

	// ✅ FIXED: Now getter returns the actual value
	public get processedData(): ProcessedChartData | null {
		return this._processedData;
	}

	public readonly isReady = $derived.by(() => {
		return this._data.length > 0 && !this._isProcessing && this._error === null;
	});

	constructor(initialConfig?: Partial<ChartConfig>) {
		if (initialConfig) {
			this.updateConfig(initialConfig);
		}

		this._initializeResizeObserver();
		this._startCacheCleanup();
	}

	private _initializeResizeObserver(): void {
		if (typeof window === 'undefined') return;

		try {
			this._resizeObserver = new ResizeObserver(
				debounce(() => {
					this._clearCache();
					this._notifyChartsOfResize();
				}, this._config.debounceMs)
			);
		} catch (error) {
			console.warn('ResizeObserver not supported:', error);
		}
	}

	private _startCacheCleanup(): void {
		if (typeof window === 'undefined') return;

		setInterval(() => {
			this._cleanExpiredCache();
		}, 60000); // Clean every minute
	}

	private _cleanExpiredCache(): void {
		const now = Date.now();
		const expiredKeys: string[] = [];

		for (const [key, cache] of this._dataCache) {
			if (now - cache.timestamp > this._cacheExpiry) {
				expiredKeys.push(key);
			}
		}

		expiredKeys.forEach((key) => this._dataCache.delete(key));
	}

	private _computeProcessedData(): ProcessedChartData | null {
		if (this._data.length === 0) return null;

		const cacheKey = this._generateCacheKey();
		const cached = this._dataCache.get(cacheKey);

		if (cached && Date.now() - cached.timestamp < this._cacheExpiry) {
			return cached.data;
		}

		this._isProcessing = true;

		try {
			const processed = this._processData();

			// Store in cache
			this._dataCache.set(cacheKey, {
				key: cacheKey,
				data: processed,
				timestamp: Date.now()
			});

			// Limit cache size
			if (this._dataCache.size > this._maxCacheSize) {
				const oldestKey = this._dataCache.keys().next().value;
				if (oldestKey) this._dataCache.delete(oldestKey);
			}

			return processed;
		} finally {
			this._isProcessing = false;
		}
	}

	private _generateCacheKey(): string {
		return JSON.stringify({
			data: this._data,
			config: this._config,
			registrations: Array.from(this._registeredCharts.keys())
		});
	}

	private _processData(): ProcessedChartData {
		const data = this._data;
		const { dimensions } = this._config;
		const { width, height, margin } = dimensions;

		// Extract all numeric keys for Y domain calculation
		const numericKeys = this._getNumericKeys(data);
		if (numericKeys.length === 0) {
			throw new Error('No numeric data found for chart rendering');
		}

		// Calculate domains
		const xDomain = this._calculateXDomain(data);
		const yDomain = this._calculateYDomain(data, numericKeys);

		// Create scales
		const xRange: readonly [number, number] = [margin.left, width - margin.right];
		const yRange: readonly [number, number] = [height - margin.bottom, margin.top];

		const xScale = this._createXScale(xDomain, xRange);
		const yScale = createLinearScale(yDomain, yRange);

		// Generate points (this will be used by individual charts)
		const points: ChartPoint[] = [];
		const pathSegments: string[] = [];

		data.forEach((point, index) => {
			try {
				const xValue = this._getXValue(point, index);
				const x = xScale(xValue);

				// This is a placeholder - individual charts will calculate their own Y values
				const y = margin.top + (height - margin.top - margin.bottom) / 2;

				points.push({
					x,
					y,
					value: 0, // Will be overridden by individual charts
					originalData: point
				});

				pathSegments.push(index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
			} catch (error) {
				console.warn(`Skipping data point at index ${index}:`, error);
			}
		});

		return deepFreeze({
			scaledData: data,
			xScale,
			yScale,
			xDomain,
			yDomain,
			pathData: pathSegments.join(' '),
			points
		});
	}

	private _getNumericKeys(data: readonly ChartDataPoint[]): string[] {
		if (data.length === 0) return [];

		const sample = data[0];
		return Object.keys(sample).filter((key) => {
			const value = sample[key];
			return isValidNumber(value);
		});
	}

	private _calculateXDomain(
		data: readonly ChartDataPoint[]
	): readonly [string | number | Date, string | number | Date] {
		if (data.length === 0) throw new Error('Cannot calculate X domain for empty data');

		// Try to find a date field first, then fall back to index
		const firstPoint = data[0];
		const dateKey = Object.keys(firstPoint).find((key) => {
			const value = firstPoint[key];
			return isValidDate(value) || (typeof value === 'string' && !isNaN(Date.parse(value)));
		});

		if (dateKey) {
			const dates = data
				.map((d) => {
					const value = d[dateKey];
					return isValidDate(value) ? value : new Date(value as string);
				})
				.filter(isValidDate);

			if (dates.length > 0) {
				return [dates[0], dates[dates.length - 1]];
			}
		}

		// Fall back to numeric indices
		return [0, data.length - 1];
	}

	private _calculateYDomain(
		data: readonly ChartDataPoint[],
		numericKeys: string[]
	): readonly [number, number] {
		const allValues: number[] = [];

		data.forEach((point) => {
			numericKeys.forEach((key) => {
				const value = point[key];
				if (isValidNumber(value)) {
					allValues.push(value);
				}
			});
		});

		if (allValues.length === 0) {
			throw new Error('No valid numeric values found for Y domain calculation');
		}

		const min = Math.min(...allValues);
		const max = Math.max(...allValues);

		// Add 10% padding
		const padding = (max - min) * 0.1;
		return [Math.max(0, min - padding), max + padding];
	}

	private _createXScale(
		domain: readonly [string | number | Date, string | number | Date],
		range: readonly [number, number]
	): ScaleFunction<string | number | Date> {
		const [start, end] = domain;

		if (isValidDate(start) && isValidDate(end)) {
			return createTimeScale([start, end], range) as ScaleFunction<string | number | Date>;
		}

		if (isValidNumber(start) && isValidNumber(end)) {
			return createLinearScale([start, end], range) as ScaleFunction<string | number | Date>;
		}

		// String-based scale (treat as ordinal with numeric mapping)
		return createLinearScale([0, 1], range) as ScaleFunction<string | number | Date>;
	}

	private _getXValue(point: ChartDataPoint, index: number): string | number | Date {
		// Try to find a suitable X value
		const dateKey = Object.keys(point).find((key) => {
			const value = point[key];
			return isValidDate(value) || (typeof value === 'string' && !isNaN(Date.parse(value)));
		});

		if (dateKey) {
			const value = point[dateKey];
			return isValidDate(value) ? value : new Date(value as string);
		}

		return index;
	}

	private _clearCache(): void {
		this._dataCache.clear();
	}

	private _notifyChartsOfResize(): void {
		// Individual charts will handle their own resize logic
		// This is just a notification mechanism
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent('chart-resize'));
		}
	}

	// Public API
	public setData(newData: readonly ChartDataPoint[]): void {
		if (!Array.isArray(newData)) {
			throw new Error('Chart data must be an array');
		}

		this._data = deepFreeze([...newData]);
		this._clearCache();
	}

	public updateConfig(newConfig: Partial<ChartConfig>): void {
		this._config = deepFreeze({
			...this._config,
			...newConfig,
			dimensions: { ...this._config.dimensions, ...newConfig.dimensions },
			theme: { ...this._config.theme, ...newConfig.theme }
		});
		this._clearCache();
	}

	public registerChart(registration: Omit<ChartRegistration, 'id'>): string {
		const id = createId();
		const fullRegistration: ChartRegistration = { ...registration, id };

		this._registeredCharts.set(id, fullRegistration);

		if (this._resizeObserver && registration.element) {
			this._resizeObserver.observe(registration.element);
		}

		return id;
	}

	public unregisterChart(id: string): void {
		const registration = this._registeredCharts.get(id);

		if (registration) {
			if (this._resizeObserver && registration.element) {
				this._resizeObserver.unobserve(registration.element);
			}
			this._registeredCharts.delete(id);
		}
	}

	public getConfig(): ChartConfig {
		return this._config;
	}

	public getData(): readonly ChartDataPoint[] {
		return this._data;
	}

	public getError(): Error | null {
		return this._error;
	}

	public getRegisteredCharts(): ReadonlyMap<string, ChartRegistration> {
		return new Map(this._registeredCharts);
	}

	// Public method to get chart-specific configurations
	public getChartConfig(chartId: string): ChartRegistration['config'] | null {
		const registration = this._registeredCharts.get(chartId);
		return registration?.config || null;
	}

	// Public method to update chart-specific config
	public updateChartConfig(chartId: string, newConfig: Partial<ChartRegistration['config']>): void {
		const registration = this._registeredCharts.get(chartId);
		if (registration) {
			const updatedRegistration: ChartRegistration = {
				...registration,
				config: { ...registration.config, ...newConfig }
			};
			this._registeredCharts.set(chartId, updatedRegistration);
		}
	}

	// Get all chart configs for bulk operations
	public getAllChartConfigs(): Map<string, ChartRegistration['config']> {
		const configs = new Map<string, ChartRegistration['config']>();
		for (const [id, registration] of this._registeredCharts) {
			configs.set(id, registration.config);
		}
		return configs;
	}

	public destroy(): void {
		this._resizeObserver?.disconnect();
		this._resizeObserver = null;
		this._clearCache();
		this._registeredCharts.clear();
	}
}

const CHART_CONTEXT_KEY = 'chart-context' as const;

export function createChartContext(
	initialData?: readonly ChartDataPoint[],
	initialConfig?: Partial<ChartConfig>
): ChartContextManager {
	const manager = new ChartContextManager(initialConfig);

	if (initialData) {
		manager.setData(initialData);
	}

	setContext(CHART_CONTEXT_KEY, manager);
	return manager;
}

export function getChartContext(): ChartContextManager {
	const context = getContext<ChartContextManager>(CHART_CONTEXT_KEY);
	if (!context) {
		throw new Error('Chart context not found. Make sure to wrap your charts with ChartProvider.');
	}
	return context;
}

// Function to process line chart specific data
export function processLineChartData(
	processedData: ProcessedChartData,
	dataKey: string,
	config: ChartConfig
): {
	readonly pathData: string;
	readonly points: readonly ChartPoint[];
} {
	const { scaledData, xScale, yScale } = processedData;

	const points: ChartPoint[] = [];
	const pathSegments: string[] = [];

	// Helper function to safely get X coordinate
	const getXCoordinate = (point: ChartDataPoint, index: number): number => {
		try {
			// Try to find a date field first
			const dateKey = Object.keys(point).find((key) => {
				const val = point[key];
				return isValidDate(val) || (typeof val === 'string' && !isNaN(Date.parse(val)));
			});

			if (dateKey) {
				const dateValue = point[dateKey];
				if (isValidDate(dateValue)) {
					return (xScale as ScaleFunction<Date>)(dateValue);
				} else if (typeof dateValue === 'string' && !isNaN(Date.parse(dateValue))) {
					return (xScale as ScaleFunction<Date>)(new Date(dateValue));
				}
			}

			// Try numeric value (excluding the dataKey we're already using for Y)
			const numericKey = Object.keys(point).find(
				(key) => isValidNumber(point[key]) && key !== dataKey
			);
			if (numericKey) {
				return (xScale as ScaleFunction<number>)(point[numericKey] as number);
			}

			// Fallback to index
			return (xScale as ScaleFunction<number>)(index);
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			// Manual fallback calculation
			const margin = config.dimensions.margin;
			return (
				margin.left +
				(index / Math.max(1, scaledData.length - 1)) *
					(config.dimensions.width - margin.left - margin.right)
			);
		}
	};

	scaledData.forEach((point, index) => {
		const value = point[dataKey];

		if (!isValidNumber(value)) {
			return; // Skip invalid points
		}

		const x = getXCoordinate(point, index);
		const y = yScale(value);

		const chartPoint: ChartPoint = {
			x,
			y,
			value,
			originalData: point
		};

		points.push(chartPoint);
		pathSegments.push(index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
	});

	return deepFreeze({
		pathData: pathSegments.join(' '),
		points
	});
}
