<script>
  import { csv, flatGroup, flatRollup, format, group, max, rollup, sum, timeFormat } from 'd3'
  import { scaleBand, scaleLinear, scaleTime } from 'd3-scale'
  import { calcExtents, LayerCake, Html, Svg } from 'layercake'
  import { onMount, setContext } from 'svelte'

  import AxisX from '../components/charts/AxisX.svelte';
  import AxisY from '../components/charts/AxisY.svelte';
  import ColumnGroup from '../components/charts/ColumnGroup.svelte';
  import Line from '../components/charts/Line.svelte';


  let ochaData = [];
  let serviceData = [];
  let yearlyData = [];
  let groupData = [];

  let fullExtents, groups, subgroups;

  const extentGetters = {
    x: d => d['Date'],
    y: d => d['Users']
  };

  onMount(async () => {
    ochaData = await csv('src/data/ocha-platforms.csv', function(data) {
      data['Users'] = parseFloat(data['Users'].replace(/,/g, ''));
      data['Date'] = new Date(data['Date']);
      return data;
    }).then((data) => {
      return data;
    });

    const properties = ['HDX', 'unocha.org', 'HPC: FTS', 'CERF'];
    $: ochaData = ochaData.filter(d => properties.includes(d.Service));

    //calculate scale for all small multiples
    $: fullExtents = calcExtents(ochaData, extentGetters);

    //group data by service
    $: serviceData = flatGroup(ochaData, d => d.Service);
    
    //find max val by country
    $: serviceData.forEach(function(service) {
      service.push(max(service[1], d => d['Users']))
    });

    //sort by high to low val
    $: serviceData.sort((a, b) => b[2] - a[2]);

    // $: serviceData = rollups(ochaData, group => max(group, d => d.Users), d => d.Service)
    //   .sort(([, a], [, b]) => descending(a, b));

    //add up users per year per service
    $: yearlyData = rollup(
      ochaData,
      v => sum(v, d => d.Users),
      d => d.Date.getFullYear(),
      d => d.Service
    );

    //aggregate data into groups by year
    $: groupData = Array.from(yearlyData, ([year, data]) => {
      const obj = {};
      for (const [service, value] of data) {
        obj.year = year;
        obj[service] = value;
      }
      return obj;
    })

    $: groups = groupData.map(d => d.year)
    $: console.log('groups', groups)

    $: subgroups = Object.keys(groupData[0])
    $: console.log('subgroups', Object.keys(groupData[0]))

    // $: console.log('ochaData',ochaData);
    // $: console.log('serviceData',serviceData);
    $: console.log('yearlyData',yearlyData);
    $: console.log('groupData',groupData);

  });


  // $: console.log('hrpData=', hrpData)
  // $: console.log('countryData=', [...countryData])
  // $: console.log('fullExtents=', fullExtents)

  const groupBy = 'year';
</script>



<main>

  {#if groupData!==undefined}
  <LayerCake
    padding={{ top: 30, right: 20, bottom: 0, left: 10 }}
    data={ groupData }
    _custom={{groupBy}}
    x={groupBy}
    xScale={ scaleBand() }
    xDomain={groupData.map(d => d[groupBy])}
    yScale={ scaleLinear() }
    y={d => d}
  >
    <Svg>
      <ColumnGroup />
    </Svg>
  </LayerCake>
  {/if}

  <h3>User Growth in OCHA Platforms</h3>
  <div class='group-chart-container'>
    {#each serviceData as service}
      <div class='multiples-chart-container'>
        <LayerCake
          padding={{ top: 30, right: 20, bottom: 0, left: 10 }}
          data={ service[1] }
          x='Date'
          y='Users'
          xScale={ scaleTime() }
          yDomain={fullExtents.y}
        >
          <Html>
            <h5>{service[0]}</h5>
          </Html>
          <Svg>
            <AxisX
              baseline={true}
              formatTick={timeFormat('%Y')}
              gridlines={false}
              snapTicks={true}
              ticks={fullExtents.x}
            />
            <AxisY
              formatTick={format('.2s')}
              ticks={fullExtents.y}
            />
            <Line stroke='#1EBFB3' />
          </Svg>
        </LayerCake>
      </div>
    {/each}
  </div>

</main>

<style>
  .group-chart-container {
    margin-bottom: 50px;
    width: 800px;
  }
  .multiples-chart-container {
    display: inline-block;
    height: 120px;
    padding-bottom: 20px;
    width: 20%;
  }
  h5 {
    line-height: 15px;
    margin: -30px 0 0;
  }
</style>
