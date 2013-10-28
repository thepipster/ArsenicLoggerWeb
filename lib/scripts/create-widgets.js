
/**
 * Module dependencies.
 */

var Logger = require('arsenic-logger')
var Settings = require('../Settings.js'); // Holds global settings such as DB connection strings
var config = require('../../logi-config.js'); // Holds configuration settings
var LogiMasterWidget = require('../models/LogiMasterWidget.js'); // Holds configuration settings

/*
LogiMasterWidget.create('Square Heatmap', 'Square Heatmap Blurb', 'Logi', '/images/widgets/square-heatmap.png', function(didCreate, widget){
});

LogiMasterWidget.create('Hexagonal Heatmap', 'Square Heatmap Blurb', 'Logi', '/images/widgets/hex-heatmap.png', function(didCreate, widget){
});

*/


LogiMasterWidget.loadFromUUID('10a546bc-3486-4e48-bfbe-b75c8895c3b0', function(err, widget){

    if (!err && !widget){

        var widget = LogiMasterWidget.get();

        widget.uuid = '10a546bc-3486-4e48-bfbe-b75c8895c3b0';
        widget.vendor = 'Logi';
        widget.name = 'Random Source';
        widget.description = "Simple block that allows you to generate random data, good for testing!";
        widget.icon = '/widgets/10a546bc-3486-4e48-bfbe-b75c8895c3b0/thumb.png';
        widget.layer = 'source';

        widget.noInputs = 0;
        widget.noOutputs = 1;

        widget.settings = [
            {
                label: "NoSamples",
                type: "string",
                hint: "Specify the number of samples to generate"
            },
            {
                label: "Labels",
                type: "array-object",
                maxNumber: 5,
                elements: [
                    {
                        label: "Label",
                        type: "string",
                        hint: "Specify the column/field name to use for this series (needed for downstream blocks)"
                    }
                ]
            }
        ];

        widget.processCode = [{
            processCode: '',
            targetSources: 'any'
        }];

        widget.save(function(err){
            Logger.debug("Created widget " + widget.uuid);
        });
    }
});


LogiMasterWidget.loadFromUUID('5f9e8c5b-e5cf-4d84-e921-987990211220', function(err, widget){

    if (!err && !widget){

        var widget = LogiMasterWidget.get();

        widget.uuid = '5f9e8c5b-e5cf-4d84-e921-987990211220';
        widget.vendor = 'Logi';
        widget.name = 'MySQL Connection';
        widget.description = "Simple block that allows you to run any SQL statement against a SQL datasource that returns a single column of data";
        widget.icon = '/widgets/5f9e8c5b-e5cf-4d84-e921-987990211220/thumb.png';
        widget.layer = 'source';

        widget.noInputs = 0;
        widget.noOutputs = 1;

        widget.settings = [
            {
                label: "SQL Query",
                type: "string",
                hint: "Specify any SQL query you like"
            },
            {
                label: "MySQL Host",
                type: "string",
                hint: "127.0.0.1"
            },
            {
                label: "Username",
                type: "string"
            },
            {
                label: "Password",
                type: "password"
            },
            {
                label: "Port",
                type: "string",
                hint: "3306"
            },
            {
                label: "Database Name",
                type: "string"
            },
            {
                label: "Socket Path",
                type: "string",
                hint: "(optional) Specify the path to the socket"
            }
        ];

        widget.processCode = [{
            processCode: '',
            targetSources: 'any'
        }];

        widget.save(function(err){
            Logger.debug("Created widget " + widget.uuid);
        });
    }
});

/**
 * Line Chart
 */
LogiMasterWidget.loadFromUUID('15beb85f-a1e1-48a2-dedb-9c55b0478bf9', function(err, widget){

    if (!err && !widget){

        var widget = LogiMasterWidget.get();

        widget.uuid = '15beb85f-a1e1-48a2-dedb-9c55b0478bf9';
        widget.vendor = 'Logi';
        widget.name = 'Simple Line Chart';
        widget.description = "Simple line chart using n3d.js";
        widget.icon = '/widgets/15beb85f-a1e1-48a2-dedb-9c55b0478bf9/thumb.png';
        widget.layer = 'visual';
        widget.domName = 'logilinechart';

        widget.settings = [
            {
                label: "Chart Title",
                type: "string"
            },
            {
                label: "Series",
                type: "array-object",
                maxNumber: 50,
                elements: [
                    {
                        label: "X-Axis Target Label",
                        type: "string",
                        hint: "Specify the column/field name to use for the x-axis of this series"
                    },
                    {
                        label: "Y-Axis Target Label",
                        type: "string",
                        hint: "Specify the column/field name to use for the y-axis of this series"
                    },
                    {
                        label: "Series Color",
                        type: "string-rgb",
                        hint: "Set the color to use for this series"
                    },
                    {
                        label: "Series Title",
                        type: "string"
                    }
                ]
            },
            {
                label: "X-axis Label",
                type: "string",
                hint: "Set the label for the x-axis"
            },
            {
                label: "Y-axis Label",
                type: "string",
                hint: "Set the label for the y-axis"
            }
        ];

        widget.processCode = [{
            processCode: '',
            targetSources: 'any'
        }];

        widget.save(function(err){
            Logger.debug("Created widget " + widget.uuid);
        });
    }
});


/*
LogiMasterWidget.loadFromUUID('97caa79a-2d74-4d0a-b211-3d74178a8e2c', function(err, widget){

    if (!err && !widget){

        var widget = LogiMasterWidget.get();

        widget.uuid = '97caa79a-2d74-4d0a-b211-3d74178a8e2c';
        widget.vendor = 'Logi';
        widget.name = 'Square Heatmap';
        widget.description = "Square Heatmap Blurb";
        widget.icon = '/widgets/97caa79a-2d74-4d0a-b211-3d74178a8e2c/thumb.png';
        widget.processCode = [{
            processCode: '',
            targetSources: 'any'
        }];
        widget.save(function(err){
            Logger.debug("Created widget " + widget.uuid);
        });
    }
});

 // Freeform heat map using OpenGL!
 // @see http://codeflow.org/entries/2013/feb/04/high-performance-js-heatmaps/#live-version

 LogiMasterWidget.loadFromUUID('c31b1238-2b2e-4509-e55a-1e3873d39fc0', function(err, widget){

    if (!err && !widget){

        var widget = LogiMasterWidget.get();

        widget.uuid = 'c31b1238-2b2e-4509-e55a-1e3873d39fc0';
        widget.vendor = 'Logi';
        widget.name = 'High Performance Heatmap (WebGL)';
        widget.description = "High performance heatmap using WebGL (see <a href='http://codeflow.org/entries/2013/feb/04/high-performance-js-heatmaps/#live-version'>this</a>";
        widget.icon = '/widgets/c31b1238-2b2e-4509-e55a-1e3873d39fc0/thumb.png';
        widget.processCode = [{
            processCode: '',
            targetSources: 'any'
        }];
        widget.save(function(err){
            Logger.debug("Created widget " + widget.uuid);
        });
    }
});


LogiMasterWidget.loadFromUUID('2aab1f19-5c1a-4186-99b4-d11a558020a9', function(err, widget){

    if (!err && !widget){

        var widget = LogiMasterWidget.get();

        widget.uuid = '2aab1f19-5c1a-4186-99b4-d11a558020a9';
        widget.vendor = 'Logi';
        widget.name = 'Canvas-based Heatmap';
        widget.description = "Canvas-based Heatmap (see <a href='https://github.com/pa7/heatmap.js'>this</a>";
        widget.icon = '/widgets/2aab1f19-5c1a-4186-99b4-d11a558020a9/thumb.png';
        widget.processCode = [{
            processCode: '',
            targetSources: 'any'
        }];
        widget.save(function(err){
            Logger.debug("Created widget " + widget.uuid);
        });
    }
});
*/

//process.exit(0);

