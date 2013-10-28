var path = require('path');
var Logger = require('arsenic-logger')
var Settings = require('../Settings.js');
var config = require('../../logi-config.js');
var fs = require('fs')

var LogiApp = require('../models/LogiApp.js');
var LogiWidget = require('../models/LogiWidget.js');

var appId = '520d1959e042d60aa6000003';

var templateFilename = path.join(__dirname, '../html/view-template.html');
var outputFilename = path.join(__dirname, '../../public/cache/view-'+appId+'.html');

Logger.info("Template file = " + templateFilename);

LogiApp.load(appId, function(err, appObj){

    Logger.debug(appObj);

    fs.readFile(templateFilename, 'utf8', function (err,data) {

        if (err) {
            return Logger.error(err);
        }

        LogiWidget.getAllForLayer(appObj.id, 'visual', function(err, widgets){

            var txt = "";

            for (var i=0; i<widgets.length; i++){
                var name = widgets[i].domName;
                var id = widgets[i].id;
                txt += "<"+name+" chart-data=chartData widget-id='"+id+"'></"+name+">";
            }

            var result = data.replace(/::LOGICHARTS::/g, txt);

            fs.writeFile(outputFilename, result, 'utf8', function (err) {
                if (err) {
                    Logger.error(err);
                }
                process.exit(0);
            });

        });


    });

});

