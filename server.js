var svr=require("./app");
svr.app.use(svr.express.static(__dirname + '/app'));
svr.app.listen(config.port);
startStreaming(stream);