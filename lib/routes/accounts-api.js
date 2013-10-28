var Logger = require('arsenic-logger')
var LogiAccount = require('../models/LogiAccount.js');
var Settings = require('../Settings.js');

exports.createAccount = function(req, res, next){

    var company = req.body.company;

    var accountObj = new LogiAccount(Settings.mongoConn);

    // TODO: Verify hmac goes here :-)

    accountObj.create(company, function(didCreate, err){
        if (didCreate){
            res.send({result: "ok", accountKey: accountObj.accountKey});
        }
        else {
            res.send({result: "fail", error: err});
        }
    });
}

exports.deleteAccount = function(req, res, next){
    var appKey = req.params.appKey;
    res.status(404).send('TODO! This method has not been built yet!');
}

exports.updateAccount = function(req, res, next){
    var appKey = req.params.appKey;
    res.status(404).send('TODO! This method has not been built yet!');
}

exports.getAccount = function(req, res, next){
    var appKey = req.params.appKey;
    res.status(404).send('TODO! This method has not been built yet!');
}
