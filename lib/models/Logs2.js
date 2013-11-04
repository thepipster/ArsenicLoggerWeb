var mongoose = require('mongoose');
var Logger = require('arsenic-logger');
var Settings = require('../Settings.js');


Log = (function(){

    /**
     * Constructor
     */
    function cls(accountId)
    {

        /**
         * Mongoose Model for this class
         */
        var LogsSchema = new mongoose.Schema({
            message: { type: String, required: false },
            memory: { type: Number, required: false },
            cpu: { type: Number, required: false },
            pid: { type: Number, required: false },
            ip: { type: String, required: false },
            tag: { type: String, required: false },
            hostname: { type: String, required: false },
            stack: [mongoose.Schema.Types.Mixed],
            level: {type: String, enum: ['debug','info','warn','error','fatal'], default: 'debug'},
            modified: { type: Date, default: Date.now }
        });

        // Turn off autoIndex in production
        if (process.env.NODE_ENV == 'production'){
            LogsSchema.set('autoIndex', false);
        }

        // Setup the mongoose model, which we'll re-use
        var Model = Settings.db.model('Logs-'+accountId, LogsSchema);

        // //////////////////////////////////////////////////////////////////////////////////////////////

        this.get = function(){ return new Model()};
        this.load = function(id, callback){ Model.findOne({'_id': id}, callback);};

        // //////////////////////////////////////////////////////////////////////////////////////////////

        /**
         * Get a list of all the tags being used
         * @param accountId
         * @param callback
         */
        this.getTags = function(accountId, callback){ Model.distinct('tag', {'accountId': accountId}, callback); },

            // //////////////////////////////////////////////////////////////////////////////////////////////

        /**
         * Get a list of all the hosts
         * @param accountId
         * @param callback
         */
        this.getHosts = function(accountId, callback){ Model.distinct('hostname', {'accountId': accountId}, callback); };

        // //////////////////////////////////////////////////////////////////////////////////////////////

        /**
         * Get a list of all the unique IP's
         * @param accountId
         * @param callback
         */
        this.getIPs = function(accountId, callback){ Model.distinct('ip', {'accountId': accountId}, callback); },

            // //////////////////////////////////////////////////////////////////////////////////////////////

            this.getVar = function(query, paraName, callback){
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
            }

        // //////////////////////////////////////////////////////////////////////////////////////////////

    }

    //
    // public static fields
    //

    cls.staticVar = 0;

    //
    // Public static methods
    //

    cls.getAll = function(accountId, callback){
        var collection = Settings.db.collection('Logs-'+accountId);
        collection.find({}, callback);
    };

    cls.getForTag = function(accountId, tag, callback){
        var collection = Settings.db.collection('Logs-'+accountId);
        this.Model.find({'accountId': accountId, 'tag':tag}, callback);
    };

    cls.getForTagSinceDate = function(accountId, tag, startDate, callback){ this.Model.find({'accountId': accountId, 'tag':tag, 'modified':{$gte: startDate}}, callback); };

    cls.getSinceDate = function(accountId, startDate, callback){ this.Model.find({'accountId': accountId, 'modified':{$gte: startDate}}, callback); };

    //
    // Private static method
    //

    function createWithName(name)
    {
        var obj = new cls();
        obj.setName(cls.capitalize(name));
        return obj;
    }

    return cls;

})();

// node.js module export
module.exports = Log;
