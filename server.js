var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var cors = require('cors');
var app = express();
var ConnectionPool = require('tedious-connection-pool');
var configDB = require('./server/config/database');
var poolConfig = {
  min: 10,
  max: 15,
  log: true
};

var pool = new ConnectionPool(poolConfig, configDB());
pool.on('error', function (err) {
  console.error(err);
});
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', path.resolve(__dirname, 'client', 'views'));
app.get('/', function (req, res) {
  res.render('index');
});
app.use('/client', express.static('client'));
var port = process.env.PORT || 4500;
var dashboard = express.Router();
require('./server/routes/dashboard/dashboardRoutes.js')(dashboard, pool);
app.use('/dashboard', dashboard);
require('./server/routes/login/loginRoutes.js')(dashboard, pool);
app.use('/login', dashboard);
require('./server/routes/container/containerRoutes.js')(dashboard, pool);
app.use('/container', dashboard);
app.listen(port, function (req, res) {
  console.log('server is running on port ' + port);
});
