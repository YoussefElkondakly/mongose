process.on('uncaughtException',(e)=>console.error("There Is An Error "+e))
const express=require('express');
const tourRouter=require('./routes/tourRouter')
const userRouter=require('./routes/userRouter')
const reviewRouter=require('./routes/reviewRouter')
const errorController=require('./controllers/errorController')
const AppError=require('./myPublicClasses/AppError');
const morgan = require('morgan');
const rateLimit=require('express-rate-limit')
const helmet=require('helmet')
const mongoSanitize=require('express-mongo-sanitize')
const xss=require('xss-clean')
const hpp=require('hpp')

const app=express()

app.use(helmet())

if(process.env.NODE_ENV==='development') app.use(morgan('dev'))

    
const limiter=rateLimit({
    max:100,
    windowMs:60*60*100,
    message:'Too Many Requests From This IP,Please Try Again In An Hour'
 }
 )
 app.use('/natours',limiter)
 app.use(express.json({limit:'10kb'}))
app.use(mongoSanitize())
app.use(xss())
app.use(hpp({
    whitelist:['duration','ratingsAverage','ratingsQuantity','maxGroupSize','difficulty','price']
    }))
 

app.use('/natours/tours',tourRouter)
app.use('/natours/users',userRouter)
app.use('/natours/reviews',reviewRouter)
app.all('*',(req,res,next)=>{
    const err=new AppError(`This ${req.originalUrl} is not avilable in the server`,404)
    // const err=new Error(`This ${req.originalUrl} is not avilable in the server`)
    // err.status='Not Found'
    // err.statusCode=
    next(err)
})
app.use(errorController)
module.exports=app