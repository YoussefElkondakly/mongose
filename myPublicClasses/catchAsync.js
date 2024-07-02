module.exports=fun=>{
  /*You are passing an async function and this will return what A Promise correct so if the 
    promise Was Rejected catching it and Throws it to the @next@ so
    app.use('/natours/tours',tourRouter)
    next=>Hi Error From Tour Router
app.use('/natours/users',userRouter)
    next=>Hi Error From User Router
app.use('/natours/reviews',reviewRouter)
    next=>Hi Error From Review Router
app.all('*',(req,res,next)=>{})
    next=>Hi Error From Other Router

app.use(errorController)
so the error now is handeld in the errorController 
    */
  //.catch(err=>next(err))
  return (req, res, next) => {
    console.log(req.query, "\n", req.originalUrl);
    fun(req, res, next).catch(next);
  };
}
//function asogpij