$('#gravatarimage').error(function() {
  $("#gravatarimage").attr("src","/images/default_photo.jpg");
});
var WIDTH = 200;
var HEIGHT = 200;
var divisor = 60000;
var ctx = document.getElementById("canvas").getContext("2d");
function init(correct,incorrect){
	correct= JSON.parse(correct);
	incorrect= JSON.parse(incorrect);
    var mintime = Number.MAX_VALUE;
    var maxtime = 0;
    correct.forEach(function(element,index){
        var time=element["time"]/divisor;
        if(mintime > time)
            mintime = time;
        if(maxtime < time)
            maxtime = time;
    });
    incorrect.forEach(function(element,index){
        var time=element["time"]/divisor;
        if(mintime > time)
            mintime = time;
        if(maxtime < time)
            maxtime = time;
    });
    var ratio = [];
    var go = [];
    console.log(correct,incorrect);
    correct.forEach(function(element,index){
        if(element.time)
        	go.push({time:(element["time"]/divisor-mintime)/(maxtime-mintime),correct:true});
    });
    incorrect.forEach(function(element,index){
        if(element.time)
        	go.push({time:(element["time"]/divisor-mintime)/(maxtime-mintime),correct:false});
    });
    go.sort(function(a,b){return a.time-b.time});
    console.log(go);
    var cx = WIDTH;
    var cy = HEIGHT;
    var last = 0;
    var totalcorrect = 0;
    var totalincorrect = 0;
    for(var i=1;i<=go.length;i++){
        var x0=cx*go[i-1].time;
        var x1=cx*go[i].time;
        var a = cy*(totalcorrect/(totalcorrect+totalincorrect));
        if(go[i].correct)
            totalcorrect++;
        else
            totalincorrect++;
        var b = cy*(totalcorrect/(totalcorrect+totalincorrect));
        for(var x=0;x<1;x+=1/(x1-x0)){
            ctx.fillStyle='#39c639';
            var y = cos_interp(a,b,x);
            var w = 1;
            ctx.fillRect(x0+x*(x1-x0),HEIGHT-y,w,y); 
        }   
    }
}
function cubic_interpolation(a,b,c,d,x){
    var P = (d-c)-(a-b);
    var Q = (a-b) - P;
    var R = c - a;
    var S = b;
    return P*x*x*x + Q*x*x+ R*x + S;
}
function cos_interp(a,b,x){
    var ft = x*3.141592654;
    var f = (1-Math.cos(ft))*.5;
    return a*(1-f)+b*f;
}