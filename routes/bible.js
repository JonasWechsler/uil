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
        
    }
};