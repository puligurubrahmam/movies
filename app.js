const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
let db = null
const dbPath = path.join(__dirname, 'moviesData.db')
const app = express()
app.use(express.json())
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server Running At http://localhost/3000/')
    })
  } catch (e) {
    console.log(`Error Occured:${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()
const convertDbObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

const convertDbObjectToResponseObjectForDirector = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}
//Getting List Of Movies

app.get('/movies/', async (request, response) => {
  const sqlquery = `
    SELECT MOVIE_NAME FROM MOVIE ORDER BY MOVIE_ID;
    `
  const moviesArray = await db.all(sqlquery)
  response.send(
    moviesArray.map(eachMovie => convertDbObjectToResponseObject(eachMovie)),
  )
})
//Posting New Movie
app.post('/movies/', async (request, response) => {
  const newmovie = request.body
  const {directorId, movieName, leadActor} = newmovie
  const sqlquery = `
  INSERT INTO movie (director_id,movie_name,lead_actor)
  VALUES(${directorId},'${movieName}','${leadActor}');
  `
  await db.run(sqlquery)
  response.send('Movie Successfully Added')
})
//Getting a movie

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const sqlquery = `
  SELECT * FROM movie 
  WHERE movie_id=${movieId};
  `
  const moviename = await db.get(sqlquery)
  response.send(convertDbObjectToResponseObject(moviename))
})
//Updating movie

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const sqlquery = `
  UPDATE MOVIE SET
  director_id=${directorId},
  movie_name='${movieName}',
  lead_actor='${leadActor}'
  WHERE movie_id=${movieId};
  `
  await db.run(sqlquery)
  response.send('Movie Details Updated')
})
//Delecting a movie

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const sqlquery = `
  DELETE FROM MOVIE
  WHERE movie_id=${movieId};
  `
  await db.run(sqlquery)
  response.send('Movie Removed')
})
//Getting List Of Directors

app.get('/directors/', async (request, response) => {
  const sqlquery = `
  SELECT * FROM DIRECTOR ORDER BY DIRECTOR_ID;
  `
  const directorsArray = await db.all(sqlquery)
  response.send(
    directorsArray.map(eachMovie =>
      convertDbObjectToResponseObjectForDirector(eachMovie),
    ),
  )
})

//Getting list of the movies by director

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const sqlquery = `
  SELECT MOVIE_NAME FROM MOVIE
  WHERE director_id=${directorId}
  GROUP BY DIRECTOR_ID;
  `
  const moviesArray = await db.all(sqlquery)
  response.send(
    moviesArray.map(eachMovie => convertDbObjectToResponseObject(eachMovie)),
  )
})
module.exports = app
