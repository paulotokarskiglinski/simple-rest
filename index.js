const fs = require('fs');
const url = require('url');
const http = require('http');
const https = require('https');
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

const httpServer = http.createServer(function(req, res) {
	server(req, res);
}).listen(process.env.NODE_ENV || 5000);

httpsServerOptions = {
	'key': fs.readFileSync('./https/key.pem'),
	'cert': fs.readFileSync('./https/cert.pem')
};
const httpsServer = https.createServer(httpsServerOptions, function(req, res) {
	server(req, res);
}).listen(process.env.NODE_ENV || 433);

const server = function(req, res) {
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
}
