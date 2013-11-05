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
    var page = req.params.page;
    var pageSize = req.params.pageSize;
    
    if (!page) page = 1;
    if (!pageSize) pageSize = 20;
    if (!tag) tag = "";

    var from = pageSize * (page-1);
    var to = from + pageSize;

    if (req.user) {

        var LogModel = Logs.getModel(req.user.accountId);

        if (tag == "" || tag == "all"){

            LogModel.count({}, function(err, size){

                if (!err){

                    LogModel.find({}).sort({'modified': 'descending'}).skip(from).limit(to).exec(function(err, logs){
                        if (!err){
                            res.send({result: "ok", logs: logs, total: size});
                        }
                        else {
                            res.send({result: "fail", error: err.toString()})
                        }
                    });

                }
                else {
                    res.send({result: "fail", error: err.toString()})
                }

            });

        }
        else {

            LogModel.count({'tag': tag}, function(err, size){

                if (!err){

                    LogModel.find({'tag': tag}).sort({'modified': 'descending'}).skip(from).limit(to).exec(function(err, logs){
                        if (!err){
                            res.send({result: "ok", logs: logs, total: size});
                        }
                        else {
                            res.send({result: "fail", error: err.toString()})
                        }
                    });

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

