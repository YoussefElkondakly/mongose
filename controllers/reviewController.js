const Review = require("./../models/reviewModel");
const Tour = require("./../models/tourModel");
const catchAsync = require("./../myPublicClasses/catchAsync");
const AppError = require("./../myPublicClasses/AppError");
const factory = require("./factoryHandler");

exports.checkTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);
  if (tour === null)
    return next(new AppError("No tour found with that ID", 404));
  // req.use._id tour.reviews.
  req.tour = tour;
  next();
});

exports.addReview = catchAsync(async (req, res, next) => {
  // check tourID Existance
req.body.user=req.user._id
req.body.tour=req.params.tourId
  const newReview = await Review.create(req.body);
// content: req.body.content,
//     rating: req.body.rating,
//     user: req.user._id,
//     tour: req.params.tourId,
  res.status(201).json({
    status: "success you added The review Successfully",
    data: newReview,
  });
});
exports.getReviewsByTour = catchAsync(async (req, res, next) => {
  //you have tourID you need to aggrigate so
  const review = await Review.find({
    tour: req.params.tourId,
  });
  // console.log(review.length === 0);
  if (review.length === 0)
    return next(new AppError(`There Is no Reviews For ${req.tour.name} Tour`));
  res.status(200).json({
    status: "success you got The review Successfully",
    data: review,
  });
}); exports.getReviews =factory.getAll(Review)
// catchAsync(async (req, res, next) => {
//   //you have tourID you need to aggrigate so
//   // if you have a id
//   // let filter={}
//   // if(req.params.tourId)filter={tour:req.params.tourId}

//   const review = await Review.find();
//   // console.log(review.length === 0);
//   if (review.length === 0) return next(new AppError(`There Is no Reviews`));
//   res.status(200).json({
//     status: "success",
//     data: review,
//   });
// });
//this middleware function to check if the owner of the review is deleting his review
exports.identityCheck = catchAsync(async (req, res, next) => {
  if (!(req.user.role === "admin")) {
    const review = await Review.find({ user: req.user.id });
    if (review.length === 0)
      return next(new AppError("You Can't delete other's review",401));
  }
  next();
});

exports.getReview=factory.getOne(Review)

exports.updateReview=factory.updateOne(Review)
exports.deleteReview = factory.deleteOne(Review);
