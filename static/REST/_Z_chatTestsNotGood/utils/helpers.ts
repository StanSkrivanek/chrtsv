/* eslint-disable @typescript-eslint/no-explicit-any */

export function isValidNumber(value: any): value is number {
	return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

export function isValidDate(value: any): value is Date {
	return value instanceof Date && !isNaN(value.getTime());
}

export function isValidString(value: any): value is string {
	return typeof value === 'string' && value.length > 0;
}

export function debounce<T extends (...args: any[]) => void>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout> | null = null;

	return (...args: Parameters<T>) => {
		if (timeout !== null) {
			clearTimeout(timeout);
		}

		timeout = setTimeout(() => {
			func(...args);
			timeout = null;
		}, wait);
	};
}

export function createId(): string {
	return `chart_${Math.random().toString(36).substring(2, 9)}`;
}

export function deepFreeze<T>(obj: T): Readonly<T> {
	Object.freeze(obj);

	if (obj !== null && typeof obj === 'object') {
		Object.getOwnPropertyNames(obj).forEach((prop) => {
			const value = (obj as Record<string, any>)[prop];
			if (value !== null && typeof value === 'object') {
				deepFreeze(value);
			}
		});
	}

	return obj;
}
