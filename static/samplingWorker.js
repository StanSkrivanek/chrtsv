/**
 * Web Worker for Data Sampling Algorithms
 * 
 * This worker handles CPU-intensive sampling operations in a separate thread
 * to prevent blocking the main UI thread when processing large datasets.
 * 
 * Place this file in your public/ folder as samplingWorker.js
 */

/**
 * 1. UNIFORM SAMPLING
 * Takes evenly spaced points across the dataset
 */
function uniformSampling(data, targetPoints) {
  if (data.length <= targetPoints) return data;
  
  const step = data.length / targetPoints;
  const sampled = [];
  
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
 */
function peaksSampling(data, targetPoints, yKey = 'value') {
  if (data.length <= targetPoints || data.length <= 3) return data;

  const peaks = [];
  
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
  return sortedIndices.map(i => data[i]);
}

/**
 * 3. LARGEST TRIANGLE THREE BUCKETS (LTTB)
 * Divides data into buckets and selects points that form largest triangles
 */
function lttbSampling(data, targetPoints, xKey = 'x', yKey = 'value') {
  if (data.length <= targetPoints || targetPoints <= 2) return data;
  
  const sampled = [];
  const bucketSize = (data.length - 2) / (targetPoints - 2);
  
  // Always include first point
  sampled.push(data[0]);
  
  let bucketStart = 1;
  
  for (let i = 1; i < targetPoints - 1; i++) {
    const bucketEnd = Math.floor((i + 1) * bucketSize) + 1;
    
    // Calculate average point for next bucket
    let avgX = 0, avgY = 0;
    let avgRangeStart = Math.floor((i + 1) * bucketSize) + 1;
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
 * 4. ADAPTIVE SAMPLING
 * Samples more densely where data changes rapidly
 */
function adaptiveSampling(data, targetPoints, yKey = 'value') {
  if (data.length <= targetPoints) return data;
  
  // Calculate rate of change (slopes)
  const slopes = [];
  for (let i = 0; i < data.length - 1; i++) {
    const dy = Number(data[i + 1][yKey]) - Number(data[i][yKey]);
    slopes.push(Math.abs(dy));
  }
  
  // Calculate weights based on slopes
  const weights = slopes.map(slope => slope + 0.1); // Add small base weight
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  
  // Distribute points based on weights
  const sampled = [data[0]]; // Always include first
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
 * Calculate data volatility (coefficient of variation)
 */
function calculateVolatility(data, yKey = 'value') {
  if (data.length < 2) return 0;
  
  const values = data.map(d => Number(d[yKey]));
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const standardDeviation = Math.sqrt(variance);
  
  return standardDeviation / Math.abs(mean);
}

/**
 * 5. HYBRID SAMPLING
 * Chooses algorithm based on data characteristics
 */
function hybridSampling(data, targetPoints, yKey = 'value') {
  if (data.length <= targetPoints) return data;
  
  const volatility = calculateVolatility(data, yKey);
  
  // Choose algorithm based on data characteristics
  if (volatility < 0.2) {
    // Low volatility: use uniform sampling
    return uniformSampling(data, targetPoints);
  } else if (volatility > 0.8) {
    // High volatility: use peak-preserving
    return peaksSampling(data, targetPoints, yKey);
  } else {
    // Medium volatility: use LTTB
    return lttbSampling(data, targetPoints, 'x', yKey);
  }
}

/**
 * Main sampling function that routes to specific algorithms
 */
function sampleData(data, config) {
  const { algorithm, targetPoints, xKey = 'x', yKey = 'value' } = config;
  
  const startTime = performance.now();
  let result;
  
  try {
    switch (algorithm) {
      case 'uniform':
        result = uniformSampling(data, targetPoints);
        break;
      
      case 'peaks':
        result = peaksSampling(data, targetPoints, yKey);
        break;
      
      case 'lttb':
        result = lttbSampling(data, targetPoints, xKey, yKey);
        break;
      
      case 'adaptive':
        result = adaptiveSampling(data, targetPoints, yKey);
        break;
      
      case 'hybrid':
      default:
        result = hybridSampling(data, targetPoints, yKey);
        break;
    }
    
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    return {
      success: true,
      data: result,
      originalLength: data.length,
      sampledLength: result.length,
      processingTime,
      algorithm,
      compressionRatio: data.length / result.length
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      algorithm,
      originalLength: data.length,
      processingTime: 0,
      sampledLength: 0,
      compressionRatio: 1
    };
  }
}

/**
 * Batch processing for multiple datasets
 */
function batchSample(datasets, configs) {
  const results = [];
  const startTime = performance.now();
  
  for (let i = 0; i < datasets.length; i++) {
    const config = configs[i] || configs[0]; // Use first config as default
    const result = sampleData(datasets[i], config);
    results.push(result);
    
    // Send progress updates for large batches
    if (datasets.length > 5 && i % Math.ceil(datasets.length / 10) === 0) {
      self.postMessage({
        type: 'progress',
        completed: i + 1,
        total: datasets.length,
        percentage: Math.round(((i + 1) / datasets.length) * 100)
      });
    }
  }
  
  const endTime = performance.now();
  
  return {
    success: true,
    results,
    totalProcessingTime: endTime - startTime,
    datasetsProcessed: datasets.length
  };
}

/**
 * Performance benchmark for comparing algorithms
 */
function benchmarkAlgorithms(data, algorithms, targetPoints) {
  const results = {};
  
  algorithms.forEach(algorithm => {
    const config = { algorithm, targetPoints };
    const result = sampleData(data, config);
    
    results[algorithm] = {
      processingTime: result.processingTime,
      compressionRatio: result.compressionRatio,
      sampledPoints: result.sampledLength,
      success: result.success
    };
  });
  
  return results;
}

/**
 * Analyze data characteristics and recommend algorithm
 */
function analyzeData(data, yKey = 'value') {
  try {
    const volatility = calculateVolatility(data, yKey);
    let recommendedAlgorithm;
    
    if (volatility < 0.2) {
      recommendedAlgorithm = 'uniform';
    } else if (volatility > 0.8) {
      recommendedAlgorithm = 'peaks';
    } else {
      recommendedAlgorithm = 'lttb';
    }
    
    return {
      success: true,
      volatility,
      dataLength: data.length,
      recommendedAlgorithm
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      volatility: 0,
      dataLength: data.length,
      recommendedAlgorithm: 'uniform'
    };
  }
}

/**
 * Worker message handler - processes messages from main thread
 */
self.onmessage = function(e) {
  const { type, data, config, configs, algorithms, id } = e.data;
  
  try {
    let result;
    
    switch (type) {
      case 'sample':
        // Single dataset sampling
        result = sampleData(data, config);
        break;
      
      case 'batch':
        // Multiple datasets sampling
        result = batchSample(data, configs);
        break;
      
      case 'benchmark':
        // Performance benchmarking
        result = benchmarkAlgorithms(data, algorithms, config.targetPoints);
        break;
      
      case 'analyze':
        // Data analysis without sampling
        result = analyzeData(data, config.yKey);
        break;
      
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
    
    // Send result back to main thread
    self.postMessage({
      type: 'result',
      id,
      ...result
    });
    
  } catch (error) {
    // Send error back to main thread
    self.postMessage({
      type: 'error',
      id,
      error: error.message,
      stack: error.stack
    });
  }
};

/**
 * Worker error handler
 */
self.onerror = function(error) {
  self.postMessage({
    type: 'error',
    error: error.message,
    filename: error.filename,
    lineno: error.lineno
  });
};

/**
 * Worker startup - signal that worker is ready
 */
self.postMessage({
  type: 'ready',
  message: 'Sampling worker initialized and ready',
  algorithms: ['uniform', 'peaks', 'lttb', 'adaptive', 'hybrid']
});