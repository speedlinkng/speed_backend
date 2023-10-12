

module.exports  = class UserController{
    static db(req,res){
        const mysql = require('mysql');
        const con = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "mydb"
        });
          
          
    }

}



  