<script>
	import { format } from 'd3'
	import { getContext } from 'svelte';

	const { data, y, xGet, yGet, xScale, yScale } = getContext('LayerCake');

	export let r = 4;
	export let fill = "#ccc";
	export let stroke = "#000";
	export let strokeWidth = 0;

	export let labels = false;
	export let labelFormat = format('');
</script>

<g>
	{#each $data as d}
		{@const cx = $xGet(d)}
		{@const cy = $yGet(d)}
		<circle {cx} {cy} {r} {fill} {stroke} stroke-width={strokeWidth} />

		{#if labels !== false}
			{@const label = $y(d)}
			<text {fill} x={cx-4} y={cy-10}>{labelFormat(label)}</text>
		{/if}
	{/each}
</g>


<style>
	text {
    font-weight: 700;
	}
</style>