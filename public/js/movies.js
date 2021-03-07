'use strict'



$(document).ready(function () {
  $("a").click(function (event) {
    console.log("we prevent it")
    event.preventDefault();
    let moviesArr = moviesHandiling("salad");
    console.log(moviesArr)
    $(".wrapper").show();

  });

  $(".wrapper2").hide();
});

$(document).ready(function () {
  $("button").click(function (e) {
    e.preventDefault();
    var x = $("form").serializeArray();
    let y = x[0].value.split(" ");
    console.log(y);
    $(".cards").empty();
    y.forEach(element => {
      let moviesArr = moviesHandiling(element);

    });
    $(".wrapper").show();

  });
});



// http://localhost:3000/movies?search_query=salad
function moviesHandiling(req) {
  let formated_query = req;
  const moviesAPIKey = "707356d323bd8eeccffedc0b2d37de4a";
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${moviesAPIKey}&query=${formated_query}&page=1`;
  let moveies = [];

  fetch(url)
    .then((resp) => resp.json())
    .then((data) => {
      console.log(data.results.length)

      let handler = 3;
      if (handler < data.results.length) {
        handler = 4;

      } else {
        handler = data.results.length;
      }
      for (let i = 0; i < handler; i++) {
        if (data.results[i].poster_path) {
          let x = new Movies(data.results[i])
          x.render();
          moveies.push(x);
        }
      }
      console.log(handler)
      return moveies
    }).then((res) => {
      console.log(res);
      return moveies
    }
    )
  // console.log(Object.values(moveies));
  // return moveies
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
Movies.prototype.render = function () {
  let template = $('#templateCard').html();
  console.log(this.title);
  let newObj = Mustache.render(template, this);

  $('.cards').append(newObj);
}