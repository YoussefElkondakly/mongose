const express=require('express')

const authController = require('../controllers/authController')

const router=express.Router()
router.post('/signUp',authController.signUp)
module.exports=router