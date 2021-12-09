const mouseOver = function (d) {
  d3.selectAll('.Borough')
    .transition()
    .duration(50)
    .attr('stroke-width', 0.5)

  d3.select(this)
    .transition()
    .duration(50)
    .attr('stroke-width', 5)
}

const mouseLeave = function (d) {
  d3.selectAll('.Borough')
    .transition()
    .duration(50)
    .attr('stroke-width', 0.5)

  d3.select(this)
    .transition()
    .duration(50)
    .attr('stroke-width', 0.5)
}

function drawTooltip(g, value) {
  if (!value) return g.style('display', 'none')

  g.style('display', null)
    .style('pointer-events', 'none')
    .style('font', '14px sans-serif')

  const path = g
    .selectAll('path')
    .data([null])
    .join('path')
    .attr('fill', 'black')
    .attr('stroke', 'black')

  const text = g
    .selectAll('text')
    .data([null])
    .join('text')
    .style('fill', 'white')
    .call(function (text) {
      text.selectAll('tspan')
        .data((value + '').split('/\n/'))
        .join('tspan')
        .attr('x', 0)
        .attr('y', function (d, i) {
          return i * 1.1 + 'em'
        })
        .style('font-weight', function (_, i) {
          return i ? null : 'bold'
        })
        .text(function (d) {
          return d
        })
    })

  const x = text.node().getBBox().x
  const y = text.node().getBBox().y
  const w = text.node().getBBox().width
  const h = text.node().getBBox().height

  text.attr(
    'transform',
    'translate(' + -w / 2 + ',' + (15 - y) + ')'
  )
  path.attr(
    'd',
    'M' +
    (-w / 2 - 10) +
    ',5H-5l5,-5l5,5H' +
    (w / 2 + 10) +
    'v' +
    (h + 20) +
    'h-' +
    (w + 20) +
    'z'
  )
}

class Choropleth {
  constructor(tagId, topo) {
    this.svg = d3.select('#choropleth')
    this.$choropleth = $('#choropleth')
    this.width = this.$choropleth.width()
    this.height = this.$choropleth.height()
    this.projection = d3.geoMercator()
      // center latitude / longitude of London
      .center([-0.1, 51.49])
      // scale the area so it can be plot
      .scale(Math.pow(2, 18) / (2 * Math.PI))
      .translate([this.width / 2, this.height / 2])

    this.colorScale = d3.scaleThreshold()
      .domain([0, 1 / 5, 1 / 5, 2 / 5, 2 / 5, 3 / 5, 3 / 5, 4 / 5, 4 / 5, 1])
      .range(d3.schemeRdYlGn[10].reverse())

    this.data = null
    this.topo = topo
    this.controlPanel = null
    this.currentBorough = null
    this.last_mouse_x = 0
    this.last_mouse_y = 0
  }

  registerControlPanel(controlPanel){
    this.controlPanel = controlPanel
  }

  update(data) {
    this.data = data.data
    this.title = data.meta['title']
    this.legend = data.meta['legend']
    this.draw()
  }

  draw() {
    const that = this
    const clickHandler = function (target, data) {
      if (data) {
        if (that.currentBorough !== data.properties.id) {
          that.currentBorough = data.properties.id
          that.controlPanel.filterBorough(data.properties.id)
        }
        target.stopPropagation()
      } else if (that.currentBorough) {
        that.currentBorough = null
        that.controlPanel.filterBorough()
        target.stopPropagation()
      }
    }

    this.svg.append('text')
      .attr('class', 'title')
      .attr('text-anchor', 'start')
      .attr('font-size', 35)
      .style('fill', 'white')
      .attr('y', 55)
      .attr('x', 170)
      .text(this.title)

    const yLegend = d3.scaleLinear()
      .domain([0, 1])
      .rangeRound([0, 300])

    const color = this.colorScale

    const g = this.svg.append('g')

    g.append('text')
      .attr('font-family', 'sans-serif')
      .attr('x', 25)
      .attr('y', 450)
      .attr('fill', '#FFF')
      .attr('text-anchor', 'start')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('Number of Cases')

    g.selectAll('rect')
      .data(color.range().map(function (d) {
        d = color.invertExtent(d)
        if (d[0] == null) d[0] = yLegend.domain()[0]
        if (d[1] == null) d[1] = yLegend.domain()[1]
        return d
      }))
      .enter().append('rect')
      .attr('height', 30)
      .attr('x', 25)
      .attr('y', function (d) {
        return (300 - yLegend(d[0]) / 2) + 285
      })
      .attr('width', 25)
      .attr('fill', function (d) {
        return color(d[0])
      })

    d3.selectAll('text.legend-text').remove()

    g.selectAll('g')
      .data(this.legend)
      .enter()
      .append('text')
      .attr('class', 'legend-text')
      .attr('font-size', '12px')
      .attr('fill', '#FFF')
      .attr('x', 60)
      .attr('y', function (d) {
        return (300 - yLegend(d.percentile / 100) / 2) + 290 + 15
      })
      .text(function (d) {
        let text = d.value
        text = '> ' + text
        return text
      })

    g.selectAll('rect')
      .data(color.range().map(function (d) {
        d = color.invertExtent(d)
        if (d[0] == null) d[0] = yLegend.domain()[0]
        if (d[1] == null) d[1] = yLegend.domain()[1]
        return d
      }))
      .enter().append('text')
      .text('demo')

    this.svg.style('background', 'grey').on('click', clickHandler)

    this.svg.append('g')
      .selectAll('path')
      .data(this.topo.features)
      .join('path')
      .attr('d', d3.geoPath()
        .projection(this.projection)
      )
      .attr('fill', (d) => {
        d.total = 0
        if (this.data[d.properties.id]) {
          d.total = this.data[d.properties.id]['percentile']
        }
        return this.colorScale(d.total)
      })
      .style('stroke', 'transparent')
      .style('stroke', 'black')
      .attr('class', (d) => {
        return 'Borough'
      })
      .attr('stroke-width', 0.5)
      .on('mouseover.borough', mouseOver)
      .on('mouseleave.borough', mouseLeave)
      .on('click', clickHandler)
      .on('mouseover.tooltip', function (event, data) {
        let case_count = 0
        if (that.data[data.properties.id]) {
          case_count = that.data[data.properties.id]['cases_count']
        }
        const info = {
          case_count: case_count,
          name: data.properties.name
        }
        let text = info.name
        if (info.case_count > 0) {
          text += `/\n/${info.case_count} cases`
        }
        tooltip.call(drawTooltip, text)
        d3.select(this)
          .attr('stroke', 'red')
          .raise()
      })
      .on('mousemove.tooltip', function (event) {
        that.last_mouse_x = d3.pointer(event)[0]
        that.last_mouse_y = d3.pointer(event)[1]
        tooltip.attr('transform', `translate(${d3.pointer(event)[0]},${d3.pointer(event)[1]})`)
      })
      .on('mouseout.tooltip', function () {
        tooltip.call(drawTooltip, null)
        d3.select(this)
          .attr('stroke', null)
          .lower()
      })
    const tooltip = this.svg.append('g')
      .attr('id', 'choropleth_tooltip')
      .attr('transform', `translate(${this.last_mouse_x},${this.last_mouse_y})`)
  }

  remove () {
    this.svg.select('g').remove()
  }
}