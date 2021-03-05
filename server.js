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

// app.get('/home', function(request, response) {
// 	if (request.session.loggedin) {
// 		response.send('Welcome back, ' + request.session.username + '!');
// 	} else {
// 		response.send('Please login to view this page!');
// 	}
// 	response.end();
// });

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

app.post('/signform', function(request, response) {
	var username = request.body.username;
  var email = request.body.email;
	var password = request.body.password;
	if (username && password && email) {
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
	
}});

//..................................................................................recipe part
app.get('/searches',(req,res)=>{
  res.render('./pages/recipe');
})

app.post('/recipeSearch' , handleRecipeSearch);

function handleRecipeSearch(req, res) {
  let recipeSearchWord = req.body.recipeSearch;

  let RECIPE_APPKey = process.env.RECIPE_APP_KEY;

  let RECIPE_APPID = process.env.RECIPE_APPID;
  
  let url = `https://api.edamam.com/search?q=${recipeSearchWord}&app_id=${RECIPE_APPID}&app_key=${RECIPE_APPKey}`;

  console.log(url);

  superagent.get(url).then (results => {

 
      let recipeData = results.body.hits;
      console.log(recipeData);
       
      let recipeArr = recipeData.map(value =>{

          const recipeObject = new Recipe(value.recipe);
          return recipeObject;
      })
      console.log(recipeArr);

      res.render('./pages/recipeResult', {recipeArray:recipeArr});
  })
}


//........................................
app.post('/caloriesMeal' , handleCaloriesSearch);

function handleCaloriesSearch(req, res) {
  let caloriesSearch0 = req.body.caloriesSearch;

  let apiKey = process.env.apiKey;

  // let url = `https://api.spoonacular.com/mealplanner/generate?apiKey=${apiKey}&timeFrame=day&targetCalories=${caloriesSearch0}`;
  let url = `https://api.spoonacular.com/recipes/complexSearch?maxCalories=${caloriesSearch0}&apiKey=${apiKey}`

  console.log(url);

  superagent.get(url).then (results => {
      let caloriesDataMeals = results.body.results;
      let caloriesMealsArr = caloriesDataMeals.map(value =>{
          return value.id;
      })
      console.log(caloriesMealsArr);

      let arr =[];
      let count = 0;
      let mealsArr = caloriesMealsArr.map(value =>{
        let mealsUrl = `https://api.spoonacular.com/recipes/${value}/information?apiKey=${apiKey}&includeNutrition=false`;
        superagent.get(mealsUrl).then(results => {

          let mealsData = results.body;
              const mealsObject = new Meal(mealsData);
              arr.push(mealsObject);
              console.log(count);
              count++;
              if(caloriesMealsArr.length === count){
          res.render('./pages/caloriesPageResult', {mealsArray:arr});
        }
      })
      })
  })
}

//........................
app.post('/caloriesForDay' , handleCaloriesForDay);

function handleCaloriesForDay(req, res) {
  let caloriesSearch0 = req.body.caloriesDaySearch;

  let apiKey = process.env.apiKey;

  let url = `https://api.spoonacular.com/mealplanner/generate?apiKey=${apiKey}&timeFrame=day&targetCalories=${caloriesSearch0}`;
  // let url = `https://api.spoonacular.com/recipes/complexSearch?maxCalories=${caloriesSearch0}&apiKey=cb1c464d94f142c08b156c5beddade8b`

  console.log(url);

  superagent.get(url).then (results => {

      let caloriesData0 = results.body.nutrients.calories;
      let caloriesData1 = results.body.nutrients.protein;
      let caloriesData2 = results.body.nutrients.fat;
      let caloriesData3 = results.body.nutrients.carbohydrates;

      console.log(caloriesData0,caloriesData1,caloriesData2,caloriesData3);

      let caloriesDataMeals = results.body.meals;
       
      let caloriesMealsArr = caloriesDataMeals.map(value =>{
          return value.id;
      })
      console.log(caloriesMealsArr);

      let arr =[];
      let count = 0;
      let mealsArr = caloriesMealsArr.map(value =>{
        let mealsUrl = `https://api.spoonacular.com/recipes/${value}/information?apiKey=${apiKey}&includeNutrition=false`;
        superagent.get(mealsUrl).then(results => {

          let mealsData = results.body;
              const mealsObject = new Meal(mealsData);
              arr.push(mealsObject);
              console.log(count);
              count++;
              if(caloriesMealsArr.length === count){
          res.render('./pages/caloriesDayResult', {mealsForDayArray:arr});
        }
      })
      })
  })
}

//..............................

app.post('/searches/new' , handleSearch);

function handleSearch(req, res) {
  let searchWay = req.body.searchWay;

  let apiKey = process.env.apiKey;

  // let url = `https://api.spoonacular.com/mealplanner/generate?apiKey=${apiKey}&timeFrame=day&targetCalories=${caloriesSearch0}`;
  let url = `https://api.spoonacular.com/recipes/complexSearch?type=${searchWay}&apiKey=${apiKey}`

  console.log(url);

  superagent.get(url).then (results => {


      let caloriesDataMeals = results.body.results;
      let caloriesMealsArr = caloriesDataMeals.map(value =>{
          return value.id;
      })
      console.log(caloriesMealsArr);

      let arr =[];
      let count = 0;
      let mealsArr = caloriesMealsArr.map(id =>{
        let mealsUrl = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}&includeNutrition=false`;
        superagent.get(mealsUrl).then(results => {

          let mealsData = results.body;
              const mealsObject = new Meal(mealsData);
              arr.push(mealsObject);
              console.log(count);
              count++;
              if(caloriesMealsArr.length === count){
          res.render('./pages/searchPage', {searchArray:arr});
        }
      })
    })

  })
}

//....................................

function Recipe(data){
  this.label = data.label;
  this.image = data.image;
  this.ingredientLines = data.ingredientLines;
  this.calories = data.calories.toFixed(2);
  this.fat = data.totalNutrients.FAT.quantity.toFixed(2);
  this.Carbs = data.totalNutrients.CHOCDF.quantity.toFixed(2);
  this.Protein = data.totalNutrients.PROCNT.quantity.toFixed(2);
  this.Cholesterol = data.totalNutrients.CHOLE.quantity.toFixed(2);
  }

  function Nutrients(data){
    this.calories = data.calories;
    this.protein = data.protein;
    this.fat = data.fat;
    this.carbohydrates = data.carbohydrates;
  }

  function Meal(data){
    this.title = data.title;
    this.image = data.image;
    this.summary = data.summary;
    this.instructions = data.instructions;
  }

client.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`listening on port ${PORT}`);
        });
    });