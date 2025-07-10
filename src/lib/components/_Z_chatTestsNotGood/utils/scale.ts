import type { ScaleFunction } from '../types/chart.js';

export function createLinearScale(
	domain: readonly [number, number],
	range: readonly [number, number]
): ScaleFunction<number> {
	const [d0, d1] = domain;
	const [r0, r1] = range;

	const scaleFunction = (value: number): number => {
		if (d1 === d0) return r0;
		const normalized = (value - d0) / (d1 - d0);
		return r0 + normalized * (r1 - r0);
	};

	// Add the required methods
	scaleFunction.domain = () => domain;
	scaleFunction.range = () => range;

	return scaleFunction as ScaleFunction<number>;
}

export function createTimeScale(
	domain: readonly [Date, Date],
	range: readonly [number, number]
): ScaleFunction<Date> {
	const [d0, d1] = domain;
	const [r0, r1] = range;

	const scaleFunction = (value: Date): number => {
		const domainSpan = d1.getTime() - d0.getTime();
		if (domainSpan === 0) return r0;
		const normalized = (value.getTime() - d0.getTime()) / domainSpan;
		return r0 + normalized * (r1 - r0);
	};

	// Add the required methods
	scaleFunction.domain = () => domain;
	scaleFunction.range = () => range;

	return scaleFunction as ScaleFunction<Date>;
}
