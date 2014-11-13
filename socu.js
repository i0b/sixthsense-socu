var restify = require('restify');
var datastreams = {};

var server = restify.createServer();
server.use(restify.bodyParser());
server.pre(restify.pre.userAgentConnection());

server.get('/', respond);
server.head('/', respond);

server.get('/datastreams/', respond);
server.head('/datastreams/', respond);

server.get('/datastreams/:name', getDatastream);
server.head('/datastreams/:name', getDatastream);

server.post('/datastreams/:name', createDatastream);
server.put('/datastreams/:name', updateDatastream);
server.del('/datastreams/:name', deleteDatastream);

server.listen(process.env.PORT || 8080, function() {
	console.log('%s listening at %s', server.name, server.url);
});

function respond(req, res, next) {
	var obj = {
		  datastreams: {}
		, documentation: "https://github.com/sixthsenseproject/docu"
		, api_version: "0.1"
		, socu_name: "exemplary-socu"
		, socu_description: "Exemplary SOCU using the code from "
			+ "https://github.com/sixthsenseproject/socu."
	};

	for (var d in datastreams) {
		var foo = datastreams[d];
		foo.href = "/datastreams/" + d;
		obj.datastreams[d] = foo;
	}

	res.json(obj);
	next();
}

function createDatastream(req, res, next) {
	if (datastreams[req.params.name]) {
		return next(new restify.errors.ConflictError(
			"Resource already exists"));
	}

	var obj = {
		  data_fetch_method: req.body.data_fetch_method
		, what_to_submit: req.body.what_to_submit
		, update_interval: req.body.update_interval
		, nominal_range: req.body.nominal_range
		, nominal_type: req.body.nominal_type
		, nominal_description: req.body.nominal_description
		, description: req.body.description
		, value: req.body.value
		, default_value: req.body.default_value

		, recommended_nominal_mapping_range: req.body.recommended_nominal_mapping_range
		, recommended_stimulation: req.body.recommended_stimulation
	};
	datastreams[req.params.name] = obj;
	res.send(201, datastreams[req.params.name]);
	next();
}

function getDatastream(req, res, next) {
	res.json(datastreams[req.params.name]);
	next();
}

function updateDatastream(req, res, next) {
	datastreams[req.params.name].value = req.body.value;
	res.json(datastreams[req.params.name]);
	next();
}

function deleteDatastream(req, res, next) {
	res.send(404);
	next();
}
