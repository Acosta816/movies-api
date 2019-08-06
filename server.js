require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const allMovies = require('./database/movies-database');

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'dev';
app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());


//--------------------------------------------------handlers start
function handleGenre(req,res, moviesArray){
  const genre = req.query.genre.toLowerCase();
  moviesArray = moviesArray.filter(movie=> movie.genre.toLowerCase().includes(genre));
  return moviesArray;
}

function handleCountry(req,res, moviesArray){
  const country = req.query.country.toLowerCase();
  moviesArray = moviesArray.filter(movie=> movie.country.toLowerCase().includes(country))
  return moviesArray;
}

function handleVotes(req,res, moviesArray){
  const vote = parseFloat(req.query.avg_vote);
  moviesArray = moviesArray.filter(movie=> parseFloat(movie.avg_vote) >= vote);
  return moviesArray;
}
//--------------------------------------------------handlers end

app.use(function validateBearerToken(req, res, next){
  if(!req.get('Authorization') || req.get('Authorization').split(' ')[1] !== process.env.API_TOKEN ){
    return res.status(401).send('🔑Invalid Authorization header. please provide correct Bearer token')
  }
  else {
    next();
  }
})

app.get('/movies',(req,res)=>{
  let movies = allMovies;
  if(req.query.genre){
     movies = handleGenre(req,res, movies);
  }
  if(req.query.country){
    movies = handleCountry(req,res, movies);
  }
  if(req.query.avg_vote){
    movies = handleVotes(req, res, movies);
  }

  

  return res.status(200).json(movies);

  // else if(!Object.keys(req.query).length){
  //   return res.status(200).json(allMovies);
  // }
})

 //======================================================error handler
app.use((error, req, res, next)=>{
  let response;
  if(process.env.NODE_ENV === 'production'){
    response = {error: {message: 'server error, whoops'}}
  }
  else { 
    response = { error } 
  }
  //=====================================================error handler
  
  res.status(500).json(response);
})


const PORT = process.env.PORT || 8000;
app.listen(PORT, ()=>{
  console.log(`Server is listening to PORT ${PORT}`);
});