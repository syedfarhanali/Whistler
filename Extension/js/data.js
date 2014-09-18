var data = {};
var fetcher= {};
var poster= {};
var api = {};

api.rootUrl="http://localhost:8080/whistler/";

fetcher.getHomePageWhistles=function getHomePageWhistles(){
	$.ajax({
		url :api.rootUrl + 'whistles/home/userId/page',
		contentType : "application/json; charset=utf-8",
		async:true,
		dataType : "json",
		success : function(userRoleDTO) {}
	});	
}

fetcher.getWhistleDetails=function getWhistleDetails(){
	$.ajax({
		url :api.rootUrl + 'whistle/detail/whistleId',
		contentType : "application/json; charset=utf-8",
		async:true,
		dataType : "json",
		success : function(userRoleDTO) {}
	});	
}

fetcher.getFavouriteWhistles=function getFavouriteWhistles(){
	$.ajax({
		url :api.rootUrl + 'whistles/favourite/userId/page',
		contentType : "application/json; charset=utf-8",
		async:true,
		dataType : "json",
		success : function(userRoleDTO) {}
	});	
}

fetcher.getTopVotedWhistles=function getTopVotedWhistles(){
	$.ajax({
		url :api.rootUrl + 'whistles/topVoted/userId/page',
		contentType : "application/json; charset=utf-8",
		async:true,
		dataType : "json",
		success : function(userRoleDTO) {}
	});	
}

poster.saveWhistle=function saveWhistle(whistle){
	$.ajax({
		url :api.rootUrl + 'whistle/save',
		contentType : "application/json; charset=utf-8",
		async:true,
		dataType : "json",
		success : function(userRoleDTO) {}
	});	
}

poster.saveEvent=function saveEvent(event){
	$.ajax({
		url :api.rootUrl + 'event/save',
		contentType : "application/json; charset=utf-8",
		async:true,
		dataType : "json",
		success : function(userRoleDTO) {}
	});	
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
	
	whistle1.comments=comments;
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
	
	data.user=user;	
	data.whistles=whistles;
})
