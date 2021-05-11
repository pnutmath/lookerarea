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
          element.innerHTML = `<h1>Max : ${max}</h1>`;
        }
        chartdata.push({
          index: chartdata.length,
          name: path.slice(i, i + 1)[0],
          value: +d[measure.name].value,
        });
      });
    });

    console.log('final chart data', chartdata);

    // set the dimensions and margins of the graph
    const margin = { top: 30, right: 30, bottom: 70, left: 60 };
    const width = element.clientWidth;
    const height = element.clientHeight;

    const svg = d3
      .select('#vis')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // X axis
    const x = d3
      .scaleBand()
      .range([0, width])
      .domain(chartdata.map((item) => item.index))
      .padding(1);

    const xAxisTickFormat = (number) => chartdata[number].name;
    svg
      .append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x).tickFormat(xAxisTickFormat))
      .selectAll('text')
      .attr('transform', 'translate(-10,10)rotate(-45)')
      .style('text-anchor', 'end');

    // Add Y axis
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(chartdata, (item) => item.value)])
      .range([height, 0]);
    svg.append('g').call(d3.axisLeft(y));

    // Area
    svg
      .append('path')
      .datum(chartdata)
      .attr('fill', '#cce5df')
      .attr('stroke', '#69b3a2')
      .attr('stroke-width', 1.5)
      .attr(
        'd',
        d3
          .area()
          .x((d) => x(d.index))
          .y0(y(0))
          .y1((d) => y(d.value))
      );

    doneRendering();
  },
};

looker.plugins.visualizations.add(visObject);
