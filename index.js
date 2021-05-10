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
    element.innerHTML = '<h1>Ready to render!</h1>';
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
    // console.log('data', data);
    // console.log('element', element);
    // console.log('config', config);
    // console.log('queryResponse', queryResponse);
    // console.log('details', details);
    const dimensions = queryResponse.fields.dimension_like;
    const measure = queryResponse.fields.measure_like[0];

    // const width = element.clientWidth;
    // const height = element.clientHeight;

    const chartdata = [];

    let max = 0;
    data.forEach(function (d) {
      // variable number of dimensions
      const path = [];
      for (const dim of dimensions) {
        if (d[dim.name].value === null && !config.show_null_points) break;
        path.push(d[dim.name].value + '');
      }
      path.forEach(function (p, i) {
        if (max < +d[measure.name].value) {
          max = +d[measure.name].value;
          element.innerHTML = `<h1>Max (${measure.name}): ${max}</h1>`;
        }
        chartdata.push({
          name: chartdata.length + 1,
          pathname: path.slice(i, i + 1)[0],
          value: +d[measure.name].value,
        });
      });
    });

    console.log('final chart data', chartdata);

    // set the dimensions and margins of the graph
    var margin = { top: 30, right: 30, bottom: 70, left: 60 },
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    var svg = d3
      .select('#vis')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // X axis
    var x = d3
      .scaleBand()
      .range([0, width])
      .domain(
        chartdata.map(function (d) {
          return d.pathname;
        })
      )
      .padding(0.2);
      
    svg
      .append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end');

    // Add Y axis
    var y = d3
      .scaleLinear()
      .domain([0, d3.max(chartdata, (dataPoint) => dataPoint.value)])
      .range([height, 0]);
    svg.append('g').call(d3.axisLeft(y));

    // Bars
    svg
      .selectAll('mybar')
      .data(chartdata)
      .enter()
      .append('rect')
      .attr('x', function (d) {
        return x(d.pathname);
      })
      .attr('y', function (d) {
        return y(d.value);
      })
      .attr('width', x.bandwidth())
      .attr('height', function (d) {
        return height - y(d.value);
      })
      .attr('fill', '#69b3a2');

    doneRendering();
  },
};

looker.plugins.visualizations.add(visObject);
