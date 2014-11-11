var restify = require('restify');
var datastreams = [];

var server = restify.createServer();
server.use(restify.acceptParser(server.acceptable));
server.use(restify.authorizationParser());
server.use(restify.dateParser());
server.use(restify.queryParser());
server.use(restify.jsonp());
server.use(restify.gzipResponse());
server.use(restify.bodyParser());
server.pre(restify.pre.userAgentConnection());

server.get('/', respond);
server.head('/', respond);

server.get('/datastreams/', respond);
server.head('/datastreams/', respond);

server.get('/datastreams/:name', respond);
server.head('/datastreams/:name', respond);

/* is this correct? posting to a resource? or does post then redirect to
the newly created resource? */
server.post('/datastreams/:name', createDatastream);
server.put('/datastreams/:name', updateDatastream);
server.del('/datastreams/:name', deleteDatastream);

server.listen(process.env.PORT || 8080, function() {
	console.log('%s listening at %s', server.name, server.url);
});

function respond(req, res, next) {
	res.send('hello ' + req.params.name);
	next();
}

function createDatastream(req, res, next) {
	console.log( req.body );

	var obj = {
		data_fetch_method: 'POST' || req.body.data_fetch_method
		//what-to-submit: 'POST' || req.body.data_fetch_method
		/*
			what-to-submit: location | time | username
			update-interval:
				what is the expected update-interval, in
				which the hocu should check again?
				only required for data-fetch-method == GET
			nominal-range: e.g. -100 ... 100
			nominal-type: float | int 
			nominal-description: string (eur, usd)
			value: ...
			description: ...
			*/
	};
	datastreams.push(obj);
	res.send('created ' + req.params.name + "\n" +  obj.data_fetch_method );
	next();
}

function updateDatastream(req, res, next) {
	res.send('created ' + req.params.name);
	next();
}

function deleteDatastream(req, res, next) {
	res.send('created ' + req.params.name);
	next();
}
