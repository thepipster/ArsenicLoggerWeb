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

exports.deleteLogs = function(req, res){

    if (req.user) {

        var col = Logs.getCollection(req.user.accountId);

        col.drop(function(err){
            if (!err){
                res.send({result: "ok"});
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

exports.getLogDiscUsage = function(req, res){

    if (req.user) {

        var col = Logs.getCollection(req.user.accountId);

        /*
        {
            "ns" : "app.users",             // namespace
            "count" : 9,                    // number of documents
            "size" : 432,                   // collection size in bytes
            "avgObjSize" : 48,              // average object size in bytes
            "storageSize" : 3840,           // (pre)allocated space for the collection in bytes
            "numExtents" : 1,               // number of extents (contiguously allocated chunks of datafile space)
            "nindexes" : 2,                 // number of indexes
            "lastExtentSize" : 3840,        // size of the most recently created extent in bytes
            "paddingFactor" : 1,            // padding can speed up updates if documents grow
            "flags" : 1,
            "totalIndexSize" : 16384,       // total index size in bytes
            "indexSizes" : {                // size of specific indexes in bytes
            "_id_" : 8192,
                "username" : 8192
        },
            "ok" : 1
        }
        */

        col.stats(function(err, stats){
            res.send({result: "ok", noDocs: stats.count, dataSize: stats.size, storageSize: stats.storageSize});
        });

    }
    else {
        res.send({result: "fail", error: "Not logged in"})
    }


}

// ////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.getLogs = function(req, res){

    var tag = req.params.tag;
    var page = req.params.page;
    var pageSize = req.params.pageSize;
    
    if (!page) page = 1;
    if (!pageSize) pageSize = 20;
    if (!tag) tag = "";

    var from = pageSize * (page-1);
    var to = pageSize;

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

