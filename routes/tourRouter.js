const express=require('express')
const tourController = require('../controllers/tourController')
const router=express.Router()
//remember and Focus on Ordring the routes 
router.route('')
.get(tourController.tours)
.post(tourController.addTour)
router.get('/top5cheap',tourController.check,tourController.tours)
router.get('/statics',tourController.toursStats)
router.get('/getMounthlyPlan/:year',tourController.getMounthlyPlan)

router.route('/:id')
.get(tourController.getTour)
.patch(tourController.updateTour)
.delete(tourController.deleteTour)



module.exports=router