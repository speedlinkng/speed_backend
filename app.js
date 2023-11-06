const express = require('express')
const app = express()
const path = require('path');
const appRoute = require('./src/routes/app.route');
const userRoute = require('./src/routes/user.route');
const googleRoute = require('./src/routes/google.route');
const admin = require('./src/routes/admin.route');
const dotenv = require('dotenv')
const cors=require("cors");
const pool = require('./src/models/DB');

dotenv.config();
const corsOptions ={
   origin:process.env.FRONTEND_URL, 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

// trial
const {validateLogin} = require("./src/middlewares/ValidateMiddleware")
const userSchema = require("./src/validations/UserValidation");
const { checkToken } = require('./src/middlewares/ValidateToken');


app.use(cors(corsOptions))
app.use(express.urlencoded({extended: true}));
app.use(express.json()) 
app.use("/api/users", userRoute)
app.use("/api/app", appRoute)
app.use("/api/google", googleRoute)
app.use("/api/admin", admin)

app.get('/testcon', (req, res) => {
    // Execute a test query to the database
    pool.query('SELECT 1 + 1 AS result', (error, results) => {
        console.log(

            process.env.DB_PORT,
           process.env.DB_HOST,
             process.env.DB_USERNAME,
            process.env.DB_PASSWORD,
        process.env.DB_DATABASE,
        )
      if (error) {
        console.error('Error testing database connection:', error);
        res.status(500).send('Database connection test failed');
      } else {
        console.log('Database connection test successful');
        res.status(200).send('Database connection test successful');
      }
    });
  });
// Express Middleware for serving static files
app.use(express.static(path.join(__dirname, 'public')));

app.post('/login', validateLogin(userSchema), function(req, res) {
    // res.redirect('view/index.html');
    res.json(req.body);
});

app.get('/', function(req, res) {
    // res.redirect('view/index.html');
    res.send('server Backend is now working');
});


const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Listening port ${port}...`)
})





















app.get('/users', (req, res) => {
    res.json(users)    
})


app.get('/users/:id', (req, res) => {
    if (users[req.params.id]){
          res.json(users[req.params.id])
    } else {
          res.json('User not found')
    }
})



//PUT USER
app.put('/users', (req, res) => {
    if (req.body.name && req.body.age){
         const {name, age} = req.body
         users[id] = {name, age}
         res.send(`Successfully created user with id: ${id}`)
         id++
    } else {
         res.send('Failed to create user')
    }
})


// PATCH USER
app.patch('/users', (req, res) => {
    if (users[req.body.id]){
          let user = users[req.body.id]
          user.name = req.body.name || user.name
          user.age = req.body.age || user.age
          res.json(user)
    } else {
          res.json('Failed to update or find user with that id.')
    }
})


const users = {
    0: {name: 'Bill', age: 29},
    1: {name: 'Jill', age: 32},
    2: {name: 'Will', age: 47}
}
let id = 3