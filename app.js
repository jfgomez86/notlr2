//setup Dependencies//{{{
require(__dirname + "/lib/setup")
.ext( __dirname + "/")
.ext( __dirname + "/lib")
.ext( __dirname + "/lib/express/support")
.ext( __dirname + "/lib/mongoose");

var connect = module.exports.connect  = require('connect')
, express   = module.exports.express  = require('express')
, mongoose  = module.exports.mongoose = require('mongoose').Mongoose
, db        = global.db               = mongoose.connect('mongodb://localhost/notlr')
, sys       = require('sys')
, io        = require('Socket.IO-node')
, port      = 4567;//}}}


//Setup Express//{{{
var app = express.createServer();
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.use(express.methodOverride());
  app.use(express.bodyDecoder());
  app.use(express.staticProvider(__dirname + '/static'));
  app.use(express.compiler({ src: __dirname + '/static', enable: ['less'] }));
  app.use("/", require("controllers/notes"));
  app.use(app.router);
});//}}}

//Setup the errors//{{{
app.error(function(err, req, res, next){
  if (err instanceof NotFound) {
    res.render(__dirname + '/views/404.ejs', {
      locals: {
        header: '#Header#'
        ,footer: '#Footer#'
        ,title : '404 - Not Found'
        ,description: ''
        ,author: ''
        ,analyticssiteid: 'XXXXXXX'
      },
      status: 404
      ,layout: __dirname + "/views/layout.jade"
    });
  } else {
    res.render(__dirname + '/views/500.ejs', {
      locals: {
        header: '#Header#'
        ,footer: '#Footer#'
        ,title : 'The app Encountered an Error'
        ,description: ''
        ,author: ''
        ,analyticssiteid: 'XXXXXXX'
        ,error: err
      },
      status: 500
      ,layout: __dirname + "/views/layout.jade"
    });
  }
});//}}}

app.listen(port);

//Setup Socket.IO//{{{
var io = io.listen(app);
io.on('connection', function(client){
  console.log('Client Connected');
  client.on('message', function(message){
    client.broadcast(message);
    client.send(message);
  });
  client.on('disconnect', function(){
    console.log('Client Disconnected.');
  });
});//}}}


//Routes//{{{

//A Route for Creating a 500 Error (Useful to keep around)
app.get('/500', function(req, res){
  throw new Error('This is a 500 Error');
});

//The 404 Route (ALWAYS Keep this as the last route)
app.get('/*', function(req, res){
  throw new NotFound;
});

function NotFound(msg){
  this.name = 'NotFound';
  Error.call(this, msg);
  Error.captureStackTrace(this, arguments.callee);
}//}}}


console.log('Listening on http://0.0.0.0:' + port );
// vim: set foldmethod=marker:
