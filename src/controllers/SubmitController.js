const {storeToken, ifexist, updateToken, defaultOauth2Data, myStorage, newStorage} = require('../services/google.services')
const request = require("request");
const dotenv = require('dotenv');
const {getSubmittedRecordById, submitAndUpdate} = require('../services/submit.services');
dotenv.config();

module.exports = {

    checkOnline:(req, res)=>{
        console.log('online')
        console.log(req.body)
        request(
     
         {
           method: "PUT",
           url: req.body.url,
           headers: { 
             "Content-Range": `bytes */*`,
             "Content-Length": '0'
          }
         },
         (err, response, body) => {
           if (err) {
             console.log(err);
             return
           }
           console.log(body);
           console.log('done');
           console.log(JSON.stringify(response.headers));
           console.log(JSON.stringify(response.statusCode));
           console.log(JSON.stringify(response.headers['range']));
     
           sta = response.statusCode
           // return response.statusCode;
           return res.json({
             status:sta,
             headerRange:response.headers['range'],
             header:response.headers
           })
           
         })  
    },

      submitAndUpdate: async (req, res) => {
        /* Update image data into submitted_Records record
          For the imaes you can update it even if the link is expired, 
          this helps when people are submitting on deadline but images or file were large
        */
        // console.log(req.body)
        let submit_id =  req.body.submit_id
        submitAndUpdate(req.body, (err, results)=>{

            if(err){
                // console.log(err);
                console.log('err');
                return res.status(400).json({
                    status: 400,
                    error: 1,
                    message : err,
                })
            }

            // function sendEmail(){
                
            // }
            // const mailSent = sendEmail();
            console.log('send success')
            return res.status(200).json({
                success: 1,
                data : 'updated successfully ..',
            })
          
        })
       
    }
}