var nodemailer = require('nodemailer');
var teacher = "jacobstephens";
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/nodetest1');
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
                user: "lasauiltraining@gmail.com",
                pass: teacher
            }
        });
        var mailOptions = {
            to: "lasauiltraining@gmail.com",
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