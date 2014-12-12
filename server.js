var svr=require("./app.js");
svr.app.use(svr.express.static(__dirname + '/app'));
svr.app.listen(config.port);
startStreaming(stream);