//const ora = require("ora");
//const fs = require("fs");
//const shortid = require("shortid");
//var file = fs.createWriteStream(`startups-${shortid.generate()}.json`);
var r = require("rethinkdbdash")({
	servers: [{ host: "localhost", port: "28015"}]
});
const SseStream = require("ssestream");
const JSONStream = require("JSONStream");
const objectStream = require("object-stream");
const strStream = require("string-to-stream");

var restify = require('restify');
var errors = require('restify-errors');

function respond(req, res, next) {
	const sseStream = new SseStream(req)
	sseStream.pipe(res)
	
	const pusher = setInterval(() => {
		sseStream.write({
			event: 'server-time',
			data: new Date().toTimeString()
		})
	}, 1000);

	res.on('close', () => {
		console.log('lost connection')
		clearInterval(pusher)
		sseStream.unpipe(res)
	});
}

function startupSub(req, res, next) {
	r.db("dd").table("startups").get(req.params.id)
		.then(data => {
			if (data) {
				res.writeHead(200, { 'Content-Type': 'application/json' });
				
				/*const stream = strStream(JSON.stringify(data.companies))
					.on("error", err => {
						console.log(error);
					})
					.on("close", err => {
						res.end();
					});

				stream.pipe(res);*/
				var stringify = JSONStream.stringify();
				stringify.pipe(res, {end: true});
				
				stringify.on("error", err => {
					console.log(error);
				})

				stringify.write(data);
				stringify.end();
				res.on('finish', next);
			}
			else {
				next(new errors.NotFoundError())
			}
		})
		.catch(e => {
			console.log(e);
			next(new errors.InternalServerError())
		})
}

function startupSub2(req, res, next) {
	r.db("dd").table("startups").get(req.params.id)
		.then(data => {
			if (data) {
				res.writeHead(200, { 'Content-Type': 'application/json' });
				
				const stream = strStream(JSON.stringify(data.companies))
					.on("error", err => {
						console.log(error);
					})
					.on("close", err => {
						res.end();
					});

				stream.pipe(res);
			}
			else {
				next(new errors.NotFoundError())
			}
		})
		.catch(e => {
			console.log(e);
			next(new errors.InternalServerError())
		})
}

var server = restify.createServer();

server.get('/startup/stream1/:id', startupSub);
server.get('/startup/stream2/:id', startupSub2);
server.get('/time', respond);
server.get(/\/?.*/, restify.plugins.serveStatic({
	directory: './public',
	default: 'index.html'
}))

server.on('InternalServer', function(req, res, err, callback) {
	// this will get fired first, as it's the most relevant listener
	//return callback();
	//console.log(err);
	res.send(err);
});

server.on('restifyError', function(req, res, err, callback) {
	// this is fired second.
	//return callback();
	res.send(err);
});

server.on('uncaughtException', function(req, res, route, err) {
	// this event will be fired, with the error object from above:
	// ReferenceError: x is not defined
	console.error("fatal");
	process.exit(1);
});

//let sse;
server.listen(8131, function() {
	console.log('%s listening at %s', server.name, server.url);
});