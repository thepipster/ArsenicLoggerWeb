var Logger = require('arsenic-logger')
var Settings = require('../Settings.js'); // Holds global settings such as DB connection strings
var config = require('../../logi-config.js'); // Holds configuration settings
var LogiMasterWidget = require('../models/LogiMasterWidget.js'); // Holds configuration settings

//var widgetObj = new LogiMasterWidget();


LogiMasterWidget.getAll(function(err, widgets){

    Logger.error(widgets);

    for (var i=0; i<widgets.length; i++){
        Logger.info(widgets.toString());

        widgets[i].name = "Pants " + i;
        widgets[i].save();
    }
});




