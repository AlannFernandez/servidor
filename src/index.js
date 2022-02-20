require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const http = require('http');
const app = express();
const server = http.Server(app);
const { database } = require('./keys');
const { getFips } = require('crypto');
const cors = require('cors');


app.use(cors());


// Intializations

require('./lib/passport');

// Settings
app.set('port', process.env.PORT || 2000);


// Middlewares
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(session({
  secret: 'merakiTokenSession',
  resave: false,
  saveUninitialized: false,
  store: new MySQLStore(database)
}));


app.use(passport.initialize());
app.use(passport.session());
// app.use(validator());




// Global variables
app.use((req, res, next) => {  
  app.locals.user = req.user;
  next();
});

// Routes
app.use(require('./routes/index'));
app.use(require('./routes/authentication'));
// app.use('/links', require('./routes/links'));



// Public
app.use(express.static(path.join(__dirname, 'public')));

// Starting
app.listen(app.get('port'), () => {
  console.log('Server is in port', app.get('port'));
});
