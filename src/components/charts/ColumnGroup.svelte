<script>
  import { getContext } from "svelte";
  import { scaleBand, scaleLinear } from 'd3-scale'
  import { extent } from 'd3-array'

  const { data, xGet, yGet, xScale, yScale } = getContext("LayerCake");

  export let fill = "#ccc";



  const subgroups = Object.keys($data[0]).filter(d => d !== 'year');


  const values = $data.flatMap(d => subgroups.map(key => d[key]));
  console.log(extent(values));

  let x1Scale = scaleBand()
    .domain(subgroups)
    .range([0, $xScale.bandwidth()])
    .paddingInner(0.05)


  $data.forEach(function(d) {
    console.log(subgroups[0], d[subgroups[0]])
    console.log('x', $xGet(d) + x1Scale(subgroups[0]));
    console.log('y', $yScale(d[subgroups[0]]));
    console.log('width', x1Scale.bandwidth());
    // console.log('height', $yScale(d[subgroups[0]]));
  });

  // // // console.log('--data',$data)
  // // // console.log('subgroups', subgroups)
  // // // console.log($data[0][subgroups[1]])
  // // // console.log('//',$xScale.bandwidth())

</script>


{#each $data as d, i}
<!--     {@const x = $xScale.range()[0]}
  {@const y = $yGet(d)}
  {@const width = $xGet(d)}
  {@const height = $yScale.bandwidth()}
  <rect data-id={i} {x} /> -->
<!--   {@const x = $xGet(d) + x1Scale(subgroups[0])}
  {@const y = $yScale(d[subgroups[0]])}
  {@const width = x1Scale.bandwidth()}
  {@const height = $yScale(0) - $yScale(d[subgroups[0]])} -->
  <g class='column-group'>
    <rect data-id={i} />
  </g>
{/each}
