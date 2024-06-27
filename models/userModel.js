const crypto=require('crypto')
const mongoose = require('mongoose')
const validator=require('validator')
const bcrypt=require('bcrypt')
const userSchema =new mongoose.Schema(
    {
    name: {
        type: String,
        required: [true,"Please Enter Name"],
        unique: true
    },
    email: {
        type: String,
        required: [true,"Please Enter E-mail"],
        unique: true,
        lowercase:true,
        validate:[validator.isEmail,"Please Enter Valid Email"]
  
    },
role:{
    type:String,
    enum:['user','guide','lead-guide','admin'],
    default:'user'
},
     photo: String,

    password: {
        type: String,
        required: true,
        minlength:[8,"The Pass Must be at least 8 characters"],
        maxlength:[16,"The Pass Must be at most 16 characters"],
        select:false
    }, passwordConfirm: {
        type: String,
        required: [true,"please Confirm Password"]
        ,validate:{
            // This only works on CREATE and SAVE!!! can not be work with the patch
            validator:function(element){
                return element===this.password
            },
        message:"Incorrect"
        },

    }
    ,passwordChangedAt: Date,passwordResetToken:String,
    passwordResetExpires:Date,  


})
console.log("Test")
userSchema.methods.correctPassword=async function(givenPassword,userPassword){
    return await bcrypt.compare(givenPassword,userPassword)
} 
userSchema.methods.changedUserAfter=function(JWTimeStamp){
if(this.passwordChangedAt){
    const changedTimeStamp=this.passwordChangedAt.getTime()/1000
    return JWTimeStamp<changedTimeStamp  
}
return false
}
userSchema.methods.createPasswordResetToken=function(){
    const resetToken= crypto.randomBytes(32).toString('hex')
    this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex')
    console.log({resetToken},this.passwordResetToken)
    this.passwordResetExpires=Date.now()+10*60*1000
    return resetToken
}
userSchema.pre('save',async function(next){
    //if not isModified no  
    if(!this.isModified('password'))return next()
        this.password=await bcrypt.hash(this.password,12)
        this.passwordConfirm=undefined
    next()
})

const User=mongoose.model('User', userSchema)

module.exports=User



  //     enum:{
    //         values:["@", ".","com"],
    //    message:"Email must contain @example.com"
    //     }
        // validate:{
        //     validator: function(v){

        //         return /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(v);

        //     }
        // },
         