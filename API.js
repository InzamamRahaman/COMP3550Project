
function apiManager(app){

	this.getHash = app.get('/index/hash',function(req,res){
		var data=req.body.data;
		res.write(data);
	});

}

module.exports = {
    apiManager: apiManager
}