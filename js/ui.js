// var tabs = document.querySelector('paper-tabs');
// var list = document.querySelector('post-list');

// tabs.addEventListener('core-select', function() {
// 	console.log('yes');
// list.show = tabs.selected;
//   $(tabs.selected).show()
// });

$( document ).ready(function() {
	$('#home').click(function(){
		$('#container2').show();
		$('#container').hide();
	});
	$('#chat').click(function(){
		$('#container').show();
		$('#container2').hide();
	});
});