// dependencies
const express = require('express');
const path = require('path')
var sessions = require("client-sessions");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
const keys = require('../keys.js')

//mLab connection and credentials
mongoose.connect(keys.mongoose);

// middleware and setup
const app = express();
// app.use(cookieParser());
app.use(bodyParser.json());

// CORS fix
app.use(function(req, res, next) {
  res.header("Access- sControl-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// routing module example
// app.use('/api', passportRoute)


/* -- copypaste -- */

// every route change, check for session and user/set user.
app.use(function(req, res, next) {
  if (req.session && req.session.user) {
    User.findOne({ email: req.session.user.email }, function(err, user) {
      if (user) {
        req.user = user;
        delete req.user.password; // delete the password from the session
        req.session.user = user;  //refresh the session value
        res.locals.user = user;
      }
      // finishing processing the middleware and run the route
      next();
    });
  } else {
    next();
  }
});

// require login
function requireLogin (req, res, next) {
  if (!req.user) {
    res.redirect('/login');
  } else {
    next();
  }
};

// example
app.get('/dashboard', requireLogin, function(req, res) {
  // res.render('dashboard.jade');
  res.send('how did you get here')
});

/*-- end copypaste -- */





app.get("*", (req, res) => (
  res.send(`it's running, yo`)
));

// temp move these later
const user_schema = mongoose.Schema({
  name: {type: String, required: true},
  email: {type: String, required: true},
  school: {type: String, required: true},
  password: {type: String, required: true}
});
const user = mongoose.model('User', user_schema);

const user_query = (q) => {
  return user.findOne({
    email: q.email
  })
}

app.post('/', (req, res) => {
  var body = req.body
  var temp = new user(body)
  user_query(body).exec((err, data) => {
    if (err) {
      throw err
    }
    if (!data) {
      temp.save((err) => {
        if (err) {
          throw err;
        }
        res.send(`Added new user with email '` + body.email + `' to mLab database`)
      })
    } else {
      //update user here
      user.update(
      {
        email: body.email
      }, 
      {
        name: body.name,
        school: body.school,
        password: body.password
      }, function (err) {
        if (err) {
          throw err;
        }
        res.send(`Updated user with email '` + body.email + `' in mLab database`)
      })
    }
  })
})

const PORT = process.env.PORT || 4000

app.listen(PORT, () => (
  console.log("Server running on port ", PORT)
))