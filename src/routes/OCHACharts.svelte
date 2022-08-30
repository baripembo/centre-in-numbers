<script>
  import { csv, flatGroup, format, max, timeFormat } from 'd3'
  import { scaleTime } from 'd3-scale'
  import { calcExtents, LayerCake, Html, Svg } from 'layercake'
  import { onMount, setContext } from 'svelte'

  import AxisX from '$components/charts/AxisX.svelte';
  import AxisY from '$components/charts/AxisY.svelte';
  import Line from '$components/charts/Line.svelte';


  let ochaData = [];
  let serviceData = [];
  let fullExtents;

  const extentGetters = {
    x: d => d['Date'],
    y: d => d['Users']
  };

  onMount(async () => {
    ochaData = await csv('./data/ocha-platforms.csv', function(data) {
      data['Users'] = parseFloat(data['Users'].replace(/,/g, ''));
      data['Date'] = new Date(data['Date']);
      return data;
    }).then((data) => {
      return data;
    });

    const properties = ['HDX', 'unocha.org', 'HPC: FTS', 'CERF', 'HumanitarianResponse.info'];
    ochaData = ochaData.filter(d => properties.includes(d.Service));

    //calculate scale for all small multiples
    fullExtents = calcExtents(ochaData, extentGetters);

    //group data by service
    serviceData = flatGroup(ochaData, d => d.Service);
    
    //find max val by country
    serviceData.forEach(function(service) {
      service.push(max(service[1], d => d['Users']))
    });

    //sort by high to low val
    serviceData.sort((a, b) => b[2] - a[2]);
  });
</script>



<main>

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
    font-size: 12px;
    line-height: 15px;
    margin: -30px 0 0;
    text-align: center;
  }
</style>
