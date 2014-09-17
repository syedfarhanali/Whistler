$(document).ready(function(){
	$("#new_post").unbind('click').click(function(){
		var effect = 'slide';
		var options = { direction:'right'};
		var duration = 500;
		$('#slide_container').toggle(effect, options, duration);
			
		chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
		    var curUrl = tabs[0].url;
		    $(".whistle_link").children('textarea').html(curUrl);
		});
	});
	/*
	 * 
	 */
	$('textarea').liveUrl({
		  success : function(data) 
		  {  
		    console.log(data);
		    var preview =data.video+'<br/>'+data.title+'<br/>'+data.description;
		    $("#linkPreview").html(preview);
		    // this return the first found url data
		  }
		});
	
	//$("#linkUrl").urlive({container: '#linkPreview'});
	
	/*$('textarea').on('input propertychange', function () {
	     $('textarea').urlive({
	        callbacks: {
	            onStart: function () {
	                $('.loading').show();
	                $('.urlive-container').urlive('remove');
	            },
	            onSuccess: function (data) {
	                $('.loading').hide();
	                $('.urlive-container').urlive('remove');
	            },
	            noData: function () {
	                $('.loading').hide();
	            }
	        }
	    });
	}).trigger('input');*/
	
	
	$('#linkUrl').on('input propertychange', function () {
		console.log(1);
	     $('#linkUrl').urlive({
	        callbacks: {
	            onStart: function () {
	            	console.log(2);
	                $('.loading').show();
	                $('#linkPreview').urlive('remove');
	            },
	            onSuccess: function (data) {
	            	console.log(3);
	                $('.loading').hide();
	                $('#linkPreview').urlive('remove');
	            },
	            noData: function () {
	            	console.log(4);
	                $('.loading').hide();
	            }
	        }
	    });
	}).trigger('input');
	
	
	
	
	
	$("#close_slider").unbind('click').click(function(){
		$("#new_post").click();
	});
	
	$("#whistleList").children(".list_item").unbind('click').click(function(){
		$("#whistleList").children().removeClass('active');
		$(this).addClass('active');
	});
	
	$(".tag_container").click(function(){
		var obj = $(this).children("[name=tag_image]");
		if(obj.hasClass("whistle_tag")){
			obj.removeClass("whistle_tag");
			obj.addClass("whistle_tag_active");
		}else{
			obj.addClass("whistle_tag");
			obj.removeClass("whistle_tag_active");
		}
	});
	
	$(".list_item").on('click',".favourite",function(){
		console.log("12");
		$(this).removeClass('favourite').addClass('favourite_sel');
	})
	
	$(".list_item").on('click',".favourite_sel",function(){
		console.log("121111");
		$(this).removeClass('favourite_sel').addClass('favourite');
	})
	
})
