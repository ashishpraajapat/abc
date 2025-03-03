import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from "./app.js";
dotenv.config({
    path: './env'
})

connectDB().then(()=>{
    app.listen(process.env.PORT || 8089, ()=>{
        console.log(`App is listing on ${process.env.PORT} !!!`);
        
    })
}
).catch((error)=> console.error("MONGODB CONNECTION ERR !!: ",error)
)



/*
import express from "express"
const app = express()
;(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("ERRR: ",error);
            throw error
        })
        app.listen(process.env.PORT, ()=>{
            console.log(`App is listing on ${process.env.PORT}`);
            
        })
    }
    catch (error)
    {
        console.error("ERROR: ",error);
        throw error;
    }
})() */