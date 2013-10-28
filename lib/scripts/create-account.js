var Logger = require('arsenic-logger')
var Settings = require('../Settings.js'); // Holds global settings such as DB connection strings
var config = require('../../logi-config.js'); // Holds configuration settings
var LogiApp = require('../models/LogiApp.js');
var LogiAccount = require('../models/LogiAccount.js');

//testAppId = '520d1959e042d60aa6000003';

LogiAccount.create("Logi", function(err, newAccount){

    if (!err){

        Logger.warn("!!!!!!!! New Account created !!!!!!!!!!");

        // Now create the app
        LogiApp.create(newAccount.id, "BlackHills Test App", "web", function(err, newApp){

            if (!err){

                Logger.warn("!!!!!!!! New App created !!!!!!!!!!");

                // Force the secret key to what is in the config file FOR TESTING ONLY
                newAccount.secretKey = config.secretKey;
                newAccount.save();

            }
            else {
                Logger.error(err);
            }
        });

    }
    else {
        Logger.error(err);
    }

});
