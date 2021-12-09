function wrap(text, width) {
  text.each(function() {
    const text = d3.select(this)
    const words = text.text().split(/\s+/).reverse()
    let word = null
    let line = []
    let lineNumber = 0
    let lineHeight = 1.1
    let y = text.attr("y")
    let dy = parseFloat(text.attr("dy"))
    let tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em")
    while (word = words.pop()) {
      line.push(word)
      tspan.text(line.join(" "))
      if (tspan.node().getComputedTextLength() > width) {
        line.pop()
        tspan.text(line.join(" "))
        line = [word]
        tspan = text.append("tspan")
          .attr("x", 0)
          .attr("y", y)
          .attr("dy", ++lineNumber * lineHeight + dy + "em")
          .text(word)
      }
    }
  })
}


class BarChart {
  constructor(tagId) {
    this.$chart = $(tagId)
    this.margin = {top: 100, right: 50, bottom: 100, left: 100}
    this.width = this.$chart.width() * 0.7
    this.height = this.$chart.height() * 0.6
    this.svg = d3.select("#chart")
    this.isSortByCategory = false
    this.metaData = null
    this.data = null
    this.sortedData = null
  }

  getGroupName(d) {
    let name = d.group.name
    if (d.group.period) {
      name = d.group.period + ' / ' + name
    }
    return name
  }

  setSortCategory(isSort) {
    this.isSortByCategory = isSort
  }

  init() {
    this.plot = this.svg.attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    this.x = d3.scaleBand()
      .range([0, this.width])
      .padding(0.2)

    this.xAxis = this.plot.append("g")
      .attr("transform", `translate(0,${this.height})`)
      .style("font-size", "12px")

    this.y = d3.scaleLinear()
      .range([this.height, 0])

    this.yAxis = this.plot.append("g")
      .attr("class", "myYaxis")
      .style("font-size", "15px")
  }

  update (plotData) {
    this.metaData = plotData.meta
    this.data = [...plotData.data]
    this.sortedData = [...plotData.data]
    this.sortedData.sort((a, b) => {
      if (a.group.name < b.group.name) {
        return -1
      }
      return 1
    })
  }

  draw () {
    let data = this.data
    if (this.isSortByCategory) {
      data = this.sortedData
    }
    const meta = this.metaData
    this.x.domain(data.map(this.getGroupName))
    const xScale = d3.scaleBand()
      .rangeRound([0, this.width / 4], .1, .3)
      .padding(0.1)

    const groupNames = data.map((d) => d.group.name)
    const groupColors = d3.scaleBand()
      .domain(groupNames)
      .range([0, 1])

    this.xAxis.call(d3.axisBottom(this.x))
      .selectAll(".tick text")
      .attr("transform", "translate(15, 15)rotate(90)")
      .style("text-anchor", "start")
      .call(wrap, xScale.bandwidth())

    this.y.domain([0, d3.max(data, d => d.value)]);
    this.yAxis
      .call(d3.axisLeft(this.y));

    this.plot.append("text")
      .attr("class", "title")
      .attr("text-anchor", "start")
      .attr('font-size', 35)
      .attr("y", -25)
      .attr("x", 170)
      .text(meta.title);

    this.plot.append("text")
      .attr("class", "y_label")
      .attr("text-anchor", "end")
      .attr("y", -60)
      .attr("x", -170)
      .attr('font-size', 25)
      .attr("transform", "rotate(-90)")
      .text(meta.y_label)

    const u = this.plot.selectAll("rect").data(data)

    u.join("rect")
      .attr("x", d => this.x(this.getGroupName(d)))
      .attr("y", d => this.y(d.value))
      .attr("width", this.x.bandwidth())
      .attr("height", d => this.height - this.y(d.value))
      .attr("fill", (d) => {
        return d3.interpolateRainbow(groupColors(d.group.name))
      })
  }

  remove () {
    this.svg.select('g').remove()
  }
}
