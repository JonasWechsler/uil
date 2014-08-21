$(document).ready(function() {
	$('.sub').on('enter', function(event, originalobject) {
		if(originalobject && $(originalobject).hasClass('search')) {
			$('.search').find('.sub').click();
		} else {
			$('.content').find('.sub').click();
		}
	});
});