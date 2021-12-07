const mouseOver = function (d) {
  d3.selectAll(".Country")
    .transition()
    .duration(50)
    .attr("stroke-width", 0.5)

  d3.select(this)
    .transition()
    .duration(50)
    .attr("stroke-width", 5)
}

const mouseLeave = function (d) {
  d3.selectAll(".Country")
    .transition()
    .duration(50)
    .attr("stroke-width", 0.5)

  d3.select(this)
    .transition()
    .duration(50)
    .attr("stroke-width", 0.5)
}

class Choropleth {
  constructor(tagId, topo) {
    this.svg = d3.select('#choropleth')
    this.$choropleth = $('#choropleth')
    this.width = this.$choropleth.width();
    this.height = this.$choropleth.height();
    // const path = d3.geoPath();
    this.projection = d3.geoMercator()
      // center latitude / longitude of London
      .center([-0.1, 51.49])
      // scale the area so it can be plot
      .scale(Math.pow(2, 18) / (2 * Math.PI))
      .translate([this.width / 2, this.height / 2])
    this.colorScale = d3.scaleThreshold()
      .domain([0, 1 / 5, 1 / 5, 2 / 5, 2 / 5, 3 / 5, 3 / 5, 4 / 5, 4 / 5, 1])
      .range(d3.schemeRdYlGn[10].reverse());

    this.data = null
    this.topo = topo
    this.controlPanel = null
    this.currentBorough = null
  }

  registerControlPanel(controlPanel){
    this.controlPanel = controlPanel
  }

  update(data) {
    this.data = data.data
    this.draw()
  }

  draw() {
    const that = this
    const clickHandler = function (target, data) {
      if (data) {
        if (that.currentBorough !== data.properties.id) {
          that.currentBorough = data.properties.id
          that.controlPanel.filterBorough(data.properties.id)
          console.log('borough_id', data.properties.id)
        }
        target.stopPropagation()
      } else if (that.currentBorough) {
        that.currentBorough = null
        that.controlPanel.filterBorough()
        console.log('click no data')
        target.stopPropagation()
      }
    }

    this.svg.style("background", "grey").on('click', clickHandler)

    this.svg.append("g")
      .selectAll("path")
      .data(this.topo.features)
      .join("path")
      .attr("d", d3.geoPath()
        .projection(this.projection)
      )
      .attr("fill", (d) => {
        d.total = 0
        if (this.data[d.properties.id]) {
          d.total = this.data[d.properties.id]['percentile']
        }
        return this.colorScale(d.total);
      })
      .style("stroke", "transparent")
      .style("stroke", "black")
      .attr("class", (d) => {
        return "Country"
      })
      .attr("stroke-width", 0.5)
      .on("mouseover", mouseOver)
      .on("mouseleave", mouseLeave)
      .on("click", clickHandler)
  }

  remove () {
    this.svg.select('g').remove()
  }
}