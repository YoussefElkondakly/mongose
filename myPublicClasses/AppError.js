class AppError extends Error{
    constructor(message, statusCode){
        super(message)
        this.statusCode=statusCode
        this.status=`${this.statusCode}`.startsWith(4)?'fail':'error'
        this.isOperational=true
Error.captureStackTrace(this,this.constructor)
    }
}
module.exports=AppError

//to check if we handeld the error it sets to true If We Won't handel it so we did not make an instance of that class by 
