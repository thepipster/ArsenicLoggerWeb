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

            case 'production':
                Logger.setLevel('warn');
                break;

            case 'development':
            case 'local':
                Logger.setLevel('debug');
                Settings.mongoConn = mongoose.connect('mongodb://localhost:27017/arseniclogger', function(err) {
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