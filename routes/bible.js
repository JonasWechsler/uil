exports.bible = function(){
    return function(req,res){
        res.render('bible', {
            cookie:req.session.loggedin,
            session:req.session
        });
    }
};

exports.section = function(){
    return function(req,res){
        var section = req.url
        section = section.substring(section.lastIndexOf('/')+1)
        res.render('biblesection', {
            cooke:req.session.loggedin,
            session:req.session,
            section:section
        })
    }
};