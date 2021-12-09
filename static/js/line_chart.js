class LineChart {
  constructor(tagId) {
    this.$chart = $(tagId)
    this.margin = {top: 100, right: 50, bottom: 100, left: 100}
    this.width = this.$chart.width() * 0.7
    this.height = this.$chart.height() * 0.7
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
      .style("font-size", "15px")

    this.y = d3.scaleLinear().range([this.height, 0]);
    this.yAxis = d3.axisLeft().scale(this.y);
    this.plot.append("g")
      .attr("class", "myYaxis")
      .style("font-size", "15px")
  }

  update (plotData) {
    const data = plotData.data
    const meta = plotData.meta
    this.x.domain(meta.x_lim)
    this.plot.selectAll(".myXaxis")
      .call(this.xAxis);

    this.y.domain(meta.y_lim)
    this.plot.selectAll(".myYaxis")
      .call(this.yAxis);

    const u = this.plot.selectAll(".lineTest")
      .data([data], function (d) {
        return d.x
      });

    this.plot.append("text")
      .attr("class", "title")
      .attr("text-anchor", "start")
      .attr('font-size', 35)
      .attr("y", -25)
      .attr("x", 170)
      .text(meta.title);

    this.plot.append("text")
      .attr("class", "x_label")
      .attr("text-anchor", "start")
      .attr("y", this.height + 50)
      .attr("x", 250)
      .attr('font-size', 25)
      .text(meta.x_label);

    this.plot.append("text")
      .attr("class", "y_label")
      .attr("text-anchor", "end")
      .attr("y", -60)
      .attr("x", -170)
      .attr('font-size', 25)
      .attr("transform", "rotate(-90)")
      .text(meta.y_label)

    u.join("path")
      .attr("class", "lineTest")
      .attr("d", d3.line()
        .x((d) => {
          return this.x(d.x);
        })
        .y((d) => {
          return this.y(d.y);
        }))
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 4)
  }

  remove () {
    this.svg.select('g').remove()
  }
}
