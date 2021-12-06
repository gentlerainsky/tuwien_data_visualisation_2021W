$(function () {
  const svg = d3.select("#choropleth")
  const $choropleth = $('#choropleth')
  const width = $choropleth.width();
  const height = $choropleth.height();
  // const path = d3.geoPath();
  const projection = d3.geoMercator()
    // center latitude / longitude of London
    .center([-0.1, 51.49])
    // scale the area so it can be plot
    .scale(Math.pow(2, 18) / (2 * Math.PI))
    .translate([width / 2, height / 2])
  const colorScale = d3.scaleThreshold()
    .domain([0, 1 / 5, 1 / 5, 2 / 5, 2 / 5, 3 / 5, 3 / 5, 4 / 5, 4 / 5, 1])
    .range(d3.schemeRdYlGn[10].reverse());

  Promise.all([
    d3.json("/static/geojson/london_boroughs.json"),
    d3.json("/api/choropleth")
  ]).then(function (result) {
    const topo = result[0]
    const data = result[1]

    const mouseOver = function (d) {
      d3.selectAll(".Country")
        .transition()
        .duration(100)
        .style("opacity", .5)
      d3.select(this)
        .transition()
        .duration(100)
        .style("opacity", 1)
        // .style("stroke-width", 10)
        .style("stroke", "black")
    }
    const mouseLeave = function (d) {
      d3.selectAll(".Country")
        .transition()
        .duration(100)
        // .style("stroke-width", 0)
        .style("opacity", .8)
      d3.select(this)
        .transition()
        .duration(100)
        // .style("stroke", "transparent")
        .style("stroke", "black")
        .style("stroke-width", 1)
        .style("opacity", .8)
    }

    const mouseClick = function (target, data) {
      console.log('click', target)
      if (data) {
        console.log('borough_id', data.properties.id)
      } else {
        console.log('click no data')
      }
    }
    //
    // const testClick = function (target, data) {
    //   console.log('click', target)
    //   console.log('data', data)
    // }
    svg.style("background", "grey")
      .on("click", mouseClick)

    svg.append("g")
      .selectAll("path")
      .data(topo.features)
      .join("path")
      .attr("d", d3.geoPath()
        .projection(projection)
      )
      .attr("fill", function (d) {
        d.total = data[d.properties.id]['percentile']
        return colorScale(d.total);
      })
      .style("stroke", "transparent")
      .style("stroke", "black")
      .attr("class", function (d) {
        return "Country"
      })
      .style("opacity", .8)
      .on("mouseover", mouseOver)
      .on("mouseleave", mouseLeave)
      .on("click", mouseClick)
  })
})
