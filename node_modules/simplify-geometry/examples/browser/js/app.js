var CENTER, map;

CENTER = [32.8406, -83.6325];

map = L.map("map").setView(CENTER, 8);

var georgia = L.geoJson();

map.addLayer(georgia);

map.doubleClickZoom.disable();

L.tileLayer("http://{s}.tile.cloudmade.com/c507c0a712c84007a9cec7849d22d49c/997/256/{z}/{x}/{y}.png", {
  attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://cloudmade.com\">CloudMade</a>",
  maxZoom: 18
}).addTo(map);

myControl = L.control({position: 'bottomleft'});
myControl.onAdd = function(map) {
            this._div = L.DomUtil.create('div', 'myControl');
            this._div.innerHTML = '<input id="tolerance" type="number" value="0.00000" step="0.0001" />';
            return this._div;
}
myControl.addTo(map);

function controlEnter(e) {
    map.dragging.disable();
}
function controlLeave() {
    map.dragging.enable();
}

$('#tolerance').mouseover(function() {
  controlEnter();
}).mouseout(function(){
  controlLeave();
});

$('#tolerance').change(function() {
  var $this = $(this);
  updateGeorgia($this.val());
});

function updateGeorgia(tolerance) {
  georgia.clearLayers();
  $.getJSON('geojson/georgia.geojson', function(data) {
      var modified = data;
      modified.features[0].geometry.coordinates[0][0] = simplifyGeometry(modified.features[0].geometry.coordinates[0][0], tolerance);
      modified.features[0].geometry.coordinates[1][0] = simplifyGeometry(modified.features[0].geometry.coordinates[1][0], tolerance);
      georgia.addData(modified);
  });
}

updateGeorgia(0.0000);
