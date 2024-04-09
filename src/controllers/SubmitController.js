const {storeToken, ifexist, updateToken, defaultOauth2Data, myStorage, newStorage} = require('../services/google.services')
const request = require("request");
const dotenv = require('dotenv');
const sendMail = require('../middlewares/emailMiddleware');
const {getSubmittedRecordById, submitAndUpdate, submitFormReplies} = require('../services/submit.services');
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


    submitReplies: (req, res)=>{
      let record_id =  req.body.record_id
      /* get the userId from the record_id
        then get the username from the users table through the user_id gotten from the form_record query th
        This is to help us send mail to the right person
      */

      submitFormReplies(req.body, (err, results)=>{
          if(err){
              console.log(err);
              return res.status(400).json({
                  status: 400,
                  error: 1,
                  message : err,
              })
          }

        // console.log('submitting')
   
        
          // Get the name of the form's creator
        
          let mesg = `<div>
          <p>Hello ${results[0].firstname},</p> 
              <p>A submissin has been made to your form titled ...</p>
          </div>`
    
          sendMail(results[0].email, 'Form Submission', mesg);
          console.log('submit ID WAS: ', results.uniqueId)
          console.log('submit ID again: ', results)
          return res.status(200).json({
              status: 200,
              success: 1,
              submit_id: results.uniqueId
                
          })
      })
  },

  submitAndUpdate: async (req, res) => {
      /* Update image data into submitted_Records record
        For the imaes you can update it even if the link is expired, 
        this helps when people are submitting on deadline but images or file were large
      */
      console.log('submit and update')
      let submit_id =  req.body.submit_id
      console.log(submit_id)
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

          console.log('send success')
          return res.status(200).json({
              success: 1,
              data : 'updated successfully ..',
          })
        
      })
      
  }
}