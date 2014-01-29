var Logger = require('arsenic-logger')
var Settings = require('../Settings.js');
var Account = require('../models/Account.js');
var User = require('../models/User.js');
var SecurityUtils = require('../utils/SecurityUtils.js');

// ////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Check to see if a session exists and a user is logged on
 */
/*
exports.checkSession = function(req, res){

    if (req.isAuthenticated()){

        var safe_info = {
            id: req.user.id,
            accountId: req.user.accountId,
            username: req.user.username,
            name: req.user.name,
            icon: req.user.icon
        };

        res.send({result: "ok", userInfo: safe_info});
    }
    else {
        // Check to see if any accounts exists, if so then this could be a new install and
        // we need to re-direct to the setup page
        Account.getAll(function(err, accounts){
            if (!err && accounts && accounts.length == 0){
                res.send({result: "fail", error: "not setup"});
            }
            else {
                res.send({result: "fail", error: "no session"});
            }
        });
    }
};
     */

// ////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Register a new user
 *
 * @param req
 * @param res
 * @param next
 */
exports.registerUser = function(req, res, next){

    var username = req.body.username;
    var company = req.body.company;
    var name = req.body.name;
    var plainPassword = req.body.password;

    var accountName = company || username;

    // Create an account, then add the new user to it
    Account.create(accountName, function(err, accountObj){

        if (!err){

            User.create(accountObj.id, username, 'admin', 'approved', function(err, userObj){


                // Use PBKDF2 for pretty secure password hash...
                // Note: its safe to store the salt in the DB as the purpose of salt is to defeat rainbox table attacks,
                // see http://stackoverflow.com/questions/1219899/where-do-you-store-your-salt-strings for more deets

                userObj.authenticationModel = "Basic";
                userObj.passwordHashMethod = 'PBKDF2';

                var pass = SecurityUtils.createPBKDF2Hash(plainPassword, '');

                userObj.passwordSalt = pass.salt;
                userObj.passwordHash = pass.key;
                userObj.name = name;

                userObj.save(function(err, savedUser){
                    if (err) {
                        Logger.error(err);
                        res.send({result:"fail", error: err});
                    }
                    else {
                        res.send({result:"ok", user: User.prepareForClient(savedUser)});
                    }
                });

            });

        }
        else {

        }

    });
}

// ////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Register a new user
 *
 * @param req
 * @param res
 * @param next
 */
exports.checkUsername = function(req, res, next){

    var username = req.params.username;

    User.loadFromUsername(username, function(err, user){

        if (err){
            res.send({result: "fail", error: err});
        }
        else {
            if (user){
                res.send({result: "ok", isUsed: true});
            }
            else {
                res.send({result: "ok", isUsed: false});
            }
        }
    });

}

// ////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Register a new user
 *
 * @param req
 * @param res
 * @param next
 */
exports.metaGetUsers = function(req, res, next){

    if (req.user.level == 'super'){

        User.getAll(function(err, users){

            if (err){
                res.send({result: "fail", error: err});
            }
            else {
                if (users){
                    res.send({result: "ok", users: users});
                }
                else {
                    res.send({result: "ok", users: []});
                }
            }
        });

    }
    else {
        res.send({result: "fail", error: "Not Authorized"});
    }


}