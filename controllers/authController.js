// const mongoose=require('mongoose')
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const crypto = require("crypto");
const User = require("./../models/userModel");
const catchAsync = require("../myPublicClasses/catchAsync");
const AppError = require("../myPublicClasses/AppError");
const sendEmail = require("../myPublicClasses/email");


  const createSendToken=(user,statusCode,res)=>{
    console.log(user._id.toString())
    const id=user._id.toString()
  const token = jwt.sign( {id},process.env.JWT_SECRET,{expiresIn: process.env.JWT_DURATION,})
  
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 *
      1000
      ),
      httpOnly: true,
      secure:process.env.NODE_ENV==='production'?true:false
    };
      
      res.cookie("jwt", token, cookieOptions);
      user.password = undefined;
      
  res.status(statusCode).json({
    success: "success",
    token,
    data: {
      user,
    },
  });
  }
exports.signUp = catchAsync(async function (req, res, next) {
  //we Destructerd these to prevent user of adding his role
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });
createSendToken(user,201,res)
  // const token = signToken(user._id);

  // res.status(201).json({
  //   success: "success",
  //   token,
  //   data: {
  //     user,
  //   },
  // });
});

exports.login = catchAsync(async function (req, res, next) {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError("Email And Password Must Be Added", 400));

  const user = await User.findOne({
    email,
  }).select("+password");
  //we made the correct passord function in the schema method to make the user functionalities in the
  //Model not in the controller to prevent making fat Controllers so the Bussiness logic
  //will be in the Model such as validating user input checkink password and the application logic to
  //handel all errors and the app's tecnical aspects

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError("Email Or Password Is Incorrect", 401));
  createSendToken(user,200,res)

  // const token = signToken(user._id);
  // res.status(200).json({
  //   success: "success",
  //   token,
  // });
  // }
});



exports.protect = catchAsync(async function (req, res, next) {
  //1) Getting token and check if it's there

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  console.log(token);
  //2) Verification token
  if (!token)
    return next(new AppError("You are not logged in! Please log in", 401));

  //3) Check if token exists and token is correct
  const verify = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(verify.iat);
  //4) Check if user still exists based on the Id after the verify method will be a destructred token

  const currentUser = await User.findById(verify.id);

  console.log(verify.id)
  if (!currentUser)
    return next(
      new AppError("The user belonging to this token does not exist", 401)
    );
  //5) Check if user changed password after the token was issued
  //6) Check if user still has the role needed to access this route
  //these things is more advanced
  const checkPass = currentUser.changedUserAfter(verify.iat);
  if (checkPass)
    return next(
      new AppError(
        "The user belonging to this token has changed password after the token was issued",
        401
      )
    );
  req.user = currentUser;
  next();
});

exports.restrictTo = function (...roles) {

  //check The Authorization
  return (req, res, next) => {
  
    if (!roles.includes(req.user.role))
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user)
    return next(new AppError("There is no user with that email address", 404));
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/users/resetPassword/${resetToken}`;
  const message = `Forgot your password ? Submit a password reset request here: ${resetURL}`;

  try {
    console.log("You are in try");
    await sendEmail({
      email: user.email,
      subject: `Your password reset token (valid for 10 minutes)`,
      message,
    });
    res.status(200).json({ status: "success", message: "Token sent to email" });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({
      validateBeforeSave: false, //deactivate all the validator in the schema
    });
    return next(
      new AppError(
        "There was an error sending the email. Please try again later",
        500
      )
    );
  }

};
exports.resetPassword = catchAsync(async (req, res, next) => {

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  console.log(hashedToken);
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) return next(new AppError("Token Has Expired", 404));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  createSendToken(user, 200, res);
  // const token = signToken(user._id);
  // res.status(200).json({
  //   success: "User's Password Ressetd Successfully",
  //   token,
  // });
});

exports.updatePassword=catchAsync(async (req,res,next)=>{
  
  //current password new password neew passwordconfirm
  const {  oldpassword,newPassword,newPasswordConfirm } = req.body;
  if (!oldpassword || !newPassword || !newPasswordConfirm)
    return next(new AppError("Password Must Be Added", 400));
// await User.
const userPass=await User.findOne({_id:req.user._id}).select('+password')

   if ( !(await req.user.correctPassword(oldpassword, userPass.password)))
    return next(new AppError("Password Is Incorrect", 401));
   userPass.password = newPassword;
   userPass.passwordConfirm = newPasswordConfirm;
   await userPass.save();
createSendToken(userPass,200,res)


})


  //  const token = signToken(userPass._id);
  //  res.status(200).json({
  //    success: "User's Password Ressetd Successfully",
  //    token,
  //  });
// if(!(user.passwordResetExpires>Date.now()))return next(new AppError("Token Expired","Token Expired",404))
// console.log(!(user.passwordResetExpires*1>Date.now()*1),`${user.passwordResetExpires*1}>${Date.now()*1}`)
//               11:30              >     11:20
// const signToken = (id) =>
//   //make token based on id as a payload
//   jwt.sign(
//     {
//       id,
//     },
//     process.env.JWT_SECRET,
//     {
//       expiresIn: process.env.JWT_DURATION,
//     }
  
//   );
  // await sendEmail({
  //   email:"toto2013elkondkly92@gmail.com",
  //   subject:"Your password reset token (valid for 10 min)"
  //   ,message:message
  // })