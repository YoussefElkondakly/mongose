require('dotenv').config()
const mongoose=require('mongoose')
const app=require('./app.js')
const pass=process.env.DB_PASSWORD
const DB=process.env.DB_CONNECT.replace("<PASSWORD>",pass)
const LocDB=process.env.DB_LOCAL
const port=process.env.PORT || 3000
mongoose.connect(DB).then(co=>{console.log("Connected Successfully to "+co.connections[0].name+" Database")
    app.listen(port,()=>{
        console.log("Server Starts ON Port "+port)
        // console.log(process.env.NODE_ENV)
        })
})

process.on('unhandledRejection',(e)=>{
console.log(e.message)
process.exit(1)
})

// process.on('uncaughtException',(e)=>console.error(e.message))
// console.log(d)
/**
 * {
    //options to deal with deprecation warnings 
    useNewUrlParser: true,
    useUnifiedTopology: true
}
 */