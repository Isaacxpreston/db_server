// dependencies
const express = require('express');
const path = require('path')
const session = require('express-session');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport')
const passportRoute = require('./passport_router.js')



//mLab connection and credentials
var keys = require('../keys.js')
mongoose.connect(keys.mongoose);

// middleware and setup
const app = express();
app.use(cookieParser());
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());

// routing
app.use('/api', passportRoute)

app.get("*", (req, res) => (
  res.send('here')
));

const PORT = process.env.PORT || 4000

app.listen(PORT, () => (
  console.log("App running on port ", PORT)
))