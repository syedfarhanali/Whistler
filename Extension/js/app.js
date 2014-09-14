$(document).ready(function(){
	$("#new_post").unbind('click').click(function(){
		var effect = 'slide';
		var options = { direction:'right'};
		var duration = 500;
		$('#slide_container').toggle(effect, options, duration);
	});
	
	$("#close_slider").unbind('click').click(function(){
		$("#new_post").click();
	});
	
	$("#whistleList").children(".list_item").unbind('click').click(function(){
		$("#whistleList").children().removeClass('active');
		$(this).addClass('active');
	});
	
	$(".tag_container").click(function(){
		var obj = $(this).children("[name=tag_image]");
		console.log(obj);
		if(obj.hasClass("whistle_tag")){
			obj.removeClass("whistle_tag");
			obj.addClass("whistle_tag_active");
		}else{
			obj.addClass("whistle_tag");
			obj.removeClass("whistle_tag_active");
		}
	})
	
})
