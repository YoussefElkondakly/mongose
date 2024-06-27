const express=require('express')

const authController = require('../controllers/authController')

const router=express.Router()
router.get('',authController.getAllusers)
router.post('/signUp',authController.signUp)
router.post('/login',authController.login)
router.post('/forgotPassword',authController.forgotPassword)
router.post('/resetPassword',authController.resetPassword)
module.exports=router