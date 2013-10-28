
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var Logger = require('arsenic-logger');
var User = require('./lib/models/User.js');
var users = require('./lib/routes/users-api.js');
var Settings = require('./lib/Settings.js'); // Holds global settings such as DB connection strings
var MongoStore = require('connect-mongo')(express);
var SecurityUtils = require('./lib/utils/SecurityUtils.js');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var app = express();

// http://passportjs.org/guide/username-password/

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.load(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy(

    function(username, password, done) {

        User.loadFromUsername(username, function(err, user) {

            if (err) { return Logger.err(err); }

            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }

            if (!SecurityUtils.validatePBKDF2Hash(user.passwordHash, user.passwordSalt, password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }

            return done(null, user);
        });

    }
));


app.set('port', process.env.PORT || 8001);
app.use(express.favicon(__dirname + '/public/images/favicon.png'));
//app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('etasg234745king'));
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
//    app.use(express.errorHandler());
}

// Heartbeat
app.get('/api/', function(req, res){ res.send({result: "ok", json: true});});

//app.get('/api/user/:userId', user);

// Authentication
app.post('/api/user', users.registerUser);
app.get('/api/user/checkusername/:username', users.checkUsername);

app.post('/api/auth/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/' }));
app.get('/api/auth/logout', function(req, res){ req.logout(); res.redirect('/');});
app.get('/api/auth/check', function(req, res){
    if (req.user) {
        res.send({result: "ok", username: req.user.username});
    }
    else {
        res.send({result: "fail"});
    }
});

http.createServer(app).listen(app.get('port'), function(){
    Logger.info('Express server listening on port ' + app.get('port'));
});