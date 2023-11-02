module.exports ={

    validate: (req, res, next) => {
       console.log('this is middleware')
        next()
    },
    validateEmail : (schema)=> async (req, res, next) => {
        let email = req.params.app_email
        res.app_email = email
        next();
       
     }

}


const validateLogin = (schema)=> async (req, res, next) => {
    let body = req.body

    try{
        await schema.validate(body, { abortEarly: false })
        next()
        // return next()
    }
    catch(err){
        // console.log(err)
        return res.status(403).json({
            error: 1,
            message:err.errors
        })
     
    }
}

const validateSignup = (schemas)=> async (req, res, next) => {
    let body = req.body

    try{
        await schemas.validate(body, { abortEarly: false })
        next()
        // return next()
    }
    catch(err){
        // console.log(err)
        return res.status(403).json({
            error: 1,
            message:err.errors
        })
     
    }
}

module.exports = {
    validateLogin,
    validateSignup
  };