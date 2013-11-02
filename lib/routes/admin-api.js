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
    var sinceDate = req.params.sinceDate;

    if (!tag) tag = "";

    if (req.user) {

        // TODO!!!!!

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

