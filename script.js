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

const w = 1000;
const h = 600;
const padding = 10;
let color;

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

const renderTreemap = (data) => {
  const root = d3
    .hierarchy(data)
    .sum((d) => d.value)
    .sort((a, b) => b.value - a.value);

  const treemapLayout = d3.treemap().size([w, h]).paddingInner(1);
  treemapLayout(root);

  const leaves = root.leaves();

  svg
    .selectAll('rect')
    .data(leaves)
    .enter()
    .append('rect')
    .attr('class', 'tile')
    .attr('data-name', (d) => d.data.name)
    .attr('data-category', (d) => d.data.category)
    .attr('data-value', (d) => d.data.value)
    .attr('x', (d) => d.x0)
    .attr('y', (d) => d.y0)
    .attr('width', (d) => d.x1 - d.x0)
    .attr('height', (d) => d.y1 - d.y0)
    .attr('fill', (d) => color(d.data.category || 'default'))
    .on('mouseover', function (event, d) {
      tooltip
        .style('opacity', 1)
        .style('display', 'block')
        .attr('data-value', d.data.value)
        .html(
          `
            <strong>${d.data.name}</strong><br/>
            Category: ${d.data.category}<br/>
            Value: ${d.data.value}
          `
        )
        .style(
          'left',
          Math.min(event.pageX + 10, window.innerWidth - 150) + 'px'
        )
        .style('top', Math.max(event.pageY - 30, 10) + 'px');

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

  svg
    .selectAll('text')
    .data(leaves)
    .enter()
    .append('text')
    .attr('x', (d) => d.x0 + 4)
    .attr('y', (d) => d.y0 + 14)
    .text((d) => d.data.name)
    .attr('font-size', '10px')
    .attr('fill', 'white')
    .attr('pointer-events', 'none');
};

const getData = async () => {
  try {
    const data = await d3.json(dataset.url);
    const categories = Array.from(
      new Set(
        data.children.flatMap((group) =>
          group.children.map((item) => item.category)
        )
      )
    );

    color = d3.scaleOrdinal().domain(categories).range(d3.schemeCategory10);
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

// {
//   "name": "Movies",
//   "children": [
//     {
//       "name": "Action",
//       "children": [
//         {
//           "name": "Avatar ",
//           "category": "Action",
//           "value": "760505847"
//         },
//         {
//           "name": "Jurassic World ",
//           "category": "Action",
//           "value": "652177271"
