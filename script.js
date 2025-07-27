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
    .text('Video Game Data Set')
    .on('click', (event) => {
      event.preventDefault();
      changeDataset('videogames');
    });

  ul.append('li')
    .attr('class', 'navigation-menu-ul-li')
    .append('a')
    .attr('href', '?data=movies')
    .text('Movies Data Set')
    .on('click', (event) => {
      event.preventDefault();
      changeDataset('movies');
    });

  ul.append('li')
    .attr('class', 'navigation-menu-ul-li')
    .append('a')
    .attr('href', '?data=kickstarter')
    .text('Kickstarter Data Set')
    .on('click', (event) => {
      event.preventDefault();
      changeDataset('kickstarter');
    });
};

const updateActiveLink = (key) => {
  d3.selectAll('.navigation-menu-ul-li a').classed('active-link', false);

  d3.selectAll('.navigation-menu-ul-li a')
    .filter(function () {
      return this.href.includes(`?data=${key}`);
    })
    .classed('active-link', true);
};

updateActiveLink(datasetKey);

const updateHeader = (dataset) => {
  d3.select('#title').remove();
  d3.select('#description').remove();

  d3.select('body')
    .insert('h1', '.container')
    .attr('id', 'title')
    .text(dataset.title);

  d3.select('body')
    .insert('h3', '.container')
    .attr('id', 'description')
    .text(dataset.description);
};

const createSVG = () => {
  return d3
    .select('body')
    .append('div')
    .attr('class', 'container')
    .append('svg')
    .attr('viewBox', `0 0 ${w} ${h + 100}`)
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
updateHeader(dataset);
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
    .selectAll('g.tile-text')
    .data(leaves)
    .enter()
    .append('g')
    .attr('class', 'tile-text')
    .attr('transform', (d) => `translate(${d.x0 + 4}, ${d.y0 + 12})`)
    .each(function (d) {
      const group = d3.select(this);
      const name = d.data.name;
      const tileWidth = d.x1 - d.x0;
      const maxCharsPerLine = Math.floor(tileWidth / 7); // estimate: 7px per char
      const lines = [];

      // Simple word wrap:
      let words = name.split(/\s+/);
      let line = '';

      words.forEach((word) => {
        if ((line + word).length <= maxCharsPerLine) {
          line += word + ' ';
        } else {
          lines.push(line.trim());
          line = word + ' ';
        }
      });
      if (line) lines.push(line.trim());

      // Show up to 3 lines
      const maxLines = 3;
      const trimmedLines = lines.slice(0, maxLines);

      // If the original had more than 3 lines, add ellipsis to the last visible line
      if (lines.length > maxLines) {
        const lastLine = trimmedLines[trimmedLines.length - 1];
        trimmedLines[trimmedLines.length - 1] =
          lastLine.slice(0, maxCharsPerLine - 3).trim() + '...';
      }

      // Render each line
      trimmedLines.forEach((lineText, i) => {
        group
          .append('text')
          .text(lineText)
          .attr('y', i * 10)
          .attr('font-size', '10px')
          .attr('fill', 'white');
      });
    });
};

const clearVisualization = () => {
  svg.selectAll('*').remove(); // clear SVG (tree map)
  d3.select('#legend').remove(); // clear legend
};

const getData = async () => {
  console.log('getData() is running for:', datasetKey);
  console.log('Dataset object:', dataset);
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

const drawLegend = (svg, w, color) => {
  const categories = color.domain();
  const itemWidth = 120; // space per legend item
  const itemHeight = 24; // vertical spacing between rows
  const boxSize = 18;
  const marginTop = 10;

  // Max items per row based on available width
  const itemsPerRow = Math.floor(w / itemWidth);

  // Create legend container below treemap
  const legend = svg
    .append('g')
    .attr('id', 'legend')
    .attr('transform', `translate(0, ${h + marginTop})`);

  // Center the whole legend group
  const legendGroup = legend
    .append('g')
    .attr(
      'transform',
      `translate(${(w - Math.min(w, itemsPerRow * itemWidth)) / 2}, 0)`
    );

  const legendItems = legendGroup
    .selectAll('g')
    .data(categories)
    .enter()
    .append('g')
    .attr('transform', (d, i) => {
      const x = (i % itemsPerRow) * itemWidth;
      const y = Math.floor(i / itemsPerRow) * itemHeight;
      return `translate(${x}, ${y})`;
    });

  legendItems
    .append('rect')
    .attr('class', 'legend-item')
    .attr('width', boxSize)
    .attr('height', boxSize)
    .attr('fill', (d) => color(d));

  legendItems
    .append('text')
    .attr('x', boxSize + 6)
    .attr('y', boxSize - 5)
    .text((d) => d)
    .attr('font-size', '11px');
};

// we will not refresh the page to change data after fetch from API:
function changeDataset(key) {
  const newUrl = `?data=${key}`;
  window.history.pushState({}, '', newUrl);

  const newDataset = DATASETS[key.toLowerCase()] || DATASETS['videogames'];

  updateHeader(newDataset);
  clearVisualization();
  updateActiveLink(key); // mark the link

  d3.json(newDataset.url)
    .then((data) => {
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
    })
    .catch((error) => {
      console.error('Failed to load data:', error);
    });
}
