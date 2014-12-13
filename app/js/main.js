(function(window){
	$(document).ready(function(){
		console.log("loaded");
		var socket = io.connect();
		var tags=['love','boobs','fitness','MTVStars','Follow','Christmas','Lakers'];
		socket.emit('register',{'email':'steffan_boodhoo@hotmail.com','tags':tags});
		socket.on('new tweet',function(tweet){
	 		console.log('data'+tweet);
		});
	});
}(this));