'use strict'

$('.updateForm').hide();
$('.updateBtn').on('click', function() {
	let parent_box = $(this).closest('#button_form');
    let siblings1= parent_box.siblings().eq(7);
    // $('.updateForm').hide();
    siblings1.toggle();
});

$('.updateForm1').hide();
$('.updateBtn1').on('click', function() {
	let parent_box = $(this).closest('#button_form');
    let siblings1= parent_box.siblings().eq(3);
    // $('.updateForm').hide();
    siblings1.toggle();
});
