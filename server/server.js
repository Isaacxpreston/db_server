// dependencies
const express = require('express');
const path = require('path')
const session = require('express-session');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport')
// const passportRoute = require('./passport_router.js')
const keys = require('../keys.js')

//mLab connection and credentials
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

// CORS fix
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// routing
// app.use('/api', passportRoute)

app.get("*", (req, res) => (
  res.send(`it's running, yo`)
));

// temp move later
const user_schema = mongoose.Schema({
  name: {type: String, required: true},
  email: {type: String, required: true},
  school: {type: String, required: true},
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
        console.log('registered user', temp);
        res.send('saved to mLab database')
      })
    } else {
      //update user here
      user.update(
      {
        email: body.email
      }, 
      {
        name: body.name,
        school: body.school
      }, function (err) {
        if (err) {
          throw err;
        }
        console.log('updated user', temp);
        res.send('updated school to mLab database')
      })
    }
  })
})

const PORT = process.env.PORT || 4000

app.listen(PORT, () => (
  console.log("Server running on port ", PORT)
))