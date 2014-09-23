$(document).ready(function(){
	
	function loadWhistles(){
		var userId=1;
		var page=1
		var whistles = data.whistles;//fetcher.getHomePageWhistles(userId,page);
		$.tmpl($("#whistleItemTemplate"),{'whistles':whistles}).appendTo($("#whistleList"));
	}
	
	function updatedWhistleNotification(available,count){
		if(isChrome) {
			if(available){
				chrome.browserAction.setBadgeBackgroundColor({color:"#FF0000"});
				chrome.browserAction.setBadgeText({text:count});
				chrome.browserAction.setBadgeBackgroundColor({"color":[0, 0, 0,0]});
			}else{
				chrome.browserAction.setBadgeBackgroundColor({"color": [225, 0, 0, 100]}); 
			}
		}
	}
	
	function bindNewPostEvent(){
		$('#linkUrl').on('input propertychange', function () {
			var el=$("#linkPreview");
			 $('#linkUrl').urlive({
				callbacks: {
					onStart: function () {
						$('.new_whistle_loading').show();
						$('.urlive-container').urlive('remove');
					},
					onSuccess: function (data) {
						el.empty();
						$.tmpl($("#previewTemplate"),{'preview':data}).appendTo(el);
						$(".preview_container").show();
						$("#preview_close").unbind('click').click(function(){
							el.empty();
							 $(".preview_container").hide();
						})
						$('.new_whistle_loading').hide();
						$('.urlive-container').urlive('remove');
					},
					noData: function () {
						console.log("nodata");
						$('.new_whistle_loading').hide();
					}
				}
			})
		});
		
		
		
		
		
		$(function() {
		    function split( val ) {
		      return val.split( /,\s*/ );
		    }
		    function extractLast( term ) {
		      return split( term ).pop();
		    }
		 
		    // don't navigate away from the field on tab when selecting an item
		    $("#newCustomTags").bind( "keydown", function( event ) {
		        if ( event.keyCode === $.ui.keyCode.TAB &&
		            $( this ).autocomplete( "instance" ).menu.active ) {
		          event.preventDefault();
		        }
		      })
		      .autocomplete({
		        minLength: 0,
		        source: function( request, response ) {
		          // delegate back to autocomplete, but extract the last term
		          response( $.ui.autocomplete.filter(
		            data.tags, extractLast( request.term ) ) );
		        },
		        focus: function() {
		          // prevent value inserted on focus
		          return false;
		        },
		        select: function( event, ui ) {
		        	console.log("4");
		          var terms = split( this.value );
		          // remove the current input
		          terms.pop();
		          // add the selected item
		          terms.push( ui.item.value );
		          // add placeholder to get the comma-and-space at the end
		          terms.push( "" );
		          this.value = terms.join( ", " );
		          return false;
		        }
		      });
		  });
		
		
		$("#createNewWhistle").unbind('click').click(function(){
			var whistle={};
			whistle.Url =$("#linkUrl").val();
			whistle.image = $(".preview_image").children('img').attr('src');
			whistle.title=$(".preview_title").html();
			whistle.description = $(".preview_description").html();
			whistle.comment= $(".new_whistle_comment").children('textarea').val();
			
			var clans = [];
			$("[name=tag_image].whistle_tag_active").each(function(){
				console.log("called");
				var clan =  $(this).parent().children(".tag_name").html();
				clans.push(clan);
			});
			whistle.clans=clans;
			//poster.saveWhistle(whistle);
			console.log(whistle);
		});
		
	}
	
	
	loadWhistles();
	updatedWhistleNotification(true,"4");
	
	
	
	$("#new_post").unbind('click').click(function(){
		var el=$("#slide_container")
		el.empty();
		$.tmpl($("#newWhistleTemplate"),{'user':data.user}).appendTo(el);
		
		if(!el.hasClass('open')){
			el.addClass('open');
			var effect = 'slide';
			var options = { direction:'right'};
			var duration = 500;
			el.toggle(effect, options, duration);
		}
		if(isChrome) {
			chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
				var curUrl = tabs[0].url;
				$(".whistle_link").children('textarea').html(curUrl);
				$(".whistle_link").children('textarea').trigger('propertychange');
			});
			bindNewPostEvent();
		}
	});
	
	$("[name=toggle_slider_left]").unbind('click').click(function(){
		var el=$("#slide_container_left");
		el.empty();
		$.tmpl($("#myWhistleTemplate"),{'user':data.user}).appendTo(el);
		$.tmpl($("#whistleItemSmallTemplate"),{'whistles':data.whistles}).appendTo(el);
		
		if(!el.hasClass('open')){
			el.addClass('open');
			var effect = 'slide';
			var options = { direction:'left'};
			var duration = 500;
			el.toggle(effect, options, duration);
		}
	});
	
	$(document).on('click','[name=whistleDetails]',function(){
		var el=$("#slide_container");
		var whistleId = $(this).attr('whistle_id');
		var whistle=data.whistles[whistleId-1];//fetcher.getWhistleDetails(whistleId);
		el.empty();
		
		$.tmpl($("#whistleDetailsTemplate"),{'whistle':whistle}).appendTo(el);
		
		if(!el.hasClass('open')){
			el.addClass('open');
			var effect = 'slide';
			var options = { direction:'right'};
			var duration = 500;
			el.toggle(effect, options, duration);
		}
	});
	  
	
	$(document).on('click',"#close_slider",function(){
		var el=$("#slide_container");
		el.removeClass('open');
		var effect = 'slide';
		var options = { direction:'right'};
		var duration = 500;
		el.hide(effect, options, duration);
	});
	$(document).on('click',".slider_close_left",function(){
		var el=$("#slide_container_left");
		el.removeClass('open');
		var effect = 'slide';
		var options = { direction:'left'};
		var duration = 500;
		el.hide(effect, options, duration);
	});
	
	$("#whistleList").children(".list_item").unbind('click').click(function(){
		$("#whistleList").children().removeClass('active');
		$(this).addClass('active');
	});
	
	$(document).on('click','.tag_container',function(){
		var obj = $(this).children("[name=tag_image]");
		if(obj.hasClass("whistle_tag")){
			obj.removeClass("whistle_tag").addClass("whistle_tag_active");
		}else{
			obj.addClass("whistle_tag").removeClass("whistle_tag_active");
		}
	});
	
	$(".list_item").on('click',".favourite",function(){
		$(this).removeClass('favourite').addClass('favourite_sel');
	})
	
	$(".list_item").on('click',".favourite_sel",function(){
		$(this).removeClass('favourite_sel').addClass('favourite');
	});
	
	
})
