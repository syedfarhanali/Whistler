$(document).ready(function(){
	
	function loadWhistles(userId,page){
		var whistles = fetcher.getHomePageWhistles(userId,page);
		if(!whistles || (whistles && whistles.length<config.WHISTLE_LIST_SIZE)){
			$("#homeViewmore").hide();
		}
		$.tmpl($("#whistleItemTemplate"),{'whistles':whistles}).appendTo($("#whistleList"));
		bindViewMore();
	}
	
	function bindViewMore(){
		$("#homeViewmore").unbind('click').click(function(){
			var currentPage= parseInt($(this).attr('page'));
			var nextPage=currentPage+1;
			$(this).attr('page',nextPage);
			loadWhistles(config.CURRENT_USER_ID,nextPage);
		});
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
	
	function bindNewPostEvent(suggestedClans){
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
		 
			$("#newCustomTags").bind( "keydown", function( event ) {
					if ( event.keyCode === $.ui.keyCode.TAB &&
						$( this ).autocomplete( "instance" ).menu.active ) {
						event.preventDefault();
					}
				}).autocomplete({
					minLength: 0,
					source: function( request, response ) {
						response( $.ui.autocomplete.filter(
							suggestedClans, extractLast( request.term ) ) );
					},
					focus: function() {
						return false;
					},
					select: function( event, ui ) {
						$("#newCustomTags").val(ui.item.label);
						console.log(ui.item.value);
						
						return false;
					}
				});
			});
		
		
		$("#createNewWhistle").unbind('click').click(function(){
			config.showLoadingNew();
			var whistle={};
			whistle.userId=config.CURRENT_USER_ID;
			whistle.url =$("#linkUrl").val();
			whistle.image = $(".preview_image").children('img').attr('src');
			whistle.title=$(".preview_title").html();
			whistle.description = $(".preview_description").html();
			whistle.comment= $(".new_whistle_comment").children('textarea').val();
			
			var clans = [];
			var customClans=$("#newCustomTags").val();
			if(customClans & customClans.length>0){
				clans=customClans.split(",");
			}
			
			$("[name=tag_image].whistle_tag_active").each(function(){
				var clan =	$(this).parent().children(".tag_name").attr("clanId");
				clans.push(clan);
			});
			whistle.clanIds=clans;
			poster.saveWhistle(whistle);
		});
		
	}
	
	var userId=1;
	var page=1
	loadWhistles(userId,page);
	updatedWhistleNotification(true,"4");
	
	
	
	$("#new_post").unbind('click').click(function(){
		var clans = fetcher.getMyClans(config.CURRENT_USER_ID);
		var topClans = clans.slice(0,3);
		var suggestedClans = topClans;//clans.slice(2,clans.length);
		var el=$("#slide_container")
		el.empty();
		$.tmpl($("#newWhistleTemplate"),{'user':config.CURRENT_USER,'topClans':topClans}).appendTo(el);
		
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
			bindNewPostEvent(suggestedClans);
		}
	});
	
	$("[name=toggle_slider_left]").unbind('click').click(function(){
		var el=$("#slide_container_left");
		el.empty();
		var whistles = fetcher.getMyWhistles(config.CURRENT_USER_ID,1);
		$.tmpl($("#myWhistleTemplate"),{'user':config.CURRENT_USER}).appendTo(el);
		$.tmpl($("#whistleItemSmallTemplate"),{'whistles':whistles}).appendTo(el);
		
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
		$("#close_slider").click();
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
