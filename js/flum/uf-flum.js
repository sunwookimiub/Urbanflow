// **************************************************************
// * Copyright (c) 2010-2012 CyberInfrastructure and Geospatial *
// * Information Laboratory (CIGI), University of Illinois at   *
// * Urbana-Champaign, All Rights Reserved.                     *
// **************************************************************
// @author Sunwoo Kim <kim392@illinois.edu>

Ext.namespace('CG.flum');

// Sample data store for the grid panel
var cityStore = Ext.create('Ext.data.Store',{
                fields:['Id','Name'],
                data:[
                {Id:'Chicago',Name:'Chicago'},
                {Id:'NYC',Name:'New York City'},
                {Id:'LA',Name:'Los Angeles'},
                {Id:'Houston',Name:'Houston'}
                ]
});

// Grid panel for selecting the city
var cityGrid = Ext.create('Ext.grid.Panel', {
        store: cityStore,
        columns: [
            { header: 'City', dataIndex: 'Name' 
            }
    ],
        height: 160,
        width: 102,
        renderTo: Ext.getBody()
});

// Form panel for users to upload their shapefiles
var cityForm = Ext.create('Ext.form.Panel', {
    title: 'Upload a File',
    width: 270,
    bodyPadding: 10,
    frame: true,
    renderTo: Ext.getBody(),    
    items: [{
        xtype: 'filefield',
    name: 'file',
    fieldLabel: 'File',
    labelWidth: 50,
    msgTarget: 'side',
    allowBlank: false,
    anchor: '100%',
    buttonText: 'Select File...'
    }],

    buttons: [{
        text: 'Upload',
    handler: function() {
        var form = this.up('form').getForm();
    }
    }]
});

// Fieldset component where users can choose various options
var cityOption = 
{
    xtype: 'fieldset',
    items: [
    {
        // Option: Start Date of the analysis period (date: day of year)
        xtype: 'datefield',
        width : 200,
        margin : '10 0 0 0',
        fieldLabel: 'Start Date',
        value: new Date()
    },
    {
        // Option: End Date of the analysis period (date: day of year)
        xtype: 'datefield',
        width : 200,
        margin : '10 0 0 0',
        fieldLabel: 'End Date',
        value: new Date()
    },
    {
        // Option: Minimum distance between two consecutive tweets (numeric in meters) 
        xtype: 'label',
        name: 'mindisttitle',
        text: 'Min distance between two consecutive tweets (m)'
    },
    {
        xtype: 'numberfield',
        name: 'mindistvalue'
    },
    {
        // Option: Minimum time between two consecutive tweets (numeric in minutes) 
        xtype: 'label',
        name: 'mintimetitle',
        text: 'Min time between two consecutive tweets (min)'
    },
    {
        xtype: 'numberfield',
        name: 'mintimevalue'
    },
    {
        // Option: Minimum speed between two consecutive tweets (numeric in m/s) 
        xtype: 'label',
        name: 'minspeedtitle',
        text: 'Min speed between two consecutive tweets (m/s)'
    },
    {
        xtype: 'numberfield',
        name: 'minspeedvalue'
    }
    ]
}

// Select a City tab panel (id: city_panel)
Ext.define('CG.view.CityPanel', {
	extend : 'Ext.panel.Panel',
	xtype : 'cgx1_urbanflowpanel',
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
                            items: cityGrid
                        },
                        {
                            // The form panel to upload a shapefile
                            title: 'Upload',
                            bodyPadding: 10,
                            items: cityForm
                        },
                        {
                            // The fieldset component for options
                            title: 'Options',
                            bodyPadding: 10,
                            items: cityOption
                        }
                        ]
            },
            {
                xtype: 'button',
                text: 'Next',
                listeners: {
                    click: function(btn) {
                        Ext.getCmp('city_panel').collapse();
                    }
                }
            }
        ]
});

// Model for data fig1.json
Ext.define('Details', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'Time', type: 'int'}, 
        { name: 'land1100', type: 'int'}, 
        { name: 'land1250', type: 'int'}, 
        { name: 'land1215', type: 'int'}, 
        { name: 'land1220', type: 'int'}, 
        { name: 'land1216', type: 'int'}, 
        { name: 'land1321', type: 'int'}
    ]
});

// Data loaded from fig1.json
var scatterStore = new Ext.data.JsonStore({
    model: 'Details',
    proxy: {
        type: 'ajax',
        url: '/home/data/newfig1.json',
        reader: {
            root: 'data',
            type: 'json'
        }
    },
    autoLoad: true,
});

// The first chart displayed on the top left
var scatterChart = Ext.create('Ext.chart.Chart', {
    renderTo: Ext.getBody(),
    width: 500,
    height: 300,
    animate: true,
    store: scatterStore,
    legend: {
        position: 'right',
        padding: 20
    },
    axes: [{
        type: 'Numeric',
    position: 'bottom',
    fields: ['Time'],
    title: 'Time of Day',
    grid: true,
    minimum: 0
    }, { 
        title: 'Tweets Volume (%)',
    type: 'Numeric',
    position: 'left',
    fields: ['land1100', 'land1250', 'land1215', 'land1220', 'land1216', 'land1321'],
    }],
    series: [{
        type: 'line',
        highlight: {
            size: 3,
            radius: 3
        },
        markerConfig: {
            radius: 3,
            size: 3
        },
        axis: 'left',
        xField: 'Time',
        yField: 'land1100'
    },
    {
        type: 'line',
        highlight: {
            size: 3,
            radius: 3
        },
        markerConfig: {
            radius: 3,
            size: 3
        },
        axis: 'left',
        xField: 'Time',
        yField: 'land1250'
    },
    {
        type: 'line',
        highlight: {
            size: 3,
            radius: 3
        },
        markerConfig: {
            radius: 3,
            size: 3
        },
        axis: 'left',
        xField: 'Time',
        yField: 'land1215'
    },
    {
        type: 'line',
        highlight: {
            size: 3,
            radius: 3
        },
        markerConfig: {
            radius: 3,
            size: 3
        },
        axis: 'left',
        xField: 'Time',
        yField: 'land1220'
    },
    {
        type: 'line',
        highlight: {
            size: 3,
            radius: 3
        },
        markerConfig: {
            radius: 3,
            size: 3
        },
        axis: 'left',
        xField: 'Time',
        yField: 'land1216'
    },
    {
        type: 'line',
        highlight: {
            size: 3,
            radius: 3
        },
        markerConfig: {
            radius: 3,
            size: 3
        },
        axis: 'left',
        xField: 'Time',
        yField: 'land1321'
    },
]
});

// Model for data fig3.json
Ext.define('barDetails', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'name', type: 'string'}, 
        { name: 'landuse1100', type: 'int'}, 
        { name: 'landuse1211', type: 'int'}, 
        { name: 'landuse1212', type: 'int'}, 
        { name: 'landuse1214', type: 'int'}, 
        { name: 'landuse1215', type: 'int'}, 
        { name: 'landuse1216', type: 'int'}, 
        { name: 'landuse1220', type: 'int'}, 
        { name: 'landuse1240', type: 'int'}, 
        { name: 'landuse1250', type: 'int'}, 
        { name: 'landuse1300', type: 'int'}, 
        { name: 'landuse1310', type: 'int'}, 
        { name: 'landuse1321', type: 'int'}, 
        { name: 'landuse1322', type: 'int'}, 
        { name: 'landuse1330', type: 'int'}, 
        { name: 'landuse1340', type: 'int'}, 
        { name: 'landuse1350', type: 'int'},
        { name: 'landuse1360', type: 'int'},
        { name: 'landuse1400', type: 'int'},
        { name: 'landuse1500', type: 'int'},
        { name: 'landuse1511', type: 'int'},
        { name: 'landuse1512', type: 'int'},
        { name: 'landuse1520', type: 'int'},
        { name: 'landuse1530', type: 'int'},
        { name: 'landuse1540', type: 'int'},
        { name: 'landuse2000', type: 'int'},
        { name: 'landuse3000', type: 'int'},
        { name: 'landuse4000', type: 'int'},
        { name: 'landuse5000', type: 'int'},
        { name: 'landuse6000', type: 'int'},
        { name: 'landuse9999', type: 'int'},
        { name: 'Other', type: 'int'}
    ]
});

// Data loaded from fig3.json
var barStore = new Ext.data.JsonStore({
    model: 'barDetails',
    proxy: {
        type: 'ajax',
        url: '/home/data/newfig3.json',
        reader: {
            root: 'data',
            type: 'json'
        }
    },
    autoLoad: true,
});

var scatterChart2 = Ext.create('Ext.chart.Chart', {
    renderTo: Ext.getBody(),
    width: 500,
    height: 300,
    animate: true,
    store: barStore,
    legend: {
        position: 'right',
        padding: 20
    },
    axes: [{
        type: 'Category',
        position: 'bottom',
        fields: ['name'],
        title: 'Rank',
    }, { 
        title: 'Number of Clusters',
        type: 'Numeric',
        position: 'left',
        // Discarding 'others'
        //fields: ['landuse1100', 'landuse1215', 'landuse1216', 'landuse1220', 'landuse1250', 'Other'],
        fields: ['landuse1100', 'landuse1215', 'landuse1216', 'landuse1220', 'landuse1250'],
        grid: true,
        minimum: 0
    }],
    series: [{
        type: 'bar',
        highlight: true,
        column: true,
        stacked: true,
        xField: 'name',
        //yField: ['landuse1100', 'landuse1215', 'landuse1216', 'landuse1220', 'landuse1250', 'Other'],
        // Discarding 'others'
        yField: ['landuse1100', 'landuse1215', 'landuse1216', 'landuse1220', 'landuse1250'],
//        yField: ['landuse1100', 'landuse1211', 'landuse1212', 'landuse1214', 'landuse1215', 'landuse1216', 'landuse1220', 'landuse1240', 'landuse1250', 'landuse1300', 'landuse1310', 'landuse1321', 'landuse1322', 'landuse1330', 'landuse1340', 'landuse1350', 'landuse1360', 'landuse1400', 'landuse1500', 'landuse1511', 'landuse1512', 'landuse1520', 'landuse1530', 'landuse1540', 'landuse2000', 'landuse3000', 'landuse4000', 'landuse5000', 'landuse6000', 'landuse9999', 'Other']
    }] 
});

// Boxplot

// Component containing html
var boxComp = new Ext.Component({
    html: '<canvas id="boxcanvas"></canvas> ',
  listeners: {
        boxready: function() {
//            document.getElementById('boxcanvas').width = this.getWidth();
            document.getElementById('boxcanvas').width = 600;
//            document.getElementById('boxcanvas').height = this.getHeight();
            document.getElementById('boxcanvas').height = 270;
            var c = document.getElementById("boxcanvas");
            var ctx = c.getContext("2d");
            ctx.rect(50,20,450,200);
            ctx.stroke(); 
        }
    }
});

// Image file loading the boxplot image
var boxImage = Ext.create('Ext.Img', {
    width: 600,
    height: 300,
    src: '/home/data/boxplot.png',
    renderTo: Ext.getBody()
});

/*
var margin = {top: 10, right: 50, bottom: 20, left: 50},
        width = 120 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;
var min = Infinity,
        max = -Infinity;
var chart = d3.box()
        .whiskers(iqr(1.5))
        .width(width)
        .height(height);
        d3.csv("/home/data/morley.csv", function(error, csv) {
            if (error) throw error;
            var data = [];
            csv.forEach(function(x) {
                var e = Math.floor(x.Expt - 1),
                r = Math.floor(x.Run - 1),
                s = Math.floor(x.Speed),
                d = data[e];
            if (!d) d = data[e] = [s];
            else d.push(s);
            if (s > max) max = s;
            if (s < min) min = s;
            });
            chart.domain([min, max]);
            var svg = d3.select("body").selectAll("svg")
            .data(data)
            .enter().append("svg")
            .attr("class", "box")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.bottom + margin.top)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(chart);
            setInterval(function() {
                svg.datum(randomize).call(chart.duration(1000));
            }, 2000);
        });
function randomize(d) {
    if (!d.randomizer) d.randomizer = randomizer(d);
    return d.map(d.randomizer);
}
function randomizer(d) {
    var k = d3.max(d) * .02;
    return function(d) {
        return Math.max(min, Math.min(max, d + k * (Math.random() - .5)));
    };
}
function iqr(k) {
    return function(d, i) {
        var q1 = d.quartiles[0],
            q3 = d.quartiles[2],
            iqr = (q3 - q1) * k,
            i = -1,
            j = d.length;
        while (d[++i] < q1 - iqr);
        while (d[--j] > q3 + iqr);
        return [i, j];
    };
}
*/


var scatterChart3 = Ext.create('Ext.chart.Chart', {
    renderTo: Ext.getBody(),
    width: 500,
    height: 300,
    animate: true,
    store: barStore,
    legend: {
        position: 'right',
        padding: 20
    },
    axes: [{
        type: 'Category',
        position: 'bottom',
        fields: ['name'],
        title: 'Rank',
    }, { 
        title: 'Number of Clusters',
        type: 'Numeric',
        position: 'left',
        // Discarding 'others'
        //fields: ['landuse1100', 'landuse1215', 'landuse1216', 'landuse1220', 'landuse1250', 'Other'],
        fields: ['landuse1100', 'landuse1215', 'landuse1216', 'landuse1220', 'landuse1250'],
        grid: true,
        minimum: 0
    }],
    series: [{
        type: 'bar',
        highlight: true,
        column: true,
        stacked: true,
        xField: 'name',
        //yField: ['landuse1100', 'landuse1215', 'landuse1216', 'landuse1220', 'landuse1250', 'Other'],
        // Discarding 'others'
        yField: ['landuse1100', 'landuse1215', 'landuse1216', 'landuse1220', 'landuse1250'],
//        yField: ['landuse1100', 'landuse1211', 'landuse1212', 'landuse1214', 'landuse1215', 'landuse1216', 'landuse1220', 'landuse1240', 'landuse1250', 'landuse1300', 'landuse1310', 'landuse1321', 'landuse1322', 'landuse1330', 'landuse1340', 'landuse1350', 'landuse1360', 'landuse1400', 'landuse1500', 'landuse1511', 'landuse1512', 'landuse1520', 'landuse1530', 'landuse1540', 'landuse2000', 'landuse3000', 'landuse4000', 'landuse5000', 'landuse6000', 'landuse9999', 'Other']
    }] 
});


//Floating window for displaying the graphs
var floatwind = new Ext.create('Ext.tab.Panel', {
    title: 'Models display',
    width: 700,
    height: 630,
    floating: true,
    closable: true,
    draggable: true,
    items: 
    [ {
        title: 'Rank',
        xtype: 'panel',
        autoScroll: true,
        layout: {type: 'vbox', align: 'center'},
        items:  [
        scatterChart,
        scatterChart2,
        boxImage
        ]
    },{
        title: 'Landuse',
        xtype: 'panel',
        autoScroll: true,
        layout: {type: 'vbox', align: 'center'},
        items:  [
            scatterChart3
        ]
    }
]
});

// Sample spatial clustering algorithm store for the grid panel
var visitorStore = Ext.create('Ext.data.Store',{
    fields:['Id','Name'],
    data:[
{Id:'db',Name:'DBSCAN'},
{Id:'seq',Name:'SeqScan'},
{Id:'gm',Name:'Gaussian Mixture'}
]
});

// Grid panel for selecting the algorithm
var visitorGrid = Ext.create('Ext.grid.Panel', {
    store: visitorStore,
    columns: [
{ header: 'Model', dataIndex: 'Name' 
}
],
height: 160,
width: 102,
renderTo: Ext.getBody(),
listeners: {
    cellclick: function (view, td, cellIndex, record, tr, rowIndex, e, eOpts){
        if(rowIndex===0){
                    Ext.getCmp('visitortab').setActiveTab('paramtab');
                        floatwind.show();
                }
            }
        }
});

// Fieldset component where users can choose the parameters
var visitorParam = 
{
    xtype: 'fieldset',
    items: [
    {
        // Option: Minimum time between two consecutive tweets (numeric in minutes) 
        xtype: 'label',
        name: 'mintweettitle',
        text: 'Min number of tweets'
    },
    {
        xtype: 'numberfield',
        name: 'mintweetvalue'
    },
    {
        // Option: Minimum speed between two consecutive tweets (numeric in m/s) 
        xtype: 'label',
        name: 'searchradiustitle',
        text: 'Search window radius (m)'
    },
    {
        xtype: 'numberfield',
        name: 'searchradiusvalue'
    }
    ]
}

// Sample data store for the grid panel
var aggregationStore = Ext.create('Ext.data.Store',{
                fields:['Id','Name'],
                data:[
                {Id:'ct',Name:'Census Tract'},
                {Id:'cb',Name:'Census Blocks'},
                {Id:'zc',Name:'Zip Codes'}
                ]
});

// Form panel for users to upload their shapefiles
var aggregationForm = Ext.create('Ext.form.Panel', {
    title: 'Upload a File',
    width: 270,
    bodyPadding: 10,
    frame: true,
    renderTo: Ext.getBody(),    
    items: [{
        xtype: 'filefield',
    name: 'file',
    fieldLabel: 'File',
    labelWidth: 50,
    msgTarget: 'side',
    allowBlank: false,
    anchor: '100%',
    buttonText: 'Select File...'
    }],
    buttons: [{
        text: 'Upload',
    handler: function() {
        var form = this.up('form').getForm();
    }
    }]
});

//----------------------------------------------------
var langStore = Ext.create('Ext.data.Store',{
                fields:['Id','Name'],
                data:[
                {Id:'eng',Name:'English'},
                {Id:'esp',Name:'Spanish'},
                {Id:'fre',Name:'French'},
                {Id:'chi',Name:'Chinese'}
                ]
});

var landStore = Ext.create('Ext.data.Store',{
                    fields: ['Id', 'Label'],
                    data:[
                    {Id: 'l1', Label:'Land1'},
                    {Id: 'l2', Label:'Land2'},
                    {Id: 'l3', Label:'Land3'}
                    ]
});

var rankStore = Ext.create('Ext.data.Store',{
                    fields: ['Id', 'Label'],
                    data:[
                    {Id: 'r1', Label:'Rank1'},
                    {Id: 'r2', Label:'Rank2'},
                    {Id: 'r3', Label:'Rank3'}
                    ]
});

var aggregationOptions=  
	{
		xtype : 'fieldset',
		title : 'Query Options',
		name : 'ufqueryoptions',
		columns : 3,
		hideMode: 'visibility',
		items : [
			{
					xtype: 'label',
					name: 'landuse1title',
					text: 'Original'
			},
			{
					xtype: 'combobox',
					name: 'landuse1value',
                    store: landStore,
                    displayField: 'Label',
                    valueField: 'Id',
                    queryMode: 'local',
                    editable: false,
                    forceSelection: true
			},
			{
					xtype: 'label',
					name: 'landuse2title',
					text: 'Destination'
			},	
			{
					xtype: 'combo',
					name: 'landuse2value',
                    store: landStore,
                    displayField: 'Label',
                    valueField: 'Id',
                    queryMode: 'local',
                    editable: false,
                    forceSelection: true
			},
			{
					xtype: 'label',
					name: 'rank1title',
					text: 'Rank 1'
			},
			{
					xtype: 'combobox',
					name: 'rank1value',
                    store: rankStore,
                    displayField: 'Label',
                    valueField: 'Id',
                    queryMode: 'local',
                    editable: false,
                    forceSelection: true
			},
			{
					xtype: 'label',
					name: 'rank2title',
					text: 'Rank 2'
			},	
			{
					xtype: 'combo',
					name: 'rank2value',
                    store: rankStore,
                    displayField: 'Label',
                    valueField: 'Id',
                    queryMode: 'local',
                    editable: false,
                    forceSelection: true
			},
			{
					xtype: 'checkboxfield',
                    fieldLabel: 'Show Statistics Plot',
                    items: [
                    {
                        name: 'query',
                        inputValue: '1',
                        id: 'checkbox1'
                    }
                    ]
			},
			{
					xtype: 'checkboxfield',
                    fieldLabel: 'Show Spread',
                    items: [
                    {
                        name: 'query',
                        inputValue: '1',
                        id: 'checkbox2'
                    }
                    ]
			}
            /*
        		{
            /*
        		{
	        		xtype: 'combobox',
                    margin: '10 10 0 0',
                    fieldLabel: 'Dominant Lang',
                    store: langStore,
                    displayField: 'Name',
                    valueField: 'Id',
                    queryMode: 'local',
                    editable: false,
                    forceSelection: true,
                    value: '201407'
                },
			{
					xtype : 'label',
                    margin: '20 10 0 0',
					name : 'ufsliderlabeltitle',
					text : 'Minimum Percentage'
			},
			{
					xtype : 'slider',
                    name : 'ufslider',
                    width : 250,
                    useTips : true,
                    margin : '10 0 0 5',
                    maxValue : 100,
                    value : 20
			},
			{
					xtype : 'button',
					width : 150,
					margin : '10 0 0 0',
					text : 'Display',
			}
            */
		]
}

// Results Panel (id: results_panel)
Ext.define('CG.view.ResultPanel', {
		extend: 'Ext.panel.Panel',
		xtype: 'cgx4_urbanflowpanel',
		bodyPadding: '5 10',
		collapseMode: 'header',
		items: [
	            {
                xtype : 'tabpanel', // Create a tab panel
                width:  280,
                height: 300,
                activeTab: 0,
                items:  [
                        {
                            // The grid panel to select the purpose and dominant language
                            title: 'Query',
                            bodyPadding: 10,
                            items: aggregationOptions
                        },
                        {
                            // The panel to download
                            title: 'Download',
                            bodyPadding: 10,
                            items: [
                            {
                                xtype : 'button',
                                width : 150,
                                margin : '10 0 0 0',
                                text : 'Download',
                            }
                                ]
                        }
                        ]
            }
        ]
});
