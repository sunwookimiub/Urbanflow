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
                        console.log(barStore);
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
    width: 450,
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
        type: 'scatter',
        markerConfig: {
            radius: 3,
            size: 3
        },
        axis: 'left',
        xField: 'Time',
        yField: 'land1100'
    },
    {
        type: 'scatter',
        markerConfig: {
            radius: 3,
            size: 3
        },
        axis: 'left',
        xField: 'Time',
        yField: 'land1250'
    },
    {
        type: 'scatter',
        markerConfig: {
            radius: 3,
            size: 3
        },
        axis: 'left',
        xField: 'Time',
        yField: 'land1215'
    },
    {
        type: 'scatter',
        markerConfig: {
            radius: 3,
            size: 3
        },
        axis: 'left',
        xField: 'Time',
        yField: 'land1220'
    },
    {
        type: 'scatter',
        markerConfig: {
            radius: 3,
            size: 3
        },
        axis: 'left',
        xField: 'Time',
        yField: 'land1216'
    },
    {
        type: 'scatter',
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
    width: 450,
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
        fields: ['landuse1100', 'landuse1215', 'landuse1216', 'landuse1220', 'landuse1250', 'Other'],
        grid: true,
        minimum: 0
    }],
    series: [{
        type: 'bar',
        highlight: true,
        column: true,
        stacked: true,
        xField: 'name',
        yField: ['landuse1100', 'landuse1215', 'landuse1216', 'landuse1220', 'landuse1250', 'Other'],
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

//Floating window for displaying the graphs
var floatwind = new Ext.create('Ext.form.Panel', {
    title: 'Models display',
    width: 1000,
    height: 630,
    floating: true,
    closable: true,
    draggable: true,
    items: 
    [ {
        layout: {type: 'hbox'},
      items:  [
        scatterChart,
        scatterChart2
        ]
    },{
        layout: {type: 'hbox', align: 'center', pack: 'center'},
//    items: boxComp
        items: boxImage
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
                                        text: 'Next',
                                        listeners: {
                                            click: function(btn) {
                                                Ext.getCmp('visitor_panel').collapse();
                                            }
                                        }
                                    }
                                    ]
                        }
                        ]
            }
            ]
});

// Sample data store for the grid panel
var aggregationStore = Ext.create('Ext.data.Store',{
                fields:['Id','Name'],
                data:[
                {Id:'ct',Name:'Census Tract'},
                {Id:'cb',Name:'Census Blocks'},
                {Id:'zc',Name:'Zip Codes'}
                ]
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
        renderTo: Ext.getBody()
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

var langStore = Ext.create('Ext.data.Store',{
                fields:['Id','Name'],
                data:[
                {Id:'eng',Name:'English'},
                {Id:'esp',Name:'Spanish'},
                {Id:'fre',Name:'French'},
                {Id:'chi',Name:'Chinese'}
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
					text: 'Purpose: Landuse 1'
			},
			{
					xtype: 'numberfield',
					name: 'landuse1value'
			},
			{
					xtype: 'label',
					name: 'landuse2title',
					text: 'Purpose: Landuse 2'
			},	
			{
					xtype: 'numberfield',
					name: 'landuse2value'
			},
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
