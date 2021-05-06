/**
 * Welcome to the Looker Visualization Builder! Please refer to the following resources
 * to help you write your visualization:
 *  - API Documentation - https://github.com/looker/custom_visualizations_v2/blob/master/docs/api_reference.md
 *  - Example Visualizations - https://github.com/looker/custom_visualizations_v2/tree/master/src/examples
 **/

const visObject = {
  /**
   * Configuration options for your visualization. In Looker, these show up in the vis editor
   * panel but here, you can just manually set your default values in the code.
   **/
  options: {
    first_option: {
      type: 'string',
      label: 'My First Option',
      default: 'Default Value',
    },
    second_option: {
      type: 'number',
      label: 'My Second Option',
      default: 42,
    },
  },

  /**
   * The create function gets called when the visualization is mounted but before any
   * data is passed to it.
   **/
  create: function (element, config) {
    element.innerHTML = '<h1>Loading area graph...</h1>';
  },

  /**
   * UpdateAsync is the function that gets called (potentially) multiple times. It receives
   * the data and should update the visualization with the new data.
   **/
  updateAsync: function (
    data,
    element,
    config,
    queryResponse,
    details,
    doneRendering
  ) {
    // const width = element.clientWidth;
    // const height = element.clientHeight;
    const dimensions = queryResponse.fields.dimension_like;
    const measure = queryResponse.fields.measure_like[0];

    console.log(data, element, config, queryResponse, details);

    const svg = d3
      .select('#vis')
      .append('svg')
      .attr('height', 300)
      .attr('width', 600);

    let elem = document.getElementById('vis');
    console.log(elem);
    var list = document.getElementById('vis'); // Get the <ul> element with id="myList"
    //list.removeChild(list.childNodes[0]);
    if (list.childNodes.length > 1) {
      return false;
    }

    data.forEach(function (d) {
      // variable number of dimensions
      const path = [];
      for (const dim of dimensions) {
        if (d[dim.name].value === null && !config.show_null_points) break;
        path.push(d[dim.name].value + '');
      }
      path.forEach(function (p, i) {
        if (i === path.length - 1) return;
        console.log(p, i);
      });
    });

    data = [
      {
        year: 2000,
        popularity: 50,
      },
      {
        year: 2001,
        popularity: 150,
      },
      {
        year: 2002,
        popularity: 200,
      },
      {
        year: 2003,
        popularity: 130,
      },
      {
        year: 2004,
        popularity: 240,
      },
      {
        year: 2005,
        popularity: 380,
      },
      {
        year: 2006,
        popularity: 420,
      },
    ];

    const strokeWidth = 1.5;
    const margin = { top: 0, bottom: 20, left: 30, right: 20 };

    const chart = svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`);

    // set the dimensions and margins of the graph
    // var margin = { top: 20, right: 20, bottom: 30, left: 40 },
    // width = 960 - margin.left - margin.right,
    // height = 500 - margin.top - margin.bottom;

    const width =
      +svg.attr('width') - margin.left - margin.right - strokeWidth * 2;

    const height = +svg.attr('height') - margin.top - margin.bottom;

    const grp = chart
      .append('g')
      .attr(
        'transform',
        `translate(-${margin.left - strokeWidth},-${margin.top})`
      );

    // Create scales
    const xScale = d3
      .scaleLinear()
      .range([0, width])
      .domain(d3.extent(data, (dataPoint) => dataPoint.year));

    const yScale = d3
      .scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(data, (dataPoint) => dataPoint.popularity)]);

    const area = d3
      .area()
      .x((dataPoint) => xScale(dataPoint.year))
      .y0(height)
      .y1((dataPoint) => yScale(dataPoint.popularity));

    // Add area
    grp
      .append('path')
      .attr('transform', `translate(${margin.left},0)`)
      .datum(data)
      .style('fill', 'url(#svgGradient)')
      .attr('stroke', 'steelblue')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', strokeWidth)
      .attr('d', area);

    // Add the X Axis
    chart
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(data.length).tickFormat(d3.format('')));

    // Add the Y Axis
    chart
      .append('g')
      .attr('transform', `translate(0, 0)`)
      .call(d3.axisLeft(yScale));

    // Add total value to the tooltip
    const totalSum = data.reduce((total, dp) => +total + +dp.popularity, 0);
    d3.select('.tooltip .totalValue').text(totalSum);

    // Add gradient defs to svg
    const defs = svg.append('defs');

    const gradient = defs.append('linearGradient').attr('id', 'svgGradient');
    const gradientResetPercentage = '50%';

    gradient
      .append('stop')
      .attr('class', 'start')
      .attr('offset', gradientResetPercentage)
      .attr('stop-color', 'lightblue');

    gradient
      .append('stop')
      .attr('class', 'start')
      .attr('offset', gradientResetPercentage)
      .attr('stop-color', 'darkblue');

    gradient
      .append('stop')
      .attr('class', 'end')
      .attr('offset', gradientResetPercentage)
      .attr('stop-color', 'darkblue')
      .attr('stop-opacity', 1);

    gradient
      .append('stop')
      .attr('class', 'end')
      .attr('offset', gradientResetPercentage)
      .attr('stop-color', 'lightblue');

    doneRendering();
  },
};

looker.plugins.visualizations.add(visObject);