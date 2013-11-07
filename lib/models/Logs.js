var mongoose = require('mongoose');
var Logger = require('arsenic-logger');
var Settings = require('../Settings.js');

// //////////////////////////////////////////////////////////////////////////////////////////////
//
// Static Methods
//
// //////////////////////////////////////////////////////////////////////////////////////////////

Log = {

    // //////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Static initializer method
     */
    init : function(){

        this.LogsSchema = new mongoose.Schema({
            message: { type: String, required: false, index: true },
            memory: { type: Number, required: false },
            cpu: { type: Number, required: false },
            memoryTotal: { type: Number, required: false },
            pid: { type: Number, required: false },
            ip: { type: String, required: false },
            tag: { type: String, required: false },
            hostname: { type: String, required: false },
            filename: { type: String, required: false, index: true },
            stack: [mongoose.Schema.Types.Mixed],
            level: {type: String, enum: ['debug','info','warn','error','fatal','exception'], default: 'debug'},
            modified: { type: Date, default: Date.now }
        });

        var textSearch = require("mongoose-text-search");

        // @see http://stackoverflow.com/questions/15990787/mongo-db-text-search-with-mongoose
        this.LogsSchema.plugin(textSearch);

        this.LogsSchema.index({
            message :"text",
            hostname :"text",
            tag : "text",
            filename :"text"
        });

        // Turn off autoIndex in production
        if (process.env.NODE_ENV == 'production'){
            this.LogsSchema.set('autoIndex', false);
        }

        /*
        db.collection.ensureIndex(
            {
                message: "text",
                content: "text"
            }
        )
*/

        //
        // Setup instance methods
        //

        // <!-- instance methods -->

        //
        // Setup any static methods we want to add the mongoose schema
        //

        // @see http://mongoosejs.com/docs/guide.html

        // <!-- static methods -->

        // Setup the mongoose model, which we'll re-use
        //this.Model = Settings.db.model('Logs', this.LogsSchema);
    },

    // //////////////////////////////////////////////////////////////////////////////////////////////

    getCollection : function(accountId){
        return this.getModel(accountId).collection;
    },

    getModel : function(accountId){
        return Settings.db.model('Logs'+accountId, this.LogsSchema);
    },

    get : function(accountId){
        var Model = this.getModel(accountId);
        return new Model();
    },

    getAll : function(accountId, callback){
        var Model = this.getModel(accountId);
        Model.find({}, callback);
    },

    load : function(accountId, id, callback){
        var Model = this.getModel(accountId);
        Model.findOne({'_id': id}, callback);
    },

    getForTag : function(accountId, tag, callback){
        var Model = this.getModel(accountId);
        //Model.find({'tag':tag}, callback).sort( { 'modified': -1 } );
        Model.find({'tag':tag}).sort({'modified': 'descending'}).exec(callback);
    },

    getForTagSinceDate : function(accountId, tag, startDate, callback){
        var Model = this.getModel(accountId);
        //Model.find({'tag':tag, 'modified':{$gte: startDate}}, callback).sort( { 'modified': -1 } );
        Model.find({'tag':tag, 'modified':{$gte: startDate}}).sort({'modified': 'descending'}).exec(callback);
    },

    getSinceDate : function(accountId, startDate, callback){
        var Model = this.getModel(accountId);
        //Model.find({'modified':{$gte: startDate}}, callback).sort( { 'modified': -1 } );
        Model.find({'modified':{$gte: startDate}}).sort({'modified': 'descending'}).exec(callback);
    },
    
    getPaged : function(accountId, pageNo, pageSize, callback){
        var Model = this.getModel(accountId);
        var from = pageSize * pageNo;
        var to = from + pageSize;
        //Model.find({'modified':{$gte: startDate}}, callback).sort( { 'modified': -1 } );
        Model.find({}).sort({'modified': 'descending'}).skip(from).limit(to).exec(callback);
    },

    getPagedByTag : function(accountId, tag, pageNo, pageSize, callback){
        var Model = this.getModel(accountId);
        var from = pageSize * pageNo;
        var to = from + pageSize;
        //Model.find({'modified':{$gte: startDate}}, callback).sort( { 'modified': -1 } );
        Model.find({'tag':tag}).sort({'modified': 'descending'}).skip(from).limit(to).exec(callback);
    },

    getCountByTag : function(accountId, tag, callback){
        var Model = this.getModel(accountId);
        Model.count({'tag':tag}, callback);
    },

    getCount : function(accountId, callback){
        var Model = this.getModel(accountId);
        Model.count({}, callback);
    },

    // //////////////////////////////////////////////////////////////////////////////////////////////

    getVar : function(accountId, query, paraName, callback){
        var Model = Settings.db.model('Logs'+accountId, this.LogsSchema);
        Model.findOne(query, paraName, function(err, account){
            if (!err){
                if (account && paraName in account){
                    callback(account[paraName]);
                }
                else {
                    callback(null);
                }
            }
            else {
                callback(null);
            }
        });
    },

    // //////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Get a list of all the tags being used
     * @param accountId
     * @param callback
     */
    getTags : function(accountId, callback){
        var Model = Settings.db.model('Logs'+accountId, this.LogsSchema);
        Model.distinct('tag', {}, callback);
    },

    // //////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Get a list of all the hosts
     * @param accountId
     * @param callback
     */
    getHosts : function(accountId, callback){
        var Model = Settings.db.model('Logs'+accountId, this.LogsSchema);
        Model.distinct('hostname', {}, callback);
    },

    // //////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Get a list of all the unique IP's
     * @param accountId
     * @param callback
     */
    getIPs : function(accountId, callback){
        var Model = Settings.db.model('Logs'+accountId, this.LogsSchema);
        Model.distinct('ip', {}, callback);
    },

    // //////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Prepare for client, this strips out any fields we don't want to be public
     * @param widget
     * @returns {null}
     */
    prepareForClient : function(logs){

        var isArray = true;

        if (!Array.isArray(logs)){
            isArray = false;
            logs = [logs];
        }

        var safe_json = [];

        if (logs.length == 0) return safe_json;

        for (var i=0; i<logs.length; i++){
            safe_json.push({
                message: logs[i].message,
                memory: logs[i].memory,
                cpu: logs[i].cpu,
                memoryTotal: logs[i].memoryTotal,
                pid: logs[i].pid,
                ip: logs[i].ip,
                tag: logs[i].tag,
                hostname: logs[i].hostname,
                stack: logs[i].stack,
                level: logs[i].level,
                modified: logs[i].modified,
                id: logs[i].id
            });
        }

        if (!isArray){
            return safe_json[0];
        }

        return safe_json;
    }

}

// Initalize the static variables
Log.init();

// node.js module export
module.exports = Log;
