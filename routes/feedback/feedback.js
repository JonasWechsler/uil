var config = require('../../config');
var nodemailer = require('nodemailer');
var mongo = require('mongodb');
var monk = require('monk');
var db = require('../../db');

module.exports = function(app) {
    app.all('/getfeedback', function (req, res) {
        res.render('feedback/feedback', {
            session: req.session
        });
    });

    app.all('/sendfeedback', function (req, res) {
        var name = req.body.name;
        var subject = req.body.subject;
        var text = req.body.text;
        var email = req.body.email;
        var smtpTransport = nodemailer.createTransport("SMTP", {
            service: "Gmail",
            auth: {
                user: config.feedback.email,
                pass: config.feedback.password
            }
        });
        var mailOptions = {
            to: config.feedback.email,
            from: name,
            subject: subject,
            text: text + "\n\nRespond to this person at: " + email
        }
        smtpTransport.sendMail(mailOptions, function (err, response) {
            if (err) {
                throw err;
            } else {
                res.redirect("/");
            }
        });
    });
}