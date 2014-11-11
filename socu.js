var restify = require('restify');
var datastreams = [];

function respond(req, res, next) {
	res.send('hello ' + req.params.name);
	next();
}

var server = restify.createServer();
server.get('/datastreams/:name', respond);
server.head('/datastreams/:name', respond);

server.listen(8080, function() {
	console.log('%s listening at %s', server.name, server.url);
});
