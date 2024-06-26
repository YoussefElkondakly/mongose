const mongoose=require('mongoose')
const slug=require('slugify')
/*
"name":
duration"
 "maxGroupSize"
"difficulty":
"ratingsAverage":
   "ratingsQuantity":
"price": 397,
"summary":
 "description":
"imageCover":
"images":
"startDates": 
*/
const tourSchema=new mongoose.Schema({
name:{
    type:String,
    required:[true,'A tour must have a name'],
    unique:true,
    trim:true,
    maxlength:[40,'A tour name must have less or equal than 40 characters'],
    minlength:[10,'A tour name must have more or equal than 10 characters']
},
duration:{
    type:Number,
    required:[true,'A tour must have a duration']

},
maxGroupSize:{
    type:Number,
    required:[true,'A tour must have a max group size']
    },
    difficulty:{
        type:String,
        required:[true,'A tour must have a difficulty level'],
        // match:[/\b(easy|medium|difficult)\b/g,"The Difficulty must Be easy , medium or difficult"],
        enum:{
            values:['easy','medium','difficult'],
            message:'The Difficulty must Be easy , medium or difficult'
        }
        },
ratingsAverage:{
    type:Number,
    default:4.5,
    max:[5,"The Maximum Rating Is 5"],
min:[1,"The Minimum Rating Is 1"]
},
slug:String,
ratingsQuantity:{
    type:Number,
    default:0
    },

price:{
    type:Number,
    required:[true,'A tour must have a price']

},
discount:Number,
summary:{
    type:String,
    trim:true,
    required:[true,'A tour must have a summary']
    //@@only works for strings it FIXME
    //@@Removes all the white string in the begging and on the end of the StringFIXME
    },
    description:{
        type:String,
        trim:true
        },
    imageCover:{
        //its just the name of the image but the data itself will be stored locally
        //but we will store the refrence in the DB
        type:String,
        required:[true,'A Tour Must Have an Image']
    },    
images:[String],
createdAt:{
    type:Date,
    default:Date.now(),

},
startDates:[Date],
secretTour:{
    type:Boolean
    ,default:false
}
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});
tourSchema.virtual('durationWeek',).get(function(){
    return this.duration/7
})
tourSchema.virtual('createdAtString',).get(function(){
   
    if(this.createdAt!==undefined){const arr=['Sun',
        'Mon',
        'Tue',
        'Wed',
        'Thu',
        'Fri',
        'Sat'
    ]
    const n=new Date(this.createdAt)
    const day=arr[n.getDay()]
const date=`${n.getDate()}`.padStart(2,'')
const month=`${n.getMonth()+1}`.padStart(2,0)
const year=n.getFullYear()
const hour=n.getHours()
const muinute=n.getMinutes()
return "Created At "+day+' '+date+'-'+month+'-'+year+' at '+hour+' : '+muinute}
else {return "No Created At in Fields"}
})
tourSchema.pre('save',function(next){
    //حافظ حتة السلج حتى الآن
    this.slug= slug(this.name,{lower:true})
    console.log(this)
    next()
})
/**
 * tourSchema.post('save',function(doc,next){
    //حافظ حتة السلج حتى الآن  
    console.log(doc)
    next()
})
 */
tourSchema.pre(/^find/,function(next){
    //حافظ حتة السلج حتى الآن
  this.find({secretTour:{$ne:true}})
    next()
}) 
tourSchema.pre('aggregate',function(next){
    this.pipeline().unshift({ $match: { secretTour: { $ne: true }}})
    // this.match(
    //     {secretTour:{$ne:true}}
    // )
    // this.aggregate([{
    //     $match:{
    //         secretTour:{$ne:true}
    //     }
    // }])
    next()
})
const Tour=mongoose.model("Tour",tourSchema)

module.exports=Tour;

