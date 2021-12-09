class Chart {
  constructor(tagId) {
    this.lineChart = new LineChart(tagId)
    this.barChart = new BarChart(tagId)
  }

  drawLineChart() {
    this.barChart.remove()
    this.lineChart.init()
    this.lineChart.update(this.lineData)
  }

  drawBarChart() {
    this.lineChart.remove()
    this.barChart.init()
    this.barChart.update(this.barData)
    this.barChart.draw()
  }

  setBarChartSortCategory(isSort) {
    this.barChart.setSortCategory(isSort)
    this.drawBarChart()
    this.lineChart.remove()
    this.barChart.init()
    this.barChart.draw()
  }

  update(currentPlot, data) {
    this.lineData = data['line']
    this.barData = data['bar']
    if (currentPlot === 'line') {
      this.drawLineChart()
    } else {
      this.drawBarChart()
    }
  }
}
