class BarChart {
  constructor(tagId) {
    this.$chart = $(tagId)
    this.margin = {top: 10, right: 30, bottom: 30, left: 60}
    this.width = this.$chart.width() * 0.8
    this.height = this.$chart.height() * 0.8
    this.svg = d3.select("#chart")
  }

  init() {
    this.plot = this.svg.attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    this.x = d3.scaleBand()
      .range([0, this.width])
      .padding(0.2);
    this.xAxis = this.plot.append("g")
      .attr("transform", `translate(0,${this.height})`)

    this.y = d3.scaleLinear()
      .range([this.height, 0]);
    this.yAxis = this.plot.append("g")
      .attr("class", "myYaxis")
  }

  update (data) {
    this.x.domain(data.map(d => d.group))
    this.xAxis.call(d3.axisBottom(this.x))

    this.y.domain([0, d3.max(data, d => d.value)]);
    this.yAxis
      // .transition().duration(1000)
      .call(d3.axisLeft(this.y));

    const u = this.plot.selectAll("rect")
      .data(data)

    u.join("rect")
      // .transition()
      // .duration(1000)
      .attr("x", d => this.x(d.group))
      .attr("y", d => this.y(d.value))
      .attr("width", this.x.bandwidth())
      .attr("height", d => this.height - this.y(d.value))
      .attr("fill", "steelblue")
  }

  remove () {
    this.svg.select('g').remove()
  }
}
