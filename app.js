const http = require('http');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var debug = require('debug')('node:server');
var elogger = require('./logger/logconfig');
//const hbs = require('hbs');
const hbs = require('express-hbs');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
var MemoryStore = require('memorystore')(session)
const methodOverride = require('method-override')
const csrf = require('csurf');
const cors = require('cors');
var cronjob = require('./services/cron');
var global = require("global");
var global1 = require("./global");


var app = express();
var port = normalizePort(process.env.PORT || '8080');
app.set('port', port);
const csrfProtection = csrf();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var patientRouter = require('./routes/patient');
var financeRouter = require('./routes/finance');
var smsRouter = require('./routes/sms');
var appmtRouter = require('./routes/apptment');

var apiPatientRouter = require('./routes/api/patient');
var apiAuthRouter = require('./routes/api/auth');
var apiCommRouter = require('./routes/api/comm');
var apiEmailRouter = require('./routes/api/email');
var apiApptRouter = require('./routes/api/apptment');
var apiCategoryRouter = require('./routes/api/category');
var apiTemplateRouter = require('./routes/api/template');
var apiSchedulerRouter = require('./routes/api/scheduler');

const IN_PRODUCITION = process.env.NODE_ENV === 'production';
const SESSION_LIFE=1000*60*60*2;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs.express3({defaultLayout: 'views/layout/apihome', partialsDir: 'views/partials'}));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({ extended: false, limit:'2mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

app.use(cookieParser());
//app.use(bodyParser.urlencoded({limit: '2mb'}));
//app.use(bodyParser.json({limit: '2mb', type: 'application/json'}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(cors());

app.use(session({
  name:process.env.SESSION_NAME,
  secret: process.env.SESSION_SECRET,
  resave:false,
  saveUninitialized:false,
  cookie:{
    maxAge:SESSION_LIFE,
    sameSite:true,
    secure:IN_PRODUCITION
  },
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
}));
//CSRF Protection
app.use(csrfProtection);
app.use(function(err, req, res, next) {
 //console.log(req.originalUrl, ' - ', req.csrfToken());
 res.locals.csrfToken = req.csrfToken();
 next();
});

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

//allow OPTIONS on all resources
app.options('*', cors());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/patient', patientRouter);
app.use('/finance', financeRouter);
app.use('/sms', smsRouter);
app.use('/appointment', appmtRouter);

app.use('/api/v1/patient', apiPatientRouter);
app.use('/api/v1/auth', apiAuthRouter);
app.use('/api/v1/comm', apiCommRouter);
app.use('/api/v1/appt', apiApptRouter);
app.use('/api/v1/email', apiEmailRouter);
app.use('/api/v1/category', apiCategoryRouter);
app.use('/api/v1/template', apiTemplateRouter);
app.use('/api/v1/scheduler', apiSchedulerRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.locals.user = req.user || null;
  res.locals.session = req.session;

    const status = err.status || err.statusCode || 500;
    const message = err.message;
    const data = err.data ? err.data : err;
    elogger.error(`message: '${message}'`);
    elogger.error(JSON.stringify(err));
    elogger.error(req.originalUrl);
    
  // render the error page
  if(req.originalUrl.indexOf('/api') >= 0){
    res.status(status).json({message:message, data: data});
    return next(); 
  }
  res.render('error', {message: req.flash(err)});
  //next();
});


var server = http.createServer(app);
console.log(process.env.PORT );
server.listen(port, () => console.log(`Justdental app is running on port ${port}!`))
server.on('error', onError);
server.on('listening', onListening);

module.exports = app;


/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
    debug('Listening on ' + bind);
    cronjob.startCronJob();
}

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
