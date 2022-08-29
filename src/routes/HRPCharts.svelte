<script>
  import { curveBasis, csv, format, group, max, timeFormat } from 'd3'
  import { scaleTime } from 'd3-scale'
  import { calcExtents, LayerCake, Html, Svg } from 'layercake'
  import { onMount, setContext } from 'svelte'

  import AxisX from '$components/charts/AxisX.svelte';
  import AxisY from '$components/charts/AxisY.svelte';
  import Line from '$components/charts/Line.svelte';


  let hrpData = [];
  let countryData = [];
  let fundingData = [];
  let fundingCountryData = [];
  let perComplete = [];

  let fullExtents, fundingExtents;

  const extentGetters = {
    x: d => d['Date'],
    y: d => d['UniqueUsers']
  };

  const perCompleteData = 'https://proxy.hxlstandard.org/data.csv?dest=data_edit&strip-headers=on&tagger-match-all=on&tagger-01-header=date&tagger-01-tag=%23date&tagger-02-header=iso3&tagger-02-tag=%23iso&tagger-03-header=location&tagger-03-tag=%23location&tagger-04-header=percentage+data+complete&tagger-04-tag=%23pct%2Bcomplete&tagger-05-header=percentage+data+incomplete&tagger-05-tag=%23pct%2Bincomplete&tagger-06-header=percentage+no+data&tagger-06-tag=%23pct%2Bnodata&header-row=1&url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1KJ4U6rc0ROWzpfHnaSlpRijF-t8T0Ze4Pq2sBjAqKrc%2Fedit%3Fpli%3D1%23gid%3D579688831';



  onMount(async () => {
    //small multiples data by PIN
    hrpData = await csv('./data/hrp-user-growth.csv', function(data) {//HRPTopTen_UsersUnique_PIN
      if (data['CountryName']==='occupied Palestinian territory') data['CountryName'] = 'State of Palestine';
      if (data['CountryName']==='Syria') data['CountryName'] = 'Syrian Arab Republic';
      if (data['CountryName']==='Democratic Republic of Congo') data['CountryName'] = 'Democratic Republic of the Congo';
      data['UniqueUsers'] = +data['UniqueUsers'];
      data['Date'] = new Date(data['Date']);
      return data;
    }).then((data) => {
      return data;
    });


    //small multiples data by PIN
    perComplete = await csv(perCompleteData).then((data) => {
      return group(data, d => d['#location']);
    });

    $: console.log('--',perComplete)



    //filter for HRP countries
    const hrpList = ['Afghanistan','Burkina Faso','Burundi','Cameroon','Central African Republic','Chad','Colombia','Democratic Republic of the Congo','Ethiopia','Haiti','Iraq','Libya','Mali','Mozambique','Myanmar','Niger','Nigeria','Somalia','South Sudan','State of Palestine','Sudan','Syrian Arab Republic','Ukraine','Venezuela (Bolivarian Republic of)','Yemen'];

    $: hrpData = hrpData.filter(d => hrpList.includes(d.CountryName));


    //calculate scale for all small multiples
    $: fullExtents = calcExtents(hrpData, extentGetters);

    //group data by country
    $: countryData = [...group(hrpData, d => d.CountryName)];
    
    //find max val by country
    $: countryData.forEach(function(country) {
      let c = perComplete.get(country[0]);
      let per = (c !== undefined) ? c[0]['#pct+complete'] : 0;
      country.push(max(country[1], d => d['UniqueUsers']));
      country.push(+per);
    });

    //sort by high to low val
    $: countryData.sort((a, b) => {
      return b[2] - a[2];
    });

    // //small multiples data by funding
    // fundingData = await csv('src/data/HRPTopTen_UsersUnique_Funding.csv', function(data) {
    //   data['Unique Users'] = +data['Unique Users'];
    //   data['Date'] = new Date(data['Date']);
    //   return data;
    // }).then((data) => {
    //   return data;
    // });


    // $: fundingExtents = calcExtents(fundingData, extentGetters);
    // $: fundingCountryData = [...group(fundingData, d => d.Country)];

    // $: fundingCountryData.forEach(function(country) {
    //   country.push(max(country[1], d => d['Unique Users']))
    // });

    // $: fundingCountryData.sort((a, b) => {
    //   return b[2] - a[2];
    // });

  });


  // $: console.log('hrpData=', hrpData)
  $: console.log('countryData=', countryData)
  // $: console.log('fullExtents=', fullExtents)
</script>



<main>

  <h3>HDX User Growth in HRP Countries</h3>
  <div class='group-chart-container'>
    {#each countryData as country}
      <div class='multiples-chart-container'>
        <LayerCake
          padding={{ top: 30, right: 20, bottom: 0, left: 20 }}
          data={ country[1] }
          x='Date'
          y='UniqueUsers'
          xScale={ scaleTime() }
          yDomain={fullExtents.y}
        >
          <Html>
            <h5>{country[0]}</h5>
            <p>{format('.0%')(country[3])} Data Complete</p>
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
            <Line stroke='#1EBFB3' curve={curveBasis} />
          </Svg>
        </LayerCake>
      </div>
    {/each}
  </div>




<!--   <h3>User Growth on HDX in Top 10 HRP Countries by Funding</h3>
  <div class='group-chart-container'>
    {#each fundingCountryData as country}
      <div class='multiples-chart-container'>
        <LayerCake
          padding={{ top: 30, right: 20, bottom: 0, left: 10 }}
          data={ country[1] }
          x='Date'
          y='Unique Users'
          xScale={ scaleTime() }
          yDomain={fundingExtents.y}
        >
          <Html>
            <h5>{country[0]}</h5>
          </Html>
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
  </div> -->

</main>

<style>
  .group-chart-container {
    margin-bottom: 50px;
    width: 800px;
  }
  .multiples-chart-container {
    display: inline-block;
    height: 120px;
    padding-bottom: 35px;
    width: 20%;
  }
  h5 {
    font-size: 12px;
    line-height: 15px;
    margin: -40px 0 0;
    text-align: center;
  }
  p {
    font-size: 12px;
    line-height: 14px;
    margin: 0;
    text-align: center;
  }
</style>
