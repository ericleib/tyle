

registerView({
  name : "xy-graph",
  dependencies : {
    javascript: ["views/charts/highcharts.js"], //,"views/charts/modules/exporting.js"],
    css: [],
  },
  render : function(scope, element, data){

    var series = [];
    data.dataset.forEach(function(d){
      d.series.forEach(function(s){
        series.push({
          name : "" + (s.hasOwnProperty("label")? s.label : data.title) + (d.hasOwnProperty("label")? " ("+data.labelDataset+": "+d.label+")" : ""),
          data : transpose([s.x, s.y])
        });
      });
    });

    scope.$on('fullscreen', function(){
      console.log("event fullscreen received!");
      setTimeout(function () { $(element).highcharts().reflow(); }, 0);
    });

    $(element).highcharts({
        chart: {
          type: 'scatter',
          zoomType: 'xy',
        },
        title:    { text: data.title },
        subtitle: { text: data.subtitle },
        xAxis: {
          title:  { text: data.labelX },
        },
        yAxis: {
          title:  { text: data.labelY }
        },
        plotOptions: {
          scatter: {
            tooltip: {
              headerFormat: '<b>'+(data.hasOwnProperty("labelSeries")? data.labelSeries+': ' : '')+'{series.name}</b><br>',
              pointFormat: '{point.x}, {point.y}'
            },
            animation: false,
            lineWidth: 2
          }
        },
        series: series,
        credits: {  enabled: false  }
    });
    $(window).trigger('resize');
  }
});

function transpose(a) {
  return Object.keys(a[0]).map(
    function (c) { return a.map(function (r) { return r[c]; }); }
  );
}
