var Logger = require('arsenic-logger')
var Settings = require('../Settings.js');
var Account = require('../models/Account.js');
var Logs = require('../models/Logs.js');

// ////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.getAccountInfo = function(req, res){

    if (req.user) {

        Account.load(req.user.accountId, function(err, account){
            if (!err){
                res.send({result: "ok", account: account});
            }
            else {
                res.send({result: "fail", error: err.toString()})
            }
        });
    }
    else {
        res.send({result: "fail", error: "Not logged in"})
    }

};

// ////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.getLogs = function(req, res){

    var tag = req.params.tag;

    // Date passed as ms since epoch
    var sinceDate = new Date(parseInt(req.params.sinceDate));

    if (!tag) tag = "";

    Logger.debug("Tag = " + tag + " sinceDate = " + sinceDate);

    var testDate = new Date(0);
    Logger.warn(testDate);

    if (req.user) {

        if (tag == "" || tag == "all"){

            Logger.debug(req.user.accountId);

            Logs.getSinceDate(req.user.accountId, sinceDate, function(err, logs){
                if (!err){
                    res.send({result: "ok", logs: logs});
                }
                else {
                    res.send({result: "fail", error: err.toString()})
                }
            });

        }
        else {

            Logs.getForTagSinceDate(req.user.accountId, tag, sinceDate, function(err, logs){
                if (!err){
                    res.send({result: "ok", logs: logs});
                }
                else {
                    res.send({result: "fail", error: err.toString()})
                }
            });

        }
    }
    else {
        res.send({result: "fail", error: "Not logged in"})
    }

};

// ////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.getTags = function(req, res){

    if (req.user) {

        Logs.getTags(req.user.accountId, function(err, tags){

            if (!err){
                res.send({result: "ok", tags: tags});
            }
            else {
                res.send({result: "fail", error: err.toString()})
            }

        });

    }
    else {
        res.send({result: "fail", error: "Not logged in"})
    }

}

// ////////////////////////////////////////////////////////////////////////////////////////////////////////

