const AppError=require('./AppError')
const splitJoiner = (qstr) => {
  return qstr.split(",").join(" ");
};  
class ApiFeatures {
    constructor(query, queryObj, extra = null) {
      this.extra = extra;
      this.query = query;
      this.queryObj = queryObj;
    }
    filter() {
      const f = ["sort", "field", "page", "limit"];
      let queryFilterdObj = { ...this.queryObj };
      f.forEach((el) => delete queryFilterdObj[el]);
      queryFilterdObj = JSON.stringify(queryFilterdObj).replace(
        /\b(gt|gte|lt|lte)\b/g,
        (m) => `$${m}`
      );
      console.log(queryFilterdObj)
      //this.query=Tour.find()
      this.query = this.query.find(JSON.parse(queryFilterdObj));
      return this;
    }
    sort() {
      if (this.queryObj.sort) {
        //price,ratingsAverage
        const sortBy = splitJoiner(this.queryObj.sort);
        this.query = this.query.sort(sortBy);
  
        /*query=query.sort(req.query.sort)*/
      } else {
        this.query = this.query.sort("-createdAt");
      }
      return this;
    }
    field() {
      this.queryObj.field
        ? (this.query = this.query.select(splitJoiner(this.queryObj.field)))
        : (this.query = this.query.select("-__v"));
      return this;
    }
    async paginate() {
      // try{
      const page = this.queryObj.page * 1 || 1;
      const limit = this.queryObj.limit * 1 || 10;
      const skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit);
  
      //see the ccount of the documents
      if (this.queryObj.page && this.extra !== null) {
        const count = await this.extra;
        if (skip >= count) throw new AppError("Page Not Found",404);
      }
  
      return this;
    }
  }
  
  module.exports=ApiFeatures