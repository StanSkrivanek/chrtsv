export interface ChartDataPoint {
	[key: string]: string | number | Date | null | undefined;
}

export interface ChartMargin {
	readonly top: number;
	readonly right: number;
	readonly bottom: number;
	readonly left: number;
}

export interface ChartDimensions {
	readonly width: number;
	readonly height: number;
	readonly margin: ChartMargin;
}

export interface ChartTheme {
	readonly backgroundColor: string;
	readonly gridColor: string;
	readonly textColor: string;
	readonly colors: readonly string[];
}

export interface ChartConfig {
	readonly dimensions: ChartDimensions;
	readonly theme: ChartTheme;
	readonly animationDuration: number;
	readonly enableAnimations: boolean;
	readonly debounceMs: number;
}

export interface ScaleFunction<T = number> {
	(value: T): number; // The scale function itself - callable as a function
	domain(): readonly [T, T];
	range(): readonly [number, number];
}

export interface ProcessedChartData {
	readonly scaledData: readonly ChartDataPoint[];
	readonly xScale: ScaleFunction<string | number | Date>;
	readonly yScale: ScaleFunction<number>;
	readonly xDomain: readonly [string | number | Date, string | number | Date];
	readonly yDomain: readonly [number, number];
	readonly pathData: string;
	readonly points: readonly ChartPoint[];
}

export interface ChartPoint {
	readonly x: number;
	readonly y: number;
	readonly value: number;
	readonly originalData: ChartDataPoint;
}

export interface ChartRegistration {
	readonly id: string;
	readonly element: HTMLElement | SVGElement;
	readonly dataKey: string;
	config: {
		readonly color?: string;
		readonly strokeWidth?: number;
		readonly showDots?: boolean;
		readonly animate?: boolean;
		readonly dotRadius?: number;
		readonly curve?: 'linear' | 'smooth';
	};
}

export interface LineChartProps {
	readonly dataKey: string;
	readonly color?: string;
	readonly strokeWidth?: number;
	readonly showDots?: boolean;
	readonly animate?: boolean;
	readonly dotRadius?: number;
	readonly curve?: 'linear' | 'smooth';
	readonly onPointClick?: (point: ChartPoint, event: MouseEvent) => void;
	readonly onPointHover?: (point: ChartPoint | null, event: MouseEvent) => void;
	readonly ariaLabel?: string;
}

export const DEFAULT_CHART_CONFIG: ChartConfig = {
	dimensions: {
		width: 400,
		height: 300,
		margin: { top: 20, right: 30, bottom: 40, left: 50 }
	},
	theme: {
		backgroundColor: '#ffffff',
		gridColor: '#f0f0f0',
		textColor: '#374151',
		colors: ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0']
	},
	animationDuration: 300,
	enableAnimations: true,
	debounceMs: 100
} as const;
