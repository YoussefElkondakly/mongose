const catchAsync=require('./../myPublicClasses/catchAsync')
const AppError=require('./../myPublicClasses/AppError');
const ApiFeatures = require("./../myPublicClasses/ApiFeatures");

// const { populate } = require('dotenv');

exports.deleteOne=(Model)=>  catchAsync(async function (req, res, next) {
 const deleting= await Model.findByIdAndDelete(req.params.id)
 if(!deleting)return next(new AppError("The Provided Id Is Not Valid",404))   
 res.status(204).json({
    status: "success",
    data: null,
  });
}); 


exports.updateOne = (Model) =>catchAsync(async function (req, res, next) {
    const data = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      //to run the validator again  when Updating
      runValidators: true,
    });
    console.log("No Print Here",data)
    res.status(200).json({
      status: "success",
      data: {
        data,
      },
    });
  });

  exports.addOne = (Model) =>
    catchAsync(async function (req, res, next) {
      const newData = await Model.create(req.body);
      res.status(201).json({
        status: "success",
        data: {
          newData: newData,
        },
      });
    });

    exports.getOne=(Model,populateOpt)=>{
return catchAsync(async (req,res,next)=>{
  let query=Model.findById(req.params.id)
  if(populateOpt)query=Model.findById(req.params.id).populate(populateOpt)
    const data=await query  
  if(!data)return next(new AppError("The Provided Id Is Not Valid",404))
    res.status(200).json({
  status: "success",
  data: {
    data: data,
    },
})
    })}

    exports.getAll = (Model) =>
      catchAsync(async function (req, res, next) {
        const tss = new ApiFeatures(
          Model.find(),
          req.query,
          Model.countDocuments()
        )
          .filter()
          .sort()
          .field();
        await tss.paginate();

        let tours = await tss.query;
        tours = tours.length === 0 ? "No" : tours;

        // console.dir(tours)
        res.status(200).json({
          status: "success",
          results: tours.length,
          data: {
            tours,
          },
        });
      });