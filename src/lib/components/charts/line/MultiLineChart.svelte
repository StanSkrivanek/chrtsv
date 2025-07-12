<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import { fade } from 'svelte/transition';

	// Enhanced Types
	interface DataPoint {
		[key: string]: any;
	}

	interface LineData {
		id: string;
		label: string;
		color?: string;
		data: DataPoint[];
	}

	interface PerformanceConfig {
		// Device-specific limits
		mobile?: number;
		tablet?: number;
		desktop?: number;
		
		// Rendering thresholds
		svgMaxPoints?: number;
		animationMaxPoints?: number;
		
		// Sampling configuration
		enableDataSampling?: boolean;
		useWebWorker?: boolean;
		workerPath?: string;
		sampleRate?: number;
		
		// Performance settings
		mouseMoveThrottle?: number;
		resizeDebounce?: number;
	}

	interface ChartProps {
		lines?: LineData[];
		xKey?: string;
		yKey?: string;
		title?: string;
		showLegend?: boolean;
		height?: number;
		dateFormat?: string;
		showValues?: boolean;
		hasTooltip?: boolean;
		yTickCount?: number;
		curveType?: 'straight' | 'smooth';
		tension?: number;
		showCrosshair?: boolean;
		performanceConfig?: PerformanceConfig;
	}

	// Enhanced sampling stats interface
	interface SamplingStats {
		originalPoints: number;
		sampledPoints: number;
		compressionRatio: number;
		processingTime: number;
		usedWorker: boolean;
		linesProcessed?: number;
		unifiedXValues?: number;
		method?: string;
	}

	// Worker message interfaces
	interface WorkerMessage {
		operation: string;
		success: boolean;
		result?: any;
		error?: string;
	}

	interface SamplingResult {
		lines: LineData[];
		metadata: {
			originalPoints: number;
			sampledPoints: number;
			compressionRatio: number;
			targetSampleSize: number;
			unifiedXValues: number;
			linesProcessed: number;
		} | null;
	}

	// Chart data interfaces
	interface ChartDataPoint {
		x: number;
		y: number;
		originalData: DataPoint;
	}

	interface LinePathData {
		id: string;
		label: string;
		color: string;
		pathData: string;
		points: ChartDataPoint[];
		originalData: DataPoint[];
	}

	interface TooltipData {
		x: number;
		y: number;
		value: string;
		label: string;
		lineLabel: string;
		color: string;
	}

	// Enhanced crosshair interfaces
	interface CrosshairData {
		x: number;
		y: number;
		xLabel: string;
		values: Array<{
			lineId: string;
			lineLabel: string;
			value: string;
			color: string;
			y: number;
		}>;
	}

	// Props
	let {
		lines = [],
		xKey = 'date',
		yKey = 'value',
		title = 'Multi Line Chart',
		showLegend = true,
		height = 400,
		dateFormat = 'MMM dd',
		showValues = false,
		hasTooltip = false,
		yTickCount = 5,
		tension = 0.3,
		curveType = 'straight',
		showCrosshair = false,
		performanceConfig = {}
	}: ChartProps = $props();

	// Device detection
	function detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
		if (typeof window === 'undefined') return 'desktop';
		
		const userAgent = navigator.userAgent;
		const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
		const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent);
		
		if (isMobile && !isTablet) return 'mobile';
		if (isTablet) return 'tablet';
		return 'desktop';
	}

	const deviceType = detectDeviceType();

	// Enhanced performance configuration
	const config = $derived(() => {
		const deviceLimits = {
			mobile: 300,
			tablet: 500,
			desktop: 1000
		};

		const defaults: Required<PerformanceConfig> = {
			mobile: deviceLimits.mobile,
			tablet: deviceLimits.tablet,
			desktop: deviceLimits.desktop,
			svgMaxPoints: 1500,
			animationMaxPoints: 800,
			enableDataSampling: true,
			useWebWorker: true,
			workerPath: '/chart-worker.js',
			sampleRate: 0.1,
			mouseMoveThrottle: 16,
			resizeDebounce: 150
		};

		return { ...defaults, ...performanceConfig };
	});

	// Get current device limit
	const maxPointsForDevice = $derived(config()[deviceType] || config().desktop);

	// Svelte 5 runes
	let svgElement = $state<SVGElement | null>(null);
	let canvasElement = $state<HTMLCanvasElement | null>(null);
	let mounted = $state(false);
	let width = $state(0);
	let chartHeight = $state(0);
	let hoveredLine = $state<string | null>(null);
	let tooltipData = $state<TooltipData | null>(null);
	let tooltipVisible = $state(false);
	let canvasContext: CanvasRenderingContext2D | null = null;

	// Crosshair state
	let crosshairVisible = $state(false);
	let crosshairData = $state<CrosshairData | null>(null);
	let mouseX = $state(0);
	let mouseY = $state(0);

	// Worker and sampling state
	let worker: Worker | null = null;
	let sampledLines = $state<LineData[]>([]);
	let samplingInProgress = $state(false);
	let samplingStats = $state<SamplingStats | null>(null);

	// Chart dimensions
	const margin = { top: 20, right: 20, bottom: 40, left: 60 };

	// Default colors
	const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

	// Calculate total data points
	const totalDataPoints = $derived(
		lines.reduce((sum: number, line) => sum + line.data.length, 0)
	);

	// Determine rendering mode
	const renderingMode = $derived(() => {
		const configValue = config();
		if (totalDataPoints > configValue.svgMaxPoints) return 'canvas';
		if (totalDataPoints > configValue.animationMaxPoints) return 'svg-no-animation';
		return 'svg-full';
	});

	const currentRenderingMode = $derived(renderingMode());

	// Derived state for tooltip logic
	const shouldShowPointTooltip = $derived(
		hasTooltip && !showCrosshair && tooltipVisible && tooltipData !== null
	);
	const shouldShowCrosshairTooltip = $derived(
		showCrosshair && hasTooltip && crosshairVisible && crosshairData !== null
	);
	const shouldShowCrosshairLines = $derived(showCrosshair && crosshairVisible);

	// Initialize worker
	function initializeWorker(): void {
		if (!config().useWebWorker) return;

		try {
			worker = new Worker(config().workerPath);
			console.log('Chart worker initialized');
		} catch (error) {
			console.warn('Failed to initialize worker:', error);
			worker = null;
		}
	}

	// Helper function to sanitize data for Web Worker
	function sanitizeDataForWorker(data: any): any {
		if (data === null || data === undefined) {
			return data;
		}
		
		if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
			return data;
		}
		
		if (data instanceof Date) {
			return data.toISOString();
		}
		
		if (Array.isArray(data)) {
			return data.map(item => sanitizeDataForWorker(item));
		}
		
		if (typeof data === 'object') {
			const sanitized: any = {};
			for (const key in data) {
				if (data.hasOwnProperty(key)) {
					const value = data[key];
					// Skip functions, symbols, and other non-serializable types
					if (typeof value === 'function' || typeof value === 'symbol') {
						continue;
					}
					// Handle circular references by using JSON stringify/parse
					try {
						sanitized[key] = sanitizeDataForWorker(value);
					} catch (error) {
						console.warn(`Skipping non-serializable property: ${key}`);
						continue;
					}
				}
			}
			return sanitized;
		}
		
		return data;
	}

	// Helper function to create a clean copy of lines data for worker
	function createCleanLinesForWorker(lines: LineData[]): LineData[] {
		return lines.map(line => {
			// Create a clean copy of each line's data
			const cleanData = line.data.map(dataPoint => {
				const cleanPoint: { [key: string]: any } = {};
				
				// Only include primitive values and dates
				for (const key in dataPoint) {
					if (dataPoint.hasOwnProperty(key)) {
						const value = dataPoint[key];
						if (value !== null && value !== undefined) {
							if (typeof value === 'string' || 
								typeof value === 'number' || 
								typeof value === 'boolean') {
								cleanPoint[key] = value;
							} else if (value instanceof Date) {
								cleanPoint[key] = value.toISOString();
							} else if (typeof value === 'object' && !Array.isArray(value)) {
								// For nested objects, try to serialize simple ones
								try {
									cleanPoint[key] = JSON.parse(JSON.stringify(value));
								} catch (e) {
									// Skip complex objects that can't be serialized
									console.warn(`Skipping complex object in data point: ${key}`);
								}
							}
						}
					}
				}
				
				return cleanPoint;
			});

			return {
				id: line.id,
				label: line.label,
				color: line.color || '',
				data: cleanData
			};
		});
	}

	// Sample multiple lines with unified X-axis using worker
	async function sampleMultipleLinesWithWorker(lines: LineData[]): Promise<SamplingResult> {
		if (!worker || !lines.length) {
			return { lines, metadata: null };
		}

		return new Promise<SamplingResult>((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject(new Error('Worker timeout'));
			}, 15000);

			const handleMessage = (e: MessageEvent<WorkerMessage>) => {
				const { operation, success, result, error } = e.data;
				
				if (operation === 'sampleMultipleLines') {
					clearTimeout(timeout);
					worker?.removeEventListener('message', handleMessage);
					
					if (success && result) {
						console.log('Worker returned multi-line data:', result);
						resolve(result as SamplingResult);
					} else {
						reject(new Error(error || 'Multi-line sampling failed'));
					}
				}
			};

			worker?.addEventListener('message', handleMessage);
			
			// Calculate sample rate based on target points and largest dataset
			const maxLineLength = Math.max(...lines.map(line => line.data?.length || 0));
			const targetPoints = maxPointsForDevice;
			const sampleRate = Math.min(1, targetPoints / maxLineLength);
			
			// Create clean data for worker
			let cleanLines: LineData[];
			try {
				cleanLines = createCleanLinesForWorker(lines);
				console.log('Sending multi-line data to worker:', {
					operation: 'sampleMultipleLines',
					linesCount: cleanLines.length,
					maxLineLength,
					sampleRate,
					targetPoints,
					xKey,
					yKey,
					firstLineDataSample: cleanLines[0]?.data[0]
				});
			} catch (error) {
				console.error('Failed to clean data for worker:', error);
				reject(new Error('Data sanitization failed'));
				return;
			}
			
			// Send cleaned data to worker
			try {
				worker?.postMessage({
					operation: 'sampleMultipleLines',
					data: cleanLines,
					sampleRate,
					xKey,
					yKey
				});
			} catch (error) {
				console.error('Failed to send data to worker:', error);
				reject(new Error('Failed to send data to worker: ' + (error as Error).message));
			}
		});
	}

	// Fallback: Improved multi-line sampling on main thread
	function sampleMultipleLinesMainThread(lines: LineData[], targetPoints: number): SamplingResult {
		if (!lines.length) return { lines, metadata: null };
		
		console.log('Main thread: Processing', lines.length, 'lines for sampling');
		
		// Step 1: Collect all unique X values
		const allXValues = new Set<string>();
		lines.forEach(line => {
			if (!line.data || !Array.isArray(line.data)) return;
			line.data.forEach((point: DataPoint) => {
				allXValues.add(String(point[xKey]));
			});
		});
		
		const sortedXValues = Array.from(allXValues).sort((a: string, b: string) => {
			// Handle date sorting
			if (a.match(/\d{4}-\d{2}-\d{2}/) && b.match(/\d{4}-\d{2}-\d{2}/)) {
				return new Date(a).getTime() - new Date(b).getTime();
			}
			// Handle numeric sorting
			const numA = Number(a);
			const numB = Number(b);
			if (!isNaN(numA) && !isNaN(numB)) {
				return numA - numB;
			}
			return a.localeCompare(b);
		});
		
		// Step 2: Determine sampling strategy
		let sampledXValues: string[];
		if (sortedXValues.length <= targetPoints) {
			sampledXValues = sortedXValues;
		} else {
			// Create sampling indices
			const indices: number[] = [];
			indices.push(0); // Always include first
			if (sortedXValues.length > 1) {
				indices.push(sortedXValues.length - 1); // Always include last
			}
			
			const remaining = targetPoints - indices.length;
			if (remaining > 0 && sortedXValues.length > 2) {
				const step = (sortedXValues.length - 1) / (remaining + 1);
				for (let i = 1; i <= remaining; i++) {
					const index = Math.round(step * i);
					if (index > 0 && index < sortedXValues.length - 1 && !indices.includes(index)) {
						indices.push(index);
					}
				}
			}
			
			const uniqueIndices = [...new Set(indices)].sort((a, b) => a - b);
			sampledXValues = uniqueIndices.map(i => sortedXValues[i]);
		}
		
		// Step 3: Sample each line based on unified X values
		const sampledLines: LineData[] = lines.map((line, lineIndex) => {
			if (!line.data || !Array.isArray(line.data) || line.data.length === 0) {
				return line;
			}
			
			// Create lookup map
			const dataMap = new Map<string, DataPoint>();
			line.data.forEach((point: DataPoint) => {
				dataMap.set(String(point[xKey]), point);
			});
			
			// Sample data
			const sampledData: DataPoint[] = [];
			sampledXValues.forEach(xVal => {
				if (dataMap.has(xVal)) {
					sampledData.push(dataMap.get(xVal)!);
				} else {
					// Find nearest point
					const nearest = line.data.reduce((prev: DataPoint, curr: DataPoint) => {
						const prevDiff = Math.abs(Number(prev[xKey]) - Number(xVal));
						const currDiff = Math.abs(Number(curr[xKey]) - Number(xVal));
						return currDiff < prevDiff ? curr : prev;
					});
					if (nearest) {
						sampledData.push(nearest);
					}
				}
			});
			
			console.log(`Main thread: Line ${lineIndex} sampled from ${line.data.length} to ${sampledData.length} points`);
			
			return {
				...line,
				data: sampledData
			};
		});
		
		const originalPoints = lines.reduce((sum, line) => sum + (line.data?.length || 0), 0);
		const sampledPoints = sampledLines.reduce((sum, line) => sum + (line.data?.length || 0), 0);
		
		return {
			lines: sampledLines,
			metadata: {
				originalPoints,
				sampledPoints,
				compressionRatio: originalPoints / sampledPoints,
				targetSampleSize: targetPoints,
				unifiedXValues: sampledXValues.length,
				linesProcessed: sampledLines.length
			}
		};
	}

	// Updated performSampling function
	async function performSampling(): Promise<void> {
		if (!lines.length || !config().enableDataSampling) {
			sampledLines = lines;
			samplingStats = null;
			return;
		}

		const configValue = config();
		const totalPoints = lines.reduce((sum, line) => sum + (line.data?.length || 0), 0);
		const needsSampling = totalPoints > maxPointsForDevice * lines.length;
		
		if (!needsSampling) {
			sampledLines = lines;
			samplingStats = null;
			console.log('No sampling needed - total points:', totalPoints, 'threshold:', maxPointsForDevice * lines.length);
			return;
		}

		console.log('Starting multi-line sampling for', lines.length, 'lines with', totalPoints, 'total points');
		samplingInProgress = true;
		const startTime = performance.now();
		
		try {
			let result: SamplingResult;
			
			// Try worker first, fallback to main thread
			if (configValue.useWebWorker && worker) {
				try {
					console.log('Attempting worker-based multi-line sampling');
					result = await sampleMultipleLinesWithWorker(lines);
					console.log('Worker sampling successful');
				} catch (error) {
					console.warn('Worker sampling failed, using main thread:', error);
					result = sampleMultipleLinesMainThread(lines, maxPointsForDevice);
				}
			} else {
				console.log('Using main thread multi-line sampling');
				result = sampleMultipleLinesMainThread(lines, maxPointsForDevice);
			}

			sampledLines = result.lines;
			const endTime = performance.now();

			// Enhanced sampling stats
			samplingStats = {
				originalPoints: result.metadata?.originalPoints || totalPoints,
				sampledPoints: result.metadata?.sampledPoints || sampledLines.reduce((sum, line) => sum + line.data.length, 0),
				compressionRatio: result.metadata?.compressionRatio || 1,
				processingTime: endTime - startTime,
				usedWorker: configValue.useWebWorker && worker ? true : false,
				linesProcessed: result.metadata?.linesProcessed || lines.length,
				unifiedXValues: result.metadata?.unifiedXValues,
				method: 'multi-line-unified'
			};

			console.table({
				deviceType,
				maxPointsForDevice,
				linesCount: lines.length,
				originalPoints: samplingStats.originalPoints,
				sampledPoints: samplingStats.sampledPoints,
				compressionRatio: samplingStats.compressionRatio.toFixed(2),
				processingTime: `${samplingStats.processingTime.toFixed(1)}ms`,
				usedWorker: samplingStats.usedWorker ? 'Yes' : 'No',
				unifiedXValues: samplingStats.unifiedXValues,
				method: samplingStats.method
			});

		} catch (error) {
			console.error('Multi-line sampling failed:', error);
			// Fallback to original data
			sampledLines = lines;
			samplingStats = null;
		} finally {
			samplingInProgress = false;
		}
	}

	// Fallback: Simple uniform sampling on main thread
	function uniformSample(data: DataPoint[], targetPoints: number): DataPoint[] {
		if (data.length <= targetPoints) return data;
		
		const step = data.length / targetPoints;
		const sampled: DataPoint[] = [];
		
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

	// Helper function to parse dates
	function parseDate(dateString: string): Date | null {
		if (!dateString) return null;

		try {
			// Try ISO format first
			const isoDate = new Date(dateString);
			if (!isNaN(isoDate.getTime())) return isoDate;
		} catch (e) {}

		try {
			// Try parsing as number (timestamp)
			const timestamp = Number(dateString);
			if (!isNaN(timestamp)) {
				const date = new Date(timestamp);
				if (!isNaN(date.getTime())) return date;
			}
		} catch (e) {}

		return null;
	}

	// Helper function to format dates for display
	function formatDateForDisplay(dateString: string): string {
		const date = parseDate(dateString);
		if (date) {
			return date.toLocaleDateString('en-US', { 
				month: 'short', 
				day: 'numeric' 
			});
		}
		return String(dateString).substring(0, 10);
	}

	// Trigger sampling when data changes
	$effect(() => {
		if (mounted && lines.length > 0) {
			performSampling();
		}
	});

	// Process chart data (using sampled data)
	const chartData = $derived.by(() => {
		if (!sampledLines.length || !mounted || width === 0 || chartHeight === 0) return null;

		// Get all unique X values from sampled data
		const xValues = new Set<string>();
		sampledLines.forEach((line) => {
			line.data.forEach((d) => {
				xValues.add(String(d[xKey]));
			});
		});
		let allXValues = Array.from(xValues).sort();

		if (!allXValues.length) return null;

		// Get Y value range from sampled data
		const allYValues: number[] = [];
		sampledLines.forEach((line) => {
			line.data.forEach((d) => {
				allYValues.push(Number(d[yKey]));
			});
		});

		if (!allYValues.length) return null;

		const yMin = Math.min(...allYValues);
		const yMax = Math.max(...allYValues);
		const yRange = yMax - yMin;
		const yPadding = yRange * 0.1;
		const yMinWithPadding = yMin - yPadding;
		const yMaxWithPadding = yMax + yPadding;

		// Scale functions
		const xScale = (idx: number) =>
			margin.left + (idx / Math.max(1, allXValues.length - 1)) * width;

		const yScale = (val: number) =>
			margin.top +
			chartHeight -
			((val - yMinWithPadding) / (yMaxWithPadding - yMinWithPadding)) * chartHeight;

		// Generate Y ticks
		const yTicks: number[] = [];
		for (let i = 0; i <= yTickCount; i++) {
			const value = yMinWithPadding + (i / yTickCount) * (yMaxWithPadding - yMinWithPadding);
			yTicks.push(value);
		}

		return {
			allXValues,
			yMin: yMinWithPadding,
			yMax: yMaxWithPadding,
			xScale,
			yScale,
			yTicks: yTicks.reverse(),
			hasNegativeValues: yMin < 0
		};
	});

	// Calculate line paths (using sampled data)
	const linePaths = $derived.by((): LinePathData[] => {
		if (!chartData || !sampledLines.length) return [];
		
		return sampledLines.map((lineData, index) => {
			const color = lineData.color || defaultColors[index % defaultColors.length];
			const points: ChartDataPoint[] = [];

			// For each X value, find the corresponding data point
			chartData.allXValues.forEach((xValue, xIndex) => {
				let dataPoint = lineData.data.find((d) => String(d[xKey]) === xValue);
				if (!dataPoint) {
					// If exact match not found, find the closest X
					dataPoint = lineData.data.reduce((prev, curr) => {
						return Math.abs(Number(curr[xKey]) - Number(xValue)) <
							Math.abs(Number(prev[xKey]) - Number(xValue))
							? curr
							: prev;
					}, lineData.data[0]);
				}
				
				if (dataPoint) {
					points.push({
						x: chartData.xScale(xIndex),
						y: chartData.yScale(Number(dataPoint[yKey])),
						originalData: dataPoint
					});
				}
			});

			// Generate path
			let pathData = '';
			if (points.length > 0) {
				if (curveType === 'smooth' && tension > 0) {
					pathData = `M ${points[0].x} ${points[0].y}`;
					for (let i = 1; i < points.length; i++) {
						const prev = points[i - 1];
						const curr = points[i];
						const cpx = (prev.x + curr.x) / 2;
						pathData += ` Q ${cpx} ${prev.y} ${cpx} ${curr.y} L ${curr.x} ${curr.y}`;
					}
				} else {
					pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
				}
			}

			return {
				id: lineData.id,
				label: lineData.label,
				color,
				pathData,
				points,
				originalData: lineData.data
			};
		});
	});

	// Canvas rendering function
	function renderCanvas(): void {
		if (!canvasElement || !canvasContext || !chartData || !linePaths.length) {
			return;
		}

		const rect = canvasElement.getBoundingClientRect();
		const dpr = window.devicePixelRatio || 1;

		// Set canvas size
		canvasElement.width = rect.width * dpr;
		canvasElement.height = rect.height * dpr;

		// Reset transform and scale
		canvasContext.setTransform(1, 0, 0, 1, 0, 0);
		canvasContext.scale(dpr, dpr);

		// Clear canvas
		canvasContext.clearRect(0, 0, rect.width, rect.height);

		// Draw axes
		drawCanvasAxes(canvasContext, chartData, rect.width, rect.height);

		// Draw lines
		linePaths.forEach((lineData) => {
			drawCanvasLine(canvasContext!, lineData, hoveredLine === lineData.id);
		});

		// Draw crosshair in canvas mode
		if (shouldShowCrosshairLines && crosshairData) {
			drawCanvasCrosshair(canvasContext, crosshairData);
		}
	}

	function drawCanvasAxes(
		ctx: CanvasRenderingContext2D,
		chartData: any,
		canvasWidth: number,
		canvasHeight: number
	): void {
		ctx.strokeStyle = '#94a3b8';
		ctx.lineWidth = 1;

		// X-axis
		ctx.beginPath();
		ctx.moveTo(margin.left, margin.top + chartHeight);
		ctx.lineTo(margin.left + width, margin.top + chartHeight);
		ctx.stroke();

		// Y-axis
		ctx.beginPath();
		ctx.moveTo(margin.left, margin.top);
		ctx.lineTo(margin.left, margin.top + chartHeight);
		ctx.stroke();

		// Y-axis ticks and grid
		ctx.fillStyle = '#64748b';
		ctx.font = '12px sans-serif';

		chartData.yTicks.forEach((tickValue: number) => {
			const y = chartData.yScale(tickValue);

			// Grid line
			ctx.strokeStyle = '#e2e8f0';
			ctx.setLineDash([4, 4]);
			ctx.beginPath();
			ctx.moveTo(margin.left, y);
			ctx.lineTo(margin.left + width, y);
			ctx.stroke();
			ctx.setLineDash([]);

			// Label
			ctx.fillStyle = '#64748b';
			ctx.textAlign = 'right';
			ctx.fillText(formatYValue(tickValue), margin.left - 10, y + 4);
		});

		// X-axis labels
		const tickInterval = Math.max(1, Math.ceil(chartData.allXValues.length / 7));
		for (let i = 0; i < chartData.allXValues.length; i += tickInterval) {
			const x = chartData.xScale(i);
			const label = formatDateForDisplay(chartData.allXValues[i]);

			ctx.textAlign = 'center';
			ctx.fillText(label, x, margin.top + chartHeight + 20);
		}
	}

	function drawCanvasLine(ctx: CanvasRenderingContext2D, lineData: LinePathData, isHovered: boolean): void {
		ctx.strokeStyle = lineData.color;
		ctx.lineWidth = isHovered ? 3 : 2;
		ctx.globalAlpha = hoveredLine && !isHovered ? 0.3 : 1;

		// Draw line
		ctx.beginPath();
		lineData.points.forEach((point, i) => {
			if (i === 0) {
				ctx.moveTo(point.x, point.y);
			} else {
				ctx.lineTo(point.x, point.y);
			}
		});
		ctx.stroke();

		// Draw points
		lineData.points.forEach((point) => {
			ctx.beginPath();
			ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
			ctx.fillStyle = '#ffffff';
			ctx.fill();
			ctx.strokeStyle = lineData.color;
			ctx.lineWidth = 2;
			ctx.stroke();
		});

		ctx.globalAlpha = 1;
	}

	function drawCanvasCrosshair(ctx: CanvasRenderingContext2D, crosshairData: CrosshairData): void {
		ctx.strokeStyle = '#6b7280';
		ctx.lineWidth = 1;
		ctx.setLineDash([4, 4]);
		ctx.globalAlpha = 0.7;

		// Vertical line
		ctx.beginPath();
		ctx.moveTo(crosshairData.x, margin.top);
		ctx.lineTo(crosshairData.x, margin.top + chartHeight);
		ctx.stroke();

		// Horizontal line
		ctx.beginPath();
		ctx.moveTo(margin.left, crosshairData.y);
		ctx.lineTo(margin.left + width, crosshairData.y);
		ctx.stroke();

		ctx.setLineDash([]);
		ctx.globalAlpha = 1;

		// Draw crosshair points
		crosshairData.values.forEach((valueData) => {
			ctx.beginPath();
			ctx.arc(crosshairData.x, valueData.y, 4, 0, 2 * Math.PI);
			ctx.fillStyle = valueData.color;
			ctx.fill();
			ctx.strokeStyle = '#ffffff';
			ctx.lineWidth = 2;
			ctx.stroke();
		});
	}

	// Helper functions
	function formatYValue(value: number): string {
		if (Math.abs(value) >= 1000000) {
			return `${(value / 1000000).toFixed(1)}M`;
		} else if (Math.abs(value) >= 1000) {
			return `${(value / 1000).toFixed(1)}k`;
		}
		return value.toFixed(1);
	}

	// Throttle function with proper typing
	function throttle<T extends (...args: any[]) => any>(
		func: T,
		waitOrGetter: number | (() => number)
	): (...args: Parameters<T>) => void {
		let timeout: ReturnType<typeof setTimeout> | null = null;
		let lastCallTime = 0;

		return (...args: Parameters<T>) => {
			const now = Date.now();
			const wait = typeof waitOrGetter === 'function' ? waitOrGetter() : waitOrGetter;
			const remaining = wait - (now - lastCallTime);

			if (remaining <= 0) {
				if (timeout) {
					clearTimeout(timeout);
					timeout = null;
				}
				lastCallTime = now;
				func(...args);
			} else if (!timeout) {
				timeout = setTimeout(() => {
					lastCallTime = Date.now();
					timeout = null;
					func(...args);
				}, remaining);
			}
		};
	}

	// Crosshair update function
	function updateCrosshair(x: number, y: number) {
		if (!chartData) return;

		let nearestXIndex = 0;
		let minDistance = Infinity;

		for (let i = 0; i < chartData.allXValues.length; i++) {
			const distance = Math.abs(x - chartData.xScale(i));
			if (distance < minDistance) {
				minDistance = distance;
				nearestXIndex = i;
			}
		}

		const currentXValue = chartData.allXValues[nearestXIndex];
		const parsedDate = parseDate(currentXValue);
		const xLabel = parsedDate ? formatDateForDisplay(currentXValue) : currentXValue;

		const values = linePaths
			.map((lineData: LinePathData) => {
				const dataPoint = lineData.originalData.find((d) => String(d[xKey]) === currentXValue);
				if (dataPoint) {
					const yValue = Number(dataPoint[yKey]);
					return {
						lineId: lineData.id,
						lineLabel: lineData.label,
						value: formatYValue(yValue),
						color: lineData.color,
						y: chartData.yScale(yValue)
					};
				}
				return null;
			})
			.filter(Boolean) as Array<{
				lineId: string;
				lineLabel: string;
				value: string;
				color: string;
				y: number;
			}>;

		crosshairData = {
			x: chartData.xScale(nearestXIndex),
			y,
			xLabel,
			values
		};
	}

	// Event handlers
	function handlePointHover(e: MouseEvent, lineData: LinePathData, point: ChartDataPoint, index: number): void {
		if (!showCrosshair && hasTooltip) {
			const originalData = point.originalData;
			tooltipData = {
				x: point.x,
				y: point.y,
				value: formatYValue(Number(originalData[yKey])),
				label: formatDateForDisplay(String(originalData[xKey])),
				lineLabel: lineData.label,
				color: lineData.color
			};
			tooltipVisible = true;
		}
		hoveredLine = lineData.id;
	}

	function handlePointLeave(): void {
		if (!showCrosshair) {
			tooltipVisible = false;
		}
		hoveredLine = null;
	}

	// Throttled mouse move handler for crosshair
	const throttledMouseMove = throttle((e: MouseEvent) => {
		if (!showCrosshair || !chartData) return;

		const rect = (svgElement || canvasElement)?.getBoundingClientRect();
		if (!rect) return;

		mouseX = e.clientX - rect.left;
		mouseY = e.clientY - rect.top;

		if (
			mouseX >= margin.left &&
			mouseX <= margin.left + width &&
			mouseY >= margin.top &&
			mouseY <= margin.top + chartHeight
		) {
			updateCrosshair(mouseX, mouseY);
		}
	}, () => config().mouseMoveThrottle);

	// Resize handler
	const handleResize = throttle(() => {
		if (!svgElement && !canvasElement) return;

		const element = svgElement || canvasElement;
		if (!element) return;

		const newWidth = element.clientWidth - margin.left - margin.right;
		const newHeight = height - margin.top - margin.bottom;

		if (newWidth !== width || newHeight !== chartHeight) {
			width = newWidth;
			chartHeight = newHeight;
		}
	}, () => config().resizeDebounce);

	// Canvas rendering trigger
	$effect(() => {
		if (currentRenderingMode === 'canvas' && mounted && canvasContext) {
			const deps = {
				dataLength: sampledLines.length,
				totalPoints: sampledLines.reduce((sum, line) => sum + line.data.length, 0),
				hasChartData: !!chartData,
				pathsLength: linePaths.length,
				hover: hoveredLine,
				dims: `${width}x${chartHeight}`,
				crosshair: crosshairData?.x
			};

			console.log('Canvas render triggered:', deps);

			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					renderCanvas();
				});
			});
		}
	});

	// Setup canvas when element is available
	$effect(() => {
		console.log('Rendering mode:', currentRenderingMode);
		if (currentRenderingMode === 'canvas' && mounted && canvasElement) {
			canvasContext = canvasElement.getContext('2d');
			console.log('Canvas context initialized');
			if (chartData && linePaths.length > 0) {
				requestAnimationFrame(() => {
					renderCanvas();
				});
			}
		}
	});

	// Lifecycle
	onMount(() => {
		mounted = true;

		// Initialize worker
		initializeWorker();

		let resizeObserver: ResizeObserver;

		tick().then(() => {
			const element = svgElement || canvasElement;
			if (!element) return;

			width = element.clientWidth - margin.left - margin.right;
			chartHeight = height - margin.top - margin.bottom;

			resizeObserver = new ResizeObserver(handleResize);
			resizeObserver.observe(element);
		});

		return () => {
			resizeObserver?.disconnect();
		};
	});

	onDestroy(() => {
		mounted = false;
		canvasContext = null;
		
		// Clean up worker
		if (worker) {
			worker.terminate();
			worker = null;
		}
	});
</script>

<div class="multi-line-chart-container">
	<!-- Performance & Sampling Info -->
	{#if samplingInProgress}
		<div class="sampling-notice processing">
			<small>⚡ Processing {totalDataPoints.toLocaleString()} data points...</small>
		</div>
	{:else if samplingStats && samplingStats.compressionRatio > 1}
		<div class="sampling-notice optimized">
			<small>
				Optimized for {deviceType}: {samplingStats.originalPoints.toLocaleString()} → {samplingStats.sampledPoints.toLocaleString()} points 
				({samplingStats.compressionRatio.toFixed(1)}x compression, {samplingStats.processingTime.toFixed(1)}ms)
				{#if samplingStats.usedWorker}
					🔧 Using Web Worker
				{:else}
					⚡ Main thread fallback
				{/if}
			</small>
		</div>
	{/if}

	{#if currentRenderingMode === 'canvas'}
		<div class="performance-notice">
			<small>
				🚀 Large dataset - Using Canvas rendering for optimal performance
			</small>
		</div>
	{/if}

	<div class="chart-container">
		{#if currentRenderingMode === 'canvas'}
			<canvas
				bind:this={canvasElement}
				class="chart-canvas"
				width={width + margin.left + margin.right}
				{height}
				aria-label="Line chart: {title}"
				onmousemove={throttledMouseMove}
				onmouseleave={() => {
					crosshairVisible = false;
				}}
				onmouseenter={() => {
					crosshairVisible = true;
				}}
			></canvas>
		{:else}
			<svg
				bind:this={svgElement}
				class="multi-line-chart"
				width="100%"
				{height}
				role="img"
				aria-label="Line chart: {title}"
				onmousemove={throttledMouseMove}
				onmouseleave={() => {
					crosshairVisible = false;
				}}
				onmouseenter={() => {
					crosshairVisible = true;
				}}
			>
				{#if chartData && linePaths.length > 0}
					<g>
						<!-- Title -->
						<text
							x={margin.left + width / 2}
							y={margin.top - 5}
							text-anchor="middle"
							fill="#1e293b"
							font-size="16px"
							font-weight="bold"
						>
							{title}
						</text>

						<!-- X Axis -->
						<g class="x-axis" transform="translate(0, {margin.top + chartHeight})">
							<line x1={margin.left} y1="0" x2={margin.left + width} y2="0" stroke="#94a3b8" />

							{#each chartData.allXValues as xValue, i}
								{#if i % Math.max(1, Math.ceil(chartData.allXValues.length / 7)) === 0}
									<g transform="translate({chartData.xScale(i)}, 0)">
										<line y2="6" stroke="#94a3b8" />
										<text y="20" text-anchor="middle" fill="#64748b" font-size="12px">
											{formatDateForDisplay(xValue)}
										</text>
									</g>
								{/if}
							{/each}
						</g>

						<!-- Y Axis -->
						<g class="y-axis" transform="translate({margin.left}, 0)">
							<line x1="0" y1={margin.top} x2="0" y2={margin.top + chartHeight} stroke="#94a3b8" />

							{#each chartData.yTicks as tickValue}
								<g transform="translate(0, {chartData.yScale(tickValue)})">
									<line x2="-6" stroke="#94a3b8" />
									<line x1="0" y1="0" x2={width} y2="0" stroke="#e2e8f0" stroke-dasharray="4,4" />
									<text
										x="-10"
										y="4"
										text-anchor="end"
										fill={tickValue === 0 ? '#374151' : '#64748b'}
										font-size="12px"
										font-weight={tickValue === 0 ? 'bold' : 'normal'}
									>
										{formatYValue(tickValue)}
									</text>
								</g>
							{/each}
						</g>

						<!-- Lines and points -->
						{#each linePaths as lineData (lineData.id)}
							<g class="line-group">
								<path
									d={lineData.pathData}
									fill="none"
									stroke={lineData.color}
									stroke-width={hoveredLine === lineData.id ? 3 : 2}
									opacity={hoveredLine && hoveredLine !== lineData.id ? 0.3 : 1}
									style="transition: stroke-width 0.2s ease, opacity 0.2s ease;"
								/>

								{#each lineData.points as point, i}
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<circle
										cx={point.x}
										cy={point.y}
										r="4"
										fill="#ffffff"
										stroke={lineData.color}
										stroke-width="2"
										opacity={hoveredLine && hoveredLine !== lineData.id ? 0.3 : 1}
										onmouseenter={(e) => handlePointHover(e, lineData, point, i)}
										onmouseleave={handlePointLeave}
										style="cursor: {hasTooltip
											? 'pointer'
											: 'default'}; transition: opacity 0.2s ease;"
									/>

									{#if showValues}
										<text
											x={point.x}
											y={point.y - 10}
											text-anchor="middle"
											fill={lineData.color}
											font-size="11px"
											font-weight="600"
											opacity={hoveredLine && hoveredLine !== lineData.id ? 0.3 : 1}
										>
											{formatYValue(Number(point.originalData[yKey]))}
										</text>
									{/if}
								{/each}
							</g>
						{/each}

						<!-- Crosshair lines -->
						{#if shouldShowCrosshairLines && crosshairData}
							<g class="crosshair-group" opacity="1">
								<!-- Vertical line -->
								<line
									x1={crosshairData.x}
									y1={margin.top}
									x2={crosshairData.x}
									y2={margin.top + chartHeight}
									stroke="#6b7280"
									stroke-width="1"
									stroke-dasharray="4,4"
									opacity="0.7"
								/>

								<!-- Horizontal line -->
								<line
									x1={margin.left}
									y1={crosshairData.y}
									x2={margin.left + width}
									y2={crosshairData.y}
									stroke="#6b7280"
									stroke-width="1"
									stroke-dasharray="4,4"
									opacity="0.7"
								/>

								<!-- Crosshair points -->
								{#each crosshairData.values as valueData}
									<circle
										cx={crosshairData.x}
										cy={valueData.y}
										r="4"
										fill={valueData.color}
										stroke="#ffffff"
										stroke-width="2"
										opacity="0.9"
									/>
								{/each}
							</g>
						{/if}
					</g>
				{/if}
			</svg>
		{/if}
	</div>

	<!-- Legend -->
	{#if showLegend && lines.length > 0}
		<div class="legend" transition:fade={{ duration: 300 }}>
			{#each lines as lineData, index}
				{@const color = lineData.color || defaultColors[index % defaultColors.length]}
				{@const isHighlighted = hoveredLine === lineData.id}
				{@const isDimmed = hoveredLine !== null && hoveredLine !== lineData.id}

				<div
					class="legend-item"
					class:hovered={isHighlighted}
					class:dimmed={isDimmed}
					role="button"
					tabindex="0"
					onmouseenter={() => (hoveredLine = lineData.id)}
					onmouseleave={() => (hoveredLine = null)}
				>
					<div class="legend-color" style="background-color: {color}"></div>
					<span class="legend-label">{lineData.label}</span>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Point tooltip -->
	{#if shouldShowPointTooltip && tooltipData}
		{@const tooltipX = tooltipData.x}
		{@const tooltipY = tooltipData.y - 20}
		{@const shouldFlipX = tooltipX > width - 120}
		{@const shouldFlipY = tooltipY < 80}

		<div
			class="tooltip"
			style="left: {tooltipX}px; top: {shouldFlipY ? tooltipY + 40 : tooltipY}px; 
			       transform: translate({shouldFlipX ? '-100%' : '-50%'}, {shouldFlipY ? '10px' : '-100%'});"
			role="tooltip"
			aria-live="polite"
		>
			<div class="tooltip-content">
				<div class="tooltip-header">{tooltipData.label}</div>
				<div class="tooltip-values">
					<div class="tooltip-value-row">
						<div
							class="tooltip-color-indicator"
							style="background-color: {tooltipData.color}"
						></div>
						<span class="tooltip-line-label">{tooltipData.lineLabel}:</span>
						<span class="tooltip-value">{tooltipData.value}</span>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Crosshair tooltip -->
	{#if shouldShowCrosshairTooltip && crosshairData}
		{@const tooltipX = crosshairData.x}
		{@const tooltipY = crosshairData.y - 20}
		{@const shouldFlipX = tooltipX > width - 120}
		{@const shouldFlipY = tooltipY < 80}

		<div
			class="tooltip crosshair-tooltip"
			style="left: {tooltipX}px; top: {shouldFlipY ? tooltipY + 40 : tooltipY}px; 
			       transform: translate({shouldFlipX ? '-100%' : '-50%'}, {shouldFlipY ? '10px' : '-100%'});"
			role="tooltip"
			aria-live="polite"
		>
			<div class="tooltip-content">
				<div class="tooltip-header">{crosshairData.xLabel}</div>
				<div class="tooltip-values">
					{#each crosshairData.values as valueData (valueData.lineId)}
						<div class="tooltip-value-row">
							<div
								class="tooltip-color-indicator"
								style="background-color: {valueData.color}"
							></div>
							<span class="tooltip-line-label">{valueData.lineLabel}:</span>
							<span class="tooltip-value">{valueData.value}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.multi-line-chart-container {
		width: 100%;
		position: relative;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.chart-container {
		position: relative;
		width: 100%;
	}

	.multi-line-chart {
		width: 100%;
		min-height: 300px;
	}

	.chart-canvas {
		width: 100%;
		height: auto;
		max-height: 100%;
		cursor: crosshair;
		border: 1px solid #e2e8f0;
		border-radius: 4px;
	}

	.performance-notice {
		margin-bottom: 8px;
		padding: 8px 12px;
		background: #f0f9ff;
		border: 1px solid #0ea5e9;
		border-radius: 4px;
		color: #0369a1;
		text-align: center;
		font-size: 12px;
	}

	.sampling-notice {
		margin-bottom: 8px;
		padding: 8px 12px;
		border-radius: 4px;
		text-align: center;
		font-size: 12px;
		font-weight: 500;
	}

	.sampling-notice.processing {
		background: #fef3c7;
		border: 1px solid #f59e0b;
		color: #92400e;
		animation: pulse 2s infinite;
	}

	.sampling-notice.optimized {
		background: #f0fdf4;
		border: 1px solid #22c55e;
		color: #15803d;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.7; }
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		margin-top: 16px;
		padding: 12px;
		background: #f8fafc;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
		padding: 8px 12px;
		border-radius: 4px;
		transition: all 0.2s ease;
		transform-origin: center;
		border: 2px solid transparent;
		outline: none;
	}

	.legend-item:hover {
		background: #e2e8f0;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.legend-item:focus {
		border-color: #3b82f6;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
	}

	.legend-item.hovered {
		background: #e2e8f0;
		transform: translateY(-2px) scale(1.05);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.legend-item.dimmed {
		opacity: 0.5;
		transform: scale(0.95);
	}

	.legend-color {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		border: 2px solid #ffffff;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s ease;
	}

	.legend-item:hover .legend-color {
		transform: scale(1.1);
	}

	.legend-label {
		font-size: 14px;
		font-weight: 500;
		color: #374151;
	}

	.tooltip {
		position: absolute;
		pointer-events: none;
		z-index: 20;
		max-width: 240px;
		opacity: 1;
		transition: opacity 0.15s ease;
	}

	.tooltip-content {
		background-color: rgba(0, 0, 0, 0.95);
		color: white;
		padding: 10px 14px;
		border-radius: 8px;
		font-size: 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.15);
		min-width: 120px;
	}

	.tooltip-header {
		font-weight: 600;
		margin-bottom: 8px;
		padding-bottom: 6px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.25);
		font-size: 13px;
		text-align: center;
		color: #ffffff;
	}

	.tooltip-values {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.tooltip-value-row {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 2px 0;
	}

	.tooltip-color-indicator {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		flex-shrink: 0;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.tooltip-line-label {
		font-weight: 500;
		flex: 1;
		min-width: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		color: #e5e7eb;
	}

	.tooltip-value {
		font-weight: 700;
		font-size: 13px;
		color: #ffffff;
		text-align: right;
		flex-shrink: 0;
	}

	@media (max-width: 768px) {
		.legend {
			flex-direction: column;
			gap: 8px;
		}

		.legend-item {
			padding: 6px 10px;
		}

		.sampling-notice,
		.performance-notice {
			font-size: 11px;
			padding: 6px 10px;
		}

		.tooltip-content {
			font-size: 11px;
			padding: 8px 10px;
			min-width: 100px;
		}
	}
</style>