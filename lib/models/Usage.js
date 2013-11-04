var mongoose = require('mongoose');
var Logger = require('arsenic-logger');
var Settings = require('../Settings.js');

// //////////////////////////////////////////////////////////////////////////////////////////////
//
// Static Methods
//
// //////////////////////////////////////////////////////////////////////////////////////////////

Usage = {

    // //////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Static initializer method
     */
    init : function(){

        this.UsageSchema = new mongoose.Schema({
            memory: { type: Number, required: false },
            cpu: { type: Number, required: false },
            pid: { type: Number, required: false },
            ip: { type: String, required: false },
            hostname: { type: String, required: false },
            time: { type: Date, default: Date.now }
        });

        // Turn off autoIndex in production
        if (process.env.NODE_ENV == 'production'){
            this.UsageSchema.set('autoIndex', false);
        }

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
        //this.Model = Settings.db.model('Usage', this.UsageSchema);
    },

    // //////////////////////////////////////////////////////////////////////////////////////////////

    get : function(accountId){
        var Model = Settings.db.model('Usage'+accountId, this.UsageSchema);
        return new Model();
    },

    getAll : function(accountId, callback){
        var Model = Settings.db.model('Usage'+accountId, this.UsageSchema);
        Model.find({}, callback);
    },

    load : function(accountId, id, callback){
        var Model = Settings.db.model('Usage'+accountId, this.UsageSchema);
        Model.findOne({'_id': id}, callback);
    },

    getSinceDate : function(accountId, startDate, callback){
        var Model = Settings.db.model('Usage'+accountId, this.UsageSchema);
        //Model.find({'time':{$gte: startDate}}, callback).sort( { 'time': -1 } );
        Model.find({'time':{$gte: startDate}}).sort({'time': 'descending'}).exec(callback);
    },

    // //////////////////////////////////////////////////////////////////////////////////////////////

    getVar : function(accountId, query, paraName, callback){
        var Model = Settings.db.model('Usage'+accountId, this.UsageSchema);
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
     * Get a list of all the hosts
     * @param accountId
     * @param callback
     */
    getHosts : function(accountId, callback){
        var Model = Settings.db.model('Usage'+accountId, this.UsageSchema);
        Model.distinct('hostname', {}, callback);
    },

    // //////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Get a list of all the unique IP's
     * @param accountId
     * @param callback
     */
    getIPs : function(accountId, callback){
        var Model = Settings.db.model('Usage'+accountId, this.UsageSchema);
        Model.distinct('ip', {}, callback);
    },

    // //////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Prepare for client, this strips out any fields we don't want to be public
     * @param widget
     * @returns {null}
     */
    prepareForClient : function(usage){

        var isArray = true;

        if (!Array.isArray(usage)){
            isArray = false;
            usage = [usage];
        }

        var safe_json = [];

        if (usage.length == 0) return safe_json;

        for (var i=0; i<usage.length; i++){
            safe_json.push({
                memory: usage[i].memory,
                ip: usage[i].ip,
                cpu: usage[i].cpu,
                pid: usage[i].pid,
                hostname: usage[i].hostname,
                time: usage[i].time
            });
        }

        if (!isArray){
            return safe_json[0];
        }

        return safe_json;
    }

}

// Initalize the static variables
Usage.init();

// node.js module export
module.exports = Usage;
