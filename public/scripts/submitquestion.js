$(document).ready(function() {
    var submittedQuestion = function(init) {
        return function(event) {
            //we only want to replace these on the first call
            var isNotFirstCall = !init;
            if(init) {
                var first = $("input[name=choice]:checked").val();
                if(key===first)
                    $('label[for=' + first + ']').css('background-color','green');
                else
                    $('label[for=' + first + ']').css('background-color','red');
                $('.content').find('.sub').remove();
                $('label').click(false);
                $('.next').css('display','inline');
                $('.try').css('display','inline');
                $('.next').attr('class','sub');
                //need to rebind click handlers (of .sub) because we've created 
                //a new object to observe
                bind();
                init = false;
            }
            return isNotFirstCall;
        }
    }

    var submitQ = submittedQuestion(true);

    var bind = function() {
        $('.content').find('.sub').click(function(event) {
            submitQ(event);
        });
    }

    bind();

    $('.try').click(function() {
        $('input[name="retry"]').val('true');
        $('.next').click();
    });
});

