$(document).ready(function() {
	$('.sub').on('enter', function(event, originalobject) {
		event.preventDefault();
		if(originalobject && $(originalobject).hasClass('search')) {
			$('.search').find('.sub').click();
		} else {
			$('.content').find('.sub').click();
		}
	});
});