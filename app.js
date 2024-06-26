const express=require('express');
const tourRouter=require('./routes/tourRouter')
const userRouter=require('./routes/userRouter')
const errorController=require('./controllers/errorController')
const AppError=require('./myPublicClasses/AppError');
const morgan = require('morgan');
const app=express()
if(process.env.NODE_ENV==='development') app.use(morgan('dev'))
app.use(express.json())
app.use('/tours',tourRouter)
app.use('/users',userRouter)
app.all('*',(req,res,next)=>{
    const err=new AppError(`This ${req.originalUrl} is not avilable in the server`,404)
    // const err=new Error(`This ${req.originalUrl} is not avilable in the server`)
    // err.status='Not Found'
    // err.statusCode=
    next(err)
})
app.use(errorController)
module.exports=app