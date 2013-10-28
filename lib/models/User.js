/**
 * This class encapsulates a User in the system
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
var User = function() {
}


User.prototype = {

}

// //////////////////////////////////////////////////////////////////////////////////////////////
//
// Static Methods
//
// //////////////////////////////////////////////////////////////////////////////////////////////

User = {

    /** Mongoose Model for this class */
    Model : null,

    // //////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Static initializer method
     */
    init : function(){

        this.UserSchema = new mongoose.Schema({
            accountId: { type: mongoose.Schema.Types.ObjectId, required: true },
            name: { type: String, required: false },
            username: { type: String, required: false },
            email: {type: String, index: 1, required: false, unique: true, match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/ },
            icon: {type: String, required: false},
            passwordHash: {type: String, required: false},
            passwordSalt: {type: String, required: false},
            hashingAlgorithm: {type: String, required: false},
            status: {type: String, enum: ['approved','pending','deleted'], default: 'approved'},
            level: {type: String, enum: ['super', 'admin', 'standard'], default: 'standard'},
            eulaAgreed: {type: Boolean, default: false},
            eulaAgreeDate:  { type: Date },
            modified: { type: Date, default: Date.now }
        });

        // Turn off autoIndex in production
        if (process.env.NODE_ENV == 'production'){
            this.UserSchema.set('autoIndex', false);
        }

        //
        // Setup instance methods
        //

        // <-- instance methods -->

        // Setup any static methods we want to add the mongoose schema
        // @see http://mongoosejs.com/docs/guide.html

        // <-- static methods -->

        // Setup the mongoose model, which we'll re-use
        this.Model = Settings.mongoConn.model('Users', this.UserSchema);
    },

    // //////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Get all widgets in the library
     * @param {function(err, widget)} callback
     */
    getAll : function(callback){ this.Model.getAll(callback);},

    load : function(id, callback){ this.Model.findOne({'_id': id}, callback);},

    loadFromUsername : function(username, callback){ this.Model.findOne({ 'username': username }, callback);},

    // //////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Factory method to create and return a new user.
     *
     * @param {mongoose.Schema.Types.ObjectId} accountId
     * @param {string} username
     * @param {string} level 'admin','admin-owner','developer', 'viewer'
     * @param {string} status 'approved','pending','deleted'
     * @param {function(err, User.Model)} callback if successful (if !err) then gives the widget created
     */
    create : function(accountId, username, level, status, callback) {

        var user = new User.Model({
            accountId : accountId,
            username : username,
            level : level,
            status : status
        });

        user.save(function(err){
            if (err) Logger.error(err);
            if(typeof callback == 'function') { callback(err, user); }
        });
    },

    // //////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Prepare for client, this strips out any fields we don't want to be public
     * @param User
     * @returns {null}
     */
    prepareForClient : function(users){

        var isArray = true;

        if (!users){
            users = [];
        }

        if (!Array.isArray(users)){
            users = [users];
            isArray = false;
        }

        var safe_json = [];

        if (users.length == 0) return safe_json;

        for (var i=0; i<users.length; i++){
            safe_json.push({
                id: users[i].id,
                accountId: users[i].accountId,
                username: users[i].username,
                name: users[i].name,
                email: users[i].email,
                icon: users[i].icon,
                status: users[i].status,
                level: users[i].level,
                preferences: users[i].preferences,
                eulaAgreed: users[i].eulaAgreed,
                eulaAgreeDate: users[i].eulaAgreeDate,
                modified: users[i].modified,
                lastLogin: users[i].lastLogin,
                created: users[i].created
            });
        }

        if (!isArray){
            return safe_json[0];
        }

        return safe_json;
    }
}


// Initalize the static variables
User.init();

// node.js module export
module.exports = User;