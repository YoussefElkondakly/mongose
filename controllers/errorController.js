const AppError = require("./../myPublicClasses/AppError");

const handelCastErr = (err) => {
  // console.log(err);
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};
const handelDuplicateErr = (err) => {
  // console.log(err)
  // const x=err.errmsg.match(/name: "(.*?)"/)[1]
  // console.log(x)
  // const message=`Duplicate field value: ${err.keyValue.name}. `
  const message = `Duplicate field value: ${err.keyValue.name} Please use another value!`;
  return new AppError(message, 400);
};
const handelValidateErr = (err) => {
  const errs = Object.values(err.errors);
  //[w:{},e:{}]
  // console.log(errs)
  const arr = errs.map((el) => el.message);
  const message = `Invalid input data. ${arr.join(". ")}`;

  return new AppError(message, 400);
};
const handelJWTError=(err)=>{
const message="You are not Authenticated"
return new AppError(message,401)
}
const handelJWTExpiredError=(err)=>{
  const message="Your Login session has expired. Log in again"
  return new AppError(message,401)
}


const sendProdError = function (res, err) {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    //if is Opretional=== undefinde meaning its not Handeld by the AppError We Made so its UnHandeld error 
    console.error("Error", err);
    return res.status(500).json({
      status: "Internal Server Error",
      message: " Somthing went very wrong",
    });
  }
};
const sendDevError = function (res, err) {
  // handelValidateErr(err)
  return res.status(err.statusCode).json({
    error: err,
    stack: err.stack,
    status: err.status,
    message: err.message,
  });
};

module.exports = (err, req, res, next) => {
  // if(err.isOpreational){
  //     return res.status(err.statusCode).json({
  //         status:err.status,
  //         message:err.message
  //     })
  // }
  /**
   *
   */
  //FIXME for testing without closing the server
  if( req.headers.test==='test'){
process.env.NODE_ENV = "production"
  }
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "fail";
// console.log("1",err.message)

  if (process.env.NODE_ENV === "development") {
    sendDevError(res, err);
    
  } else if (process.env.NODE_ENV === "production") {
    // console.log("2",err)
    let e = { message:err.message,...err };
    if (err.name === "CastError") e = handelCastErr(err);
    else if (err.code === 11000) e = handelDuplicateErr(err);
    else if (err.name === "ValidationError") e = handelValidateErr(err);
//"message": "invalid signature"
    else if (err.name === "JsonWebTokenError") e = handelJWTError(err)
      else if (err.name === "TokenExpiredError") e = handelJWTExpiredError(err)
    // console.log("3",err)
  // console.log("4",e)
    sendProdError(res, e);
  //FIXMEfor testing without closing the server
 req.headers.test==='test'?process.env.NODE_ENV = "development":null

  }
  // console.log(err.stack)
};
