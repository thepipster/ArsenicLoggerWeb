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
var Logger = require('arsenic-logger');
var Settings = require('../Settings.js');

// //////////////////////////////////////////////////////////////////////////////////////////////
//
// Static Methods
//
// //////////////////////////////////////////////////////////////////////////////////////////////

Account = {

    /** Mongoose Model for this class */
    Model : null,

    // //////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Static initializer method
     */
    init : function(){

        this.AccountSchema = new mongoose.Schema({
            apiKey: { type: String, required: false },
            company: { type: String, required: false },
            status: {type: String, enum: ['active','pending','deleted'], default: 'pending'},
            modified: { type: Date, default: Date.now }
        });

        // Turn off autoIndex in production
        if (process.env.NODE_ENV == 'production'){
            this.AccountSchema.set('autoIndex', false);
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
        this.Model = Settings.db.model('Accounts', this.AccountSchema);
    },

    // //////////////////////////////////////////////////////////////////////////////////////////////

    getAll : function(callback){ this.Model.find({}, callback);},

    load : function(id, callback){ this.Model.findOne({'_id': id}, callback);},

    loadFromAPIKey : function(apiKey, callback){ this.Model.findOne({'apiKey': apiKey}, callback);},

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
    },

    // //////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Factory method to create and return a new account. This will set the API key
     * and guarantee its unique (at least within our library of accounts!)
     * @param {string} companyName Company name
     * @param {function(err, Account.Model)} callback if successful (if !err) then gives the account created
     */
    create : function(companyName, callback) {

        function generateAPIKey(callback){

            var token = SecurityUtils.generateUUID();

            Account.loadFromAPIKey(token, function(err, app){

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
                        generateAPIKey(callback);
                    }

                }
                else {
                    Logger.error(err);
                    callback(token);
                }

            });

        };

        generateAPIKey(function(key){

            var account = new Account.Model({
                apiKey : key,
                company : companyName,
                status : 'pending'
            });

            account.save(function(err){
                if (err) Logger.error(err);
                callback(err, account);
            });
        });

    },

    /**
     * Prepare for client, this strips out any fields we don't want to be public
     * @param widget
     * @returns {null}
     */
    prepareForClient : function(accounts){

        var isArray = true;

        if (!Array.isArray(accounts)){
            isArray = false;
            accounts = [accounts];
        }

        var safe_json = [];

        if (accounts.length == 0) return safe_json;

        for (var i=0; i<accounts.length; i++){
            safe_json.push({
                apiKey: accounts[i].apiKey,
                company: accounts[i].company,
                status: accounts[i].status,
                modified: accounts[i].modified,
                id: accounts[i].id
            });
        }

        if (!isArray){
            return safe_json[0];
        }

        return safe_json;
    }

}

// Initalize the static variables
Account.init();

// node.js module export
module.exports = Account;
