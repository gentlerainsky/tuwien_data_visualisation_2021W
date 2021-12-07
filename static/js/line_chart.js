class LineChart {
  constructor(tagId) {
    this.$chart = $(tagId)
    this.margin = {top: 10, right: 30, bottom: 30, left: 50}
    this.width = this.$chart.width() * 0.9
    this.height = this.$chart.height() * 0.9
    this.svg = d3.select("#chart")
  }

  init() {
    this.plot = this.svg.attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    this.x = d3.scaleLinear().range([0, this.width]);
    this.xAxis = d3.axisBottom().scale(this.x);
    this.plot.append("g")
      .attr("transform", `translate(0, ${this.height})`)
      .attr("class", "myXaxis")

    this.y = d3.scaleLinear().range([this.height, 0]);
    this.yAxis = d3.axisLeft().scale(this.y);
    this.plot.append("g")
      .attr("class", "myYaxis")
  }

  update (plotData) {
    console.log('plotData', plotData)
    const data = plotData.data
    const meta = plotData.meta
    console.log('meta', meta)
    this.x.domain(meta.x_lim)
    this.plot.selectAll(".myXaxis")
      // .transition()
      // .duration(3000)
      .call(this.xAxis);

    this.y.domain(meta.y_lim)
    this.plot.selectAll(".myYaxis")
      // .transition()
      // .duration(3000)
      .call(this.yAxis);

    const u = this.plot.selectAll(".lineTest")
      .data([data], function (d) {
        return d.x
      });

    u.join("path")
      .attr("class", "lineTest")
      // .transition()
      // .duration(3000)
      .attr("d", d3.line()
        .x((d) => {
          return this.x(d.x);
        })
        .y((d) => {
          return this.y(d.y);
        }))
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2.5)
  }

  remove () {
    this.svg.select('g').remove()
  }
}
