// **************************************************************
// * Copyright (c) 2010-2012 CyberInfrastructure and Geospatial *
// * Information Laboratory (CIGI), University of Illinois at   *
// * Urbana-Champaign, All Rights Reserved.                     *
// **************************************************************
// @author Yizhao Gao <ygao29@illinois.edu> Kiumars Soltani <soltani2@illinois.edu>

Ext.namespace('CG.flum');

var dateStore = Ext.create('Ext.data.Store',{
                fields:['Id','Name'],
                data:[
                {Id:'201407',Name:'2014-07'},
                {Id:'201408',Name:'2014-08'},
                {Id:'201409',Name:'2014-09'},
                {Id:'201410',Name:'2014-10'},
                {Id:'201411',Name:'2014-11'},
                {Id:'201412',Name:'2014-12'}
                ]
});

// Create a grid panel
var cityStore = Ext.create('Ext.data.Store',{
                fields:['Id','Name'],
                data:[
                {Id:'Chicago',Name:'Chicago'},
                {Id:'NYC',Name:'New York City'},
                {Id:'LA',Name:'Los Angeles'},
                {Id:'Houston',Name:'Houston'}
                ]
});

var cityGrid = Ext.create('Ext.grid.Panel', {
        title: 'Cities',
        store: cityStore,
        columns: [
            { header: 'City', dataIndex: 'city'//, 
                //hidden: true 
            }
    ],
        height: 160,
        width: 102,
        renderTo: Ext.getBody()
});

var cityForm = Ext.create('Ext.form.Panel', {
    title: 'Upload a File',
    width: 280,
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

var simpleCombo = Ext.create('Ext.form.field.ComboBox', {
	                	margin: '30 10 0 0',
	                	fieldLabel: 'Date',
	                	store: dateStore,
	                	displayField: 'Name',
	                	valueField: 'Id',
	               		queryMode: 'local',
	               		editable: false,
	               		forceSelection: true,
	                	value: '201407'
        });


Ext.define('CG.view.FlumapperPanel', {
	extend : 'Ext.panel.Panel',
	xtype : 'cgx1_flumapperpanel',
//	bodyPadding : '5 10',
	collapseMode : 'header',
	items : [ 
	        {
                xtype : 'tabpanel',
                width:  300,
                height: 300,
                activeTab: 0,
                items:  [
                        {
                            title: 'Select',
                            bodyPadding: 10,
                            items: cityGrid
                        },
                        {
                            title: 'Upload',
                            bodyPadding: 10,
                            items: cityForm
                        },
                        {
                            title: 'Options',
                            bodyPadding: 10,
                            items: simpleCombo
                        }
                        ]
            }
            ]
});

var emptystore = Ext.create('Ext.data.JsonStore', {
    fields: ['date', 'value1', 'value2'],
    data: [
        {'date':'2020-01-01', 'value1':10, 'value2':12}
    ]
});

Ext.define('CG.view.ResultPanel', {
		extend: 'Ext.panel.Panel',
		xtype: 'cgx2_flumapperpanel',
		bodyPadding: '5 10',
		collapseMode: 'header',
		items: [
		{
			xtype: 'fieldset',
			title: 'Movement Measures',
			name: 'mmflowmeasures',
			layout: {
				type: 'vbox',
				align: 'middle'
			},
			items:[{
				xtype: 'label',
				name: 'flowinfolabel1',
				text: ''
			},{
				xtype: 'label',
				name: 'flowinfolabel2',
				text: ''
			},{
				xtype: 'label',
				name: 'flowinfolabel3',
				text: ''
			},{
				xtype: 'label',
				name: 'flowinfolabel4',
				text:''
			}
			],
		},{
			xtype: 'fieldset',
			title: 'Movement History',
			name: 'mmflowhistory',
			items:[{
			xtype: 'chart',
			width: 260,
			height: 260,
			store: emptystore,
			legend: {
				position: "bottom"
			},
			axes: [
			{
            			title: 'Date',
            			type: 'Category',
            			position: 'bottom',
            			fields: ['date'],
				grid:true,
				labelTitle: {
					font:'bold 12x Arial'
				} 
        		},
        		{
            			title: 'Number of Movements',
            			type: 'Numeric',
            			position: 'left',
            			fields: ['value1', 'value2'],
				//minimum:0,
				minorTickSteps:1,
				labelTitle: {
					font:'bold 12x Arial'
				}
        		}],
    			series: [
        		{
            			type: 'line',
            			xField: 'date',
            			yField: 'value1',
				title: "Direction 1",
				markerConfig: {
					size:4,
					radius:4,
					"stroke-width": 0
				}
        		},{
				type: 'line',
				xField: 'date',
				yField: 'value2',
				title: "Direction 2",
				markerConfig: {
					size:4,
					radius:4,
					"stroke-width": 0
				}
			}]
			}]
		}]
});
