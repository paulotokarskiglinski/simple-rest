const handlers = {};
const fs = require('fs');
const url = require('url');
const http = require('http');
const https = require('https');

handlers.status = function(data, callback) {
  callback(202, {status: true});
};

handlers._usuarios = {};
handlers.usuarios = function(data, callback) {
  fs.readFile(path.join(__dirname, ('/libs/usuarios.json')), 'utf8', function(err, usuarios) {
    if (err) {
      throw new Error(err);
    } else {
      const metodos = ['get'];
      if(metodos.indexOf(data.method) > -1){
        handlers._usuarios[data.method](usuarios, data, callback);
      } else {
        callback(405, {error: 405, message: "Método não permitido"});
      }
    }
  });
};

handlers._usuarios.get = function(usuarios, data, callback) {
  const array = JSON.parse(usuarios);
  const id = typeof(data.queryParams.id) == 'string' ? data.queryParams.id : false;

  if (id) {
    callback(202, array.filter(function(usuario) {
      return usuario.id.toString() === id;
    }));    
  } else {
    callback(202, array);
  }
}

handlers.notFound = function(data, callback) {
	callback(404, {error: 404});
};

const router = {
  '': handlers.status,
	'usuarios': handlers.usuarios,
};
const httpServer = http.createServer(function(req, res) {
  server(req, res);
}).listen(process.env.PORT || 5000);
/* REMOVE THE COMMENT TO RUN THIS ON LOCALHOST
httpsServerOptions = {
  'key': fs.readFileSync(path.join(__dirname, '/https/key.pem')),
	'cert': fs.readFileSync(path.join(__dirname, '/https/cert.pem'))
};
const httpsServer = https.createServer(httpsServerOptions, function(req, res) {
  server(req, res);
}).listen(process.env.PORT || 6000);
*/

const server = function(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');
  const data = {
    queryParams: parsedUrl.query,
    method: req.method.toLowerCase()
  };

  const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
  chosenHandler(data, function(statusCode, payload) {
    res.writeHead(statusCode, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(payload));
    res.end();
  });
}
