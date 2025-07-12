/**
 * Sampling Worker Helper
 *
 * This utility provides an easy-to-use interface for the sampling Web Worker,
 * handling worker lifecycle, message passing, and promise-based APIs.
 */

import type { SamplingConfig, SamplingAlgorithm, DataPoint } from './samplingAlgorithms';

interface WorkerMessage {
	type: 'sample' | 'batch' | 'benchmark' | 'analyze';
	id: string;
	data: DataPoint[] | DataPoint[][];
	config?: SamplingConfig;
	configs?: SamplingConfig[];
	algorithms?: SamplingAlgorithm[];
}

interface WorkerResponse {
	type: 'result' | 'error' | 'progress' | 'ready';
	id?: string;
	success?: boolean;
	data?: DataPoint[];
	results?: SamplingResult[];
	error?: string;
	processingTime?: number;
	originalLength?: number;
	sampledLength?: number;
	compressionRatio?: number;
	completed?: number;
	total?: number;
	percentage?: number;
	volatility?: number;
	dataLength?: number;
	recommendedAlgorithm?: SamplingAlgorithm;
	totalProcessingTime?: number;
	datasetsProcessed?: number;
	algorithm?: string;
}

interface SamplingResult {
	success: boolean;
	data: DataPoint[];
	originalLength: number;
	sampledLength: number;
	processingTime: number;
	algorithm: string;
	compressionRatio: number;
}

interface BenchmarkResult {
	processingTime: number;
	compressionRatio: number;
	sampledPoints: number;
	success: boolean;
}

interface ProgressCallback {
	(progress: { completed: number; total: number; percentage: number }): void;
}

interface PendingRequest {
	resolve: (value: WorkerResponse) => void;
	reject: (reason?: Error) => void;
	onProgress?: ProgressCallback;
}

export class SamplingWorkerManager {
	private worker: Worker | null = null;
	private pendingRequests = new Map<string, PendingRequest>();
	private isReady = false;
	private readyPromise: Promise<void>;

	constructor(workerPath = '/samplingWorker.js') {
		this.readyPromise = this.initializeWorker(workerPath);
	}

	private async initializeWorker(workerPath: string): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				this.worker = new Worker(workerPath);

				this.worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
					this.handleWorkerMessage(e.data);
				};

				this.worker.onerror = (error) => {
					console.error('Sampling worker error:', error);
					reject(error);
				};

				// Wait for ready signal
				const readyHandler = (data: WorkerResponse) => {
					if (data.type === 'ready') {
						this.isReady = true;
						resolve();
					}
				};

				// Temporarily listen for ready message
				const originalHandler = this.handleWorkerMessage.bind(this);
				this.handleWorkerMessage = (data: WorkerResponse) => {
					readyHandler(data);
					this.handleWorkerMessage = originalHandler;
					this.handleWorkerMessage(data);
				};
			} catch (error) {
				reject(error);
			}
		});
	}

	private handleWorkerMessage(data: WorkerResponse): void {
		if (data.type === 'ready') {
			return; // Already handled in initialization
		}

		if (data.type === 'progress' && data.id) {
			const request = this.pendingRequests.get(data.id);
			if (request?.onProgress) {
				request.onProgress({
					completed: data.completed!,
					total: data.total!,
					percentage: data.percentage!
				});
			}
			return;
		}

		if (!data.id) return;

		const request = this.pendingRequests.get(data.id);
		if (!request) return;

		this.pendingRequests.delete(data.id);

		if (data.type === 'error') {
			request.reject(new Error(data.error || 'Unknown worker error'));
		} else {
			request.resolve(data);
		}
	}

	private generateId(): string {
		return Math.random().toString(36).substr(2, 9);
	}

	private async sendMessage(
		message: Omit<WorkerMessage, 'id'>,
		onProgress?: ProgressCallback
	): Promise<WorkerResponse> {
		await this.readyPromise;

		if (!this.worker) {
			throw new Error('Worker not initialized');
		}

		const id = this.generateId();
		const fullMessage: WorkerMessage = { ...message, id };

		return new Promise<WorkerResponse>((resolve, reject) => {
			this.pendingRequests.set(id, { resolve, reject, onProgress });
			this.worker!.postMessage(fullMessage);
		});
	}

	/**
	 * Sample a single dataset
	 */
	async sampleData(data: DataPoint[], config: SamplingConfig): Promise<SamplingResult> {
		const response = await this.sendMessage({
			type: 'sample',
			data,
			config
		});

		return {
			success: response.success || false,
			data: response.data || [],
			originalLength: response.originalLength || 0,
			sampledLength: response.sampledLength || 0,
			processingTime: response.processingTime || 0,
			algorithm: response.algorithm || config.algorithm,
			compressionRatio: response.compressionRatio || 1
		};
	}

	/**
	 * Sample multiple datasets in batch
	 */
	async batchSample(
		datasets: DataPoint[][],
		configs: SamplingConfig[],
		onProgress?: ProgressCallback
	): Promise<{
		success: boolean;
		results: SamplingResult[];
		totalProcessingTime: number;
		datasetsProcessed: number;
	}> {
		const response = await this.sendMessage(
			{
				type: 'batch',
				data: datasets,
				configs
			},
			onProgress
		);

		return {
			success: response.success || false,
			results: response.results || [],
			totalProcessingTime: response.totalProcessingTime || 0,
			datasetsProcessed: response.datasetsProcessed || 0
		};
	}

	/**
	 * Benchmark different algorithms
	 */
	async benchmarkAlgorithms(
		data: DataPoint[],
		algorithms: SamplingAlgorithm[],
		targetPoints: number
	): Promise<Record<SamplingAlgorithm, BenchmarkResult>> {
		const response = await this.sendMessage({
			type: 'benchmark',
			data,
			algorithms,
			config: { algorithm: 'uniform', targetPoints }
		});

		// The response should contain the benchmark results
		return response as unknown as Record<SamplingAlgorithm, BenchmarkResult>;
	}

	/**
	 * Analyze data characteristics
	 */
	async analyzeData(
		data: DataPoint[],
		yKey = 'value'
	): Promise<{
		success: boolean;
		volatility: number;
		dataLength: number;
		recommendedAlgorithm: SamplingAlgorithm;
	}> {
		const response = await this.sendMessage({
			type: 'analyze',
			data,
			config: { algorithm: 'uniform', targetPoints: 100, yKey }
		});

		return {
			success: response.success || false,
			volatility: response.volatility || 0,
			dataLength: response.dataLength || 0,
			recommendedAlgorithm: response.recommendedAlgorithm || 'uniform'
		};
	}

	/**
	 * Terminate the worker
	 */
	terminate(): void {
		if (this.worker) {
			this.worker.terminate();
			this.worker = null;
			this.isReady = false;
		}

		// Reject all pending requests
		this.pendingRequests.forEach(({ reject }) => {
			reject(new Error('Worker terminated'));
		});
		this.pendingRequests.clear();
	}

	/**
	 * Check if worker is ready
	 */
	get ready(): boolean {
		return this.isReady;
	}
}

// Singleton instance for easy use
let workerInstance: SamplingWorkerManager | null = null;

/**
 * Get shared worker instance
 */
export function getSamplingWorker(workerPath?: string): SamplingWorkerManager {
	if (!workerInstance) {
		workerInstance = new SamplingWorkerManager(workerPath);
	}
	return workerInstance;
}

/**
 * Utility functions for common use cases
 */

/**
 * Sample data with automatic fallback to main thread
 */
export async function sampleDataSafe(
	data: DataPoint[],
	config: SamplingConfig,
	useWorker = true
): Promise<DataPoint[]> {
	// For small datasets, use main thread
	if (data.length < 5000 || !useWorker) {
		const { sampleData } = await import('./samplingAlgorithms');
		return sampleData(data, config);
	}

	try {
		const worker = getSamplingWorker();
		const result = await worker.sampleData(data, config);
		return result.data;
	} catch (error) {
		console.warn('Worker sampling failed, falling back to main thread:', error);
		const { sampleData } = await import('./samplingAlgorithms');
		return sampleData(data, config);
	}
}

/**
 * Get optimal sampling configuration for device
 */
export function getOptimalSamplingConfig(
	dataLength: number,
	deviceType: 'mobile' | 'tablet' | 'desktop' | 'highPerformance' = 'desktop'
): SamplingConfig {
	const limits = {
		mobile: 250,
		tablet: 400,
		desktop: 800,
		highPerformance: 1200
	};

	const targetPoints = Math.min(limits[deviceType], dataLength);

	// Choose algorithm based on data size and device
	let algorithm: SamplingAlgorithm;

	if (deviceType === 'mobile' && dataLength > 10000) {
		algorithm = 'uniform'; // Performance priority
	} else if (dataLength > 50000) {
		algorithm = 'lttb'; // Balance of quality and performance
	} else if (dataLength > 5000) {
		algorithm = 'hybrid'; // Quality priority
	} else {
		algorithm = 'uniform'; // Small dataset
	}

	return {
		algorithm,
		targetPoints
	};
}

/**
 * Progress tracking utility
 */
export class SamplingProgress {
	private callbacks: ProgressCallback[] = [];

	onProgress(callback: ProgressCallback): void {
		this.callbacks.push(callback);
	}

	emit(progress: { completed: number; total: number; percentage: number }): void {
		this.callbacks.forEach((callback) => callback(progress));
	}

	clear(): void {
		this.callbacks = [];
	}
}

/**
 * Example usage helper
 */
export class ChartSamplingManager {
	private worker: SamplingWorkerManager;
	private cache = new Map<string, DataPoint[]>();

	constructor(workerPath?: string) {
		this.worker = new SamplingWorkerManager(workerPath);
	}

	async sampleForChart(
		data: DataPoint[],
		chartWidth: number,
		deviceType: 'mobile' | 'tablet' | 'desktop' | 'highPerformance' = 'desktop'
	): Promise<DataPoint[]> {
		// Calculate optimal points based on chart width (roughly 1 point per 2 pixels)
		const optimalPoints = Math.min(Math.floor(chartWidth / 2), data.length);
		const config = getOptimalSamplingConfig(data.length, deviceType);
		config.targetPoints = Math.min(config.targetPoints, optimalPoints);

		// Create cache key
		const cacheKey = `${data.length}-${config.algorithm}-${config.targetPoints}`;

		if (this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey)!;
		}

		const result = await sampleDataSafe(data, config, data.length > 5000);
		this.cache.set(cacheKey, result);

		return result;
	}

	clearCache(): void {
		this.cache.clear();
	}

	terminate(): void {
		this.worker.terminate();
		this.clearCache();
	}
}
