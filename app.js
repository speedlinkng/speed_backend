const express = require('express')
const app = express()
const path = require('path');
const appRoute = require('./src/routes/app.route');
const userRoute = require('./src/routes/user.route');
const googleRoute = require('./src/routes/google.route');
const admin = require('./src/routes/admin.route');
const pay = require('./src/routes/paystack.route');
const dotenv = require('dotenv')
const cors=require("cors");
const pool = require('./src/models/DB');
const pgpool = require('./src/models/PGDB');

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
app.use("/api/pay", pay)

app.get('/testcon', (req, res) => {
    async function getClient() {
        try {
          const client = await pgpool.connect();
          console.log('Acquired a client from the pool');
          return client;
        } catch (error) {
          console.error('Error acquiring client from the pool', error);
          throw error;
        }
      }
      getClient()

      async function insert() {

        const json_data = [{
            field3: {
              other_data: {
                drop_zone: "",
                success_page_text: "",
                error_page_text: "",
                shearable_link: "shearable",
                page_url: "uploadforexam",
                page_name: "page 1",
              },
              edit_submit_field: "Submit Answers",
              page_header: "Say Form 2",
              page_description: "",
              fieldType: {
                fieldName: "Text",
                fieldValue: "Say no more",
              },
              conditions: {
                firstCondition: [
                  {
                    selectorName: "hide-show",
                    selectorValue: "Hide",
                  },
                  {
                    selectorName: "if",
                    selectorValue: "All",
                  },
                ],
                secondCondition: [
                  {
                    SCL_selectorName: "matches",
                    SCL_selectorValue: "Your Answers",
                  },
                  {
                    SCL_selectorName: "condition",
                    SCL_selectorValue: "greater",
                  },
                  {
                    SCL_inputName: "compared",
                    SCL_inputValue: "",
                  },
                ],
              },
              settings: [
                {
                  inputName: "Required",
                  inputValue: "on",
                },
                {
                  inputName: "Add field value to the front of the file name ",
                  inputValue: "on",
                },
                {
                  inputName: "Placeholder",
                  inputValue: "",
                },
                {
                  inputName: "Validation Pattern",
                  inputValue: "",
                },
                {
                  inputName: "Description",
                  inputValue: "",
                },
              ],
            },
            field4: {
              other_data: {
                drop_zone: "",
                success_page_text: "",
                error_page_text: "",
                shearable_link: "shearable",
                page_url: "uploadforexam",
                page_name: "page 1",
              },
              edit_submit_field: "Submit Answers",
              page_header: "Say Form 2",
              page_description: "",
              fieldType: {
                fieldName: "Dropdown",
                fieldValue: "",
              },
              conditions: {
                firstCondition: [
                  {
                    selectorName: "hide-show",
                    selectorValue: "Hide",
                  },
                  {
                    selectorName: "if",
                    selectorValue: "All",
                  },
                ],
                secondCondition: [
                  {
                    SCL_selectorName: "matches",
                    SCL_selectorValue: "Your Answers",
                  },
                  {
                    SCL_selectorName: "condition",
                    SCL_selectorValue: "greater",
                  },
                  {
                    SCL_inputName: "compared",
                    SCL_inputValue: "",
                  },
                ],
              },
              settings: [
                {
                  inputName: "Dropdown List",
                  inputValue: ["drop1", "drop2", "drop3"],
                },
                {
                  inputName: "Required",
                  inputValue: "on",
                },
                {
                  inputName: "Add field value to the front of the file name",
                  inputValue: "on",
                },
                {
                  inputName: "Description",
                  inputValue: "",
                },
              ],
            },
          }];
          const jsonString = JSON.stringify(json_data);
          pgpool.query(
            `insert into example_jsonb(json_data) values($1)`,
            [
                jsonString
            ],
            (err, res, fields) =>{
                if(err){
                    console.log(err);
                }
                console.log(res.rows)
              
                pgpool.end();
            }
        )
      }
    //   insert()

      
      async function getRecords() {

            pgpool.query(
                "SELECT json_data->'field[0-9]+$' FROM example_jsonb",
                [],
                (err, res, fields) => {
                  if (err) {
                    console.error(err);
                    return;
                  }
                  console.log(
                    "Fetched all fields with numbers at their end:",
                    res.rows
                  );
                }
              );


          // Check different rows of the JSONB record for a specific name
            pgpool.query(
                "SELECT json_data FROM example_jsonb WHERE json_data->'field3'->'page_header' = $1",
                ["Say Form 2"],
                (err, res, fields) => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log("Found rows with the specified name:", res.rows);
                }
            );
            
            // Count records that exist inside the JSONB data
            pgpool.query("SELECT COUNT(*) FROM example_jsonb", [], (err, res, fields) => {
                if (err) {
                  console.error(err);
                  return;
                }
                console.log("Total number of records:", res.rows[0].count);
              });
      }
      getRecords()

  });
// Express Middleware for serving static files
app.use(express.static(path.join(__dirname, 'public')));

app.post('/login', validateLogin(userSchema), function(req, res) {
    // res.redirect('view/index.html');
    res.json(req.body);
});

app.get('/', function(req, res) {
    // res.redirect('view/index.html');
    async function getClient() {
      try {
        const client = await pgpool.connect();
        console.log('Acquired a client from the pool');
        res.send('server Backend is now working');
        return client;
      } catch (error) {
        console.error('Error acquiring client from the pool', error);
        throw error;
      }
    }
    getClient()
    
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