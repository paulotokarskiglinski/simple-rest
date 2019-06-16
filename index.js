const handlers = {};
const fs = require('fs');
const url = require('url');
const http = require('http');

handlers.status = function(data, callback) {
  callback(202, {status: true});
};

handlers._usuarios = {};
handlers.usuarios = function(data, callback) {
  fs.readFile('./libs/usuarios.json', 'utf8', function(err, usuarios) {
    if (err) {
      throw new Error(err);
    } else {
      if(['get'].indexOf(data.method) > -1){
        handlers._usuarios[data.method](usuarios, data, callback);
      } else {
        callback(405, {error: 405});
      }
    }
  });
};

handlers._usuarios.get = function(usuarios, data, callback) {
  const array = JSON.parse(usuarios);
  const parametros = typeof(data.queryParams) == 'object' && Object.keys(data.queryParams).length > 0 ? data.queryParams : false;

  if (parametros) {
    const resultados = [];
    for (data in parametros) {
      array.filter(function(usuario) {
        if (usuario[data].toString().toLowerCase() === parametros[data].toString().toLowerCase()) {
          resultados.push(usuario);
        }
      });
    }
    callback(202, resultados);    
  } else {
    callback(202, array);
  }
}

handlers._posts = {};
handlers.posts = function(data, callback) {
  fs.readFile('./libs/posts.json', 'utf8', function(err, posts) {
    if (err) {
      throw new Error(err);
    } else {
      if(['get', 'post', 'put', 'delete'].indexOf(data.method) > -1){
        handlers._posts[data.method](posts, data, callback);
      } else {
        callback(405, {error: 405});
      }
    }
  });
};

handlers._posts.get = function(posts, data, callback) {
  const array = JSON.parse(posts);
  const parametros = typeof(data.queryParams) == 'object' && Object.keys(data.queryParams).length > 0 ? data.queryParams : false;

  if (parametros) {
    const resultados = [];
    for (data in parametros) {
      array.filter(function(posts) {
        if (posts[data].toString().toLowerCase() === parametros[data].toString().toLowerCase()) {
          resultados.push(posts);
        }
      });
    }
    callback(202, resultados);
  } else {
    callback(202, array);
  }
};

handlers._posts.post = function(post, data, callback) {
  const array = JSON.parse(post);
  const item = data.body;
  const novoItem = {
    id: parseInt(item.split('&')[0].replace('id', '').replace('=', ''), 10),
    title: decodeURIComponent(item.split('&')[1].replace('title', '').replace('=', '')),
    body: decodeURIComponent(item.split('&')[2].replace('body', '').replace('=', ''))
  };

  array.push(novoItem);
  callback(202, array);
};

handlers.notFound = function(data, callback) {
	callback(404, {error: 404});
};

const router = {
  '': handlers.status,
  'usuarios': handlers.usuarios,
  'posts': handlers.posts
};

const httpServer = http.createServer(function(req, res) {
  server(req, res);
}).listen(process.env.PORT || 5000);

const server = function(req, res) {
  let body = [];
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');
  const data = {
    queryParams: parsedUrl.query,
    method: req.method.toLowerCase()
  };

  req.on('data', function(conteudo) {
    body.push(conteudo);
  }).on('end', function() {
    if (body.length > 0) {
      body = Buffer.concat(body).toString();
      data.body = body;
    }
    
    const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
    chosenHandler(data, function(statusCode, payload) {
      res.writeHead(statusCode, {'Content-Type': 'application/json'});
      res.write(JSON.stringify(payload));
      res.end();
    });
  });
}
