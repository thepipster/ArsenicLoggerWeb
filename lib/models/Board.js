/**
 * This class encapsulates a User in the system
 *
 * @since 12th August, 2013
 */

/**
 * This class encapsulates a App in the system
 *
 * @since 12th August, 2013
 */

var mongoose = require('mongoose');
var SecurityUtils = require('../utils/SecurityUtils.js');
var Logger = require('arsenic-logger')
var Settings = require('../Settings.js');

// //////////////////////////////////////////////////////////////////////////////////////////////
//
// Constructor and Public methods
//
// //////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Constructor
 * @constructor
 */
var Board = function() {
}


Board.prototype = {

}

// //////////////////////////////////////////////////////////////////////////////////////////////
//
// Static Methods
//
// //////////////////////////////////////////////////////////////////////////////////////////////

Board = {

    /** Mongoose Model for this class */
    Model : null,

    // //////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Static initializer method
     */
    init : function(){

        this.LabelSchema = new mongoose.Schema({
            title: { type: String, required: false },
            color: { type: String, required: false }
        });

        this.UsersSchema = new mongoose.Schema({
            userId: { type: mongoose.Schema.Types.ObjectId, required: true },
            level: {type: String, enum: ['owner','billing-admin','admin','read-write','read-only'], default: 'read-only'},
        });

        this.BoardSchema = new mongoose.Schema({
            secretKey: { type: String, required: false },
            title: { type: String, required: false },
//            ownerUserId: { type: mongoose.Schema.Types.ObjectId, required: true },
            users: [this.UsersSchema],
            columns: [{ type: String, required: false }],
            labels: [this.LabelSchema],
            status: {type: String, enum: ['active','pending','deleted'], default: 'pending'},
            created: { type: Date, default: Date.now },
            modified: { type: Date, default: Date.now }
        });

        // Turn off autoIndex in production
        if (process.env.NODE_ENV == 'production'){
            this.BoardSchema.set('autoIndex', false);
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
        this.Model = Settings.mongoConn.model('Boards', this.BoardSchema);
    },

    // //////////////////////////////////////////////////////////////////////////////////////////////

    load : function(id, callback){ this.Model.findOne({'_id': id}, callback);},

    loadFromSecretKey : function(key, callback){ this.Model.findOne({'secretKey': key}, callback);},

    getAccountIdFromSecretKey : function(key, callback){ this.getVar({'secretKey': key}, '_id', callback);},

    // //////////////////////////////////////////////////////////////////////////////////////////////

    getVar : function(query, paraName, callback){
        this.Model.findOne(query, paraName, function(err, account){
            if (!err){
                if (typeof account[paraName] != 'undefined'){
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
     * Factory method to create and return a new app. This will set the UUID (universal unique identifier)
     * and guarantee its unique (at least within our library of apps!)
     * @param {string} boardTitle Company name
     * @param {function(err, Board.Model)} callback if successful (if !err) then gives the account created
     */
    create : function(boardTitle, callback) {

        function generateSecretKey(callback){

            var token = SecurityUtils.getToken(48);

            Board.loadFromSecretKey(token, function(err, app){

                if (!err){

                    if (!app){
                        // No app found that is using this API key, so token is unique so return it
                        if(typeof callback == 'function') {
                            callback(token);
                        }
                    }
                    else {
                        // Bah! We have a collision, which is quite unlikey but lets try again!
                        Logger.error('We have a secret key collision ' + token + ', trying again!!!');
                        generateSecretKey(callback);
                    }

                }
                else {
                    Logger.error(err);
                    callback(token);
                }

            });

        };

        generateSecretKey(function(key){

            var account = new Board.Model({
                secretKey : key,
                title : boardTitle,
                status : 'pending'
            });

            account.save(function(err){
                MongoErrorHandler.handle(err, '');
                callback(err, account);
            });
        });

    }
}

// Initalize the static variables
Board.init();

// node.js module export
module.exports = Board;
