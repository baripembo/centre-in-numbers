<script>

  import { Router, Link, Route } from "svelte-routing";
  import Home from "./routes/Home.svelte";
  import HRPCharts from "./routes/HRPCharts.svelte";

  export let url = "";



  import { csv, format, group, groups, max, precisionFixed, reduce, timeFormat, timeParse } from 'd3'
  import { scaleOrdinal, scaleTime } from 'd3-scale'
  import { calcExtents, LayerCake, Html, Svg } from 'layercake'
  import { onMount, setContext } from 'svelte'

  import AnnotationsLabel from './components/charts/AnnotationsLabel.svelte';
  import AxisX from './components/charts/AxisX.svelte';
  import AxisY from './components/charts/AxisY.svelte';
  import Key from './components/charts/Key.html.svelte';
  import Labels from './components/charts/GroupLabels.html.svelte';
  import Line from './components/charts/Line.svelte';
  import MultiLine from './components/charts/MultiLine.svelte';
  import Scatter from './components/charts/Scatter.svelte';
  import SharedTooltip from './components/charts/SharedTooltip.html.svelte';

  import data from './data/fruit.csv';

  const xKey = 'month';
  const yKey = 'value';
  const zKey = 'fruit';

  const seriesNames = Object.keys(data[0]).filter(d => d !== xKey);
  const seriesColors = ['#1ebfb3', '#f2645a', '#007ce1', '#9c27b0', '#2CA02C'];

  const parseDate = timeParse('%Y-%m-%d');

  const dataLong = seriesNames.map(key => {
    return {
      [zKey]: key,
      values: data.map(d => {
        d[xKey] = typeof d[xKey] === 'string' ? parseDate(d[xKey]) : d[xKey]; // Conditional required for sapper
        return {
          [yKey]: +d[key],
          [xKey]: d[xKey],
          [zKey]: key
        };
      })
    };
  });


  const flatten = data => data.reduce((memo, group) => {
    return memo.concat(group.values);
  }, []);

  const formatTickX = timeFormat('%b %Y');
  const formatTickY = d => format(`.${precisionFixed(d)}s`)(d);


  console.log('data',data)
  console.log('seriesNames',seriesNames)
  console.log('dataLong',dataLong)
  console.log('flatten',flatten(dataLong))




  let costData,
      growthData,
      userData = [];

  let ochaData = [];
  let ochaGroupData = [];

  let hrpData,
      countryData = [];

  let fundingData,
      fundingCountryData = [];

  let fullExtents, fundingExtents;

  const extentGetters = {
    x: d => d['Date'],
    y: d => d['Unique Users']
  };



  onMount(async () => {
    costData = await csv('src/data/cost-per-user.csv', function(data) {
      data['HDX Cost Per User'] = +data['HDX Cost Per User'];
      data['Year'] = new Date(data['Year'], 0);
      return data;
    }).then((data) => {
      return data;
    });

    growthData = await csv('src/data/hdx-growth.csv', function(data) {
      data['Number of Datasets on HDX'] = +data['Number of Datasets on HDX'];
      data['Total_Orgs'] = +data['Total_Orgs'];
      data['End_Date'] = new Date(data['End_Date']);
      return data;
    }).then((data) => {
      return data;
    });

    userData = await csv('src/data/hdx-users.csv', function(data) {
      data['Unique Users_Updated'] = parseFloat(data['Unique Users_Updated'].replace(/,/g, ''));
      data['Month'] = new Date(data['Month']);
      return data;
    }).then((data) => {
      return data;
    });

    ochaData = await csv('src/data/ocha-platforms.csv', function(data) {
      data['Users'] = parseFloat(data['Users'].replace(/,/g, ''));
      data['Date'] = new Date(data['Date']);
      return data;
    }).then((data) => {
      return data;
    });

    //small multiples data by PIN
    hrpData = await csv('src/data/HRPTopTen_UsersUnique_PIN.csv', function(data) {
      data['Unique Users'] = +data['Unique Users'];
      data['Date'] = new Date(data['Date']);
      return data;
    }).then((data) => {
      return data;
    });

    //calculate scale for all small multiples
    $: fullExtents = calcExtents(hrpData, extentGetters);

    //group data by country
    $: countryData = [...group(hrpData, d => d.Country)];
    
    //find max val by country
    $: countryData.forEach(function(country) {
      country.push(max(country[1], d => d['Unique Users']))
    });

    //sort by high to low val
    $: countryData.sort((a, b) => {
      return b[2] - a[2];
    });

    //small multiples data by funding
    fundingData = await csv('src/data/HRPTopTen_UsersUnique_Funding.csv', function(data) {
      data['Unique Users'] = +data['Unique Users'];
      data['Date'] = new Date(data['Date']);
      return data;
    }).then((data) => {
      return data;
    });


    $: fundingExtents = calcExtents(fundingData, extentGetters);
    $: fundingCountryData = [...group(fundingData, d => d.Country)];

    $: fundingCountryData.forEach(function(country) {
      country.push(max(country[1], d => d['Unique Users']))
    });

    $: fundingCountryData.sort((a, b) => {
      return b[2] - a[2];
    });

    //const seriesNames = Object.keys(data[0]).filter(d => d !== xKey);
  });

  const userAnnotations = [
    {
      text: 'The Centre for Humanitarian Data opens',
      Month: new Date(2017, 0),
    }
  ];

  const properties = ['unocha.org', 'HPC: FTS', 'CERF', 'GHO 2022', 'IASC Inter-Agency Standing Committee'];
  $: ochaData = ochaData.filter(d => properties.includes(d.Service));

  //group data by country
  $: ochaGroupData = groups(ochaData, d => d.Service).reduce((acc, curr) => {
    let obj = {
      'Service': curr[0],
      'values': curr[1]
    };
    acc.push(obj);
    return acc;
  }, []);
  $: console.log('ochaData=', ochaData)
  $: console.log('ochaGroupData=', ochaGroupData)
  $: console.log('flatten(ochaGroupData)=', flatten(ochaGroupData));

  // $: console.log('hrpData=', hrpData)
  // $: console.log('countryData=', [...countryData])
  // $: console.log('fullExtents=', fullExtents)


</script>


<Router url="{url}">
  <nav>
    <Link to="/">Home</Link>
    <Link to="hrp-charts">HRP Charts</Link>
  </nav>

</Router>



<main>

  <div class="chart-container">
    <h3>User Growth in OCHA Properties</h3>
    <LayerCake
      padding={{ top: 0, right: 0, bottom: 0, left: 20 }}
      x='Date'
      y='Users'
      z='Service'
      xScale={ scaleTime() }
      zScale={ scaleOrdinal() }
      zRange={ seriesColors }
      flatData={flatten(ochaGroupData)}
      data={ochaGroupData}
    >
      <Svg>
        <AxisX
          baseline={true}
          formatTick={timeFormat('%b %Y')}
          gridlines={false}
          snapTicks={true}
          ticks={9}
        />
        <AxisY
          formatTick={format('.2s')}
        />
        <MultiLine/>
      </Svg>

      <Html pointerEvents={true}>
        <Key align='start' />
      </Html>
    </LayerCake>
  </div>

  <br><br><br><br>

<!--   <div class="chart-container">
    <LayerCake
      padding={{ top: 7, right: 10, bottom: 20, left: 25 }}
      x={xKey}
      y={yKey}
      z={zKey}
      yDomain={[0, null]}
      zScale={scaleOrdinal()}
      zRange={seriesColors}
      flatData={flatten(dataLong)}
      data={dataLong}
    >
      <Svg>
        <AxisX
          gridlines={false}
          ticks={data.map(d => d[xKey]).sort((a, b) => a - b)}
          formatTick={formatTickX}
          snapTicks={true}
          tickMarks={true}
        />
        <AxisY
          ticks={4}
          formatTick={formatTickY}
        />
        <MultiLine/>
      </Svg>

      <Html>
        <Labels/>
        <SharedTooltip
          formatTitle={formatTickX}
          dataset={data}
        />
      </Html>
    </LayerCake>
  </div> -->


<!--   <div class='chart-container'>
    <h3>Cost Per Monthly Unique User</h3>
    <LayerCake
      padding={{ top: 0, right: 0, bottom: 0, left: 20 }}
      data={ costData }
      x='Year'
      y='HDX Cost Per User'
      xScale={ scaleTime() }
    >
      <Svg>
        <AxisX
          baseline={true}
          formatTick={timeFormat('%Y')}
          gridlines={false}
          snapTicks={true}
        />
        <AxisY
          formatTick={format('$')}
        />
        <Line stroke='#007CE0' />
        <Scatter 
          fill='#007CE0'
          labels={true}
          labelFormat={format('$.2f')} 
        />
      </Svg>
    </LayerCake>
  </div>


  <div class='chart-container'>
    <h3>Datasets on HDX</h3>
    <LayerCake
      padding={{ top: 0, right: 0, bottom: 0, left: 20 }}
      data={ growthData }
      x='End_Date'
      y='Number of Datasets on HDX'
      xScale={ scaleTime() }
    >
      <Svg>
        <AxisX
          baseline={true}
          formatTick={timeFormat('%b %Y')}
          gridlines={false}
        />
        <AxisY
          axisLabel={'Number of Datasets'}
          formatTick={format('.2s')}
        />
        <Line stroke='#1EBFB3' />
      </Svg>
    </LayerCake>
  </div>


  <div class='chart-container'>
    <h3>Organizations on HDX</h3>
    <LayerCake
      padding={{ top: 0, right: 0, bottom: 0, left: 20 }}
      data={ growthData }
      x='End_Date'
      y='Total_Orgs'
      xScale={ scaleTime() }
    >
      <Svg>
        <AxisX
          baseline={true}
          formatTick={timeFormat('%b %Y')}
          gridlines={false}
        />
        <AxisY
          axisLabel={'Number of Orgs'}
        />
        <Line stroke='#1EBFB3' />
      </Svg>
    </LayerCake>
  </div>


  <div class='chart-container'>
    <h3>Unique Users on HDX</h3>
    <LayerCake
      padding={{ top: 0, right: 0, bottom: 0, left: 20 }}
      data={ userData }
      x='Month'
      y='Unique Users_Updated'
      yNice={true}
      yDomain={[0, max(userData, d => d['Unique Users_Updated'] + 50000)]}
      xScale={ scaleTime() }
    >
      <Svg>
        <AxisX
          baseline={true}
          formatTick={timeFormat('%b %Y')}
          gridlines={false}
        />
        <AxisY
          axisLabel={'Number of Unique Users'}
          formatTick={format('.2s')}
        />
        <Line stroke='#1EBFB3' />

        <AnnotationsLabel annotations={userAnnotations} />
      </Svg>

    </LayerCake>
  </div> 

<br><br><br><br><br><br>-->



  <div class='group-chart-container'>
    <h3>User Growth on HDX in Top 10 HRP Countries by PIN</h3>
    {#each countryData as country}
      <div class='multiples-chart-container'>
        <h5>{country[0]}</h5>
        <LayerCake
          padding={{ top: 0, right: 10, bottom: 0, left: 10 }}
          data={ country[1] }
          x='Date'
          y='Unique Users'
          xScale={ scaleTime() }
          yDomain={fullExtents.y}
        >
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

<br><br><br><br><br><br><br><br><br><br><br><br>



  <div class='group-chart-container'>
    <h3>User Growth on HDX in Top 10 HRP Countries by Funding</h3>
    {#each fundingCountryData as country}
      <div class='multiples-chart-container'>
        <h5>{country[0]}</h5>
        <LayerCake
          padding={{ top: 0, right: 10, bottom: 0, left: 10 }}
          data={ country[1] }
          x='Date'
          y='Unique Users'
          xScale={ scaleTime() }
          yDomain={fundingExtents.y}
        >
          <Svg>
            <AxisX
              baseline={true}
              formatTick={timeFormat('%Y')}
              gridlines={false}
              snapTicks={true}
              ticks={fundingExtents.x}
            />
            <AxisY
              formatTick={format('.2s')}
              ticks={fundingExtents.y}
            />
            <Line stroke='#1EBFB3' />
          </Svg>
        </LayerCake>
      </div>
    {/each}
  </div>

</main>

<style>
  .chart-container {
    margin-bottom: 80px;
    width: 600px;
    height: 300px;
  }
  .group-chart-container {
    height: 180px;
    width: 800px;
  }
  .multiples-chart-container {
    display: inline-block;
    height: 50%;
    margin-bottom: 75px;
    position: relative;
    width: 20%;
  }
  h5 {
    margin: 0 0 15px;
  }
</style>
