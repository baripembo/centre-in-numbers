<script>
  import { curveNatural, csv, extent, format, line, max, scaleLinear, scaleTime, timeFormat } from 'd3'
  //import { getContext } from 'svelte'

  export let props;
  export let dataset;
  //const props = getContext('line-context')
  
  let title = props.title;
  let xParam = props.xParam;
  let yParam = props.yParam;

  const margin = { top: 50, bottom: 40, left: 40, right: 40 };
  const width  = 600,
        height = 400;

  const innerHeight = height - margin.top - margin.bottom,
        innerWidth  = width - margin.left - margin.right;

  //y ticks
  let yTicks = [];
  function getYTicks() {
    let interval = 10;
    let extentY = extent(dataset, (d) => d[yParam]);
    for (let i = Math.round(extentY[0]); i < Math.round(extentY[1]+interval); i=i+interval) {
      yTicks.push(Math.floor(i/interval)*interval);
    }
  }

  $: dataset && getYTicks();

  $: xScale = scaleTime()
    .domain(extent(dataset, (d) => d[xParam]))
    .range([0, innerWidth]);

  $: yScale = scaleLinear()
    .domain(extent(dataset, (d) => d[yParam]))
    .range([innerHeight, 0])
    .nice();

  $: line_gen = line()
    .x((d) => xScale(d[xParam]))
    .y((d) => yScale(d[yParam]))(dataset);

</script>

<h1>{title}</h1>

<svg class='line-chart' {width} {height}>
  <g transform={`translate(${margin.left}, ${margin.top})`}>
    <!-- y axis -->
    <g class='y-axis'>
      {#each yTicks as y} 
        <g class="tick" opacity="1" transform={`translate(${-margin.left}, ${yScale(y)})`}>
          <line class='gridline' x2="100%" />
          <text y='-4'>
            {format('$')(y)}
          </text>
        </g>
      {/each}
    </g>

    <!-- x axis -->
    <g class='x-axis'>
      <line class='x-axis' transform={`translate(${-margin.left}, ${innerHeight})`} x2="100%" />

      {#each dataset as d} 
        <g class="tick" opacity="1" transform={`translate(${xScale(d[xParam])}, ${innerHeight})`}>
          <text y='15' style='text-anchor: middle;'>
            {timeFormat('%Y')(d[xParam])}
          </text>
        </g>
      {/each}
    </g>

    <!-- data points -->
    <g class='dots'>
      {#each dataset as data, i}
        <circle
          cx={xScale(data[xParam])}
          cy={yScale(data[yParam])}
          r="3"
        />
        <text class='label' 
          x={xScale(data[xParam])-4} 
          y={yScale(data[yParam])-10}>
            {format('$')(data[yParam])}
        </text>
      {/each}
    </g>

    <!-- line -->
    <path d={line_gen} />

  </g>
</svg>



<style>
  h1 {
    font-family: 'Source Sans Pro', serif;
    font-size: 26px;
    font-weight: 700;
    text-align: left;
  }
  circle {
    fill: #007CE0;
  }
  path {
    fill: transparent;
    stroke: #007CE0;
    stroke-width: 2px;
  }
  .gridline {
    stroke: #EEE;
    stroke-width: 1px;
  }  
  .x-axis {
    stroke: #888;
  }
  .label {
    fill: #007CE0;
    font-family: 'Source Sans Pro', sans-serif;
    font-size: 14px;
    font-weight: 700;
    text-anchor: start;
  }
  .tick {
    fill: #888;
    font-size: 12px;
    font-family: 'Source Sans Pro', sans-serif;
  }
</style>