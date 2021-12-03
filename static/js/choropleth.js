$(function() {
// The svg
    const svg = d3.select("svg"),
      width = +svg.attr("width"),
      height = +svg.attr("height");

// Map and projection
    const path = d3.geoPath();
    const projection = d3.geoMercator()
      // center latitude / longitude of London
      .center([-0.1, 51.49])
      // scale the area so it can be plot
      .scale(Math.pow(2, 17) / (Math.PI))
      .translate([width / 2, height / 2])
// Data and color scale
//     let data = new Map()
    const colorScale = d3.scaleThreshold()
      .domain([0, 1 / 5, 1 / 5, 2 / 5, 2 / 5, 3 / 5, 3 / 5, 4 / 5, 4 / 5, 1])
      .range(d3.schemeRdYlGn[10].reverse());

// Load external data and boot
    Promise.all([
        d3.json("/static/geojson/london_boroughs.json"),
        d3.json("/api/choropleth")
    ]).then(function (result) {
        const topo = result[0]
        const data = result[1]
        let mouseOver = function (d) {
            d3.selectAll(".Country")
              .transition()
              .duration(200)
              .style("opacity", .5)
            d3.select(this)
              .transition()
              .duration(200)
              .style("opacity", 1)
              .style("stroke", "black")
        }
        let mouseLeave = function (d) {
            d3.selectAll(".Country")
              .transition()
              .duration(200)
              .style("opacity", .8)
            d3.select(this)
              .transition()
              .duration(200)
              .style("stroke", "transparent")
        }
        // Draw the map
        svg.append("g")
          .selectAll("path")
          .data(topo.features)
          .join("path")
          // draw each country
          .attr("d", d3.geoPath()
            .projection(projection)
          )
          // set the color of each country
          .attr("fill", function (d) {
              d.total = data[d.properties.id]['percentile']
              console.log(data['borough_name'], d.total, colorScale(d.total))
              return colorScale(d.total);
          })
          .style("stroke", "transparent")
          .attr("class", function(d){ return "Country" } )
          .style("opacity", .8)
          .on("mouseover", mouseOver)
          .on("mouseleave", mouseLeave)
    })
})
