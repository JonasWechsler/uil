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
        var transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: config.feedback.email,
                pass: config.feedback.password
            }
        });
        var name = req.body.name;
        var subject = req.body.subject;
        var text = req.body.text;
        var email = req.body.email;
        var mailOptions = {
            from: name, 
            to: config.feedback.email, 
            subject: subject, 
            text: text + "\n\nRespond to this person at: " + email
        };

        transporter.sendMail(mailOptions, function (err, response) {
            if (err) {
                throw err;
            } else {
                console.log("Message sent   " + response.response);
                res.redirect("/");
            }
        });
    });
}