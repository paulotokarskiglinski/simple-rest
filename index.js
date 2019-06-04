const url = require('url');
const http = require('http');
const StringDecoder = require('string_decoder').StringDecoder;
const handlers = {};

handlers.sample = function(callback) {
	callback(406, { name: 'sample handler'});
};

handlers.notFound = function(callback) {
	callback(404, { error: 404 });
};

const router = {
	'sample': handlers.sample,
	'ping': handlers.ping
};

const httpsServer = http.createServer(function(req, res) {
    var parsedUrl = url.parse(req.url, true);
    var method = req.method.toLowerCase();
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');
    
    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
    chosenHandler(function(statusCode, payload) {
        res.writeHead(statusCode, {'Content-Type': 'application/json'});
        res.write(JSON.stringify(payload));
        res.end();
    });
}).listen(5000);
