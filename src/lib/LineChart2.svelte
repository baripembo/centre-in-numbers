<script>
  import { curveNatural, csv, extent, format, line, max, scaleLinear, scaleTime, timeFormat, axisBottom, axisLeft, select } from "d3"
  import { onMount } from "svelte"

  const margin = { top: 50, bottom: 40, left: 40, right: 40 };
  const width  = 600,
        height = 400;

  const innerHeight = height - margin.top - margin.bottom,
        innerWidth  = width - margin.left - margin.right;

  let dataset = [];
  const row = function (data) {
    data['HDX Cost Per User'] = +data['HDX Cost Per User'];
    data['Year'] = new Date(data['Year'], 0);
    return data;
  };
  onMount(async () => {
    dataset = await csv('src/data/cost-per-user.csv', row).then((data) => {
      return data;
    });
  });

  $: console.log(dataset)

  let pinXAxis, pinYAxis, gridLines; // declare pins

  $: xScale = scaleTime()
    .domain(extent(dataset, (d) => d['Year']))
    .range([0, innerWidth]);

  $: yScale = scaleLinear()
    .domain(extent(dataset, (d) => d['HDX Cost Per User']))
    .range([innerHeight, 0])
    .nice();

  $: line_gen = line()
    .x((d) => xScale(d['Year']))
    .y((d) => yScale(d['HDX Cost Per User']))(dataset);


  $: gridlinesY = axisLeft()
    .ticks(5)
    .tickFormat('')
    .tickSize(-width)
    .scale(yScale);

  // call axis generators on the scale and pin the SVG pins.
  $: if (pinXAxis) {
    select(pinXAxis).call(axisBottom(xScale).ticks(width / 60));
  }
  $: if (pinYAxis) {
    select(pinYAxis).call(axisLeft(yScale).ticks(5).tickFormat(format('$.0f')));
  }
  $: if (gridLines) {
    select(gridLines).call(gridlinesY);
  }
</script>

<h3>Line Chart</h3>

<svg {width} {height}>
  <g transform={`translate(${margin.left}, ${margin.top})`}>
    <g
    class="x-axis"
    bind:this={pinXAxis}
    transform={`translate(0, ${innerHeight})`}
  />
  <g
    class="y-axis"
    bind:this={pinYAxis}
  />
  <g
    class="grid"
    bind:this={gridLines}
  />

  <g>
    {#each dataset as data, i}
      <circle
          cx={xScale(data['Year'])}
          cy={yScale(data['HDX Cost Per User'])}
          r="3"
      />
      <text class='label' 
        x={xScale(data['Year'])-4} 
        y={yScale(data['HDX Cost Per User'])-10}>
          {format('$')(data['HDX Cost Per User'])}
      </text>
    {/each}
  </g>
   <!--  <text transform={`translate(10,${innerHeight/2}), rotate(-90)`}>label goes here</text> -->

   <!-- line -->
    <path d={line_gen} />
  </g>
</svg>

<style>
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

    .tick line {
      stroke: #EEE;
    }
    .tick text {
      font-size: 18px;
      fill: #666;
      font-family: 'Source Sans Pro', sans-serif;
      text-transform: uppercase;
    }
    .x-axis .tick line {
      opacity: 0;
    }
    .y-axis .tick:nth-child(2) text {
      display: none;
    }
    .grid .tick:nth-child(2) line {
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