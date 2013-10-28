var Logger = require('arsenic-logger')
var LogiAccount = require('../models/LogiAccount.js');
var LogiApp = require('../models/LogiApp.js');
var LogiWidget = require('../models/LogiWidget.js');
var LogiMasterWidget = require('../models/LogiMasterWidget.js');
var Settings = require('../Settings.js');
var RouteHelper = require('../utils/RouteHelper.js');
var MongoErrorHandler = require('../utils/MongoErrorHandler.js');

var LogiSecurity = require('../LogiSecurity.js');

var config = require('../../logi-config.js'); // Holds configuration settings

// ///////////////////////////////////////////////////////////////////////////////////////////

/**
 * Get a list of all the apps that the current user has access to!
 * @param req
 * @param res
 * @param next
 */
exports.getApps = function(req, res, next){

    //Logger.debug("Getting all apps for the account = " + req.session.accountId);

    LogiAccount.getAccountIdFromSecretKey(config.secretKey, function(accountId){

        LogiApp.getAll(accountId, function(err, apps){
            if (!err){
                res.send({result:"ok", apps: RouteHelper.prepareLogiApp(apps)});
            }
            else {
                MongoErrorHandler.send(res, err, "Error creating widget");
            }
        });

    });

};

// ///////////////////////////////////////////////////////////////////////////////////////////

exports.createApp = function(req, res, next){
          /*
    var company = req.body.company;

    var accountObj = new LogiAccount(Settings.mongoConn);

    // TODO: Verify hmac goes here :-)

    accountObj.create(company, function(didCreate, err){
        if (didCreate){
            res.send({result: "ok", accountKey: accountObj.accountKey});
        }
        else {
            res.send({result: "fail", error: err});
        }
    });
    */
};

// ///////////////////////////////////////////////////////////////////////////////////////////

exports.deleteApp = function(req, res, next){
    var appKey = req.params.appKey;
    res.status(404).send('TODO! This method has not been built yet!');
};

// ///////////////////////////////////////////////////////////////////////////////////////////

exports.updateApp = function(req, res, next){
    var appKey = req.params.appKey;
    res.status(404).send('TODO! This method has not been built yet!');
};

// ///////////////////////////////////////////////////////////////////////////////////////////

exports.getApp = function(req, res, next){
    var appKey = req.params.appKey;
    res.status(404).send('TODO! This method has not been built yet!');
};

// ///////////////////////////////////////////////////////////////////////////////////////////

exports.getWidgets = function(req, res, next){

    var appId = req.params.appId;

    Logger.debug("Getting widgets for app id = " + appId);

    // Check ownership of the app
    RouteHelper.checkAppOwnership(req, res, appId, function(hasAccess, appObj){

        if (hasAccess){

            LogiWidget.getAll(appObj.id, function(err, widgets){

                if (!err){
                    res.send({result:"ok", widgets: RouteHelper.prepareLogiWidget(widgets)});
                }
                else {
                    MongoErrorHandler.send(res, err, "Error creating widget");
                }

            });
        }
    });

};

// ///////////////////////////////////////////////////////////////////////////////////////////

exports.addWidget = function(req, res, next){

/*
 appId: $scope.selectedAppId,
 widgetUUID: widget.uuid,
 row: $scope.appWidgets.length+1,
 col: 1

     */
    var appId = req.body.appId;
    var widgetUUID = req.body.widgetUUID;
    var row = req.body.row;
    var col = req.body.col;

    Logger.debug('Adding widget, appId = ' + appId + " widget uuid = " + widgetUUID);

    // Check ownership of the app
    // TODO: need to check the widget belongs to this app!!!!!!
    RouteHelper.checkAppOwnership(req, res, appId, function(hasAccess, appObj){

        if (hasAccess){

            LogiWidget.create(widgetUUID, appObj.id, '', row, col, function(err, widget){

                // Regenerate view
                // TODO: make this smarter!
                regenerateCachedView(appId);

                if (!err){
                    res.send({result:"ok", widget: RouteHelper.prepareLogiWidget(widget)});
                }
                else {
                    Logger.error('>>>>');
                    Logger.error(err);
                    MongoErrorHandler.send(res, err, "Error adding widget");
                }

            });

            // Create widget
//            var widgetObj = new LogiWidget();
           // widgetObj.create

        }
    });

};

// ///////////////////////////////////////////////////////////////////////////////////////////

exports.removeWidget = function(req, res){

    var appId = req.params.appId;
    var widgetId = req.params.widgetId;

    Logger.debug("Removing widget, appId = " + appId + ", widgetId = " + widgetId);

    // Check ownership of the app
    RouteHelper.checkAppOwnership(req, res, appId, function(hasAccess, appObj){

        var appId = appObj._id;

        if (hasAccess){

            // Check widget belongs to this app!
            LogiWidget.load(widgetId, function(err, widgetDoc){

                if (!err){
                    if (appId == widgetDoc.appId){
                        res.send({result:"fail", error:"", message: "This widget does not belong to this app!!!!"});
                    }
                    else {
                        LogiWidget.delete(widgetId, function(err, widgetDoc){

                            // Regenerate view
                            // TODO: make this smarter!
                            regenerateCachedView(appId);

                            if (!err){
                                res.send({result:"ok", id: widgetId});
                            }
                            else {
                                MongoErrorHandler.send(res, err, "Error updating widget");
                            }

                        });
                    }
                }
                else {
                    MongoErrorHandler.send(res, err, "Error updating widget");
                }



            });



        }
    });

};

// ///////////////////////////////////////////////////////////////////////////////////////////

exports.updateWidget = function(req, res, next){

    /*
     appId: $scope.selectedAppId,
     widgetUUID: widget.uuid,
     row: $scope.appWidgets.length+1,
     col: 1
     */

    var appId = req.body.appId;
    var widget = req.body.widget;

    Logger.debug('Saving widget, appId = ' + appId + " widget id = " + widget.id);

    // Check ownership of the app
    // TODO: need to check the widget belongs to this app!!!!!!
    RouteHelper.checkAppOwnership(req, res, appId, function(hasAccess, appObj){

        if (hasAccess){

            Logger.info(widget);

            LogiWidget.load(widget.id, function(err, widgetDoc){

                // Update the fields that we allow to be updated!
                widgetDoc.settings = widget.settings;
                widgetDoc.title = widget.title;
                widgetDoc.icon = widget.icon;
                widgetDoc.row = widget.row;
                widgetDoc.col = widget.col;
                widgetDoc.inputWidgetId = widget.inputWidgetId;
                widgetDoc.outputWidgetId = widget.outputWidgetId;
                widgetDoc.modified = Date.now();

                widgetDoc.save(function(err, savedWidget){

                    // Regenerate view
                    // TODO: make this smarter!
                    regenerateCachedView(appId);

                    if (!err){
                        res.send({result:"ok", widget: RouteHelper.prepareLogiWidget(savedWidget)});
                    }
                    else {
                        MongoErrorHandler.send(res, err, "Error updating widget");
                    }

                });


            });



        }
    });

};

// ///////////////////////////////////////////////////////////////////////////////////////////

exports.getWidgetData = function(req, res, next){

    var widgetId = req.params.widgetId;

    LogiWidget.load(widgetId, function(err, widgetDoc){

        Logger.info(widgetDoc);

        if (!err){

            var eTime = 999999999999;

            try {
                eTime = Date.now().getTime() - widgetDoc.lastCacheUpdate.getTime();
            }
            catch(terr){
            }

            if (!err){
                Logger.info(widgetDoc.cache);
                res.send({result:"ok", cache: widgetDoc.cache, cacheDate: widgetDoc.lastCacheUpdate, cacheAge: eTime });
            }
            else {
                MongoErrorHandler.send(res, err, "Error updating widget");
            }

        }

    });

};


// ///////////////////////////////////////////////////////////////////////////////////////////

/**
 * Get a list of all availabile widgets
 * @param req
 * @param res
 * @param next
 */
exports.getMasterWidgets = function(req, res, next){

    Logger.debug("entering getAllWidgets");


    LogiMasterWidget.getAll(function(err, widgets){
        res.send({result:"ok", widgets: RouteHelper.prepareLogiMasterWidget(widgets)});
    });

};

// ///////////////////////////////////////////////////////////////////////////////////////////

exports.updateMasterWidget = function(req, res, next){

    Logger.debug("entering updateMasterWidget");

    var widget = req.body.widget;

    Logger.debug('Saving widget, widget id = " + widget.id');

    // Check ownership of the app

    if (LogiSecurity.isSuperUser(req, res)){

        Logger.info(widget);

        LogiMasterWidget.loadFromUUID(widget.uuid, function(err, widgetDoc){

            widgetDoc.name = widget.name;
            //widgetDoc.vendor = widget.vendor;
            //widgetDoc.domName = widget.domName;
            //widgetDoc.description = widget.description;
            //widgetDoc.layer = widget.layer;
            //widgetDoc.icon = widget.icon;
            //widgetDoc.settings = widget.settings;
            widgetDoc.preProcessCode = widget.preProcessCode;
            widgetDoc.processCode = widget.processCode;
            widgetDoc.postProcessCode = widget.postProcessCode;
            //widgetDoc.noInputs = widget.noInputs;
            //widgetDoc.noOutputs = widget.noOutputs;
            widgetDoc.modified = Date.now();

            widgetDoc.save(function(err, savedWidget){

                if (!err){
                    res.send({result:"ok", widget: RouteHelper.prepareLogiMasterWidget(savedWidget)});
                }
                else {
                    MongoErrorHandler.send(res, err, "Error updating master widget");
                }

            });


        });
    }
    else {
        res.send({result:"fail", error: "Super user authentication error", message: "Sorry, you need to be a super user to make this change!"});
    }

};

// ///////////////////////////////////////////////////////////////////////////////////////////
//
// Utils
//
// ///////////////////////////////////////////////////////////////////////////////////////////

function regenerateCachedView(appId){

    var path = require('path');
    var fs = require('fs')

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
                });

            });


        });

    });

}