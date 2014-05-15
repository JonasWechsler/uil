module.exports = function(){
    return function(req,res,next){
        var accessible = [
            "/signin",
            "/",
            "/newuser",
            "/adduser"
        ];
        if(accessible.indexOf(req.url)>-1){
            next();
        }
        else if(req.session.user){
            next();
        }
        else{
            res.redirect("/signin");
        }
    }
}