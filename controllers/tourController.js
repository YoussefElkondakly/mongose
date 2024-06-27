const Tour = require("../models/tourModel");
const AppError = require("../myPublicClasses/AppError");
const catchAsync = require("../myPublicClasses/catchAsync");
const ApiFeatures = require("./../myPublicClasses/ApiFeatures");

exports.check = function (req, res, next) {
  req.query.limit = "5";
  req.query.field = "name,price,ratingsAverage,difficulty,summary";
  req.query.sort = "-ratingsAverage,price";
  console.log(req.query);
  next();
};

exports.tours = catchAsync(async function (req, res, next) {
  const tss = new ApiFeatures(Tour.find(), req.query, Tour.countDocuments())
    .filter()
    .sort()
    .field();
  await tss.paginate();

  let tours = await tss.query;
  tours=tours.length === 0?"No":tours

  // console.dir(tours)
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.addTour = catchAsync(async function (req, res, next) {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      tour: newTour,
    },
  });
});
exports.getTour = catchAsync(async function (req, res, next) {
  const tour = await Tour.findById(req.params.id);
  if (tour === null) throw new AppError("No tour found with that ID",404);
  
  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});
exports.updateTour = catchAsync(async function (req, res, next) {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    //to run the validator again  when Updating
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});
exports.deleteTour = catchAsync(async function (req, res, next) {
 const deleting= await Tour.findByIdAndDelete(req.params.id)
 if(!deleting)return next(new AppError("The Provideied Id Is Not Valid",404))   
 res.status(204).json({
    status: "success",
    data: null,
  });
});
exports.toursStats = catchAsync(async function (req, res, next) {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $lte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },

        a7aRating: { $avg: "$ratingsAverage" },
        a7aMax: { $max: "$price" },
        a7aMin: { $min: "$price" },
        a7aAvg: { $avg: "$price" },
      },
    },
    { $sort: { a7aAvg: 1 } },
  ]);

  res.status(200).json({
    status: "success",
    statics: {
      stats,
    },
  });
});
exports.getMounthlyPlan = catchAsync(async function (req, res, next) {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    //deconstructs the array items
    { $unwind: "$startDates" },
    //filtering Items based on the Year
  
    {
      $match: {
        startDates: {
          $gte: new Date(year + "-01-01"),
          $lte: new Date(year + "-12-31"),
        },
      },
    },
    //It returns the required Bussiness data
    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    //add a field beneath the group
    { $addFields: { mounth: "$_id" } },
    //edit any value of the data to be hiddien or somthin  else I already did not know it
    { $project: { _id: 0 } },
    // sort ascending 1 descending -1
    { $sort: { numTourStarts: -1 } },
    //limit the result to be a certain length to reduce recevein unlimited values
    { $limit: 5 },
  ]);
  res.status(200).json({
    status: "success",
    year: year,
    results: plan.length,
    mounthlyPlan: {
      plan,
    },
  });
});

//FELTERD Query
// console.dir(tss)
// const f = ['sort', 'field', 'page', 'limit']
// let queryObj = { ...req.query };
// f.forEach(el => delete queryObj[el])
// queryObj = JSON.stringify(queryObj).replace(/\b(gt|gte|lt|lte)\b/g, m => `$${m}`)
// console.log(queryObj)
// Make QUERY
// let query = Tour.find(JSON.parse(queryObj))
//SORT
// if (req.query.sort) {
//     //price,ratingsAverage
//     const sortBy = splitJoiner(req.query.sort)
//     console.log(sortBy)
//     query = query.sort(sortBy)

//     /*query=query.sort(req.query.sort)*/

// } else {
//     query = query.sort('-createdAt')
// }

//including //excluding use minus
// req.query.field ? query = query.select(splitJoiner(req.query.field)) : query = query.select('-__v')

//pagination
// const page = req.query.page * 1 || 1
// const limit = req.query.limit * 1 || 10
// const skip = (page - 1) * limit

// query = query.skip(skip).limit(limit)
// //see the ccount of the documents
// if (req.query.page) {

//     const count = await Tour.countDocuments()
//     if (skip >= count) throw new Error("undefind");
// }
