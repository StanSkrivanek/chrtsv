// File: static/chart-worker.js
// Enhanced Web Worker for processing large multi-line datasets

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
				
			//Multi-line sampling with consistent X-axis
			case 'sampleMultipleLines':
				result = sampleMultipleLines(data, e.data.sampleRate || 0.1, xKey, yKey);
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

// Enhanced multi-line sampling function with better error handling
function sampleMultipleLines(lines, sampleRate, xKey) {
	console.log('Worker: Starting sampleMultipleLines');
	console.log('Worker: Lines type:', typeof lines, 'Is array:', Array.isArray(lines));
	
	if (!Array.isArray(lines) || lines.length === 0) {
		console.log('Worker: Invalid or empty lines data');
		return {
			lines: lines || [],
			metadata: null
		};
	}
	
	try {
		console.log('Worker: Processing', lines.length, 'lines for sampling');
		
		// Step 1: Collect all unique X values across all lines
		const allXValues = new Set();
		const xValueCounts = new Map();
		
		lines.forEach((line, lineIndex) => {
			console.log(`Worker: Processing line ${lineIndex}:`, {
				id: line.id,
				label: line.label,
				dataLength: line.data ? line.data.length : 'no data'
			});
			
			if (!line.data || !Array.isArray(line.data)) {
				console.warn(`Worker: Line ${lineIndex} has invalid data`);
				return;
			}
			
			line.data.forEach((point, pointIndex) => {
				if (!point || typeof point !== 'object') {
					console.warn(`Worker: Line ${lineIndex}, point ${pointIndex} is invalid:`, point);
					return;
				}
				
				if (!(xKey in point)) {
					console.warn(`Worker: Line ${lineIndex}, point ${pointIndex} missing xKey '${xKey}':`, point);
					return;
				}
				
				const xVal = String(point[xKey]);
				allXValues.add(xVal);
				xValueCounts.set(xVal, (xValueCounts.get(xVal) || 0) + 1);
			});
		});
		
		// Step 2: Sort X values (handle dates if needed)
		const sortedXValues = Array.from(allXValues).sort((a, b) => {
			if (isDateString(a) && isDateString(b)) {
				return new Date(a).getTime() - new Date(b).getTime();
			}
			// Try numeric comparison
			const numA = Number(a);
			const numB = Number(b);
			if (!isNaN(numA) && !isNaN(numB)) {
				return numA - numB;
			}
			// Fallback to string comparison
			return a.localeCompare(b);
		});
		
		console.log('Worker: Total unique X values:', sortedXValues.length);
		
		// Step 3: Determine target sample size based on the line with most points
		const maxLineLength = Math.max(...lines.map(line => line.data?.length || 0));
		const targetSampleSize = Math.max(100, Math.floor(maxLineLength * sampleRate));
		
		console.log('Worker: Target sample size:', targetSampleSize, 'from max line length:', maxLineLength);
		
		// Step 4: Create a unified sampling strategy
		let sampledXIndices;
		
		if (sortedXValues.length <= targetSampleSize) {
			// No sampling needed
			sampledXIndices = sortedXValues.map((_, index) => index);
		} else {
			// Sample X values strategically
			sampledXIndices = createSamplingIndices(sortedXValues.length, targetSampleSize);
		}
		
		const sampledXValues = sampledXIndices.map(i => sortedXValues[i]);
		
		console.log('Worker: Sampled X values:', sampledXValues.length);
		
		// Step 5: Sample each line based on the unified X sampling
		const sampledLines = lines.map((line, lineIndex) => {
			if (!line.data || !Array.isArray(line.data) || line.data.length === 0) {
				console.log(`Worker: Line ${lineIndex} has no data, skipping`);
				return {
					id: line.id || `line-${lineIndex}`,
					label: line.label || `Line ${lineIndex}`,
					color: line.color || '',
					data: []
				};
			}
			
			console.log(`Worker: Processing line ${lineIndex} with ${line.data.length} points`);
			
			// Create a map for quick lookup of line data by X value
			const dataMap = new Map();
			line.data.forEach(point => {
				if (point && typeof point === 'object' && (xKey in point)) {
					const xVal = String(point[xKey]);
					dataMap.set(xVal, point);
				}
			});
			
			// Sample data based on unified X values
			const sampledData = [];
			
			sampledXValues.forEach(xVal => {
				if (dataMap.has(xVal)) {
					sampledData.push(dataMap.get(xVal));
				} else {
					// Find nearest X value if exact match not found
					const nearestPoint = findNearestPoint(line.data, xVal, xKey);
					if (nearestPoint) {
						sampledData.push(nearestPoint);
					}
				}
			});
			
			console.log(`Worker: Line ${lineIndex} sampled from ${line.data.length} to ${sampledData.length} points`);
			
			return {
				id: line.id || `line-${lineIndex}`,
				label: line.label || `Line ${lineIndex}`,
				color: line.color || '',
				data: sampledData
			};
		});
		
		// Step 6: Return results with metadata
		const originalPoints = lines.reduce((sum, line) => sum + (line.data?.length || 0), 0);
		const sampledPoints = sampledLines.reduce((sum, line) => sum + (line.data?.length || 0), 0);
		
		const result = {
			lines: sampledLines,
			metadata: {
				originalPoints,
				sampledPoints,
				compressionRatio: originalPoints > 0 ? originalPoints / sampledPoints : 1,
				targetSampleSize,
				unifiedXValues: sampledXValues.length,
				linesProcessed: sampledLines.length
			}
		};
		
		console.log('Worker: Sampling complete', result.metadata);
		return result;
		
	} catch (error) {
		console.error('Worker: Error in sampleMultipleLines:', error);
		// Return original data on error
		return {
			lines: lines,
			metadata: null
		};
	}
}

// Helper function to create strategic sampling indices
function createSamplingIndices(totalLength, targetSize) {
	const indices = [];
	
	// Always include first and last
	indices.push(0);
	if (totalLength > 1) {
		indices.push(totalLength - 1);
	}
	
	// Calculate remaining points to sample
	const remaining = targetSize - indices.length;
	
	if (remaining > 0 && totalLength > 2) {
		// Use uniform sampling for middle points
		const step = (totalLength - 1) / (remaining + 1);
		
		for (let i = 1; i <= remaining; i++) {
			const index = Math.round(step * i);
			if (index > 0 && index < totalLength - 1 && !indices.includes(index)) {
				indices.push(index);
			}
		}
	}
	
	// Sort indices and remove duplicates
	return [...new Set(indices)].sort((a, b) => a - b);
}

// Helper function to find nearest point when exact X match is not found
function findNearestPoint(data, targetX, xKey) {
	if (!data.length) return null;
	
	let nearest = data[0];
	let minDistance = Math.abs(getNumericValue(data[0][xKey]) - getNumericValue(targetX));
	
	for (let i = 1; i < data.length; i++) {
		const distance = Math.abs(getNumericValue(data[i][xKey]) - getNumericValue(targetX));
		if (distance < minDistance) {
			minDistance = distance;
			nearest = data[i];
		}
	}
	
	return nearest;
}

// Helper function to get numeric value from string (handles dates)
function getNumericValue(value) {
	if (typeof value === 'number') return value;
	if (typeof value === 'string') {
		// Try parsing as date first
		if (isDateString(value)) {
			return new Date(value).getTime();
		}
		// Try parsing as number
		const num = Number(value);
		if (!isNaN(num)) return num;
	}
	return 0;
}

// Original functions (kept for backward compatibility)
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
	const indices = createSamplingIndices(data.length, targetSize);
	
	return indices.map(i => data[i]);
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