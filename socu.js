var restify = require('restify');
var datastreams = {};

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

server.get('/datastreams/:name', getDatastream);

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

/* check if already exists, throw error */
function createDatastream(req, res, next) {
	console.log( req.body );

	var obj = {
		  data_fetch_method: req.body.data_fetch_method
		, what_to_submit: req.body.what_to_submit
		, update_interval: req.body.update_interval
		, nominal_range: req.body.nominal_range
		, nominal_type: req.body.nominal_type
		, nominal_description: req.body.nominal_description
		, description: req.body.description

		, recommended_nominal_mapping_range: req.body.recommended_nominal_mapping_range
		, recommended_stimulation: req.body.recommended_stimulation
	};
	datastreams[req.params.name] = obj;
	res.send('created ' + req.params.name + "\n" +  obj.data_fetch_method );
	next();
}

function getDatastream(req, res, next) {
	console.log( JSON.stringify(datastreams, null, "\t") );
	res.send( JSON.stringify(datastreams[req.params.name], null, "\t") );
	next();
}

/* this should update the whole object, not just the value */
function updateDatastream(req, res, next) {
	datastreams[req.params.name].value = req.body.value;
	res.send( datastreams[req.params.name] );
	next();
}

function deleteDatastream(req, res, next) {
	res.send('created ' + req.params.name);
	next();
}
