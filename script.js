const dataEducationUrl =
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';
const dataCountyUrl =
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';

const w = 1000;
const h = 600;
const padding = 60;

const thresholds = [0, 10, 20, 30, 40, 50];
const colorRange = [
  '#fef0d9',
  '#fddbc7',
  '#f4a582',
  '#d6604d',
  '#b2182b',
  '#67001f',
];

//-------------------------------------------------------

const createHeader = () => {
  d3.select('body')
    .append('h1')
    .attr('id', 'title')
    .text('United States Educational Attainment');

  d3.select('body')
    .append('h3')
    .attr('id', 'description')
    .text(
      "Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)"
    );
};

const createSVG = () => {
  return d3
    .select('body')
    .append('div')
    .attr('class', 'container')
    .append('svg')
    .attr('viewBox', `0 0 ${w} ${h}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');
};

const createTooltip = () => {
  return d3
    .select('body')
    .append('div')
    .attr('id', 'tooltip')
    .style('opacity', 0)
    .style('position', 'absolute')
    .style('pointer-events', 'none')
    .style('z-index', 10);
};

createHeader();
const svg = createSVG();
const tooltip = createTooltip();

const drawCounties = (svg, counties, educationMap, color, tooltip) => {
  svg
    .selectAll('path')
    .data(counties)
    .join('path')
    .attr('class', 'county')
    .attr('d', d3.geoPath())
    .attr('fill', (d) => {
      const county = educationMap.get(d.id);
      return county ? color(county.bachelorsOrHigher) : '#ccc';
    })
    .attr('data-fips', (d) => d.id)
    .attr('data-education', (d) => {
      const county = educationMap.get(d.id);
      return county ? county.bachelorsOrHigher : 0;
    })
    //-------------------------------------------------------
    .on('mouseover', function (event, d) {
      const county = educationMap.get(d.id);
      if (county) {
        tooltip
          .style('opacity', 1)
          .style('display', 'block')
          .attr('data-education', county.bachelorsOrHigher)
          .html(
            `<strong>${county.area_name}, ${county.state}</strong>: ${county.bachelorsOrHigher}%`
          )
          .style(
            'left',
            Math.min(event.pageX + 10, window.innerWidth - 150) + 'px'
          )
          .style('top', Math.max(event.pageY - 30, 10) + 'px');
      }
      d3.select(this)
        .attr('stroke', '#000')
        .transition()
        .duration(200)
        .attr('stroke-width', 1.5);
    })

    .on('mouseout', function () {
      tooltip.style('opacity', 0).style('display', 'none');
      d3.select(this).attr('stroke', null);
    });
};
const getData = async () => {
  try {
    const [educationData, countyData] = await Promise.all([
      d3.json(dataEducationUrl),
      d3.json(dataCountyUrl),
    ]);

    // Create a map of fips -> education object:
    const educationMap = new Map(educationData.map((d) => [d.fips, d]));

    // Convert TopoJSON to GeoJSON:
    const counties = topojson.feature(
      countyData,
      countyData.objects.counties
    ).features;

    // Get a color scale:
    const getColorScale = () => {
      return d3.scaleThreshold().domain(thresholds).range(colorRange);
    };
    const color = getColorScale();

    // Draw counties
    drawCounties(svg, counties, educationMap, color, tooltip);
    drawLegend(svg, w, color);
  } catch (error) {
    console.error('Failed to load data:', error);
  }
};
getData();

const drawLegend = (svg, w, color) => {
  const legendWidth = 200;
  const legendHeight = 10;
  const legendX = (w - legendWidth) / 2;
  const legendY = 15;

  const legend = svg
    .append('g')
    .attr('id', 'legend')
    .attr('transform', `translate(${legendX}, ${legendY})`);

  const x = d3
    .scaleLinear()
    .domain([color.domain()[0], color.domain()[color.domain().length - 1]])
    .range([0, legendWidth]);

  legend
    .selectAll('rect')
    .data(color.range())
    .enter()
    .append('rect')
    .attr('x', (d) => {
      const [x0, _] = color.invertExtent(d);
      return x(x0);
    })
    .attr('width', (d) => {
      const [x0, x1] = color.invertExtent(d);
      return x(x1) - x(x0);
    })
    .attr('height', legendHeight)
    .attr('fill', (d) => d)
    .attr('stroke', '#ccc');

  const xScaleLegend = d3
    .scaleLinear()
    .domain([color.domain()[0], color.domain()[color.domain().length - 1]])
    .range([0, legendWidth]);

  const legendThresholds = [0, ...color.domain()];

  const xAxisLegend = d3
    .axisBottom(xScaleLegend)
    .tickValues(legendThresholds)
    .tickFormat((d) => `${d}%`);

  legend
    .append('g')
    .attr('id', 'x-axis-legend')
    .attr('transform', `translate(0, ${legendHeight})`)
    .call(xAxisLegend);
};
