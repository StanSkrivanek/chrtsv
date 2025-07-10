// File: static/chart-worker.js
// Web Worker for processing large datasets

self.onmessage = function(e) {
	const { data, xKey, yKey, operation } = e.data;
	
	try {
		let result;
		
		switch (operation) {
			case 'processData':
				result = processChartData(data, xKey, yKey);
				break;
				
			case 'sampleData':
				result = sampleLargeDataset(data, e.data.sampleRate || 0.1);
				break;
				
			case 'calculateStatistics':
				result = calculateDataStatistics(data, yKey);
				break;
				
			case 'generatePath':
				result = generateSmoothPath(data, e.data.tension || 0.3);
				break;
				
			default:
				throw new Error(`Unknown operation: ${operation}`);
		}
		
		self.postMessage({
			success: true,
			result,
			operation
		});
		
	} catch (error) {
		self.postMessage({
			success: false,
			error: error.message,
			operation
		});
	}
};

function processChartData(data, xKey, yKey) {
	const processed = data.map(d => ({
		x: d[xKey],
		y: Number(d[yKey]),
		original: d
	}));
	
	// Sort by x value if they're dates
	const firstX = processed[0]?.x;
	if (firstX && isDateString(firstX)) {
		processed.sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime());
	}
	
	return processed;
}

function sampleLargeDataset(data, sampleRate) {
	if (data.length <= 1000) return data;
	
	const targetSize = Math.max(100, Math.floor(data.length * sampleRate));
	const step = Math.floor(data.length / targetSize);
	
	const sampled = [];
	
	// Always include first point
	sampled.push(data[0]);
	
	// Sample middle points
	for (let i = step; i < data.length - 1; i += step) {
		sampled.push(data[i]);
	}
	
	// Always include last point
	if (data.length > 1) {
		sampled.push(data[data.length - 1]);
	}
	
	return sampled;
}

function calculateDataStatistics(data, yKey) {
	const values = data.map(d => Number(d[yKey])).filter(v => !isNaN(v));
	
	if (values.length === 0) {
		return { min: 0, max: 0, mean: 0, median: 0, std: 0 };
	}
	
	const sorted = [...values].sort((a, b) => a - b);
	const min = sorted[0];
	const max = sorted[sorted.length - 1];
	const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
	
	// Median
	const mid = Math.floor(sorted.length / 2);
	const median = sorted.length % 2 === 0 
		? (sorted[mid - 1] + sorted[mid]) / 2 
		: sorted[mid];
	
	// Standard deviation
	const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
	const std = Math.sqrt(variance);
	
	return { min, max, mean, median, std, count: values.length };
}

function generateSmoothPath(points, tension = 0.3) {
	if (points.length < 2) return '';
	
	// For 2 points, use quadratic curve
	if (points.length === 2) {
		const start = points[0];
		const end = points[1];
		const midX = (start.x + end.x) / 2;
		const midY = (start.y + end.y) / 2;
		return `M${start.x},${start.y} Q${midX},${midY} ${end.x},${end.y}`;
	}
	
	const path = [`M${points[0].x},${points[0].y}`];
	const t = Math.max(0, Math.min(1, tension)) * 0.5;
	
	for (let i = 0; i < points.length - 1; i++) {
		const p0 = i === 0 ? points[0] : points[i - 1];
		const p1 = points[i];
		const p2 = points[i + 1];
		const p3 = i === points.length - 2 ? points[points.length - 1] : points[i + 2];
		
		const cp1x = p1.x + (p2.x - p0.x) * t;
		const cp1y = p1.y + (p2.y - p0.y) * t;
		const cp2x = p2.x - (p3.x - p1.x) * t;
		const cp2y = p2.y - (p3.y - p1.y) * t;
		
		path.push(`C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`);
	}
	
	return path.join(' ');
}

function isDateString(str) {
	if (typeof str !== 'string') return false;
	
	// Simple date patterns
	const datePatterns = [
		/^\d{4}-\d{2}-\d{2}/, // ISO date
		/^\d{1,2}\/\d{1,2}\/\d{4}/, // US date
		/^\d{1,2}-\d{1,2}-\d{4}/, // EU date
	];
	
	return datePatterns.some(pattern => pattern.test(str)) && !isNaN(Date.parse(str));
}

// Error handling for unhandled errors
self.onerror = function(error) {
	self.postMessage({
		success: false,
		error: error.message || 'Unknown worker error'
	});
};