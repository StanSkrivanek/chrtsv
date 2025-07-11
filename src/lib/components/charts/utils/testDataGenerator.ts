import type { LineData } from "../types/chart.types";

// Generate test datasets
export default function generateTestData(points: number): LineData[] {
	console.log(`Generating ${points} points for 3 lines...`);

	const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
	const lines: LineData[] = [];

	for (let lineIndex = 0; lineIndex < 3; lineIndex++) {
		const data = [];
		let value = Math.random() * 1000;

		for (let i = 0; i < points; i++) {
			const date = new Date(2025, 0, 1 + i);
			value += (Math.random() - 0.5) * 100;
			value = Math.max(0, value);

			data.push({
				date: date.toISOString().split('T')[0],
				value: Math.round(value)
			});
		}

		lines.push({
			id: `dataset-${lineIndex}`,
			label: `Dataset ${lineIndex + 1}`,
			color: colors[lineIndex],
			data
		});
	}

	console.log(
		`Generated data:`,
		lines.map((line) => ({
			id: line.id,
			points: line.data.length
		}))
	);

	return lines;
}
