var mongoose = require('mongoose');
var Logger = require('arsenic-logger');
var Settings = require('../Settings.js');

// //////////////////////////////////////////////////////////////////////////////////////////////
//
// Static Methods
//
// //////////////////////////////////////////////////////////////////////////////////////////////

Log = {

    /** Mongoose Model for this class */
    Model : null,

    // //////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Static initializer method
     */
    init : function(){

        this.LogsSchema = new mongoose.Schema({
            accountId: { type: mongoose.Schema.Types.ObjectId, required: true },
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
            this.LogsSchema.set('autoIndex', false);
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
        this.Model = Settings.mongoConn.model('Logs', this.LogsSchema);
    },

    // //////////////////////////////////////////////////////////////////////////////////////////////

    get : function(){ return new this.Model(); },

    getAll : function(callback){ this.Model.find({}, callback);},

    load : function(id, callback){ this.Model.findOne({'_id': id}, callback);},

    getTags : function(accountId, callback){ this.Model.distinct('tag', {'accountId': accountId}, callback); },

    getForTag : function(accountId, tag, callback){ this.Model.find({'accountId': accountId, 'tag':tag}, callback); },

    getForTagSinceDate : function(accountId, tag, startDate, callback){ this.Model.find({'accountId': accountId, 'tag':tag, 'modified':{$gte: startDate}}, callback); },

    getSinceDate : function(accountId, startDate, callback){ this.Model.find({'accountId': accountId, 'modified':{$gte: startDate}}, callback); },

    // //////////////////////////////////////////////////////////////////////////////////////////////

    getVar : function(query, paraName, callback){
        this.Model.findOne(query, paraName, function(err, account){
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
}

// Initalize the static variables
Log.init();

// node.js module export
module.exports = Log;
