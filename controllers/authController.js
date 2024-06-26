// const mongoose=require('mongoose')
const User=require('./../models/userModel')
const catchAsync = require('../myPublicClasses/catchAsync')


exports.signUp=catchAsync(async function(req,res,next){
const user=await  User.create(req.body)
res.status(201).json({
    success:"success",
    data:{
        user
    }
})
})