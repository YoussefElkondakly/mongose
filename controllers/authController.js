// const mongoose=require('mongoose')
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const bcrypt = require("bcrypt");

const User = require("./../models/userModel");
const catchAsync = require("../myPublicClasses/catchAsync");
const AppError = require("../myPublicClasses/AppError");
const sendEmail = require("../myPublicClasses/email");
const signToken = (id) =>
  jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_DURATION,
    }
  );
exports.signUp = catchAsync(async function (req, res, next) {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });
  const token = signToken(user._id);

  res.status(201).json({
    success: "success",
    token,
    data: {
      user,
    },
  });
});

exports.login = catchAsync(async function (req, res, next) {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError("Email And Password Must Be Added", 400));
  const user = await User.findOne({
    email,
  }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError("Email Or Password Is Incorrect", 401));
  const token = signToken(user._id);
  res.status(200).json({
    success: "success",
    token,
  });
  // }
});

exports.getAllusers = catchAsync(async function (req, res, next) {
  const users = await User.find();
  res.status(200).json({
    success: true,
    data: users,
  });
});

exports.protect = catchAsync(async function (req, res, next) {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  console.log(token);
  if (!token)
    return next(new AppError("You are not logged in! Please log in", 401));

  const verify = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(verify.iat);
  const currentUser = await User.findById(verify.id);
  if (!currentUser)
    return next(
      new AppError("The user belonging to this token does not exist", 401)
    );
  const d = currentUser.changedUserAfter(verify.iat);
  if (d)
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
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return next(new AppError("You do not have permission to perform this action", 403));
    next()
  }
}


exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body
  const user = await User.findOne({ email })
  if (!user) return next(new AppError("There is no user with that email address", 404))
  const resetToken = user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false })
  const resetURL = `${req.protocol}://${req.get('host')}/users/resetPassword/${resetToken}`
  const message = `Forgot your password ? Submit a password reset request here: ${resetURL}`

  try {
    console.log("You are in try")
    await sendEmail({
      email: 'toto2013elkondkly92@gmail.com',
      subject: `Your password reset token (valid for 10 minutes)`,
      message
    })
    res.status(200).json({ status: "success", message: "Token sent to email" })
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false })
    return next(new AppError('There was an error sending the email. Please try again later', 500))
  }


  // await sendEmail({
  //   email:"toto2013elkondkly92@gmail.com",
  //   subject:"Your password reset token (valid for 10 min)"
  //   ,message:message
  // })

}
exports.resetPassword = (req, res, next) => {

}
