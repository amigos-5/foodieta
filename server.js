'use strict'
let arr0 =[];
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
const { resolve4 } = require('dns');
let client ;
// = new pg.Client(process.env.DATABASE_URL);
if(PORT == 3000 || PORT == 3030){  client = new pg.Client(process.env.DATABASE_URL);} else {  client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });}
// const client = new pg.Client({ connectionString: process.env.DATABASE_URL,   ssl: { rejectUnauthorized: false } });

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.get('/movies', moviesHandiling);
app.use(express.static('./public'))
app.use(methodOverride('_method'));
app.get('/home',homeHandler);
app.get('/', (req, res) => {
  res.redirect('/home.html');
});
app.post('/auth', function(request, response) {
    var username = request.body.username;
    var password = request.body.password;
    if (username && password) {
    let sql = 'SELECT * FROM userInfo WHERE userName =$1 AND userPass =$2;';
    let values = [username, password];
    client.query(sql, values)
      .then((results) => {
        // console.log(results.rows);
        // let id = results.rows[0].id;
        // arr0 = [];
        // arr0.push(id);
        if (results.rows.length > 0) {
          request.session.loggedin = true;
          request.session.username = username;
          // console.log('request.session.username', id);
          // console.log( request.session.username)
          // console.log(username,password);
          response.render('pages/hi',{ username1: username });
        }else{
        response.render('pages/sign');
      }})

}});
function homeHandler(res,req){
  // console.log(res.session.loggedin)
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
app.get('/about' ,aboutHandler);
function aboutHandler(req,res){
  res.redirect('/aboutus');}
app.get('/moviess' ,aboutHandler);
function aboutHandler(req,res){
  res.render('pages/movies');}
app.post('/logout',logoutHandler);
function logoutHandler(req,res){
  req.session.loggedin = false;
  req.session.username = "";
  res.redirect('/');
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
        // console.log(results.rows);
        if (results.rows.length > 0) {
          request.session.loggedin = true;
          request.session.username = username;
          username += " you already have an account in our database!!"
          response.render('pages/hi',{ username1: username });
        }else{
          let sql = 'INSERT INTO userInfo (userName, userEmail, userPass) VALUES ($1,$2,$3)RETURNING id;';
    let values = [username, email,password];
    client.query(sql, values)
      .then((results) => {
        let id = results.rows[0].id;
        arr0 = [];
        arr0.push(id);
        request.session.loggedin = true;
        request.session.username = username;
        // console.log( request.session.username)
        // console.log(username,password)
       
        response.render('pages/hi',{ username1: username });
      })
        }})
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
  // console.log(url);
  superagent.get(url).then (results => {
 
      let recipeData = results.body.hits;
      // console.log(recipeData);
       
      let recipeArr = recipeData.map(value =>{
          const recipeObject = new Recipe(value.recipe);
          return recipeObject;
      })
      // console.log(recipeArr);
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
  // console.log(url);
  superagent.get(url).then (results => {
      let caloriesDataMeals = results.body.results;
      let caloriesMealsArr = caloriesDataMeals.map(value =>{
          return value.id;
      })
      // console.log(caloriesMealsArr);
      let arr =[];
      let count = 0;
      let mealsArr = caloriesMealsArr.map(value =>{
        let mealsUrl = `https://api.spoonacular.com/recipes/${value}/information?apiKey=${apiKey}&includeNutrition=false`;
        superagent.get(mealsUrl).then(results => {
          let mealsData = results.body;
              let mealsObject = new Meal(mealsData);
              if(mealsObject.summary){
                mealsObject.summary= mealsObject.summary.replace(/<[^>]*>/g, '');
                } else{
                  mealsObject.summary= "no summery provided for this recipe";
                }
  
                if(mealsObject.instructions){
                mealsObject.instructions= mealsObject.instructions.replace(/<[^>]*>/g, '');
                }else{
                  mealsObject.instructions= "no instructions provided for this recipe";
                }
              arr.push(mealsObject);
              // console.log(count);
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
  // console.log(url);
  superagent.get(url).then (results => {
      let caloriesData0 = results.body.nutrients.calories;
      let caloriesData1 = results.body.nutrients.protein;
      let caloriesData2 = results.body.nutrients.fat;
      let caloriesData3 = results.body.nutrients.carbohydrates;
      // console.log(caloriesData0,caloriesData1,caloriesData2,caloriesData3);
      let caloriesDataMeals = results.body.meals;
       
      let caloriesMealsArr = caloriesDataMeals.map(value =>{
          return value.id;
      })
      // console.log(caloriesMealsArr);
      let arr =[];
      let count = 0;
      let mealsArr = caloriesMealsArr.map(value =>{
        let mealsUrl = `https://api.spoonacular.com/recipes/${value}/information?apiKey=${apiKey}&includeNutrition=false`;
        superagent.get(mealsUrl).then(results => {
          let mealsData = results.body;
              let mealsObject = new Meal(mealsData);
              if(mealsObject.summary){
                mealsObject.summary= mealsObject.summary.replace(/<[^>]*>/g, '');
                } else{
                  mealsObject.summary= "no summery provided for this recipe";
                }
  
                if(mealsObject.instructions){
                mealsObject.instructions= mealsObject.instructions.replace(/<[^>]*>/g, '');
                }else{
                  mealsObject.instructions= "no instructions provided for this recipe";
                }
              arr.push(mealsObject);
              // console.log(count);
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
  let url = `https://api.spoonacular.com/recipes/complexSearch?type=${searchWay}&apiKey=${apiKey}`
  // console.log(url);
  superagent.get(url).then (results => {
      let caloriesDataMeals = results.body.results;
      let caloriesMealsArr = caloriesDataMeals.map(value =>{
          return value.id;
      })
      // console.log(caloriesMealsArr);
      let arr =[];
      let count = 0;
      let mealsArr = caloriesMealsArr.map(id =>{
        let mealsUrl = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}&includeNutrition=false`;
        superagent.get(mealsUrl).then(results => {
          let mealsData = results.body;
              let mealsObject = new Meal(mealsData);
              if(mealsObject.summary){
              mealsObject.summary= mealsObject.summary.replace(/<[^>]*>/g, '');
              } else{
                mealsObject.summary= "no summery provided for this recipe";
              }

              if(mealsObject.instructions){
              mealsObject.instructions= mealsObject.instructions.replace(/<[^>]*>/g, '');
              }else{
                mealsObject.instructions= "no instructions provided for this recipe";
              }
              arr.push(mealsObject);
              // console.log(count);
              count++;
              if(caloriesMealsArr.length === count){
          res.render('./pages/searchPage', {searchArray:arr});
        }
      })
    })
  })
}
// exclude route
app.post('/execlude',execludeHandler);
function execludeHandler(req,res){
let execludeItem = req.body.execludeItem;
let apiKey=process.env.apiKey;
let url =`https://api.spoonacular.com/recipes/complexSearch?excludeIngredients=${execludeItem}&apiKey=${apiKey}`;
superagent.get(url).then (results => {
  let excludeplate = results.body.results;
  let excludeplateArr = excludeplate.map(value =>{
      return value.id;
  })
  // console.log(excludeplateArr);
  let arr =[];
  let count = 0;
  let execludeArr = excludeplateArr.map(id =>{
    let execludeUrl = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}&includeNutrition=false`;
    superagent.get(execludeUrl).then(results => {
      let execludeData = results.body;
          let execludeObject = new Meal(execludeData);
          if(execludeObject.summary){
            execludeObject.summary= execludeObject.summary.replace(/<[^>]*>/g, '');
            } else{
              execludeObject.summary= "no summery provided for this recipe";
            }

            if(execludeObject.instructions){
              execludeObject.instructions= execludeObject.instructions.replace(/<[^>]*>/g, '');
            }else{
              execludeObject.instructions= "no instructions provided for this recipe";
            }
          arr.push(execludeObject);
          // console.log(count);
          count++;
          if(excludeplateArr.length === count){
      res.render('./pages/execludeMeal', {execludeItem:arr});
    }
  })
})
})
}
// include route
app.post('/include',includeHandler);
function includeHandler(req,res){
  let includeItem = req.body.includeItem;
  let apiKey=process.env.apiKey;
  let url =`https://api.spoonacular.com/recipes/complexSearch?includeIngredients=${includeItem}&apiKey=${apiKey}`;
  superagent.get(url).then (results => {
  
  
    let includeplate = results.body.results;
    let includeplateArr = includeplate.map(value =>{
        return value.id;
    })
    // console.log(includeplateArr);
  
    let arr =[];
    let count = 0;
    let includeArr = includeplateArr.map(id =>{
      let includeUrl = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}&includeNutrition=false`;
      superagent.get(includeUrl).then(results => {
  
        let includeData = results.body;
            let includeObject = new Meal(includeData);
            if(includeObject.summary){
              includeObject.summary= includeObject.summary.replace(/<[^>]*>/g, '');
              } else{
                includeObject.summary= "no summery provided for this recipe";
              }
  
              if(includeObject.instructions){
                includeObject.instructions= includeObject.instructions.replace(/<[^>]*>/g, '');
              }else{
                includeObject.instructions= "no instructions provided for this recipe";
              }
            arr.push(includeObject);
            // console.log(count);
            count++;
            if(includeplateArr.length === count){
        res.render('./pages/includeMeal', {includeItem:arr});
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
// http://localhost:3000/movies?search_query=salad


app.get('/movieta',(req,res)=>{
  res.render('./pages/movies');
})


function moviesHandiling(req, res) {
  let formated_query = req.query.search_query;
  const moviesAPIKey = process.env.MOVIE_API_KEY;
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${moviesAPIKey}&query=${formated_query}&page=1`;
  superagent
      .get(url)
      .then((data) => {
        let moveies = [];
        for(let i = 0 ; i < data.body.results.length ; i++){
          if(data.body.results[i].poster_path){
          moveies.push(new Movies(data.body.results[i]));
        }
        }
        res.render('pages/movies', { moviesArr: moveies })
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

//......................................insert to database
app.post('/recipes', addRecipes );

function addRecipes (req, res){
  // console.log(req.body);
  let SQL = `INSERT INTO recipes (userName, label, image, ingredientLines, calories, fat, Carbs, Protein, Cholesterol  ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)RETURNING id;`;
  let value = req.body;
  let safeValues= [ req.session.username,value.label,value.image,value.ingredientLines,value.calories,value.fat,value.Carbs,value.Protein,value.Cholesterol];
  client.query(SQL,safeValues).then(()=>{
    if (req.session.loggedin) {
      res.render('pages/hi',{ username1: req.session.username });
    }else{
    res.redirect('/home.html');
  }
  })
}

app.get('/saved',(req,res)=>{
  let SQL = `SELECT label, image, ingredientLines, calories, fat, Carbs, Protein, Cholesterol FROM recipes where userName=$1 ;`
  let safeValues= [ req.session.username ];
  client.query(SQL,safeValues)
  .then (result=>{
    console.log(result.rows);

        res.render('./pages/savedRecipes', { savedList: result.rows})
  })
});

    //......................................insert to database
    app.post('/recipesOption', addRecipesOption);
    
function addRecipesOption (req, res){
  // console.log(req.body);
  let SQL = `INSERT INTO recipesOption (userId, title, image, instructions, summary) VALUES ($1,$2,$3,$4,$5)RETURNING id;`;
  let value = req.body;
  let safeValues= [ req.session.username,value.title,value.image,value.instructions,value.summary];
  client.query(SQL,safeValues).then(()=>{
    if (req.session.loggedin) {
      res.render('pages/hi',{ username1: req.session.username });
    }else{
    res.redirect('/home.html');
  }
  });
}
app.get('/savedOption',(req,res)=>{
  let SQL = `SELECT title, image, instructions, summary FROM recipesOption where userId=$1 ;`
  let safeValues= [ req.session.username ];
  client.query(SQL,safeValues)
  .then (result=>{
      console.log(result.rows);
        res.render('./pages/savedRecipesOption', { savedList: result.rows})
  })
});
    
//.................................contactDB

app.post('/contactForm',(req,res) =>{
  let SQL = `INSERT INTO contactUs (firstName, lastName, email, comments) VALUES ($1,$2,$3,$4);`;
  let value = req.body;
  let safeValues= [value.first_name,value.last_name,value.email,value.comments];
  client.query(SQL,safeValues)
  .then (result=>{
      console.log(result.rows);
        res.redirect('/');
  })
})

app.get('/contactInfo',(req,res)=>{
  console.log(req.session.username);
  if( req.session.username == 'Farhan'){
    let SQL = `SELECT * FROM contactUs;`
    // let safeValues= [ req.session.username ];

    client.query(SQL).then(result=>{
      console.log(result.rows);
      res.render('./pages/contactInfo',{ searchArray: result.rows});
    });
  }else {
    res.redirect('/');
  }
})

////////////////////////////////////////////////////////////////////////profile btn
app.get('/profile',(req,res)=>{
  if( req.session.loggedin){
    res.render('pages/hi',{ username1:req.session.username});
        }else{
        res.redirect('/');
      }})

//.............................................delete btn
app.delete('/deleteRecipe/:label', deleteHandler);

function deleteHandler(req,res) {
  let SQL = `DELETE FROM recipes WHERE label=$1;`;
  let value = [req.params.label];
  client.query(SQL,value)
  .then(()=>{
    res.redirect('/saved');
  })
}
app.delete('/deleteRecipeoptions/:title', deleteHandlerOption);

function deleteHandlerOption(req,res){
  let SQL = `DELETE FROM recipesOption WHERE title=$1;`;
  let value = [req.params.title];
  client.query(SQL,value)
  .then(()=>{
    res.redirect('/savedOption');
  }) 
}

client.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`listening on port ${PORT}`);
        });
    });
    