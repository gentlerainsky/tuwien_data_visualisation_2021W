$(() => {
  fetch("/static/geojson/london_boroughs.json").then(response => response.json())
    .then((topo) => {
      const choropleth = new Choropleth('#choropleth', topo)
      const chart = new Chart('#chart')
      const controlPanel = new ControlPanel({
        'choropleth': choropleth,
        'chart': chart
      })
      controlPanel.registerEventHandler()
      controlPanel.update()
    })
})


