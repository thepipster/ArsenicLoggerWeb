var nodemailer = require("nodemailer"); // https://github.com/andris9/Nodemailer
var Logger = require('arsenic-logger');
var Settings = require('./Settings.js');

var Messaging = {

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    sendEmail : function(toEmail, fromEmail, fromName, subject, message, messagePlain){

        var transport = getTransport();

        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: fromEmail + " <"+fromEmail+">", // sender address
            to: toEmail,
            subject: subject, // Subject line
            text: messagePlain, // plaintext body
            html: message // html body
        };

        Logger.info(mailOptions);

        // send mail with defined transport object
        transport.sendMail(mailOptions, function(error, response){
            if(error){
                Logger.error(error);
            }
            else{
                Logger.debug("Message sent: " + response.message);
            }

            // if you don't want to use this transport object anymore, uncomment following line
            transport.close(); // shut down the connection pool, no more messages
        });

    },

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    sendSystemEmail : function(toEmail, subject, message){
        this.sendEmail(toEmail, 'support@arsenicsoup.com', 'The ArsenicSoup Crew', subject, message);
    },

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    sendWelcomeEmail : function(toEmail, toName){

        var fs = require('fs');

        Logger.debug(__dirname);

        fs.readFile(__dirname + '/email_templates/template.html', function (err, email_template) {

            if (err) {
                Logger.error(err);
                return;
            }

            var contents = "<br />Thanks for signing up with ArsenicSoup! Your account is now active.<br /><br />You will be able to use this account accross any of ArsenicSoup's products.";

            var html_contents = email_template.toString().replace("__USER_NAME__", toName);
            var html_contents = email_template.toString().replace("__CONTENTS__", contents);

            Messaging.sendEmail(toEmail, 'support@arsenicsoup.com', 'The ArsenicSoup Crew', 'Your ArsenicSoup account is active', html_contents, '');

        });
        	
    }

};

module.exports = Messaging;


function getTransport(){

    var transport = nodemailer.createTransport("SMTP", {
        host: "smtp.sendgrid.net",
        secureConnection: false,
        port: 587,
        auth: {
            user: Settings.sendgridUser,
            pass: Settings.sendgridPass
        }
    });

    return transport;
}

