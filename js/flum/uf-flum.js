// **************************************************************
// * Copyright (c) 2010-2012 CyberInfrastructure and Geospatial *
// * Information Laboratory (CIGI), University of Illinois at   *
// * Urbana-Champaign, All Rights Reserved.                     *
// **************************************************************
// @author Sunwoo Kim <kim392@illinois.edu>

Ext.namespace('CG.flum');
var ranks = {"1":"1", "2":"2", "3":"3", "4":"4", "5":"5"};
var landuses = {"1100": "Residential", "1321": "k-12 Education Schools", "1322": "Post-Secondary Educational", "1220": "Office", "1240": "Cultural/Entertainment"};

function getValues(maps){
	var arr = [{id: 'null', value: 'All'}];
	for(var i in maps) arr.push({id: i, value: maps[i]});
	return Ext.create('Ext.data.Store', {
	fields: ['id', 'value'],
	data: arr,
	});
}

// Sample data store for the grid panel
var cityStore = Ext.create('Ext.data.Store',{
                fields:['Id','Name'],
                data:[
                {Id:'Chicago',Name:'Chicago'}
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



function getDayChart(maps){
	var arr = Object.keys(maps);
	var series = new Array();
	for(var i in arr){
		series.push({
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
	        xField: 'Day',
        	yField: arr[i],
		title: maps[arr[i]]
    		});
	}

	var chart = {
		xtype: 'chart',
		    width: 500,
	    height: 300,
	    animate: true,
	    store: Ext.create('Ext.data.JsonStore', {
	    fields: [arr.concat("Day")],
	    data: [
	    ]
	    }),
	    legend: {
	        position: 'right',
	        padding: 20
	    },
	    axes: [{
	    position: 'bottom',
	    fields: ['Day'],
	    title: 'Day of the Week',
	    grid: true,
	    type: 'Category'
	    }, { 
	        title: 'Tweets Volume (log)',
	    type: 'Numeric',
	    position: 'left',
	    fields: arr
	    }],
	    series: series
	};

	return chart;
}


function getHourChart(maps){
	var arr = Object.keys(maps);
	var series = new Array();
	for(var i in arr){
		series.push({
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
	        xField: 'Hour',
        	yField: arr[i],
		title: maps[arr[i]]
    		});
	}

	var chart = {
		xtype: 'chart',
		    width: 500,
	    height: 300,
	    animate: true,
	    store: Ext.create('Ext.data.JsonStore', {
	    fields: [arr.concat("Hour")],
	    data: [
	    ]
	    }),
	    legend: {
	        position: 'right',
	        padding: 20
	    },
	    axes: [{
	    position: 'bottom',
	    fields: ['Hour'],
	    title: 'Hour of the Day',
	    grid: true,
	    type: 'Numeric'
	    }, { 
	        title: 'Tweets Volume (log)',
	    type: 'Numeric',
	    position: 'left',
	    fields: arr
	    }],
	    series: series
	};

	return chart;
}

function getStackPlot(maps, category, text1, text2){
	var arr = Object.keys(maps);
	var values = new Array();
	for(var i in arr) values.push(maps[arr[i]]);
	var chart = Ext.create('Ext.chart.Chart', {
    		width: 500,
    		height: 300,
    		animate: true,
    		store: Ext.create('Ext.data.JsonStore', {
	    		fields: arr.concat(category),
		    	data: [
		    	]
		}),
    		legend: {
        		position: 'right',
        		padding: 20
    		},
    		axes: [{
        		type: 'Category',
        		position: 'bottom',
        		fields: [category],
        		title: text1,
    		}, { 
        		title: text2,
        		type: 'Numeric',
        		position: 'left',
        		fields: arr,
        		grid: true,
        		minimum: 0
    		}],
    		series: [{
        		type: 'bar',
	        	highlight: true,
	        	column: true,
	        	stacked: true,
        		yField: arr,
			title: values
    		}] 
	});

	return chart;

}

function getPieChart(category, value){
	var chart = new Ext.chart.Chart({
	width: 500,
        height: 300,
        animate: true,
        store: Ext.create('Ext.data.JsonStore', {
                fields: [category, value],
                data: [
        	]
        }),
        shadow: true,
        legend: {
            position: 'right'
        },
        insetPadding: 25,
        theme: 'Base:gradients',
        series: [{
            type: 'pie',
            field: value,
            showInLegend: true,
            highlight: {
              segment: {
                margin: 20
              }
            },
            label: {
                field:  category,
                display: 'rotate',
                contrast: true,
                font: '18px "Lucida Grande", "Lucida Sans Unicode", Verdana, Arial, Helvetica, sans-serif'
            },
            animate: true
        }]
	});
	
	return chart;
}

function drawBoxPlot(panel, data, min, max, category, title, value) {
	var labels = true; // show the text labels beside individual boxplots?
	var margin = {top: 30, right: 50, bottom: 70, left: 50};
	var  width = 800 - margin.left - margin.right;
	var height = 400 - margin.top - margin.bottom;
        var chart = d3.box()
        .whiskers(iqr(1.5))
        .height(height) 
        .domain([min, max])
        .showLabels(labels);

	var svg = d3.select("#"+panel.id+"-body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("class", "box")    
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        var x = d3.scale.ordinal()         
                .domain( data.map(function(d) { console.log(d); return d[0] } ) )           
                .rangeRoundBands([0 , width], 0.7, 0.3);                

        var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

        // the y-axis
        var y = d3.scale.linear()
        .domain([min, max])
        .range([height + margin.top, 0 + margin.top]);
        
        var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

        // the x-axis

        // draw the boxplots    
        svg.selectAll(".box")      
      .data(data)

          .enter().append("g")
                .attr("transform", function(d) { return "translate(" +  x(d[0])  + "," + margin.top + ")"; } )
      .call(chart.width(x.rangeBand())); 
        
              
        // add a title
        svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 + (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "18px") 
        //.style("text-decoration", "underline")  
        .text(title);
 
         // draw y axis
        svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
                .append("text") // and text1
                  .attr("transform", "rotate(-90)")
                  .attr("y", 6)
                  .attr("dy", ".71em")
                  .style("text-anchor", "end")
                  .style("font-size", "16px") 
                  .text(value);                
        
        // draw x axis  
        svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (height  + margin.top + 10) + ")")
      .call(xAxis)
          .append("text")             // text label for the x axis
        .attr("x", (width / 2) )
        .attr("y",  10 )
                .attr("dy", ".71em")
        .style("text-anchor", "middle")
                .style("font-size", "16px") 
        .text(category);
}
        // distance between graphs

function iqr(k) {
    return function(d, i) {
        var q1 = d[1],
            q3 = d[3],
            iqr = (q3 - q1) * k,
            i = -1,
            j = d.length;
        while (d[++i] < q1 - iqr);
        while (d[--j] > q3 + iqr);
        return [i, j];
    };
}


function chordRdr (matrix, mmap) {
  return function (d) {
    var i,j,s,t,g,m = {};
    if (d.source) {
      i = d.source.index; j = d.target.index;
      s = _.where(mmap, {id: i });
      t = _.where(mmap, {id: j });
      m.sname = s[0].name;
      m.sdata = d.source.value;
      m.svalue = +d.source.value;
      m.stotal = _.reduce(matrix[i], function (k, n) { return k + n }, 0);
      m.tname = t[0].name;
      m.tdata = d.target.value;
      m.tvalue = +d.target.value;
      m.ttotal = _.reduce(matrix[j], function (k, n) { return k + n }, 0);
    } else {
      g = _.where(mmap, {id: d.index });
      m.gname = g[0].name;
      m.gdata = g[0].data;
      m.gvalue = d.value;
    }
    m.mtotal = _.reduce(matrix, function (m1, n1) { 
      return m1 + _.reduce(n1, function (m2, n2) { return m2 + n2}, 0);
    }, 0);
    return m;
  }
}


function drawChoordPlot(panel, matrix, map, title) {
        var w = panel.width - 50, h = panel.height - 50, r1 = h / 2, r0 = r1 - 200;
	
        var fill = d3.scale.ordinal()
            .domain(d3.range(4))
            .range(["#000000", "#FFDD89", "#957244", "#F26223"]);

        var chord = d3.layout.chord()
            .padding(.02)
            .sortSubgroups(d3.descending)
            .sortChords(d3.descending);

        var arc = d3.svg.arc()
            .innerRadius(r0)
            .outerRadius(r0 + 20);

        var svg = d3.select('#' + panel.id + '-body').append("svg:svg")
            .attr("width", w)
            .attr("height", h)
          .append("svg:g")
            .attr("id", "circle")
            .attr("transform", "translate(" + w / 2 + "," + (h / 2) + ")");

            svg.append("circle")
                .attr("r", r0 + 20);

        var rdr = chordRdr(matrix, map);
        chord.matrix(matrix);

        svg.append("text")
        .attr("x", 0)             
        .attr("y", w/2 - 125)
        .attr("text-anchor", "middle")  
        .style("font-size", "18px") 
        //.style("text-decoration", "underline")  
        .text(title);

        var g = svg.selectAll("g.group")
            .data(chord.groups())
          .enter().append("svg:g")
            .attr("class", "group")
            .on("mouseover", mouseover)
            .on("mouseout", function (d) { d3.select("#tooltip").style("visibility", "hidden") });

        g.append("svg:path")
            .style("stroke", "black")
            .style("fill", function(d) { return fill(d.index); })
            .attr("d", arc);

        g.append("svg:text")
            .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
            .attr("dy", ".35em")
            .style("font-family", "helvetica, arial, sans-serif")
            .style("font-size", "10px")
            .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
            .attr("transform", function(d) {
              return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                  + "translate(" + (r0 + 26) + ")"
                  + (d.angle > Math.PI ? "rotate(180)" : "");
            })
            .text(function(d) { return rdr(d).gname; });

        var chordPaths = svg.selectAll("path.chord")
        .data(chord.chords())
        .enter().append("svg:path")
        .attr("class", "chord")
        .style("stroke", function(d) { return d3.rgb(fill(d.target.index)).darker(); })
        .style("fill", function(d) { return fill(d.target.index); })
        .attr("d", d3.svg.chord().radius(r0))
        .on("mouseover", function (d) {
         d3.select("#tooltip")
        .style("visibility", "visible")
        .html(chordTip(rdr(d)))
        .style("top", function () { return (d3.event.pageY - 100)+"px"})
        .style("left", function () { return (d3.event.pageX - 100)+"px";})
        })
        .on("mouseout", function (d) { d3.select("#tooltip").style("visibility", "hidden") });

	function chordTip (d) {
	        var p = d3.format(".2%"), q = d3.format(",.3r")
	        return "Chord Info:<br/>"
	        + p(d.svalue/d.stotal) + " (" + q(d.svalue) + ") moves from "
	        + d.sname + " to " + d.tname
	        + (d.sname === d.tname ? "": ("<br/>while...<br/>"
	        + p(d.tvalue/d.ttotal) + " (" + q(d.tvalue) + ") moves from "
        	+ d.tname + " to " + d.sname))
	}

	function groupTip (d) {
        	var p = d3.format(".1%"), q = d3.format(",.3r")
	        return "Group Info:<br/>"
	        + d.gname + " : " + q(d.gvalue) + "<br/>"
	        + p(d.gvalue/d.mtotal) + " of Matrix Total (" + q(d.mtotal) + ")"
	}

	function mouseover(d, i) {
	        d3.select("#tooltip")
	        .style("visibility", "visible")
	        .html(groupTip(rdr(d)))
	        .style("top", function () { return (d3.event.pageY - 80)+"px"})
	        .style("left", function () { return (d3.event.pageX - 130)+"px";})
	        chordPaths.classed("fade", function(p) {
	                return p.source.index != i
        	        && p.target.index != i;
        	});
	}
}
	
var floatwind = getNewFloatWind();

function getNewFloatWind(){
return new Ext.create('Ext.tab.Panel', {
    //header:false,
    width: 700,
    height: 630,
    floating: true,
    closable: true,
    draggable: true,
    renderTo: Ext.getBody(),
    hidden:true,
    items: 
    [ {
        title: 'Rank',
        xtype: 'panel',
        autoScroll: true,
        layout: {type: 'vbox', align: 'center'},
        items:  [
		getDayChart(ranks),
		getHourChart(ranks),
		getStackPlot(landuses, 'rank', 'Rank', 'Number of Clusters'),
        ]
    },{
        title: 'Landuse',
        xtype: 'panel',
        autoScroll: true,
        layout: {type: 'vbox', align: 'center'},
        items:  [
		getDayChart(landuses),
		getHourChart(landuses),
        ]
    }
    ]
});
}

var floatwind2 = getNewFloatWind2();

function getNewFloatWind2(){
return new Ext.create('Ext.tab.Panel', {
    //header:false,
    closable: true,
    width: 700,
    height: 630,
    floating: true,
    hidden:true,
    draggable: true,
    items: 
    [ {
        xtype: 'panel',
        autoScroll: true,
	title: 'Rank',
        layout: {type: 'vbox', align: 'center'},
        items:  [
		getDayChart(ranks),
		getHourChart(ranks),
		getStackPlot(landuses, 'rank', 'Rank', 'Number of Clusters'),
        ]
    },{
        title: 'Landuse',
        xtype: 'panel',
        autoScroll: true,
        layout: {type: 'vbox', align: 'center'},
        items:  [
		getDayChart(landuses),
		getHourChart(landuses),
        ]
    },{
        title: 'Users',
        xtype: 'panel',
        autoScroll: true,
        layout: {type: 'vbox', align: 'center'},
        items:  [
		getPieChart("lang", "count"),
        ]
    }

]
});
}

var choordPanel = getNewPanel();

function getNewPanel(){
return  new Ext.create('Ext.tab.Panel', {
    //header:false,
    closable: true,
    width: 700,
    height: 630,
    floating: true,
    hidden:true,
    draggable: true,
});
}
 

// Sample spatial clustering algorithm store for the grid panel
var visitorStore = Ext.create('Ext.data.Store',{
    fields:['Id','Name'],
    data:[
{Id:'db',Name:'DBSCAN'}
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
                {Id:'ct',Name:'Census Tract'}
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
				text: 'Origin'
			},
			{
				xtype: 'combo',
				name: 'landuse1value',
                    		store: getValues(landuses),
				displayField: 'value',
				valueField: 'id',
                    		queryMode: 'local',
                    		editable: false,
                    		forceSelection: true,
				fieldLabel: 'Landuse',
				value: 'null',
			},
			{
				xtype: 'combobox',
				name: 'rank1value',
		       	        store: getValues(ranks),
				displayField: 'value',
				valueField: 'id',
		                fieldLabel: 'Rank',
		                queryMode: 'local',
		                editable: false,
		                forceSelection: true,
				value: 'null'
			},
			{
				xtype: 'label',
				name: 'landuse2title',
				text: 'Destination'
			},	
			{
				xtype: 'combobox',
				name: 'landuse2value',
                    		store: getValues(landuses),
				displayField: 'value',
				valueField: 'id',
				fieldLabel: 'Landuse',
                    		queryMode: 'local',
                    		editable: false,
                    		forceSelection: true,
				value: 'null'
			},
			{
				xtype: 'combobox',
				name: 'rank2value',
                    		store: getValues(ranks),
				displayField: 'value',
				valueField: 'id',
                    		fieldLabel: 'Rank',
                    		queryMode: 'local',
                    		editable: false,
                    		forceSelection: true,
				value: 'null'
			},
			{
                        	xtype : 'button',
                                width : 150,
                                margin : '10 0 0 0',
                                text : 'Update Map',
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

