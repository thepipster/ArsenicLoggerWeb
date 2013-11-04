var Logger = require('arsenic-logger')
var Settings = require('../Settings.js');
var Account = require('../models/Account.js');
var Logs = require('../models/Logs.js');
var Usage = require('../models/Usage.js');

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

    if (req.user) {

        if (tag == "" || tag == "all"){

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

exports.getUsage = function(req, res){

    // Date passed as ms since epoch
    var sinceDate = new Date(parseInt(req.params.sinceDate));

    if (req.user) {

        Usage.getSinceDate(req.user.accountId, sinceDate, function(err, usage){
            if (!err){
                res.send({result: "ok", usage: Usage.prepareForClient(usage)});
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

exports.getHosts = function(req, res){

    if (req.user) {

        Logs.getHosts(req.user.accountId, function(err, hosts){

            if (!err){
                res.send({result: "ok", hosts: hosts});
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

