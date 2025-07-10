// File: src/lib/components/charts/types/chart.types.ts

export interface LineData {
	id: string;
	label: string;
	data: Array<Record<string, any>>;
	color: string;
}

export interface TooltipData {
	x: number;
	y: number;
	value: any;
	label: string;
	lineLabel: string;
	color: string;
}

export interface CrosshairData {
	x: number;
	y: number;
	xLabel: string;
	values: Array<{
		lineId: string;
		lineLabel: string;
		value: any;
		color: string;
		y: number;
	}>;
}

export interface ProcessedChartData {
	allXValues: string[];
	allYValues: number[];
	yMin: number;
	yMax: number;
	xScale: (idx: number) => number;
	yScale: (val: number) => number;
	hasNegativeValues: boolean;
	yTicks: number[];
}

export interface ChartPerformanceConfig {
	// Thresholds for different rendering modes
	svgMaxPoints: number; // Default: 1000
	animationMaxPoints: number; // Default: 500
	tooltipMaxPoints: number; // Default: 2000

	// Optimization settings
	enableMemoization: boolean; // Default: true
	enableWebWorkers: boolean; // Default: true
	enableDataSampling: boolean; // Default: true

	// Event throttling
	mouseMoveThrottle: number; // Default: 16ms (60fps)
	resizeDebounce: number; // Default: 150ms

	// Cache settings
	maxCacheEntries: number; // Default: 50
	enablePathCache: boolean; // Default: true

	// Canvas settings
	devicePixelRatio: number; // Default: window.devicePixelRatio
	canvasSmoothing: boolean; // Default: true
}

export type PerformanceMode = 'svg-full' | 'svg-no-animation' | 'canvas';

export type CurveType = 'straight' | 'smooth';
