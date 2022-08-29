<script>
  import { csv, scaleBand, scaleLinear, max } from "d3"
  import { onMount } from "svelte"

  const width = 600,
        height = 300;

  let dataset = [];
  const row = function (data) {
    data["Population"] = +data["2020"] * 1000;  // + here is the unary conversion operator
    return data;
  };
  onMount(async () => {
    dataset = await csv("https://raw.githubusercontent.com/AnupJoseph/svelteLearn/main/charts/bar-chart-svelte/public/data/population_data.csv", row).then((data) => {
      return data.slice(0, 10);
    });
  });

  $: yScale = scaleBand()
    .domain(dataset.map((d) => d["Location"]))
    .range([0, height])
    .paddingInner(0.15);

  $: xScale = scaleLinear()
    .domain([0, max(dataset, (d) => d.Population)])
    .range([0, width]);

</script>

<h3>Bar Chart</h3>

<svg {width} {height}>
  {#each dataset as data, i}
    <rect     
      x={0}
      y={yScale(data.Location)}
      width={xScale(data.Population)}
      height={yScale.bandwidth()}
    />
  {/each}
</svg>

<style lang='sass'>
  rect {
    fill: #007CE0;
  }
</style>