// **************************************************************
// * Copyright (c) 2010-2012 CyberInfrastructure and Geospatial *
// * Information Laboratory (CIGI), University of Illinois at   *
// * Urbana-Champaign, All Rights Reserved.                     *
// **************************************************************
// @authorKiumars Soltani <soltani2@illinois.edu>

Ext.namespace('CG.flum');

// Global configurations: server URL and layer/time list
CG.flum.Config = {
    server: 'http://141.142.168.35:8889',
};

/* Definitions for MMFlowMap */
var legendWindow;
var animationWindow;
var color = ['#053061', '#2166AC', '#D6604D', '#B2182B', '#67001F'];
var NANorth = 82.296478;
var NAWest = -167.276413;
var NAEast = -56.347517;
var NASouth = 5.499550;


var USSouth = 24.15275;
var USNorth = 49.751726;
var USWest = -125.714216667; 
var USEast = -65.983272667;

var boundNorth = 45.0;
var boundSouth = 30.0;
var boundWest = -125.0;
var boundEast = -70.0;

var cellsizes = [0.008333, 0.016666, 0.033332, 0.066664, 0.133328, 0.266656, 0.533312, 1.066624, 2.133248, 4.266496];

var legendWindow;
var is_depth_equal = 0;

var flowLevel = 9;
var scale;

var rows = [9216,4608,2304,1152,576,288,144,72,36,18];
var cols = [13312,6656,3328,1664,832,416,208,104,52,26];



var movLayer = new OpenLayers.Layer.Vector('Movement Layer', {
    renderers: ['SVG', 'Canvas', 'VML']
});

var edges;
var weights;

var dates = ['201407', '201408', '201409', '201410', '201411', '201412'];

/*
var canvas = movLayer.renderer.canvas.canvas
	,ctx = canvas.getContext('2d'),
	*/
      var delta = 1,
      type = 'Bezier',
      neighbors = 10,
      angleStrength = 10,
      curviness = 0.5,
      margin = 0,
      jsonText,
      bundle;


CG.global.layoutConfig.push({
    region : 'west',
    id : 'setting_region',
    title : 'App: Urban Flow',
    split : true,
    width : 300,
    minWidth : 300,
    maxWidth : 300,
    collapsible : false,
    collapseMode: "header",
    animCollapse : true,
    margins : '1 0 1 2',
    layout : 'accordion',
    collapsed : false,
    layoutConfig : {
        animate : true
    },
    items : [ {
        xtype : 'cgx1_urbanflowpanel',
        id : 'city_panel',
        title : 'Select a City',
        scroll : 'both',
        minHeight : 300,
        minWidth : 300,
        width : 300
    },
    {
        xtype : 'cgx2_urbanflowpanel',
        id : 'visitor_panel',
        title : 'Identify Frequent Visitors',
        scroll : 'both',
        minHeight : 300,
        minWidth : 300,
        width : 300
    },
    {
        xtype : 'cgx3_urbanflowpanel',
        id : 'aggregation_panel',
        title : 'Select an Aggregation Scheme',
        scroll : 'both',
        minHeight : 300,
        minWidth : 300,
        width : 300
    },
    {
        xtype : 'cgx4_urbanflowpanel',
        id : 'results_panel',
        title : 'Results',
        scroll : 'both',
        minHeight : 300,
        minWidth : 300,
        width : 300
	}]
});


function createBaseMap() {
    var options = {};
    options['controls'] = [ new OpenLayers.Control.Navigation({
        mouseWheelOptions : {
            interval : 100
        }
    }), new OpenLayers.Control.PanZoomBar(),
            new OpenLayers.Control.MousePosition({
                prefix : 'LonLat: ',
                displayProjection : new OpenLayers.Projection('EPSG:4326')
            }), new OpenLayers.Control.ScaleLine() ];
    options['projection'] = "EPSG:900913";
    USExtent = new OpenLayers.Bounds(boundWest, boundSouth, boundEast, boundNorth).transform(
            new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection(
                    "EPSG:900913"));
    var map = new OpenLayers.Map(options);
    var baseLayer3 = new OpenLayers.Layer.OSM();
    var baseLayer4 = new OpenLayers.Layer.Bing({
        name : "Bing Road",
        key : CG.global.Env.bingMapApiKey,
        type : "Road",
        numZoomLevels : 9,
		minScale: 27734017,
    });
	baseLayer4.setOpacity(0.8);
    map.addLayers([ movLayer, baseLayer4 ]);
    var nav = map.getControlsByClass("OpenLayers.Control.Navigation")[0];
    nav.handlers.wheel.cumulative = true;
    return map;
}

CG.global.map = createBaseMap();
scale = CG.global.map.getScale();
// To enable the gateway messagebox
CG.global.logger = Ext.create('CG.util.Msg');


// CG.global.map = CG.map.Map.createBaseMap();
CG.global.layoutConfig.push({
    region : 'center',
    padding : '1 2 1 1',
    width : 450,
    height : 450,
    border : false,
    id : "cg_mappanel",
    xtype : 'cgx_map',
    map : CG.global.map,
});

CG.global.layoutRender();

var westPanel = Ext.getCmp("setting_region");
var mapPanel = Ext.getCmp("cg_mappanel");

// Add legend and animation bar
/*legendWindow.show();
animationWindow.show();
legendWindow.alignTo(mapPanel, "tr", [ -430, 0 ]);
animationWindow.alignTo(mapPanel, "b", [ -250, -90 ]);
*/
var slider = westPanel.getComponent(0).getComponent(0).getComponent(2);


mapPanel.expand();
mapPanel.addListener('resize', function() {
    //legendWindow.alignTo(mapPanel, "tr", [ -430, 0 ]);
    //animationWindow.alignTo(mapPanel, "b", [ -250, -90 ]);
});

var init_sw = new OpenLayers.LonLat(boundWest, boundSouth).transform(
        new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection(
		                "EPSG:900913"));
var init_ne = new OpenLayers.LonLat(boundEast, boundNorth).transform(
        new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection(
		                "EPSG:900913"));

var bounds = new OpenLayers.Bounds();
bounds.extend(init_sw);
bounds.extend(init_ne);
bounds.toBBOX();
CG.global.map.zoomToExtent(bounds);
PhiloGL.unpack();
westPanel.getComponent(1).getComponent(1).getComponent(0).setVisible(false);		

function getCell(lat, lon, level){
	if (lon < NAWest) lon = NAWest;
	if (lon > NAEast) lon = NAEast;
	if (lat > NANorth) lat = NANorth;
	if (lat < NASouth) lat = NASouth;
	var nrow = Math.floor((lat - NASouth) /cellsizes[level]);
	var ncol = Math.floor((lon - NAWest) / cellsizes[level]);
	if (nrow < 0) nrow = 0;
	if (ncol < 0) ncol = 0;
	var ret = [nrow, ncol];
	return ret;
}

function getRange(start, end, level){
	var ret = new Array();
	for(var r = start[0]; r <= end[0]; r++){
		for(var c = start[1]; c <= end[1]; c++){
			ret.push(r * cols[level] + c);
		}
	}
	return ret;
}

function clearMovements(){
	movLayer.removeAllFeatures();
}

function render(delta) {
	//ctx.strokeStyle = 'black';
	//ctx.lineWidth = 1;
        bundle.graph.each(function(node) {
	var edges = node.unbundleEdges(delta);
        Bundler.Graph['render' + type](movLayer, edges, {
        	curviness: curviness,
	        delta: delta,
	        margin: margin
      		});
        });
}

function animate(bundle) {
		//var loading = document.querySelector('.loading');
		//loading.parentNode.removeChild(loading);
		new Fx({
				transition: Fx.Transition.Quart.easeInOut,
				duration: 1000
				}).start({
				onCompute: function(deltaValue) {
						delta = deltaValue;
						clearMovements();
						render(delta);
						}
				});
				
				Fx.requestAnimationFrame(function loop() { Fx.requestAnimationFrame(loop); });
				}


function filterEdges(){
	var index = Math.floor((100 - slider.getValue())/100 * weights.length);
	var minFromSlider = weights[index];
	var minFromText = westPanel.getComponent(0).getComponent(0).getComponent(4)
	.getValue();
	var maxFromText = westPanel.getComponent(0).getComponent(0).getComponent(6)
	.getValue();
	if (minFromText == null) minFromText = 0; else minFromText = parseInt(minFromText);
	if (maxFromText == null) maxFromText = Number.MAX_VALUE; else maxFromText = parseInt(maxFromText);
	return filterEdgesWithBounds(Math.max(minFromSlider, minFromText),
		maxFromText);
}


function filterEdgesWithBounds(minWeight, maxWeight){
		var json = new Array();
		var c = 0;
		for(var i in edges){
				if (edges[i].data.weight >= minWeight && edges[i].data.weight <= maxWeight){
					json.push(edges[i]);
					c++;
				}
		}
		//window.alert(minWeight + ":" + maxWeight);
		return json;
}

function drawEdges(json){
	bundle = new Bundler();
	//console.log(json);
	bundle.setNodes(json);
	bundle.buildNearestNeighborGraph();
	bundle.MINGLE();
	//render();
	animate(bundle);
	slider.setDisabled(false);
}


function sortNumber(a, b){
	return a - b;
}

function getEdges(srcX, srcY, tarX, tarY){
	/*var screenBound = CG.global.map.getExtent();
	var srcX = screenBound.left;
	var srcY = screenBound.bottom;
	var tarX = screenBound.right;
	var tarY = screenBound.top;*/
	weights = new Array();
	var date = dateSelection.getValue();
	var json;	
	//var jqxhr = $.get("server-proxy-new.php?url="+encodeURIComponent(CG.flum.Config.server + "?" +
	//         "ids=" + cells.join(",") + "&" + "level=" + flowLevel),
	var jqxhr = $.get("server-proxy-new.php?url="+encodeURIComponent(CG.flum.Config.server + "?command=getmovement&" + "swx=" + srcX + "&swy=" + srcY + "&nex=" + tarX + "&ney=" +	tarY + "&" + "level=" + flowLevel + "&date=" + date),	
	function(data) {
		json = JSON.parse(data);
		var q20 = json.quantiles[0]["q20"];
		var q40 = json.quantiles[1]["q40"];
		var q60 = json.quantiles[2]["q60"];
		var q80 = json.quantiles[3]["q80"];
		var q100= json.quantiles[4]["q100"];

		for(var p in json.data){
			var obj = json.data[p].data;
			if (obj["weight"] < q20)
				obj["color"]=color[0];
			else if (obj["weight"] < q40)
				obj["color"]=color[1];
			else if (obj["weight"] < q60)
				obj["color"]=color[2];
			else if (obj["weight"] < q80)
				obj["color"]=color[3];
			else
				obj["color"]=color[4];

			var coords = json.data[p].data.coords;
			var lonLat1 = new OpenLayers.LonLat(coords[1],coords[0]).transform(
				new OpenLayers.Projection("EPSG:4326"),
				new OpenLayers.Projection("EPSG:900913"));
			var lonLat2 = new OpenLayers.LonLat(coords[3],coords[2]).transform(
				new OpenLayers.Projection("EPSG:4326"),
				new OpenLayers.Projection("EPSG:900913"));
				//movLayer.addFeatures(feature2);
			json.data[p].data.coords = [lonLat1.lon,
			                           lonLat1.lat,
						   lonLat2.lon,
						   lonLat2.lat
			];
			json.data[p].data.color = obj["color"];
			weights.push(obj["weight"]);
		}

		edges = json.data;
		weights.sort(sortNumber);
		drawEdges(filterEdges());
	});		
}

function moveendHandler(e) {
    var presentScale = CG.global.map.getScale();
    //Decide if we want to continue or not
    var screenBound = CG.global.map.getExtent();

    var srcX = screenBound.left;
    var srcY = screenBound.bottom;
    var srcPoint = new OpenLayers.LonLat(srcX, srcY).transform(
        new OpenLayers.Projection("EPSG:900913"),
        new OpenLayers.Projection("EPSG:4326"));
    srcX = srcPoint.lon;
    srcY = srcPoint.lat;

    var tarX = screenBound.right;
    var tarY = screenBound.top;
    var tarPoint = new OpenLayers.LonLat(tarX, tarY).transform(
        new OpenLayers.Projection("EPSG:900913"),
        new OpenLayers.Projection("EPSG:4326"));
    tarX = tarPoint.lon;
    tarY = tarPoint.lat;

	//srcX = USWest;
	//srcY = USSouth;
	//tarX = USEast;
	//tarY = USNorth;

    // Decide the new flow level
    scale = presentScale;

    if (scale > 20000000) {
        flowLevel = 9;
    } else if (scale > 10000000) {
        flowLevel = 8;
    } else if (scale > 5000000) {
        flowLevel = 7;
    } else if (scale > 3000000) {
        flowLevel = 6;
    } else if (scale > 1500000) {
        flowLevel = 5;
    } else if (scale > 800000) {
        flowLevel = 4;
    } else if (scale > 400000) {
        flowLevel = 3;
    } else if (scale > 200000) {
        flowLevel = 2;
    } else if (scale > 100000) {
        flowLevel = 1;
    } else {
        flowLevel = 0;
    }

	clearMovements();
	//var startCell = getCell(srcY, srcX, flowLevel);
	//var endCell = getCell(tarY, tarX, flowLevel);
	//var cells = getRange(startCell, endCell, flowLevel);
	getEdges(srcX, srcY, tarX, tarY);
}




/** Event Handlers Assignment **/
CG.global.map.events.register('moveend', CG.global.map, moveendHandler);

slider.addListener('changecomplete',function(){
		slider.setDisabled(true);
		westPanel.getComponent(0).getComponent(0).getComponent(1).setText("Top-" + slider.getValue() + "% FLows Percentile");
		clearMovements();
		drawEdges(filterEdges());
});

var dateSelection = westPanel.getComponent(0).getComponent(0).getComponent(0);
dateSelection.addListener('select',
	function(){
		clearMovements();
		moveendHandler(null);
		//drawEdges(filterEdges());
	});

westPanel.getComponent(0).getComponent(0).getComponent(7).addListener('click',
	function(){
			//var min = westPanel.getComponent(0).getComponent(0).getComponent(4).getValue();
			//var max = westPanel.getComponent(0).getComponent(0).getComponent(6).getValue();
			clearMovements();
			drawEdges(filterEdges());
	});


var mmhoverControl = new OpenLayers.Control.SelectFeature(movLayer, {
	multiple : false,
	hover : true,
});


function mmselectFlowFeature(evt) {
	if(westPanel.getComponent(1).collapsed) return;
	mousePoint = CG.global.map.getLonLatFromViewPortPx(new OpenLayers.Pixel(
			mmhoverControl.handlers.feature.evt.xy.x + 1,
			mmhoverControl.handlers.feature.evt.xy.y - 20));
	evt.feature.style.strokeColor = "#00FF00";
	evt.feature.style.cursor = "pointer";

	movLayer.drawFeature(evt.feature);
	var weight1 = evt.feature.attributes.weight1;
	var weight2 = evt.feature.attributes.weight2;
	var timelag1 = evt.feature.attributes.timelag1;
	var timelag2 = evt.feature.attributes.timelag2;
	var text1 = "Movements in -> " + weight1;
	var text2 = "Movements in <- " + weight2;
	var text3 = "Average Time Lag in -> " + Math.ceil(timelag1) + " min";
	var text4 = "Average Time Lag in <- " + Math.ceil(timelag2) + " min";

	westPanel.getComponent(1).getComponent(0).getComponent(0).setText(text1);
	westPanel.getComponent(1).getComponent(0).getComponent(1).setText(text2);
	westPanel.getComponent(1).getComponent(0).getComponent(2).setText(text3);
	westPanel.getComponent(1).getComponent(0).getComponent(3).setText(text4);

	var newstore = Ext.create('Ext.data.JsonStore', {
    		fields: ['date', 'value1', 'value2'],
    		data: [
    		]
	});

	var id1 = evt.feature.attributes.id1;
	var id2 = evt.feature.attributes.id2;
	
	var jqxhr = $.get("server-proxy-new.php?url="+encodeURIComponent(CG.flum.Config.server + "?command=gethistory&id1=" + id1 + "&id2=" + id2 + "&level=" + flowLevel + "&dates=" + dates.join(',')),	
	function(data) {
		json = JSON.parse(data);
		for(var p in json.data){
			var obj = json.data[p];
			newstore.add(obj);
		}
	});		

	newstore.commitChanges();
	westPanel.getComponent(1).getComponent(1).getComponent(0).setVisible(true);	
	westPanel.getComponent(1).getComponent(1).getComponent(0).bindStore(newstore);
	westPanel.getComponent(1).getComponent(1).getComponent(0).redraw();
	westPanel.getComponent(1).getComponent(1).getComponent(0).refresh();
}

movLayer.events.on({
	"featureselected" : mmselectFlowFeature,
	"featureunselected" : function(evt) {
		evt.feature.style.cursor = "";
		evt.feature.style.strokeColor = evt.feature.attributes.originalcolor;
		movLayer.drawFeature(evt.feature);
	}
});

CG.global.map.addControl(mmhoverControl);
mmhoverControl.activate();
