const yup = require('yup');

module.exports ={
 registerSchema : yup.object({
    email: yup.string().email().required('The email field is required.'),
    first_name: yup.string().required('The firstname required.'),
    last_name: yup.string().required('The lastname required.'),
    number: yup.string().required('The numer required.'),
    password: yup
    .string()
    .min(5, 'Password must be at least 5 characters')
    .max(100, 'Password must not exceed 100 characters')
    .matches(
      /^(?=.*[A-Z])(?=.*\d).+$/, 
      'Password must contain at least one uppercase letter and one digit'
    )
    .required('Password is required'),
    passwordConfirmation: yup.string().required().oneOf([yup.ref('password'), null], 'Passwords must match'),
  
}),

  
 loginSchema :yup.object({
    email: yup.string().email().required('The email field is required.'),
    password: yup.string().min(5).max(100).required('Password is required'),  
}),
}


// const registerSchema = yup.object({
//     email: yup.string().email().required('The email field is required.'),
//     name: yup.string().required('The name required.'),
//     password: yup.string().min(5).max(16).required('Password is required'),
//     passwordConfirmation: yup.string().required().oneOf([yup.ref('password'), null], 'Passwords must match'),
  
// });
// module.exports = loginSchema, registerSchema;