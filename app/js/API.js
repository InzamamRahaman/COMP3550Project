function(){

	function getHash(hash, callback){
		$.get(' ',function(data){
			callback(data);
		});
	}
}();