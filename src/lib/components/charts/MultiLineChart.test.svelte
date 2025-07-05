fns lib<script lang="ts">
	import { render } from '@testing-library/svelte';
	import { describe, expect, it } from 'vitest';
	import MultiLineChart from './MultiLineChart.svelte';

	describe('MultiLineChart', () => {
		const sampleData = [
			{
				id: 'line1',
				label: 'Line 1',
				color: '#3b82f6',
				data: [
					{ month: 'Jan', value: 100 },
					{ month: 'Feb', value: 200 },
					{ month: 'Mar', value: 150 }
				]
			},
			{
				id: 'line2',
				label: 'Line 2',
				color: '#ef4444',
				data: [
					{ month: 'Jan', value: 80 },
					{ month: 'Feb', value: 120 },
					{ month: 'Mar', value: 200 }
				]
			}
		];

		it('renders without crashing', () => {
			const { container } = render(MultiLineChart, {
				props: {
					lines: sampleData,
					xKey: 'month',
					yKey: 'value',
					title: 'Test Chart'
				}
			});

			expect(container.querySelector('.multi-line-chart-container')).toBeTruthy();
		});

		it('renders the chart title', () => {
			const { container } = render(MultiLineChart, {
				props: {
					lines: sampleData,
					title: 'Custom Test Title'
				}
			});

			const title = container.querySelector('text');
			expect(title?.textContent).toBe('Custom Test Title');
		});

		it('renders legend when showLegend is true', () => {
			const { container } = render(MultiLineChart, {
				props: {
					lines: sampleData,
					showLegend: true
				}
			});

			expect(container.querySelector('.legend')).toBeTruthy();
			expect(container.querySelectorAll('.legend-item')).toHaveLength(2);
		});

		it('does not render legend when showLegend is false', () => {
			const { container } = render(MultiLineChart, {
				props: {
					lines: sampleData,
					showLegend: false
				}
			});

			expect(container.querySelector('.legend')).toBeFalsy();
		});

		it('handles empty data gracefully', () => {
			const { container } = render(MultiLineChart, {
				props: {
					lines: [],
					title: 'Empty Chart'
				}
			});

			expect(container.querySelector('.multi-line-chart-container')).toBeTruthy();
		});

		it('respects custom height', () => {
			const { container } = render(MultiLineChart, {
				props: {
					lines: sampleData,
					height: 500
				}
			});

			const svg = container.querySelector('svg');
			expect(svg?.getAttribute('height')).toBe('500');
		});

		it('handles up to 5 lines', () => {
			const fiveLines = Array.from({ length: 5 }, (_, i) => ({
				id: `line${i + 1}`,
				label: `Line ${i + 1}`,
				color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
				data: [
					{ month: 'Jan', value: Math.random() * 100 },
					{ month: 'Feb', value: Math.random() * 100 },
					{ month: 'Mar', value: Math.random() * 100 }
				]
			}));

			const { container } = render(MultiLineChart, {
				props: {
					lines: fiveLines,
					showLegend: true
				}
			});

			expect(container.querySelectorAll('.legend-item')).toHaveLength(5);
		});
	});
</script>
