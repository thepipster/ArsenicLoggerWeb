var Logger = require('arsenic-logger');
var LogiUser = require('../models/LogiUser.js');
var LogiApp = require('../models/LogiApp.js');
var LogiAccount = require('../models/LogiAccount.js');
var Settings = require('../Settings.js');

var RouteHelper = {

    /**
     * Convert a LogiApp to JSON that is safe to send back to the client, this will safely handle arrays
     * of widgets as well as the singular case.
     *
     * @param (LogiApp) widget Can be a single LogiApp instance or an array of them
     */
    prepareLogiApp : function(app){

        var safe_json = null;

        if (Array.isArray(app)){

            safe_json = [];
            for (var i=0; i<app.length; i++){
                safe_json.push({
                    id: app[i].id,
                    name: app[i].name,
                    icon: app[i].icon,
                    target: app[i].target,
                    status: app[i].status,
                    modified: app[i].modified
                });
            }

        }
        else {
            safe_json = {
                id: app.id,
                name: app.name,
                icon: app.icon,
                target: app.target,
                status: app.status,
                modified: app.modified
            }
        }

        return safe_json;
    },

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
 uuid: { type: String, required: true },
 vendor: { type: String, required: false },
 name: { type: String, required: false },
 domName: { type: String, required: false }, // Name of custom DOM element associated with this, if any
 description: { type: String, required: false },
 layer: {type: String, enum: ['visual', 'plumbing', 'source'], default: 'plumbing'},
 icon: {type: String, required: false},

 processCode :  [this.ProcessCodeSchema],

 noInputs : { type: Number, required: true, default: 1 },
 noOutputs : { type: Number, required: true, default: 1 },

 modified: { type: Date, default: Date.now }
     */

    /**
     * Convert a LogiMasterWidget to JSON that is safe to send back to the client, this will safely handle arrays
     * of widgets as well as the singular case.
     *
     * @param (LogiMasterWidget) widget Can be a single LogiMasterWidget instance or an array of them
     */
    prepareLogiMasterWidget : function(widget){

        var safe_json = null;

        if (Array.isArray(widget)){

            safe_json = [];
            for (var i=0; i<widget.length; i++){
                safe_json.push({
                    uuid: widget[i].uuid,
                    vendor: widget[i].vendor,
                    name: widget[i].name,
                    description: widget[i].description,
                    layer: widget[i].layer,

                    preProcessCode: widget[i].preProcessCode,
                    processCode: widget[i].processCode,
                    postProcessCode: widget[i].postProcessCode,

                    noInputs: widget[i].noInputs,
                    noOutputs: widget[i].noOutputs,
                    icon: widget[i].icon,
                    modified: widget[i].modified
                });
            }

        }
        else {
            safe_json = {
                uuid: widget.uuid,
                vendor: widget.vendor,
                name: widget.name,
                description: widget.description,
                layer: widget.layer,
                preProcessCode: widget.preProcessCode,
                processCode: widget.processCode,
                postProcessCode: widget.postProcessCode,
                noInputs: widget.noInputs,
                noOutputs: widget.noOutputs,
                icon: widget.icon,
                modified: widget.modified
            }
        }

        return safe_json;
    },

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
     masterWidgetId: { type: mongoose.Schema.Types.ObjectId, required: true },
     masterWidgetUUID: { type: String, required: true },
     appId: { type: mongoose.Schema.Types.ObjectId, required: true },
     title: { type: String, required: false },
     icon: { type: String, required: false },
     layer: {type: String, enum: ['visual', 'plumbing'], default: 'plumbing'},
     processCode :  [this.ProcessCodeSchema], // This is a copy of the code from the master widget, which allows for customization
     settings: mongoose.Schema.Types.Mixed,

     cache : mongoose.Schema.Types.Mixed,
     lastCacheUpdate :  { type: Date, required: false },

     row: {type: Number, required: false},
     col: {type: Number, required: false},

     inputWidgetId: { type: mongoose.Schema.Types.ObjectId, required: false },
     outputWidgetId: { type: mongoose.Schema.Types.ObjectId, required: false },

     */
    /**
     * Convert a LogiWidget to JSON that is safe to send back to the client, this will safely handle arrays
     * of widgets as well as the singular case.
     *
     * @param (LogiWidget) widget Can be a single LogiWidget instance or an array of them
     */
    prepareLogiWidget : function(widget){

        var safe_json = null;

        if (Array.isArray(widget)){

            safe_json = [];
            for (var i=0; i<widget.length; i++){
                safe_json.push({
                    id: widget[i].id,
                    uuid: widget[i].masterWidgetUUID,
                    title: widget[i].title,
                    icon: widget[i].icon,
                    domName: widget[i].domName,
                    layer: widget[i].layer,
                    settings: widget[i].settings,
                    row: widget[i].row,
                    col: widget[i].col,
                    noInputs: widget[i].noInputs,
                    noOutputs: widget[i].noOutputs,
                    inputWidgetId: widget[i].inputWidgetId,
                    outputWidgetId: widget[i].outputWidgetId,
                    modified: widget[i].modified
                });
            }

        }
        else {
            safe_json = {
                id: widget.id,
                uuid: widget.masterWidgetUUID,
                title: widget.title,
                icon: widget.icon,
                domName: widget.domName,
                layer: widget.layer,
                settings: widget.settings,
                row: widget.row,
                col: widget.col,
                noInputs: widget.noInputs,
                noOutputs: widget.noOutputs,
                inputWidgetId: widget.inputWidgetId,
                outputWidgetId: widget.outputWidgetId,
                modified: widget.modified
            }
        }

        return safe_json;
    },

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Check the current user has access to this app and is allowed to modify it
     * @param req Express http request object
     * @param res Express http response object
     * @param appId The app id
     */
    checkAppOwnership : function(req, res, appId, callback){

        // TODO: implement this! Need to get user from the session (use req object)
        // and then check they have the correct user role to modify an app

        Logger.warn("TODO: checkAppOwnership is not fully implemented yet!");

        LogiApp.load(appId, function(err, app){
            if (!err){
                callback(true, app);
            }
            else {
                res.status(500).send({result: "fail", error: "Could not load app!"});
            }
        });

        // res.status(500).send({result: "fail", error: "Authentication error, you do not have acccess to this App!");

    }
}

// node.js module export
module.exports = RouteHelper;