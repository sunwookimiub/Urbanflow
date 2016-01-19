// **************************************************************
// * Copyright (c) 2010-2012 CyberInfrastructure and Geospatial *
// * Information Laboratory (CIGI), University of Illinois at   *
// * Urbana-Champaign, All Rights Reserved.                     *
// **************************************************************
// @authorKiumars Soltani <soltani2@illinois.edu> Sunwoo Kim <kim392@illinois.edu>

Ext.namespace('CG.flum');

/* TODO: change to each analysis */
var col = "exp1"

// Global configurations: server URL and layer/time list
CG.flum.Config = {
    server: 'http://141.142.168.35:8889/dibbs',
};

var selectedFeature = null;
var testLayer;
var selectControl; 

var maxRanks = 5;

var heatmap = new Heatmap.Layer("Heatmap");	

var evalResult = {};
var clusResult = {};
var sprdResult = [];

/* Definitions for MMFlowMap */
var boundNorth = 45.0;
var boundSouth = 30.0;
var boundWest = -125.0;
var boundEast = -70.0;

var movLayer = new OpenLayers.Layer.Vector('Movement Layer', {
    renderers: ['SVG', 'Canvas', 'VML']
});

// Grid panel for selecting the aggregation scheme
var aggregationGrid = Ext.create('Ext.grid.Panel', {
        store: aggregationStore,
        columns: [
            { header: 'Scheme', dataIndex: 'Name' 
            }
    ],
        height: 160,
        width: 102,
        renderTo: Ext.getBody(),
        listeners: {
            cellclick: function (view, td, cellIndex, record, tr, rowIndex, e, eOpts){
                if(rowIndex===0){
                    getCensusTract();
                }
            }
        }
});

aggregationGrid.hide();

// Identify Frequent Visitors Tab Panel (id: visitor_panel)
Ext.define('CG.view.VisitorPanel', {
	extend : 'Ext.panel.Panel',
	xtype : 'cgx2_urbanflowpanel',
	bodyPadding : '5 10',
	collapseMode : 'header',
	items : [ 
            {
                xtype : 'tabpanel', // Create a tab panel
                id : 'visitortab',
                width:  280,
                height: 300,
                activeTab: 0,
                items:  [
                        {
                            // The grid panel to select the algorithm
                            title: 'Model',
                            bodyPadding: 10,
                            items: visitorGrid
                        },
                        {
                            // Fieldset component to select parameters
                            title: 'Parameters',
                            id : 'paramtab',
                            bodyPadding: 10,
                            items: [
                                    visitorParam,
                                    {
                                        xtype: 'button',
                                                                              listeners: {
                                            click: function(btn) {
                                                Ext.getCmp('visitor_panel').collapse();
                                                //floatwind.hide();
                                            }
                                        }
                                    }
                                    ]
                        }
                        ]
            }
            ]
});

// Select an Aggregation Scheme Tab Panel (id: aggregation_panel)
Ext.define('CG.view.AggregationPanel', {
    extend : 'Ext.panel.Panel',
	xtype : 'cgx3_urbanflowpanel',
	bodyPadding : '5 10',
	collapseMode : 'header',
	items : [ 
	        {
                xtype : 'tabpanel', // Create a tab panel
                width:  280,
                height: 300,
                activeTab: 0,
                items:  [
                        {
                            // The grid panel to select the city
                            title: 'Select',
                            bodyPadding: 10,
                            items: aggregationGrid
                        },
                        {
                            // The form panel to upload a shapefile
                            title: 'Upload',
                            bodyPadding: 10,
                            items: aggregationForm
                        }
                        ]
            },
            {
                xtype: 'button',
                text: 'Next',
                listeners: {
                    click: function(btn) {
                        Ext.getCmp('aggregation_panel').collapse();
                    }
                }
            }
        ]
});

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
        width : 300,
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
    map.addLayers([ movLayer, baseLayer4]);
    var nav = map.getControlsByClass("OpenLayers.Control.Navigation")[0];
    nav.handlers.wheel.cumulative = true;
    return map;
}

CG.global.map = createBaseMap();

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
var westPanel = Ext.getCmp('setting_region');

// Get Census Tract, highlight, and
function getCensusTract() {
	westPanel.getComponent(3).expand();
    	testLayer = new OpenLayers.Layer.Vector("GeoJSON", {
        projection: "EPSG:4326",
        strategies: [new OpenLayers.Strategy.Fixed()],
        eventListeners: {           
            'loadend': function (evt) {
                CG.global.map.zoomToExtent(testLayer.getDataExtent());
		selectControl = new OpenLayers.Control.SelectFeature(
		testLayer,
        	{
                        onSelect:selected,
                        onUnselect:unselected,
                         multiple: false, hover: false,
                         multipleKey: "shiftKey" // shift key adds to selection
        	}
        	);
		CG.global.map.addControl(selectControl);
		selectControl.activate();
            }
        },
        protocol: new OpenLayers.Protocol.HTTP({
            url: "/home/data/acs2013_5yr_geojson/acs2013_5yr.geojson",
        format: new OpenLayers.Format.GeoJSON()
        })
    });
    /*testLayer.events.on({
        featureselected: function(event) {
            var geoid = (event.feature.attributes.geoid);
	    selectedFeature = event.feature;
	    getClusters(col, geoid);
	    getSpread(col, geoid);
        }
    });*/

    var report = function(e) {
        OpenLayers.Console.log(e.type, e.feature.id);
    };

    CG.global.map.addLayer(testLayer);
    var select = new OpenLayers.Control.SelectFeature(testLayer, {
        hover: true,
        highlightOnly: true,
        renderIntent: "temporary",
        eventListeners: {
            beforefeaturehighlighted: report,
        featurehighlighted: report,
        featureunhighlighted: report
        }
    });

    var selectCtrl = new OpenLayers.Control.SelectFeature(testLayer,
            {clickout: true}
            );

    CG.global.map.addControl(select);
    select.activate();
    CG.global.map.addControl(selectCtrl);
    selectCtrl.activate();
}

function initializeDayArray(){
	var dayString = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	var arr = new Array();
	for(var i = 0; i < 7; i++){
		arr.push({'Day': dayString[i]});
	}
	return arr;
}

function initializeHourArray(){
	var arr = new Array();
	for(var i = 0; i < 24; i++){
		arr.push({'Hour': i});
	}
	return arr;
}

function iterate(arr, maps) {
	for (var i in arr) {
		for(var k in maps){
			arr[i][k] = log(arr[i][k]);
		}
	}
	return arr;
}

function log(x){
	if (x == 0) return 0;
	else if (x == null) return 0;
	else return Math.log(x);
}

function plotRankBasedStats(){
	floatwind.getComponent(0).getComponent(1).bindStore(Ext.create('Ext.data.JsonStore', {
        	fields: Object.keys(ranks).concat("Hour"),
        	data: iterate(evalResult['rank']['hours'], ranks)
        }));
	floatwind.getComponent(0).getComponent(1).redraw();
	floatwind.getComponent(0).getComponent(1).refresh();
;
	floatwind.getComponent(0).getComponent(0).bindStore(Ext.create('Ext.data.JsonStore', {
		fields: Object.keys(ranks).concat("Day"),
	        data: iterate(evalResult['rank']['days'], ranks)
	}));
	floatwind.getComponent(0).getComponent(0).redraw();
	floatwind.getComponent(0).getComponent(0).refresh();
	floatwind.getComponent(0).getComponent(2).bindStore(Ext.create('Ext.data.JsonStore', {
        	fields: Object.keys(landuses).concat("rank"),
        	data: evalResult['rank']['count']
        }));
	floatwind.getComponent(0).getComponent(2).redraw();
	floatwind.getComponent(0).getComponent(2).refresh();
	drawBoxPlot(floatwind.getComponent(0), evalResult['rank']['purity'], 0, 1, "Rank", "Dominant Landuse Purity", "Percentage");
}

function plotLandBasedStats(){
	floatwind.getComponent(1).getComponent(0).bindStore(Ext.create('Ext.data.JsonStore', {
        	fields: Object.keys(landuses).concat("Day"),
        	data: iterate(evalResult['landuse']['days'], landuses)
        }));
	floatwind.getComponent(1).getComponent(0).redraw();
	floatwind.getComponent(1).getComponent(0).refresh();
	floatwind.getComponent(1).getComponent(1).bindStore(Ext.create('Ext.data.JsonStore', {
        	fields: Object.keys(landuses).concat("Hour"),
        	data: iterate(evalResult['landuse']['hours'], landuses)
        }));
	floatwind.getComponent(1).getComponent(1).redraw();
	floatwind.getComponent(1).getComponent(1).refresh();
	drawBoxPlot(floatwind.getComponent(1), evalResult['landuse']['purity'], 0, 1, "Landuse", "Dominant Landuse Purity", "Percentage");

}

function plotLandBasedClusters(){
	floatwind2.getComponent(1).getComponent(0).bindStore(Ext.create('Ext.data.JsonStore', {
        	fields: Object.keys(landuses).concat("Day"),
        	data: iterate(clusResult['landuse']['days'], landuses)
        }));
	floatwind2.getComponent(1).getComponent(0).redraw();
	floatwind2.getComponent(1).getComponent(0).refresh();
;
	floatwind2.getComponent(1).getComponent(1).bindStore(Ext.create('Ext.data.JsonStore', {
        	fields: Object.keys(landuses).concat("Hour"),
        	data: iterate(clusResult['landuse']['hours'], landuses)
        }));
	floatwind2.getComponent(1).getComponent(1).redraw();
	floatwind2.getComponent(1).getComponent(1).refresh();
;
	drawBoxPlot(floatwind2.getComponent(1), clusResult['landuse']['purity'], 0, 1, "Landuse", "Dominant Landuse Purity", "Percentage");
}

function plotRankBasedClusters(){
	floatwind2.getComponent(0).getComponent(0).bindStore(Ext.create('Ext.data.JsonStore', {
        	fields: Object.keys(ranks).concat("Day"),
        	data: iterate(clusResult['rank']['days'], ranks)
        }));
	floatwind2.getComponent(0).getComponent(0).redraw();
	floatwind2.getComponent(0).getComponent(0).refresh();
;
	floatwind2.getComponent(0).getComponent(1).bindStore(Ext.create('Ext.data.JsonStore', {
        	fields: Object.keys(ranks).concat("Hour"),
        	data: iterate(clusResult['rank']['hours'], ranks)
        }));
	floatwind2.getComponent(0).getComponent(1).redraw();
	floatwind2.getComponent(0).getComponent(1).refresh();
;

	floatwind2.getComponent(0).getComponent(2).bindStore(Ext.create('Ext.data.JsonStore', {
        	fields: Object.keys(landuses).concat('rank'),
        	data: clusResult['rank']['count']['data']
        }));
	floatwind2.getComponent(0).getComponent(2).axes.items[1].maximum = clusResult['rank']['count']['max'];
	floatwind2.getComponent(0).getComponent(2).redraw();
	floatwind2.getComponent(0).getComponent(2).refresh();

	drawBoxPlot(floatwind2.getComponent(0), clusResult['rank']['purity'], 0, 1, "Rank", "Dominant Landuse Purity", "Percentage");
}

function plotLangBasedClusters(){
	floatwind2.getComponent(2).getComponent(0).bindStore(Ext.create('Ext.data.JsonStore', {
        	fields: ["count", "lang"],
        	data: clusResult['lang']
        }));
	floatwind2.getComponent(2).getComponent(0).redraw();
	floatwind2.getComponent(2).getComponent(0).refresh();
}





function getClusteringStats(evt){
	/* TODO: get info on the clustering algorithms that they want */
	/* TODO: get info on the parameters */
	/* TODO: launch Hadoop job */
	/* For now it's DBSCAN with fixed parameters and pre-computed*/
	var jqxhr1 = $.get("server-proxy-new.php?url="+encodeURIComponent(CG.flum.Config.server + "?command=getlandusestat&" + "col=" + col),	
	function(data) {
		var json = JSON.parse(data);
		var days = initializeDayArray();
		var hours = initializeHourArray();
		var purity = new Array();
		for(var i in json){
			var element = json[i];
			var landuse = element._id;
			if (!(landuse in landuses)) continue;
			for(var j in element.day){
				days[j][landuse] = Number(element.day[j]);
			}
			for(var j in element.hour){
				hours[j][landuse] = Number(element.hour[j]);
			}
			var quantiles = new Array();
			for(var j in element.purity) quantiles.push(element.purity[j]);
			purity.push([landuse, quantiles]);
		}

		evalResult['landuse'] = {'hours': hours, 'days': days, 'purity': purity};
	});

	var jqxhr2 = $.get("server-proxy-new.php?url="+encodeURIComponent(CG.flum.Config.server + "?command=getrankstat&" + "col=" + col),	
	function(data) {
		var json = JSON.parse(data);
		var days = initializeDayArray();	
		var count = new Array(5);
		var hours = initializeHourArray();
		var purity = new Array(ranks.length);
		for(var i in json){
			var element = json[i];
			var rank = element._id;
			if (!(rank in ranks)) continue;
			for(var j in element.day){
				days[j][rank] = Number(element.day[j]);
			}
			for(var j in element.hour){
				hours[j][rank] = Number(element.hour[j]);
			}
			var obj = {rank: element._id};
			for(var j in element.count){
				if (!(j in landuses)) continue;	
				obj[j] = Number(element.count[j]);
			}
			count[rank-1] = obj;
			var quantiles = new Array();
			for(var j in element.purity) quantiles.push(element.purity[j]);
			purity[rank-1] = [rank, quantiles];
		}

		evalResult['rank'] = {'hours': hours, 'days': days, 'purity': purity, 'count': count};
	});

	$.when(jqxhr1, jqxhr2).done(function() {
		floatwind.show();
	});
}

function plotSpread(){
	heatmap.destroy();
	heatmap = new Heatmap.Layer("Heatmap"); 

	for(var i in sprdResult){
		var loc = sprdResult[i];
		var lonlat = new OpenLayers.LonLat(loc[1], loc[0]).transform(
        		new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection(
	                "EPSG:900913"));
		heatmap.addSource(new Heatmap.Source(lonlat));
	}
	CG.global.map.addLayer(heatmap);
}

function getSpread(col, geoid){
	var resultPanel = westPanel.getComponent(3).getComponent(0).getComponent(0).getComponent(0);
	var landuse1 = resultPanel.getComponent(1).getValue();
	var rank1 = resultPanel.getComponent(2).getValue();
	var landuse2 = resultPanel.getComponent(4).getValue();
	var rank2 = resultPanel.getComponent(5).getValue();
	var jqxhr = $.get("server-proxy-new.php?url="+encodeURIComponent(CG.flum.Config.server + "?command=getspread&" + "col=" + col + "&id=" + geoid +
	"&landuse1=" + landuse1 + "&rank1=" + rank1 + "&landuse2=" + landuse2 + "&rank2="+rank2),
        function(data) {
                var json = JSON.parse(data);
		sprdResult = new Array(0);
		for(var i in json){
			var loc = json[i].loc;
			sprdResult.push(loc);
		}
		plotSpread();
	});
	
}

function create2dArray(dim1, dim2){
	var arr = new Array();
	for(var i = 0; i < dim1; i++) arr.push(Array.apply(null, Array(dim2)).map(Number.prototype.valueOf,0));
	return arr;
}

function getClustersJoined(col, id1, id2, evt){
	var jqxhr = $.get("server-proxy-new.php?url="+encodeURIComponent(CG.flum.Config.server + "?command=getclustersjoined&" + "col=" + col + "&id1=" + id1 +
        "&id2=" + id2),
        function(data) {
                var json = JSON.parse(data);
		var keys = Object.keys(landuses);
		var matrix = create2dArray(keys.length, keys.length);
		var mapp = {};
		for(var i in keys){
			mapp[keys[i]] = {name: landuses[keys[i]], id: Number(i)};
		}
		var users = {};
                for(var i in json){
                        var landuse = json[i].landuse;
			if (!(landuse in landuses)) continue;
			var userid = json[i].userid;
			if (userid in users) users[userid].push(landuse);
			else users[userid] = [landuse];
                }

		for(user in users){
			var arr = users[user];
			for(var i = 0; i < arr.length; i++){
				for(var j = 0; j < arr.length; j++){
					var index1 = keys.indexOf(arr[i]);
					var index2 = keys.indexOf(arr[j]);
					//window.alert(index1 + ":" + index2);
					//window.alert(matrix[0][0]);
					matrix[index1][index2]++;
				}
			}
		}

		for(var i in matrix) console.log(matrix[i]);
		choordPanel.show();
		drawChoordPlot(choordPanel, matrix, mapp, "Connectivity of Landuse Types");
		selectControl.onUnselect = function(){};
		selectControl.unselect(evt);
		selectControl.onUnselect = unselected;

        });

}

function getClusters(col, geoid){
	var jqxhr = $.get("server-proxy-new.php?url="+encodeURIComponent(CG.flum.Config.server + "?command=getclusters&" + "col=" + col + "&id=" + geoid),
        function(data) {
                var json = JSON.parse(data);
		var days1 = initializeDayArray();	
		var days2 = initializeDayArray();
		var count = new Array(5);
		var hours1 = initializeHourArray();
		var hours2 = initializeHourArray();
		var purity1 = {};
		var purity2 = {};
		var users = {};
		for(var i in json){
			var element = json[i];
			var rank = element.rank;
			var landuse = element.landuse;
			var userid = element.userid;
			var purity = element.purity;
			if (!(rank in ranks)) continue;
			if(!(landuse in landuses)) continue;

			for(var j in element.day){
				if (rank in days1[j]) days1[j][rank] = days1[j][rank] + Number(element.day[j]);
				else days1[j][rank] = Number(element.day[j]);
				if (landuse in days2[j]) days2[j][landuse] = days2[j][landuse] + Number(element.day[j]);
				else days2[j][landuse] = Number(element.day[j]);
	
			}
			for(var j in element.hour){
				if (rank in hours1[j]) hours1[j][rank] = hours1[j][rank] + Number(element.hour[j]);
				else hours1[j][rank] = Number(element.hour[j]);
				if (landuse in hours2[j]) hours2[j][landuse] = hours2[j][landuse] + Number(element.hour[j]);
				else hours2[j][landuse] = Number(element.hour[j]);
			}
			if (count[rank-1] == null) count[rank-1] = {rank: rank};
			if (!(landuse in count[rank-1])){
				count[rank-1][landuse] = 1;
			}
			else
				count[rank-1][landuse] = count[rank-1][landuse] + 1;

			if (rank in purity1) purity1[rank].push(purity);
			else purity1[rank] = [purity];
			if (landuse in purity2) purity2[landuse].push(purity);
			else purity2[landuse] = [purity];

			if (rank != 1) continue;
			if (element.language in users) users[element.language] = users[element.language] + 1;
			else users[element.language] = 1;
		}

		var LangsArr = new Array();
		for(var lang in users) LangsArr.push({lang: lang, count: users[lang]});
		var purityArr1 = new Array();
		var purityArr2 = new Array();
		for(var j in purity1){
			var arr = purity1[j].sort();
			var quantiles = math.quantileSeq(arr, [0.25, 0.50, 0.75], true);
			purityArr1.push([j, [arr[0]].concat(quantiles).concat(arr[arr.length-1])]);
		}

		for(var j in purity2){
			var arr = purity2[j].sort();
			var quantiles = math.quantileSeq(arr, [0.25, 0.50, 0.75], true);
			purityArr2.push([j, [arr[0]].concat(quantiles).concat(arr[arr.length-1])]);
		}
		var maxcount = 0;
		for(var i in count){
			var sum = 0;
			for(var j in count[i]) sum += count[i][j];
			if (sum > maxcount) maxcount = sum;
		}
		clusResult['rank'] = {'days': days1, 'hours': hours1, 'count': {'data': count, 'max': maxcount}, 'purity': purityArr1};
		clusResult['landuse'] = {'days': days2, 'hours': hours2, 'purity': purityArr2};
		clusResult['lang'] = LangsArr;
		floatwind2.show();
	});
}

function closeFloatWind(panel){
	floatwind.destroy();
	floatwind = getNewFloatWind();	
 	floatwind.getComponent(0).on('boxready', plotRankBasedStats, this, {single: true}); 
	floatwind.getComponent(1).on('boxready', plotLandBasedStats, this, {single: true}); 
	floatwind.on('close', closeFloatWind, this);
}

function closeFloatWind2(panel){
	floatwind2.destroy();
	floatwind2 = getNewFloatWind2();	
 	floatwind2.getComponent(0).on('boxready', plotRankBasedClusters, this, {single: true}); 
	floatwind2.getComponent(1).on('boxready', plotLandBasedClusters, this, {single: true});
 	floatwind2.getComponent(2).on('boxready', plotLangBasedClusters, this, {single: true}); 	
	floatwind2.on('close', closeFloatWind2, this);
}

function closeChoordPanel(panel){
	choordPanel.destroy();
	choordPanel = getNewPanel();
	choordPanel.on('close', closeChoordPanel, this);
}

visitorGrid.on('cellclick', getClusteringStats, this);
floatwind.getComponent(0).on('boxready', plotRankBasedStats, this, {single: true});
floatwind.getComponent(1).on('boxready', plotLandBasedStats, this, {single: true}); 
floatwind.on('close', closeFloatWind, this);
floatwind2.getComponent(0).on('boxready', plotRankBasedClusters, this, {single: true});
floatwind2.getComponent(1).on('boxready', plotLandBasedClusters, this, {single: true}); 
floatwind2.getComponent(2).on('boxready', plotLangBasedClusters, this, {single: true}); 
floatwind2.on('close', closeFloatWind2, this);
choordPanel.on('close', closeChoordPanel, this);
westPanel.getComponent(2).on('expand', function show(){aggregationGrid.show();});
westPanel.getComponent(3).getComponent(0).getComponent(0).getComponent(0).getComponent(6).on('click', function() {getSpread(col,selectedFeature.attributes.geoid);});

function selected(evt){
	if (selectedFeature != null){
		getClustersJoined(col, selectedFeature.attributes.geoid, evt.attributes.geoid, evt)
	}
	else{
		selectedFeature = evt;
		getSpread(col, selectedFeature.attributes.geoid);
	    	getClusters(col, selectedFeature.attributes.geoid);
	
	}
}

function unselected(evt){
	selectedFeature = null;
}


