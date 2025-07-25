const DATASETS = {
  kickstarter: {
    url: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json',
    title: 'Kickstarter Pledges',
    description:
      'Top 100 Most Pledged Kickstarter Campaigns Grouped by Category',
  },
  movies: {
    url: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json',
    title: 'Movie Sales',
    description: 'Top 100 Highest Grossing Movies Grouped by Genre',
  },
  videogames: {
    url: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json',
    title: 'Video Game Sales',
    description: 'Top 100 Video Game Sales Grouped by Platform',
  },
};

const params = new URLSearchParams(window.location.search);
const datasetKey = params.get('data') || 'videogames';
const dataset = DATASETS[datasetKey.toLowerCase()] || DATASETS['videogames'];

const w = 1200;
const h = 800;
const padding = 10;

//-------------------------------------------------------

const createNavbar = () => {
  const nav = d3.select('body').insert('nav').attr('class', 'navigation-menu');

  const ul = nav.append('ul').attr('class', 'navigation-menu-ul');

  ul.append('li')
    .attr('class', 'navigation-menu-ul-li')
    .append('a')
    .attr('href', '?data=videogames')
    .text('Video Game Data Set');

  ul.append('li')
    .attr('class', 'navigation-menu-ul-li')
    .append('a')
    .attr('href', '?data=movies')
    .text('Movies Data Set');

  ul.append('li')
    .attr('class', 'navigation-menu-ul-li')
    .append('a')
    .attr('href', '?data=kickstarter')
    .text('Kickstarter Data Set');
};

const createHeader = () => {
  d3.select('body').append('h1').attr('id', 'title').text(dataset.title);

  d3.select('body')
    .append('h3')
    .attr('id', 'description')
    .text(dataset.description);
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

createNavbar();
createHeader();
const svg = createSVG();
const tooltip = createTooltip();

// const drawCounties = (svg, counties, educationMap, color, tooltip) => {
//   svg
//     .selectAll('rect')
//     .data(counties)
//     .join('path')
//     .attr('class', 'tile')
//     .attr('d', d3.geoPath())
//     .attr('fill', (d) => {
//       const county = educationMap.get(d.id);
//       return county ? color(county.bachelorsOrHigher) : '#ccc';
//     })
//     .attr('data-fips', (d) => d.id)
//     .attr('data-education', (d) => {
//       const county = educationMap.get(d.id);
//       return county ? county.bachelorsOrHigher : 0;
//     })
//     //-------------------------------------------------------
//     .on('mouseover', function (event, d) {
//       const county = educationMap.get(d.id);
//       if (county) {
//         tooltip
//           .style('opacity', 1)
//           .style('display', 'block')
//           .attr('data-education', county.bachelorsOrHigher)
//           .html(
//             `<strong>${county.area_name}, ${county.state}</strong>: ${county.bachelorsOrHigher}%`
//           )
//           .style(
//             'left',
//             Math.min(event.pageX + 10, window.innerWidth - 150) + 'px'
//           )
//           .style('top', Math.max(event.pageY - 30, 10) + 'px');
//       }
//       d3.select(this)
//         .attr('stroke', '#000')
//         .transition()
//         .duration(200)
//         .attr('stroke-width', 1.5);
//     })

//     .on('mouseout', function () {
//       tooltip.style('opacity', 0).style('display', 'none');
//       d3.select(this).attr('stroke', null);
//     });
// };

const getData = async () => {
  try {
    const data = await d3.json(dataset.url);
    renderTreemap(data);

    drawLegend(svg, w, color);
  } catch (error) {
    console.error('Failed to load data:', error);
  }
};
getData();

// const drawLegend = (svg, w, color) => {
//   const legendWidth = 200;
//   const legendHeight = 10;
//   const legendX = (w - legendWidth) / 2;
//   const legendY = 15;

//   const legend = svg
//     .append('g')
//     .attr('id', 'legend')
//     .attr('transform', `translate(${legendX}, ${legendY})`);

//   const x = d3
//     .scaleLinear()
//     .domain([color.domain()[0], color.domain()[color.domain().length - 1]])
//     .range([0, legendWidth]);

//   legend
//     .selectAll('rect')
//     .data(color.range())
//     .enter()
//     .append('rect')
//     .attr('x', (d) => {
//       const [x0, _] = color.invertExtent(d);
//       return x(x0);
//     })
//     .attr('width', (d) => {
//       const [x0, x1] = color.invertExtent(d);
//       return x(x1) - x(x0);
//     })
//     .attr('height', legendHeight)
//     .attr('fill', (d) => d)
//     .attr('stroke', '#ccc');

//   const xScaleLegend = d3
//     .scaleLinear()
//     .domain([color.domain()[0], color.domain()[color.domain().length - 1]])
//     .range([0, legendWidth]);

//   const legendThresholds = [0, ...color.domain()];

//   const xAxisLegend = d3
//     .axisBottom(xScaleLegend)
//     .tickValues(legendThresholds)
//     .tickFormat((d) => `${d}%`);

//   legend
//     .append('g')
//     .attr('id', 'x-axis-legend')
//     .attr('transform', `translate(0, ${legendHeight})`)
//     .call(xAxisLegend);
// };
