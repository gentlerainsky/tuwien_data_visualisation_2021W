class ControlPanel {
  constructor({
    'choropleth': choropleth,
    'chart': chart
  }) {
    this.choropleth = choropleth
    this.choropleth.registerControlPanel(this)
    this.chart = chart
    this.filter = {}
    this.linePlotSetting = {
      'period': 'week'
    }
    this.barPlotSetting = {
      'field': 'Gender',
      'useBarTimeframe': false
    }
    this.currentPlot = 'line'
  }

  refetchData (callback) {
    const url = '/api/data'
    const options = {
      filter: this.filter,
      ...this.linePlotSetting,
      ...this.barPlotSetting
    }
    fetch(`${url}?options=${JSON.stringify(options)}`).then(response => response.json()).then(callback)
  }

  togglePlotControl(isLinePlot) {
    console.log('isLinePlot', isLinePlot)
    if (isLinePlot) {
      $('#bar_variable').attr('disabled', true)
      $('#bar_timeframe_checkbox').attr('disabled', true)
      $('#sort_category_checkbox').attr('disabled', true)
    } else {
      $('#bar_variable').removeAttr('disabled')
      $('#bar_timeframe_checkbox').removeAttr('disabled')
      $('#sort_category_checkbox').removeAttr('disabled')
    }
  }

  update () {
    this.refetchData((data) => {
      this.chart.update(this.currentPlot, data)
      this.choropleth.update(data['choropleth'])
    })
  }

  filterBorough(boroughId) {
    if (boroughId) {
      this.filter['borough_id'] = [boroughId]
      this.update()
    } else {
      delete this.filter['borough_id']
      this.update()
    }
  }

  registerPlotSwitcherHandler() {
    const that = this
    $('input[name="PlotSwitcher"]').on('change', function () {
      if ($('input[name="PlotSwitcher"]:checked')) {
        const plotType = $(this).val()
        that.togglePlotControl(plotType === 'line')
        if (plotType === 'line') {
          that.currentPlot = 'line'
          that.chart.drawLineChart()
        } else {
          that.currentPlot = 'bar'
          that.chart.drawBarChart()
        }
      }
    })
  }

  registerFilterHandler() {
    const filterMapper = {
      'search_type_filter': 'Type',
      'gender_filter': 'Gender',
      'age_filter': 'Age range',
      'legistration_filter': 'Legislation',
      'officer_ethnicity_filter': 'Officer-defined ethnicity',
      'object_search_filter': 'Object of search',
      'outcome_filter': 'Outcome',
      'self_ethnicity_filter': 'Self-defined ethnicity',
    }
    const that = this
    const idList = Object.keys(filterMapper).map(key => `#${key}`).join(',')
    $(idList).on('change', function () {
      const filterId = $(this).attr('id')
      const filterValue = $(this).val()
      const key = filterMapper[filterId]
      if (filterValue === 'All' && !!that.filter[key]) {
        delete that.filter[key]
      } else {
        that.filter[key] = [filterValue]
      }
      that.update()
    })
  }

  registerPlotSettingHandler() {
    const that = this
    $('#line_aggregate_time_frame').on('change', function () {
      that.linePlotSetting['period'] = $(this).val()
      that.update()
    })

    $('#bar_variable').on('change', function () {
      that.barPlotSetting['field'] = $(this).val()
      that.update()
    })
  }

  registerBarTimeFrameCheckBox() {
    const that = this
    $('input[name="BarTimeframeCheckbox"]').on('change', function () {
      that.barPlotSetting['useBarTimeframe'] = $('input[name="BarTimeframeCheckbox"]:checked').length > 0
      that.update()
    })
  }

  registerBarSortCategoryCheckBox() {
    const that = this
    $('input[name="SortCategoryCheckbox"]').on('change', function () {
      that.chart.setBarChartSortCategory($('input[name="SortCategoryCheckbox"]:checked').length > 0)
    })
  }

  registerEventHandler() {
    this.registerPlotSwitcherHandler()
    this.registerFilterHandler()
    this.registerPlotSettingHandler()
    this.registerBarTimeFrameCheckBox()
    this.registerBarSortCategoryCheckBox()
  }
}
