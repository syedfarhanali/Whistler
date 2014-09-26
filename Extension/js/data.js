var data = {};
var fetcher= {};
var poster= {};
var api = {};
var config = {};
var isChrome = window.chrome;
api.rootUrl="http://localhost:8080/";


config.CURRENT_USER_ID=1;
config.WHISTLE_LIST_SIZE=11;


config.showLoadingNew = function showLoadingNew(){
	$(".new_whistle_loading").show();
}
config.hideLoadingNew = function hideLoadingNew(){
	$(".new_whistle_loading").hide();
}

function processAjaxResponse(response){
	if(response.status=="SUCCESS"){
		return response.body;
	}else{
		alert(response.message);
	}
}
fetcher.getHomePageWhistles=function getHomePageWhistles(userId,page){
	var returnData;
	$.ajax({
		url :api.rootUrl +'whistle/shared/'+userId+'/'+page,
		contentType : "application/json; charset=utf-8",
		async:false,
		type:"GET",
		dataType : "json",
		success : function(whistles) {
			returnData = processAjaxResponse(whistles);
			return returnData;
		}
	});	
	return returnData;
}

fetcher.getMyWhistles=function getMyWhistles(userId,page){
	var returnData;
	$.ajax({
		url :api.rootUrl +'whistle/mine/'+userId+'/'+page,
		contentType : "application/json; charset=utf-8",
		async:false,
		type:"GET",
		dataType : "json",
		success : function(whistles) {
			returnData = processAjaxResponse(whistles);
			return returnData;
		}
	});	
	return returnData;
}

fetcher.getMyClans=function getMyClans(userId){
	var returnData;
	$.ajax({
		url :api.rootUrl + 'clan/my/'+userId,
		contentType : "application/json; charset=utf-8",
		async:false,
		type:"GET",
		dataType : "json",
		success : function(myclans) {
			returnData = processAjaxResponse(myclans);
			return returnData;
		}
	});	
	return returnData;
}

poster.saveWhistle=function saveWhistle(whistle){
	var returnData;
	$.ajax({
		url :api.rootUrl + 'whistle/save',
		contentType : "application/json; charset=utf-8",
		async:true,
		dataType : "json",
		type:"POST",
		data:JSON.stringify(whistle),
		success : function(whistle) {
			config.hideLoadingNew();
			if(whistle.status=="FAILURE"){
				alert("Whistle could not be posted, please try again later.");
			}else{
				//alert("Whistle posted successfully.");
				$("#close_slider").click();
				returnData = processAjaxResponse(whistles);
				return returnData;
			}
		}
	});
	return returnData;
}

/********************NOT USED*******************************/

fetcher.getWhistleDetails=function getWhistleDetails(){
	var returnData;
	$.ajax({
		url :api.rootUrl + 'whistle/detail/whistleId',
		contentType : "application/json; charset=utf-8",
		async:false,
		type:"GET",
		dataType : "json",
		success : function(details) {
			returnData = processAjaxResponse(details);
			return returnData;
		}
	});	
	return returnData;
}

fetcher.getFavouriteWhistles=function getFavouriteWhistles(){
	var returnData;
	$.ajax({
		url :api.rootUrl + 'whistles/favourite/userId/page',
		contentType : "application/json; charset=utf-8",
		async:true,
		type:"GET",
		dataType : "json",
		success : function(whistles) {
			returnData = processAjaxResponse(whistles);
			return returnData;
		}
	});	
	return returnData;
}

fetcher.getTopVotedWhistles=function getTopVotedWhistles(){
	var returnData;
	$.ajax({
		url :api.rootUrl + 'whistles/topVoted/userId/page',
		contentType : "application/json; charset=utf-8",
		async:true,
		type:"GET",
		dataType : "json",
		success : function(whistles) {
			returnData = processAjaxResponse(whistles);
			return returnData;
		}
	});	
	return returnData;
}

poster.saveEvent=function saveEvent(event){
	var returnData;
	$.ajax({
		url :api.rootUrl + 'event/save',
		contentType : "application/json; charset=utf-8",
		async:true,
		dataType : "json",
		type:"POST",
		success : function(event){
			returnData = processAjaxResponse(event);
			return returnData;
		}
	});	
	return returnData;
}

$(document).ready(function(){
	var whistles = new Array();
	var whistle1= {
			id:1,
			title:'title1',
			image:'images/whistle-orange-logo.jpg',
			description:'We will be having all hands meeting today at 5 pm ,please be there.We will be having all hands meeting today at 5 pm ,please be there.',
			upvote:12,
			downvote:1};
	
	
	var comment1 = {
			text:"Where is the meeting?"
	};
	var comment2 = {
			text:"Its on the 4 the floor?"
	}
	var comment3 = {
			text:"Are the snacks gonna be there?"
	}
	var comment4 = {
			text:"Absolutely!! :)"
	}
	var comments = new Array();
	comments.push(comment1);
	comments.push(comment2);
	comments.push(comment3);
	comments.push(comment4);
	comments.push(comment4);
	comments.push(comment4);
	comments.push(comment4);
	comments.push(comment4);
	comments.push(comment4);
	comments.push(comment4);
	
	whistle1.comments=comments;
	whistles.push(whistle1);
	whistles.push(whistle1);
	whistles.push(whistle1);
	whistles.push(whistle1);
	whistles.push(whistle1);
	whistles.push(whistle1);
	whistles.push(whistle1);
	whistles.push(whistle1);
	whistles.push(whistle1);
	whistles.push(whistle1);
	whistles.push(whistle1);
	whistles.push(whistle1);
	
	var whistle2= {
			id:2,
			title:'title2',
			image:'images/whistle-orange-logo.jpg',
			description:'This is an amazing java article please read it, also share your views if you like it, Thanks!!',
			upvote:120,
			downvote:0};
	whistles.push(whistle2);
	
	
	var user={};
	user.id=1,
	user.firstName="Farhan Ali";
	user.lastName="Syed"
		
		
	var availableTags = [
	                     "Gurpreet",
	                     "Farhan",
	                     "Suyash",
	                   ];	
	
	data.tags=availableTags;
	data.user=user;	
	data.whistles=whistles;
	
	config.CURRENT_USER=user;
})
