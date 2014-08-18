$(document).ready(function(){
    $('#sub').click(function(){
        var first = $("input[name=choice]:checked").val();
        if(key===first)
            $('label[for=' + first + ']').css('background-color','green');
        else
            $('label[for=' + first + ']').css('background-color','red');
        $('#sub').remove();
        $('label').click(false);
        $('.next').css('display','inline');
        $('.try').css('display','inline');
        $('.next').attr('id','sub');
    });
    $('.try').click(function() {
        $('input[name="retry"]').val('true');
        $('.next').click();
    });
});