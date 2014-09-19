$(document).ready(function() {
    var submitQ = (function(init) {
        return function(event) {
            //we only want to replace these on the first call
            var isNotFirstCall = !init;
            if(init) {
                var first = $("input[name=choice]:checked").val();
                var type = $('input[name=typer]').val();
                var postData = {};
                postData.id=qid;
                postData.choice=first;
                if(type) {
                    postData.typer=type;
                }
                $.post('/checkquestion',postData).done(function(data){
                    if(data==='correct')
                        $('label[for=' + first + ']').css('background-color','green');
                    else if(data === 'incorrect')
                        $('label[for=' + first + ']').css('background-color','red');
                    $('.content').find('.sub').remove();
                    $('label').click(false);
                    $('.next').css('display','inline');
                    $('.try').css('display','inline');
                    $('.next').attr('class','sub');
                    //need to rebind click handlers (of .sub) because we've created 
                    //a new object to observe
                    bind();
                });
                init = false;
            }
            return isNotFirstCall;
        }
    })(true);

    var bind = function() {
        $('.content').find('[name=checkquestion]').submit(function(event) {
            event.preventDefault();
            if(submitQ(event)) {
                window.location.href= "/random"
            } 
        });
    }

    bind();

    $('.try').click(function(event) {
        event.preventDefault();
        window.location.href= "/random/" + qid;
    });

    $('.report').one("click", function() {
        // make sure the user doesn't change qid to nonsense
        if(document.URL.indexOf(qid) > -1) { 
            $.get('/report/' + qid);
            //handle report request
            $('.report')[0].innerHTML= "Thanks!";
        }
    });
});

