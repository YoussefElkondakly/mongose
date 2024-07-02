const catchAsync = require("./../myPublicClasses/catchAsync");
const AppError = require("./../myPublicClasses/AppError");
const User = require("./../models/userModel");
const factory = require("./factoryHandler");
const filterObj = function (obj, ...allowedFields) {
  let newObj = {};
  Object.keys(obj).forEach((el) => {
    {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    }
  });
  return newObj;
};
exports.getMe=(req,res,next)=>{
  req.params.id=req.user.id;
  next();
}
exports.getUser = factory.getOne(User);
exports.getAllusers = factory.getAll(User)

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password)
    return next(new AppError("You Can Not Update Password Here", 400));
  const filteredObj = filterObj(req.body, "name", "email");
  console.log(filteredObj);
  const id=req.user._id.toString()
  console.log("JOE: ",id)
  const user = await User.findByIdAndUpdate(
    id,
    // {name: req.body.name,email: req.body.email,}
    filteredObj,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!user) return next(new AppError("somthin went wrong", 401));
  res.status(200).json({
    success: true,
    data: user
    });

});

exports.deleteMe=catchAsync(async (req,res,next)=>{
    const id=req.user._id.toString()
    const user=await User.findByIdAndUpdate(id,{active:false})
    if(!user)return next(new AppError("somthin went wrong",401))
        res.status(204).json({
    success:true,
    data:null
    });

})
