var Logger = require('arsenic-logger')
var Settings = require('../Settings.js');
var Account = require('../models/Account.js');
var Logs = require('../models/Logs.js');
var SecurityUtils = require('../utils/SecurityUtils.js');

// ////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.addLogEntry = function(req, res){

    Logger.debug('Entering addLogEntry...');

    var apiKey = req.body.apiKey;
    var clientIP = SecurityUtils.getClientIp(req);

    /*
        accountId: { type: mongoose.Schema.Types.ObjectId, required: true },
        message: { type: String, required: false },
        stack: [Mixed],
        status: {type: String, enum: ['debug','info','warn','error','fatal'], default: 'debug'},
        modified: { type: Date, default: Date.now }
    */

    Account.loadFromAPIKey(apiKey, function(err, account){

        if (err){
            res.status(500).send({result: "fail", error: err.toString()});
        }
        else if (!account){
            res.status(500).send({result: "fail", error: "No account found with this API key ("+apiKey+")"});
        }
        else {

            var entry = Logs.get(account.id);

            var stackObj = JSON.parse(req.body.stack);

            entry.memory = req.body.memory || 0;
            entry.memoryTotal = req.body.memoryTotal || 0;
            entry.message = req.body.message;
            entry.stack = stackObj;
            entry.pid = req.body.pid;
            entry.level = req.body.level;
            entry.hostname = req.body.hostname;
            entry.message = req.body.message;
            entry.ip = clientIP;
            entry.tag = req.body.tag || 'default';
            entry.modified = new Date();

            try {
                entry.filename = stackObj[0].fileName;
            }
            catch (err){
                Logger.error(err);
            }

            entry.save(function(err, savedEntry){
                if (err){
                    res.status(500).send({result: "fail", error: err.toString()});
                }
                else {
                    res.send({result: "ok"});
                }
            });

        }


    });

};

// ////////////////////////////////////////////////////////////////////////////////////////////////////////
