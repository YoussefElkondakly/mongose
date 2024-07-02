const express = require("express");
const reviewController = require("./../controllers/reviewController");
const authController = require("./../controllers/authController");

const router = express.Router()//{mergeParams: true});

router.use(authController.protect,);

router.get(
  "",
  // authController.protect,
//   reviewController.checkTour,
  reviewController.getReviews
);
router.get(
  "/:tourId",
  // authController.protect,
  reviewController.checkTour,
  reviewController.getReviewsByTour
);
router.post(
  "/:tourId/addReview",
  // authController.protect,
  authController.restrictTo("user"),
  reviewController.checkTour,
  reviewController.addReview
);
router.use(reviewController.identityCheck,)
router
  .route("/:id")
  .get(reviewController.getReview)
  .patch( reviewController.updateReview)
  .delete( reviewController.deleteReview);

module.exports=router
