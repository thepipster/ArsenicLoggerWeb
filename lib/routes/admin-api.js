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

exports.searchLogs = function(req, res){

    var keyword = req.params.keyword;

    if (req.user) {

        var LogModel = Logs.getModel(req.user.accountId);

        //var textSearch = require("mongoose-text-search");
        LogModel.textSearch(keyword, function (err, output) {

            // { queryDebugString: '3d||||||',
            //   language: 'english',
            //   results:
            //    [ { score: 1,
            //        obj:
            //         { name: 'Super Mario 64',
            //           _id: 5150993001900a0000000001,
            //           __v: 0,
            //           tags: [ 'nintendo', 'mario', '3d' ] } } ],
            //   stats:
            //    { nscanned: 1,
            //      nscannedObjects: 0,
            //      n: 1,
            //      nfound: 1,
            //      timeMicros: 77 },
            //   ok: 1 }

            if (!err){

                var logs = [];
                for (var i=0; i<output.results.length; i++){
                    var score = output.results[i].score;
                    logs.push(output.results[i].obj);
                }

                res.send({result: "ok", logs: Logs.prepareForClient(logs)});
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

    var tag = req.params.tag || '';
    var level = req.params.level || 'debug';
    var host = req.params.host || '';

    var startDate = null; // new Date(0);
    var endDate = null; //new Date();

    if (req.params.startDate){
        startDate = new Date(req.params.startDate);
    }

    if (req.params.endDate){
        endDate = new Date(req.params.endDate);
    }

    //var query = {'modified': {$gte: startDate, $lt: endDate}};
    var query = {};

    if (tag != "" && tag != "all"){
        query['tag'] = tag;
    }
    if (level != 'debug'){
        query['level'] = level;
    }
    if (host != '' && host != 'all'){
        query['hostname'] = host;
    }

    query['modified'] = {$gte: startDate, $lt: endDate};

    if (req.user) {

        var LogModel = Logs.getModel(req.user.accountId);

        LogModel.count(query, function(err, size){

            if (!err){

                Logger.info(query);

                LogModel.find(query).sort({'modified': 'descending'}).limit(200).exec(function(err, logs){
                    if (!err && logs){
                        Logger.warn("Found " + logs.length + " logs");
                        res.send({result: "ok", logs: Logs.prepareForClient(logs), total: size});
                    }
                    else {
                        Logger.warn("No logs found!!");
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
        res.send({result: "fail", error: "Not logged in"})
    }

};

// ////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.getMemoryData = function(req, res){

    var pid = req.params.pid || 0;
    var tag = req.params.tag;
    var level = req.params.level || 'debug';
    var host = req.params.host || '';

    if (!tag) tag = "";

    var query = {};

    if (tag != "" && tag != "all"){
        query['tag'] = tag;
    }
    if (level != 'debug'){
        query['level'] = level;
    }
    if (host != '' && host != 'all'){
        query['hostname'] = host;
    }
    if (pid != 0){
        query['pid'] = pid;
    }


    if (req.user) {

        var LogModel = Logs.getModel(req.user.accountId);

        var fields = {
            '_id':0,
            'cpu':1,
            'memory':1,
            'memoryTotal':1,
            //'pid':1,
            //'ip':1,
            'hostname':1,
            //'filename':1,
            //'level':1,
            'modified':1
        }

        LogModel.find(query, fields).sort({'modified': 'descending'}).limit(2000).exec(function(err, data){
            if (!err){
                res.send({result: "ok", memoryUsage: data});
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

