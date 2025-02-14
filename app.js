var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//var apikey = require('./config/apikey');

// AUTHENTICATION MODULES
session = require("express-session"),
bodyParser = require("body-parser"),
User = require( './models/User' ),
flash = require('connect-flash')
// END OF AUTHENTICATION MODULES

const mongoose = require( 'mongoose' );
const MONGOLAB_ONYX_URI = 'mongodb://heroku_shhwd4lb:qmmab0sk7ms02kt3mvk4bqtfnr@ds149616.mlab.com:49616/heroku_shhwd4lb'
const MONGOLAB_GREEN_URI = 'mongodb://heroku_m0gs3wzq:15caahgqgedl9ioi4o747stjot@ds243607.mlab.com:43607/heroku_m0gs3wzq'

var uristring =
    MONGOLAB_ONYX_URI ||
    process.env.MONGOLAB_ONYX_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://localhost/mydb';

    // Makes connection asynchronously.  Mongoose will queue up database
    // operations and release them when the connection is complete.
    mongoose.connect(uristring, function (err, res) {
      if (err) {
      console.log ('ERROR connecting to: ' + uristring + '. ' + err);
      } else {
      console.log ('Succeeded connected to: ' + uristring);
      }
    });


//mongoose.connect( 'mongodb://localhost/mydb', { useNewUrlParser: true } );
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we are connected!!!")
});

const commentController = require('./controllers/commentController')
const profileController = require('./controllers/profileController')
const forumPostController = require('./controllers/forumPostController')
const noteController = require('./controllers/noteController')
const historyController = require('./controllers/historyController')
const likecontroller = require('./controllers/likecontroller')


const isbnController = require('./controllers/isbnController')
const apiController = require('./controllers/apiController')
// Authentication
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
// here we set up authentication with passport
const passport = require('passport')
const configPassport = require('./config/passport')
configPassport(passport)


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



/*************************************************************************
     HERE ARE THE AUTHENTICATION ROUTES
**************************************************************************/

app.use(session(
  { secret: 'zzbbyanana',
    resave: false,
    saveUninitialized: false }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: false }));



const approvedLogins = ["tjhickey724@gmail.com","csjbs2018@gmail.com"];

// here is where we check on their logged in status
app.use((req,res,next) => {
  res.locals.title="LegUp"
  res.locals.loggedIn = false
  if (req.isAuthenticated()){
      console.log("User has been authenticated.")
      res.locals.user = req.user
      res.locals.loggedIn = true
    }
  else {
    res.locals.loggedIn = false
  }
  next()
})



// here are the authentication routes

app.get('/loginerror', function(req,res){
  res.render('loginerror',{})
})

app.get('/login', function(req,res){
  res.render('login',{})
})



// route for logging out
app.get('/logout', function(req, res) {
        req.session.destroy((error)=>{console.log("Error in destroying session: "+error)});
        console.log("session has been destroyed")
        req.logout();
        res.redirect('/');
    });


// =====================================
// GOOGLE ROUTES =======================
// =====================================
// send to google to do the authentication
// profile gets us their basic information including their name
// email gets their emails
app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));


app.get('/login/authorized',
        passport.authenticate('google', {
                successRedirect : '/',
                failureRedirect : '/loginerror'
        })
      );


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    console.log("checking to see if they are authenticated!")
    // if user is authenticated in the session, carry on
    res.locals.loggedIn = false
    if (req.isAuthenticated()){
      console.log("user has been Authenticated")
      res.locals.loggedIn = true
      return next();
    } else {
      console.log("user has not been authenticated...")
      res.redirect('/login');
    }
}

// we require them to be logged in to see their profile
app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile')
    });

app.get('/editProfile',isLoggedIn, (req,res)=>{
  res.render('editProfile')
})

app.get('/profiles', isLoggedIn, profileController.getAllProfiles);
app.get('/showProfile/:id', isLoggedIn, profileController.getOneProfile);


app.post('/updateProfile',profileController.update)

// add page for editProfile and views
// add router for updateProfile and send browser to /profie

// END OF THE AUTHENTICATION ROUTES

app.use(function(req,res,next){
  console.log("about to look for routes!!!")
  //console.dir(req.headers)
  next()
});


app.get('/', function(req, res, next) {
  res.render('index',{title:"LegUp"});
});

app.get('/History',historyController.getAllMovieRatings)


app.get('/forum',forumPostController.getAllForumPosts)

app.post('/forum',forumPostController.saveForumPost)

app.post('/forumDelete',forumPostController.deleteForumPost)

app.get('/showPost/:id',
        forumPostController.attachAllForumComments,
        forumPostController.showOnePost)

app.post('/saveForumComment',forumPostController.saveForumComment)




app.get('/griddemo', function(req, res, next) {
  res.render('griddemo',{title:"Grid Demo"});
});

app.get('/dov', (req, res) => {
  res.render('dov',{title:"dov"});
});

app.get('/jackA', (req, res) => {
  res.render('jackA',{title:"jackA"});
});

app.get('/jackF', (req, res) => {
  res.render('jackF',{title:"jackF"});
});

app.get('/jason', (req, res) => {
  res.render('jason',{title:"jason"});
});

app.get('/william', (req, res) => {
  res.render('william',{title:"william"});
});

app.get('/zone', (req, res) => {
  res.render('zone',{title:"zone"});
});



app.get('/English', (req, res) => {
  res.render('English',{title:"English"});
});

app.get('/Language', (req, res) => {
  res.render('Language',{title:"Language"});
});

app.get('/math', (req, res) => {
  res.render('math',{title:"math"});
});

app.get("/mathTextBooks/algebra", (req, res) => {
  res.render('mathTextBooks/algebra',{title:"algebra"});
});

app.get("/mathTextBooks/generalAlgebra", (req, res) => {
  res.render('mathTextBooks/generalAlgebra',{title:"generalAlgebra"});
});

app.get("/mathTextBooks/algebra2", (req, res) => {
  res.render('mathTextBooks/algebra2',{title:"algebra2"});
});

app.get("/mathTextBooks/geometry", (req, res) => {
  res.render('mathTextBooks/geometry',{title:"geometry"});
});

app.get("/mathTextBooks/precalc", (req, res) => {
  res.render('mathTextBooks/precalc',{title:"precalc"});
});

app.get("/mathTextBooks/stats", (req, res) => {
  res.render('mathTextBooks/stats',{title:"stats"});
});

app.get("/mathTextBooks/calc", (req, res) => {
  res.render('mathTextBooks/calc',{title:"calc"});
});


app.get('/discord', (req, res) => {
  res.render('Discord',{title:"discord"});
});

app.get("/historyTextBooks/americanStudies", (req, res) => {
  res.render('historyTextBooks/americanStudies',{title:"history"});
});

app.get("/historyTextBooks/econ", (req, res) => {
  res.render('historyTextBooks/econ',{title:"history"});
});

app.get("/historyTextBooks/geo", (req, res) => {
  res.render('historyTextBooks/geo',{title:"history"});
});

app.get("/historyTextBooks/gov", (req, res) => {
  res.render('historyTextBooks/gov',{title:"history"});
});

app.get("/historyTextBooks/worldCiv", (req, res) => {
  res.render('historyTextBooks/worldCiv',{title:"history"});
});

app.get("/englishTextBooks/americanLiterature", (req, res) => {
  res.render('englishTextBooks/americanLiterature',{title:"english"});
});

app.get("/englishTextBooks/apLanguage", (req, res) => {
  res.render('englishTextBooks/apLanguage',{title:"english"});
});

app.get("/englishTextBooks/apLiterature", (req, res) => {
  res.render('englishTextBooks/apLiterature',{title:"english"});
});

app.get("/englishTextBooks/worldLiterature", (req, res) => {
  res.render('englishTextBooks/worldLiterature',{title:"english"});
});

app.get("/scienceTextBooks/bio", (req, res) => {
  res.render('scienceTextBooks/bio',{title:"science"});
});

app.get("/scienceTextBooks/chem", (req, res) => {
  res.render('scienceTextBooks/chem',{title:"science"});
});

app.get("/scienceTextBooks/cs", (req, res) => {
  res.render('scienceTextBooks/cs',{title:"science"});
});

app.get("/scienceTextBooks/environmentalScience", (req, res) => {
  res.render('scienceTextBooks/environmentalScience',{title:"science"});
});

app.get("/scienceTextBooks/physics", (req, res) => {
  res.render('scienceTextBooks/physics',{title:"science"});
});

app.get("/languageTextbooks/french", (req, res) => {
  res.render('languageTextbooks/french',{title:"language"});
});

app.get("/languageTextbooks/spanish", (req, res) => {
  res.render('languageTextbooks/spanish',{title:"language"});
});

app.get("/languageTextbooks/latin", (req, res) => {
  res.render('languageTextbooks/latin',{title:"language"});
});

app.get("/languageTextbooks/mandarin", (req, res) => {
  res.render('languageTextbooks/mandarin',{title:"language"});
});

const axios = require("axios")
const util = require("util")
app.get("/apitest",(req,res) =>{
  axios.get("https://www.googleapis.com/books/v1/volumes?q=Harry+Potter")
  .then((result)=>{

    console.dir(result.data)
    res.send(result.data)
  })
  .catch((error)=>{
    res.send("apitest error = "+error)
  })
})

// myform demo ...

app.get('/myform', function(req, res, next) {
  res.render('myform',{title:"Form Demo"});
});

app.get('/science', function(req, res, next) {
  res.render('science',{title:"Note Demo"});
});

app.post('/processform', commentController.saveComment)


app.post('/findISBN', isbnController.findISBN)
app.post('/findBook', apiController.findBook)
app.get('/showBook/:id', apiController.ShowOneBook)
app.post('/processBook', apiController.saveBook)
app.post('/processLike', likecontroller.saveLike)
//app.post('/processdisLike', likecontroller.savedisLike)



app.get('/showComments', commentController.getAllComments)
// app.use('/', indexRouter);  // this is how we use a router to handle the / path
// but here we are more direct

app.get('/showComment/:id', commentController.getOneComment)
//ALL NOTES SYSTEMS
app.get('/showNote/:id', noteController.getOneNote)
app.get('/showNotes', noteController.getAllNotes)
app.post('/processnote', noteController.saveNote)

app.get('/noteform', function(req, res, next) {
  res.render('noteform',{title:"Note"});
});
app.get('/notesmain', function(req, res, next) {
  res.render('notesmain',{title:"Notesmain"});
});
//ALL BOOK SYSTEMS


function processFormData(req,res,next){
  res.render('formdata',
     {title:"Form Data",url:req.body.url, coms:req.body.theComments})
}





// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
