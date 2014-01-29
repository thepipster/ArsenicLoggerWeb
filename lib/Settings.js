var mongoose = require('mongoose');
var Logger = require('arsenic-logger');

var Settings = {

    /** Default time zone */
    timeZone : 'America/New_York',

    /** SendGrid username */
    sendgridUser : "tbd",

    /** SendGrid password */
    sendgridPass: "tbd",

    /** The length of time that session secret keys are valid, in seconds */
    sessionSecretKeyDuration : 48 * 60 * 60, // 48 hours

    dbUrl : "",

/**
     * Connection to mongo DB
     */
    mongoConn : null,

    /**
     * Initialize any connections
     */
    init : function(){

        // If the environment variable isn't set, assume we're in a local setup
        if (typeof process.env.NODE_ENV == 'undefined'){
            process.env.NODE_ENV = 'local';
        }

        switch(process.env.NODE_ENV){

            case 'nodejitsu':

                Logger.setLevel('error');
                Logger.dbUrl = 'mongodb://nodejitsu:37a676e843fee72daeee3457388e76c5@paulo.mongohq.com:10090/nodejitsudb2720327319';

                Settings.db = mongoose.connect(Logger.dbUrl, function(err) {
                    if (err) {
                        Logger.fatal("Error connecting to Mongo!", err);
                    }
                });
                break;

            case 'production':

                Logger.setLevel('error');
                Logger.dbUrl = 'mongodb://localhost:27017/arseniclogger';

                Settings.db = mongoose.connect(Logger.dbUrl, function(err) {
                    if (err) {
                        Logger.fatal("Error connecting to Mongo!", err);
                    }
                });
                break;

            case 'development':
            case 'local':
                Logger.setLevel('debug');
                Logger.dbUrl = 'mongodb://localhost:27017/nodejitsudb2720327319';
                Settings.db = mongoose.connect(Logger.dbUrl, function(err) {
                    if (err) {
                        Logger.fatal("Error connecting to Mongo! Is Mongo running?");
                        throw err;
                    }
                });
                break;

        }

        mongoose.connection.on('open', function () {
            Logger.debug("Connected to MongoDB!");
        });

    }
}


Logger.debug("Setting up connection to database, using " + process.env.NODE_ENV + " environment");

Settings.init();

module.exports = Settings;