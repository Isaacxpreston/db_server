// dependencies
const express = require('express');
const path = require('path')
var session = require("client-sessions");
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
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// routing module example
// app.use('/api', passportRoute)



/* -- copypaste -- */

app.use(session({
  cookieName: 'session',
  secret: keys.session,
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  httpOnly: true,
  secure: true,
  ephemeral: true
}));

// log user in
app.post('/login', function(req, res) {
  User.findOne({ email: req.body.email }, function(err, user) {
    if (!user) {
      res.json({unauthorized: true})
    } else {
      // check password match, then set current session to user to check against later in auth call below.
      if (req.body.password === user.password) { // should probably bcrypt here
        req.session.user = user;
        // delete password here or just don't include it.
        res.json({unauthorized: false})
      } else {
        res.json({unauthorized: true})
      }
    }
  });
});


app.get('/authenticate', function(req, res) {
  if (req.session && req.session.user) { // Check if session exists
    // lookup the user in the DB by pulling their email from the session
    User.findOne({ email: req.session.user.email }, function (err, user) {
      if (!user) {
        // if the user isn't found in the DB, reset the session info
        req.session.reset();
        res.json({unauthorized: true})
      } else {
        res.json({unauthorized: false})
        //include additional information in response (last page, etc) HERE
      }
    });
  } else {
    // fired if no session active
    res.json({unauthorized: true})
  }
});

app.get('/logout', function(req, res) {
  req.session.reset()
  res.send('Logged out.')
});


/*-- end copypaste -- */



app.get("*", (req, res) => (
  res.send(`it's running, yo`)
));

// SCHEMA temp move these later
const user_schema = mongoose.Schema({
  name: {type: String, required: true},
  email: {type: String, required: true},
  school: {type: String, required: true},
  password: {type: String, required: true}
});
const User = mongoose.model('User', user_schema);

const user_query = (q) => {
  return User.findOne({
    email: q.email
  })
}

//signup or update
app.post('/register', (req, res) => {
  var body = req.body
  var temp = new User(body)
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
      User.update(
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