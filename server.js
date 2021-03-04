'use strict'

require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');


const client = new pg.Client(process.env.DATABASE_URL);
// const client = new pg.Client({ connectionString: process.env.DATABASE_URL,   ssl: { rejectUnauthorized: false } });

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.set('view engine', 'ejs');


app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.get('/movies', moviesHandiling);

app.use(express.static('./public'))

app.use(methodOverride('_method'));

app.get('/home',homeHandler);

app.get('/', (req, res) => {
  let SQL = `SELECT * FROM userinfo ORDER BY id DESC;`;
  client.query(SQL)
      .then((results) => {
          // console.log(results.rows);
          res.render('pages/index')
      })
});


app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
    let sql = 'SELECT * FROM userInfo WHERE userName =$1 AND userPass =$2;';
    let values = [username, password];
    client.query(sql, values)
      .then((results) => {
        console.log(results.rows);
        if (results.rows.length > 0) {
          request.session.loggedin = true;
          request.session.username = username;
          console.log( request.session.username)
          console.log(username,password)
          response.render('pages/hi',{ username1: username });
        }else{
        response.render('pages/sign');
      }})
	
}});



function homeHandler(res,req){
  console.log(res.session.loggedin)
  if (res.session.loggedin) {
    req.render('pages/hi' ,{ username1: res.session.username});
    	} else {
        req.render('pages/bye');
    	}
}

app.get('/sign' ,signHandler);
function signHandler(req,res){

  res.render('pages/sign');
}


app.post('/logout',logoutHandler);
function logoutHandler(req,res){
  req.session.loggedin = false;
  req.session.username = "";
  res.render('pages/index');
}


app.post('/signform', function(request, response) {
	var username = request.body.username;
  var email = request.body.email;
	var password = request.body.password;
	if (username && password && email) {
    let sql = 'SELECT * FROM userInfo WHERE userName =$1 AND userPass =$2 AND userEmail = $3 ;';
    let values = [username, password , email ];
    client.query(sql, values)
      .then((results) => {
        console.log(results.rows);
        if (results.rows.length > 0) {
          request.session.loggedin = true;
          request.session.username = username;
          username += " you already have an account in our database!!"
          response.render('pages/hi',{ username1: username });
        }else{
          let sql = 'INSERT INTO userInfo (userName, userEmail, userPass) VALUES ($1,$2,$3);';
    let values = [username, email,password];
    client.query(sql, values)
      .then((results) => {
        request.session.loggedin = true;
        request.session.username = username;
        console.log( request.session.username)
        console.log(username,password)
       
        response.render('pages/hi',{ username1: username });
      })

        }})
}});

// http://localhost:3000/movies?search_query=salad
function moviesHandiling(req, res) {
  let formated_query = req.query.search_query;
  const moviesAPIKey = process.env.MOVIE_API_KEY;
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${moviesAPIKey}&query=${formated_query}&page=1`;
  superagent
      .get(url)
      .then((data) => {
          let moviesArray = data.body.results.map((data) => {
              return new Movies(data);
          });
          res.status(200).json(moviesArray);
      })
     
}

function Movies(data) {
  this.title = data.title;
  this.overview = data.overview;
  this.average_votes = data.vote_average;
  this.total_votes = data.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/original${data.poster_path}`;
  this.popularity = data.popularity;
  this.released_on = data.release_date;
}




client.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`listening on port ${PORT}`);
        });
    });