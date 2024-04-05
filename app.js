const express = require('express')
const app = express()
const path = require('path');
const appRoute = require('./src/routes/app.route');
const zoomRoute = require('./src/routes/zoom.route');
const userRoute = require('./src/routes/user.route');
const googleRoute = require('./src/routes/google.route');
const admin = require('./src/routes/admin.route');
const pay = require('./src/routes/paystack.route');
const dotenv = require('dotenv')
const cors=require("cors");
const pool = require('./src/models/DB');
const pgpool = require('./src/models/PGDB');

dotenv.config();
const corsOptions = {
  origin: [process.env.FRONTEND_URL, process.env.OTHER_FRONTEND_URL],
  credentials: true,
  optionSuccessStatus: 200,
};

// trial
const {validateLogin} = require("./src/middlewares/ValidateMiddleware")
const userSchema = require("./src/validations/UserValidation");
const { checkToken } = require('./src/middlewares/ValidateToken');


app.use(cors(corsOptions))
app.use(express.urlencoded({extended: true}));
app.use(express.json()) 
app.use("/api/users", userRoute)
app.use("/api/app", appRoute)
app.use("/api/zoom", zoomRoute)
app.use("/api/google", googleRoute)
app.use("/api/admin", admin)
app.use("/api/pay", pay)

// app.get('/testcon', (req, res) => {
//     async function getClient() {
//         try {
//           const client = await pgpool.connect();
//           console.log('Acquired a client from the pool');
//           return client;
//         } catch (error) {
//           console.error('Error acquiring client from the pool', error);
//           throw error;
//         }
//       }
//       getClient()

      
//       async function getRecords() {

//             pgpool.query(
//                 "SELECT json_data->'field[0-9]+$' FROM example_jsonb",
//                 [],
//                 (err, res, fields) => {
//                   if (err) {
//                     console.error(err);
//                     return;
//                   }
//                   console.log(
//                     "Fetched all fields with numbers at their end:",
//                     res.rows
//                   );
//                 }
//               );


//           // Check different rows of the JSONB record for a specific name
//             pgpool.query(
//                 "SELECT json_data FROM example_jsonb WHERE json_data->'field3'->'page_header' = $1",
//                 ["Say Form 2"],
//                 (err, res, fields) => {
//                 if (err) {
//                     console.error(err);
//                     return;
//                 }
//                 console.log("Found rows with the specified name:", res.rows);
//                 }
//             );
            
//             // Count records that exist inside the JSONB data
//             pgpool.query("SELECT COUNT(*) FROM example_jsonb", [], (err, res, fields) => {
//                 if (err) {
//                   console.error(err);
//                   return;
//                 }
//                 console.log("Total number of records:", res.rows[0].count);
//               });
//       }
//       getRecords()

//   });
// Express Middleware for serving static files
app.use(express.static(path.join(__dirname, 'public')));

// app.post('/login', validateLogin(userSchema), function(req, res) {
//     // res.redirect('view/index.html');
//     res.json(req.body);
// });

app.get('/', function(req, res) {
  // res.send(`server Backend is running on this URL ${process.env.PORT}`);
    // res.redirect('view/index.html');
    async function getClient() {
      try {
        const client = await pgpool.connect();
        console.log('Acquired a client from the pool');
        res.send('server Backend is running on this URL');
        return client;
      } catch (error) {
        console.error('Error acquiring client from the pool', error);
        res.send('error was received');
        throw error;
      }
    }
    getClient()
    
});


const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Listening port ${port} of ${process.env.PORT}...`)
})









