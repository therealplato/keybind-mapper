
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , nano = require('nano')('http://localhost:5984')
  , util = require('util');

  
  var couchdb = nano.use('keymap', function(err,body){
    if(err==''){
      console.log('Missing keymap database. Creating...');
      nano.db.create('keymap', function(err,body){
        var couchdb = nano.db.use('keymap');
        console.log(err||body);
      });
    } 
  });
 
//  var couchdb = nano.use('keymap');
  /*
   * nano.db.create('keymap', function(){
    var couchdb = nano.use('keymap');
  });
  */

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname);
  app.set('view engine', 'jade');
//  app.set('view options', {layout:false});
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  //app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.newuuid = function (callback){
nano.request({db:'_uuids'}, function(err, body) {
   if(!err){ 
     var shortid=body['uuids'][0].slice(-12,-1);
     callback(null, shortid);
   } else {
     console.log('uuid error:\n'+err);
     callback(err.error);
   };
  });
};

app.post('/savemap', function(req,res){
  app.newuuid(function(err, id){
    if(err){return new Error('newuuid')};
//    console.log('REGEX '+req.body.state.match(/"'"/));
//    console.log(util.inspect(JSON.parse(req.body.state)));
//    return;
//    console.log('BEFORE STASHING\n\n'+req.body.state); 
    couchdb.insert({state:JSON.parse(req.body.state)}, id, function(err,body){
      console.log(err || body);
      res.redirect('/mapping/'+id);
    });
  });
});

app.get('/mapping/:id', function(req,res){
  console.log('getting '+req.params.id);
  couchdb.get(req.params.id, function(err,body){
//    console.log(err||body);
    if(err){return new Error('get_'+req.params.id)};
    console.log('AFTER STASHING\n\n');
//    var tmp = JSON.stringify(body.state).replace(/"/g,'\\"');
//    console.log('REGEX '+body.stateJSON.match(/"'"/));
//    var tmp = body.stateJSON.replace(/([^\\])(')/,'$1\\$2');
//    console.log('REGEX '+tmp.match(/"'"/));
//    console.log(body.stateJSON);
    res.locals.stateJSON=JSON.stringify(body.state);
//    res.locals.stateJSON=tmp;
    res.render('existing_mapping');
//    res.json(body.state);
  });
});

app.get('/', function(req,res){
  res.render('layout');
});

app.get('*', function(req,res){
  var filePath='./srv'+req.url;
  if (filePath=='./srv/')
      filePath='./srv/index.html';
  var extname = path.extname(filePath);
  var contentType='text/html';
  switch (extname) {
    case '.js':
      contentType='text/javascript';
      break;
    case '.css':
      contentType='text/css';
      break;
  };

  path.exists(filePath, function(exists) {
    if(exists) {
      fs.readFile(filePath, function (err, data) {
        if (err) {
          res.writeHead(500);
          return res.end('Error loading filePath');
        } else {
          res.writeHead(200,{'Content-Type':contentType});
          res.end(data, 'utf-8');
        };
      });
    } else {
      res.writeHead(404);
      res.end();
    };
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
