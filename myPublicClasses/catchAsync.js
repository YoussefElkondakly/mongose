module.exports=fun=>{
    
    //.catch(err=>next(err))
    return (req,res,next)=>{
        console.log(req.query,"\n",req.originalUrl);
        fun(req,res,next).catch(next)
    }
}