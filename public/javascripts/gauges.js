google.load('visualization', '1', {packages:['gauge']});
google.setOnLoadCallback(drawChart);
function drawChart() {
var data = google.visualization.arrayToDataTable([
  ['Label', 'Value'],
  ['Labeling', 0],
  ['CPU', 0],
  ['Network', 0]
]);

var options = {
  width: 400, height: 120,
  redFrom: 0, redTo: 33,
  yellowFrom:33, yellowTo: 66,
  greenFrom:66, greenTo: 100,
  minorTicks: 5
};

var chart = new google.visualization.Gauge(document.getElementById('chart_div'));
chart.draw(data, options);
}