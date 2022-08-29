<script>
    import { getContext } from 'svelte';
    import { line } from 'd3';

    const { height, xGet, yGet } = getContext('LayerCake');

    export let stroke = '#F2645A';
    export let fill = '#F2645A';
    export let annotations = [];
</script>

{#each annotations as annotation}
    <line 
        class='line' 
        x1={$xGet(annotation)}
        y1={0} 
        x2={$xGet(annotation)}
        y2={$height} 
        {stroke} 
    />
    <text
        class='label'
        dy='1em'
        x={$xGet(annotation) + 5}
        y={-5}
        {fill}
    >
        {annotation.text}
    </text>
{/each}


<style>
    .line {
        stroke-dasharray: 4 2;
        stroke-width: 1;
    }
    .label {
        font-family: 'Source Sans Pro', sans-serif;
        font-size: 14px;
        font-weight: 700;
        text-anchor: start;
    }
</style>
