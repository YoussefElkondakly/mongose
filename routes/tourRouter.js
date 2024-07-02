const express=require('express')
const tourController = require('../controllers/tourController')
const authController=require('./../controllers/authController')
const reviewRouter=require('./reviewRouter')
const router=express.Router()

router.use("/:tourId/review",reviewRouter)
//remember and Focus on Ordring the routes
router.get('/top5cheap',tourController.check,tourController.tours)
router.get('/statics',tourController.toursStats)
router.get(
  "/getMounthlyPlan/:year",
  authController.protect,
  authController.restrictTo("admin", "lead-guide"),
  tourController.getMounthlyPlan
);
router.get('/tours-within/:distance/center/:lnglat/unit/:unit',tourController.getToursWithin)
router.get('/distances/:lnglat/unit/:unit',tourController.getDistances)

router
  .route("")
  .get(tourController.tours)
  .post(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.addTour
  );


router
  .route("/:id")
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.deleteTour
  );


module.exports=router