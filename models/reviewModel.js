const mongoose = require("mongoose");
const Tour = require("./tourModel");
const reviewSchema = mongoose.Schema({
  content: {
    type: String,
    required: [true, "Please Type Content to this review"],
  },
  rating: {
    type: Number,
    min: [1, "the Rating Must be Between 1-5"],
    max: [5, "the Rating Must be Between 1-5"],
  },
  //this review by this user for this tour
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: "Tour",
    required: [
      true,
      "Please Insert Tour id (or Name to store its Id) keda keda all routes will be with params ID",
    ],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [
      true,
      "Please Insert User id (or Name to store its Id) keda keda all routes will be with params ID",
    ],
  },
  createdAt: { type: Date, default: Date.now },
});

reviewSchema.index(
  { tour: 1, user: 1 },
  {
    unique: true,
  }
);

reviewSchema.pre(/^find/, function (next) {
  if (typeof this._conditions.tour === "string")
    this.populate({ path: "tour", select: "name" });

  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: "$tour",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  //this.updateOrDelete = await this.findOne();
  this.updateOrDelete = await this.model.findOne(this.getQuery());
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  await this.updateOrDelete.constructor.calcAverageRatings(
    this.updateOrDelete.tour
  );
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
