var passwordHash = require('password-hash');

var shuffle = function (array) {
    var currentIndex = array.length;
    var temp;
    var randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temp = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temp;
    }
    return array;
}

exports.newuser = function (req, res) {
    res.render('newuser', {
        title: 'Add New User',
        prompt: 'Please fill out the information below.'
    });
};

exports.adduser = function (db) {
    return function (req, res) {
        var userName = req.body.username;
        var email = req.body.useremail;
        var grade = req.body.usergrade;
        var firstPassword = req.body.password;
        var secondPassword = req.body.secondpassword;
        var firstName = req.body.firstname;
        var lastName = req.body.lastname;
        var password = passwordHash.generate(firstPassword);
        var questiontheme = 'eclipse';
        var codetheme = 'twilight';
        var ids = [];
        var collections = db.get('questions')
        collections.find({}, function (err, found) {
            if (err) {
                throw err;
            } else {
                for (var i = 0; i < found.length; i++) {
                    ids.push(found[i]['_id']);
                }
                shuffle(ids);

                var empty1 = false;
                var email1 = false;
                var password1 = false;
                var grade1 = false;

                if (!email) {
                    email = "";
                }

                if (!req.body.username || !req.body.useremail || !req.body.usergrade || !req.body.password || !req.body.secondpassword || !req.body.firstname || !req.body.lastname) {
                    empty1 = true;
                    //error: "You left some of the boxes empty!"
                }
                if (email.indexOf("@") === -1) {
                    email1 = true;
                    //error: "Please use a valid email",
                }
                if (firstPassword != secondPassword) {
                    password1 = true;
                    //error: "Make sure the password fields match.",
                }
                if (grade > 12) {
                    grade1 = true;
                }
                if (password1 || email1 || grade1 | empty1) {
                    res.render('newuser', {
                        title: 'Add New User',
                        empty: empty1,
                        email: email1,
                        password: password1,
                        grade: grade1,
                        prompt: "Please fill out the information below."
                    });
                } else {
                    var collection = db.get("users");
                    var count = collection.count({
                        username: userName
                    }, function (err, count) {
                        if (err) {
                            throw err;
                        }
                        if (count > 0) {
                            res.render('newuser', {
                                title: 'Add New User',
                                error: "That username is already taken.",
                                prompt: "Please fill out the information below."
                            });
                        } else {
                            collection.insert({
                                "firstName": firstName,
                                "lastName": lastName,
                                "username": userName,
                                "email": email,
                                "grade": grade,
                                "password": password,
                                "questions": ids,
                                "correct": [],
                                "incorrect": [],
                                "passed": [],
                                "corrected":[],
                                "score": 0,
                                "streak": 0,
                                "longeststreak":0,
                                "qtheme":questiontheme,
                                "ctheme":codetheme
                            }, function (err, doc) {
                                if (err) {
                                    throw err;
                                } else {
                                    res.location("signin");
                                    res.redirect("signin");
                                }
                            });
                        }
                    });
                }
            }
        });

    }
};