// **************************************************************
// * Copyright (c) 2010-2012 CyberInfrastructure and Geospatial *
// * Information Laboratory (CIGI), University of Illinois at   *
// * Urbana-Champaign, All Rights Reserved.                     *
// **************************************************************
// @authorKiumars Soltani <soltani2@illinois.edu> Sunwoo Kim <kim392@illinois.edu>

Ext.namespace('CG.flum');

// Global configurations: server URL and layer/time list
CG.flum.Config = {
    server: 'http://141.142.168.35:8889',
};

/* Definitions for MMFlowMap */
var boundNorth = 45.0;
var boundSouth = 30.0;
var boundWest = -125.0;
var boundEast = -70.0;

var movLayer = new OpenLayers.Layer.Vector('Movement Layer', {
    renderers: ['SVG', 'Canvas', 'VML']
});

// The left sidebar
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

// Testing out zoom and highlight
// TODO: work on interactivity.
function testZoom() {
    var testLayer = new OpenLayers.Layer.Vector("GeoJSON", {
        projection: "EPSG:4326",
        strategies: [new OpenLayers.Strategy.Fixed()],
        eventListeners: {           
            'loadend': function (evt) {//THE LOADEND EVENT LISTENER - WHEN THE LAYER IS DONE LOADING...
                CG.global.map.zoomToExtent(testLayer.getDataExtent());//ZOOM TO ITS EXTENT!
            }//END OF THE LOADEND EVENT
        },
        protocol: new OpenLayers.Protocol.HTTP({
            url: "/home/data/acs2013_5yr_geojson/acs2013_5yr.geojson",
        format: new OpenLayers.Format.GeoJSON()
        })
    });

    CG.global.map.addLayer(testLayer);
    var select = new OpenLayers.Control.SelectFeature(testLayer);
    CG.global.map.addControl(select);
    select.activate();
}

testZoom();
