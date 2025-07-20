
type ChartCategory = "comparison" | "correlation" | "hierarchical" | "temporal" | "distribution" | "geospatial" | "partToWhole" | "flow" | "multivariate";
type Comparison =
	| 'bar'
	| 'groupedBar'
	| 'radialBar'
	| 'column'
	| 'groupedColumn'
	| 'stackedColumn'
	| 'lollipop'
	| 'bullet'
	| 'dot'
	| 'dumbbell'
	| 'pictogram'
	| 'icon'
	| 'range'
	| 'paralelCoordinates'
	| 'radar'
	| 'nightingnale'
	| 'waterfall'
	| 'matrix'
	| 'slopeGraph'
	| 'table'
	| 'categoricalScatter'
	| 'quadrant';
type Correlation = "heatmap"| "scatter" | "bubble" | "connectedScatterPlot" | "hexagonicalBin" | "contour" | "correlationMatrix" | "pairPlot" | "parallelCoordinates" | "correlationHeatmap"; 
type Hierarchical = 'stackedBar'| "tree" | "treemap" | "sunburst";
type Temporal = "line" | "area" | "bar" | "scatter";
type Distribution = "histogram" | "boxplot" | "violin";			
type ChartType =
	| 'line'
	| 'bar'
	| 'area'
	| 'scatter'
	| 'pie'
	| 'radar'
	| 'bubble'
	| 'heatmap'
	| 'treemap'
	| 'funnel'
	| 'gauge'
	| 'polar'
	| 'sankey'
	| 'waterfall'
	| 'boxplot'
	| 'candlestick'
	| 'violin'
	| 'radialBar'
	| 'donut'
	| 'polarArea'
	| 'radarLine'
	| 'multiLine'
	| 'stackedBar'
	| 'stackedArea'
	| 'stackedColumn'
	| 'stackedLine';

export interface ChartConfig {
	type: ChartType;
	title?: string;
	subtitle?: string;
	xAxisLabel?: string;
	yAxisLabel?: string;
	tooltipEnabled?: boolean;
	crosshairEnabled?: boolean;
	legendEnabled?: boolean;
	animationEnabled?: boolean;
	theme?: 'light' | 'dark';
	performanceMode?: PerformanceMode;
	curveType?: CurveType;
}
export interface ChartData {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[seriesId: string]: Array<Record<string, any>>;
}
export interface ChartOptions {
	width?: number; // Width of the chart
	height?: number; // Height of the chart
	margin?: {
		top?: number;
		right?: number;
		bottom?: number;
		left?: number;
	};
	padding?: {
		top?: number;
		right?: number;
		bottom?: number;
		left?: number;
	};
	backgroundColor?: string; // Background color of the chart
	fontFamily?: string; // Font family for text elements
	fontSize?: string; // Font size for text elements
}

export interface ChartSeries {
	id: string;
	label: string;
	color?: string;
	data: DataPoint[];
}

export interface ChartAxis {
	id: string;
	label: string;
	ticks?: Array<string | number>;
	tickFormat?: (value: string | number) => string;
	scaleType?: 'linear' | 'log' | 'time';
}
export interface ChartAxisConfig {
	xAxis?: ChartAxis;
	yAxis?: ChartAxis;
	grid?: ChartGrid;
	title?: ChartAxisTitle;
	ticks?: ChartAxisTicks;
}

export interface ChartGrid {
	enabled: boolean;
	color?: string;
	opacity?: number;
	lineWidth?: number;
	verticalLines?: boolean; // Show vertical grid lines
	horizontalLines?: boolean; // Show horizontal grid lines
}
export interface ChartTitle {
	text: string;
	fontSize?: string;
	fontWeight?: string; // Font weight for the title
	color?: string; // Color of the title text
	textAlign?: 'left' | 'center' | 'right'; // Text alignment for the title
	position?: 'top' | 'bottom'; // Position of the title relative to the chart
}
export interface ChartSubtitle {
	text: string;
	fontSize?: string;
	fontWeight?: string; // Font weight for the subtitle
	color?: string; // Color of the subtitle text
	textAlign?: 'left' | 'center' | 'right'; // Text alignment for then subtitle
	position?: 'top' | 'bottom'; // Position of the subtitle relative to the chart
}

export interface ChartAxisLabel {
	text: string;
	fontSize?: string;
	fontWeight?: string; // Font weight for the axis label
	color?: string; // Color of the axis label text
	textAlign?: 'left' | 'center' | 'right'; // Text alignment for the axis label
	position?: 'top' | 'bottom' | 'left' | 'right'; // Position of the axis label relative to the chart
}

export interface ChartAxisTitle {
	xAxis?: ChartAxisLabel;
	yAxis?: ChartAxisLabel;
}
export interface ChartAxisTick {
	value: string | number; // Tick value
	label?: string; // Optional label for the tick
	color?: string; // Optional color for the tick label
	fontSize?: string; // Font size for the tick label
	fontWeight?: string; // Font weight for the tick label
	textAlign?: 'left' | 'center' | 'right'; // Text alignment for the tick label
}
export interface ChartAxisTicks {
	xAxis?: ChartAxisTick[]; // Array of ticks for the X axis
	yAxis?: ChartAxisTick[]; // Array of ticks for the Y axis
}
export interface ChartAxisGrid {
	enabled: boolean; // Whether grid lines are enabled for the axis
	color?: string; // Color of the grid lines
	opacity?: number; // Opacity of the grid lines
	lineWidth?: number; // Width of the grid lines
	verticalLines?: boolean; // Show vertical grid lines
	horizontalLines?: boolean; // Show horizontal grid lines
}
export interface ChartAxisGridConfig {
	xAxis?: ChartAxisGrid; // Grid configuration for the X axis
	yAxis?: ChartAxisGrid; // Grid configuration for the Y axis
}

export interface ChartLegend {
	enabled: boolean; // Whether the legend is enabled
	position?: 'top' | 'bottom' | 'left' | 'right'; // Position of the legend
	itemStyle?: {
		color?: string; // Color of legend items
		fontSize?: string; // Font size of legend items
		fontWeight?: string; // Font weight of legend items
	};
	itemHoverStyle?: {
		color?: string; // Color on hover
		fontSize?: string; // Font size on hover
		fontWeight?: string; // Font weight on hover
	};
	itemClick?: (seriesId: string) => void; // Callback for item click events
}

export interface ChartTooltip {
	enabled: boolean;
	format?: (value: string | number) => string;
	showCrosshair?: boolean;
	crosshairColor?: string;
	crosshairWidth?: number;
	crosshairOpacity?: number;
}

export interface ChartAnimation {
	enabled: boolean;
	duration?: number; // in milliseconds
	easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
	animateOnLoad?: boolean;
}

export interface ChartTheme {
	backgroundColor?: string;
	axisColor?: string;
	gridColor?: string;
	textColor?: string;
	fontFamily?: string;
	fontSize?: string;
	tooltipBackgroundColor?: string;
	tooltipTextColor?: string;
	legendBackgroundColor?: string;
	legendTextColor?: string;
}

export interface ChartPerformance {
	mode: PerformanceMode;
	samplingRate?: number; // percentage of data points to sample
	enableWebWorkers?: boolean;
	enableMemoization?: boolean;
	enableDataSampling?: boolean;
	mouseMoveThrottle?: number; // in milliseconds
	resizeDebounce?: number; // in milliseconds
	maxCacheEntries?: number; // for caching rendered paths
	enablePathCache?: boolean; // whether to cache SVG paths
	canvasSmoothing?: boolean; // for canvas rendering
	devicePixelRatio?: number; // for high-DPI displays
}

export interface ChartEvent {
	type: 'click' | 'hover' | 'crosshair';
	data: {
		x: number;
		y: number;
		value?: string | number;
		label?: string;
		lineLabel?: string;
		color?: string;
	};
}

export interface ChartDataPoint {
	x: string | number; // X value, can be a date string or number
	y: number; // Y value
	label?: string; // Optional label for the point
	color?: string; // Optional color for the point
	// Additional metadata can be added as needed
}
export interface ChartLine {
	id: string; // Unique identifier for the line
	label: string; // Label for the line
	color?: string; // Optional color for the line
	data: ChartDataPoint[]; // Array of data points for the line
}

export interface ChartTooltipConfig {
	enabled: boolean; // Whether the tooltip is enabled
	format?: (value: string | number) => string; // Optional format function for tooltip values
	showCrosshair?: boolean; // Whether to show crosshair on hover
	crosshairColor?: string; // Color of the crosshair
	crosshairWidth?: number; // Width of the crosshair line
	crosshairOpacity?: number; // Opacity of the crosshair line
}

export interface DataPoint {
	[key: string]: string | number | boolean | Date | null | undefined;
}
export interface LineData {
	id: string;
	label: string;
	color?: string;
	data: DataPoint[];
}
// export interface LineData {
// 	id: string;
// 	label: string;
// 	// eslint-disable-next-line @typescript-eslint/no-explicit-any
// 	data: Array<Record<string, any>>;
// 	color: string;
// }

export interface TooltipData {
	x: number;
	y: number;
	value: string | number;
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
		value: string | number;
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
