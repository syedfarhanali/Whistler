var data = {};
$(document).ready(function(){
	var whistles = new Array();
	var whistle1= {
			id:1,
			title:'title1',
			image:'images/whistle-orange-logo.jpg',
			description:'We will be having all hands meeting today at 5 pm ,please be there.',
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
