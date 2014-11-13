var restify = require('restify');
var datastreams = {};
var socu_uri = process.env.SOCU_URI || "http://localhost:8080";

var server = restify.createServer({
	formatters: {
		'application/json': myCustomFormatJSON
	}
});
server.use(restify.bodyParser());
server.pre(restify.pre.userAgentConnection());

server.get('/', redirect);
server.head('/', redirect);

function redirect(req, res, next) {
	res.header('Location', '/api/v1');
	res.send(302);
}

server.get('/api/v1', respond);
server.head('/api/v1', respond);

server.get('/api/v1/datastreams/', respond);
server.head('/api/v1/datastreams/', respond);

server.get('/api/v1/datastreams/:name', getDatastream);
server.head('/api/v1/datastreams/:name', getDatastream);

server.post('/api/v1/datastreams/:name', createDatastream);
server.put('/api/v1/datastreams/:name', updateDatastream);
server.del('/api/v1/datastreams/:name', deleteDatastream);

server.listen(process.env.PORT || 8080, function() {
	console.log('%s listening at %s', server.name, server.url);
});

function respond(req, res, next) {
	var obj = {
		  datastreams: []
		, documentation: "https://github.com/i0b/docu"
		, api_version: "1"
		, socu_name: "exemplary-socu"
		, socu_description: "Demo instance of the SixthSense SOCU"
			+ " code from https://github.com/i0b/socu."
	};

	for (var d in datastreams) {
		var datastream_obj = datastreams[d];
		datastream_obj.name = d;
		datastream_obj.links = [{
			  rel: "self"
			, href: socu_uri + "/datastreams/" + d
		}];

		obj.datastreams.push(datastream_obj);
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


function myCustomFormatJSON(req, res, body) {
  if (!body) {
    if (res.getHeader('Content-Length') === undefined &&
        res.contentLength === undefined) {
      res.setHeader('Content-Length', 0);
    }
    return null;
  }

  if (body instanceof Error) {
    // snoop for RestError or HttpError, but don't rely on instanceof
    if ((body.restCode || body.httpCode) && body.body) {
      body = body.body;
    } else {
      body = {
        message: body.message
      };
    }
  }

  if (Buffer.isBuffer(body))
    body = body.toString('base64');

  var data = JSON.stringify(body, null, 2);

  if (res.getHeader('Content-Length') === undefined &&
      res.contentLength === undefined) {
    res.setHeader('Content-Length', Buffer.byteLength(data));
  }

  return data;
}
