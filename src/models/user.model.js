import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
const userSchema= new Schema({
    username:{
        type: String,
        required:true,
        unique:true,
        lowercase:true,
        index:true
    },
    email:{
        type: String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    fullname:{
        type: String,
        required:true,
        index:true
    },
    avatar:{
        type:String,//thirdparty URL
        required:true,
    },
    coverImage:{
        type:String,//URL
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true,'password is req!!!']
    },
    refreshToken:{
        type:String,
    }
}, {timestamps:true})

userSchema.pre("save",async function (next){
    if(!this.isModified("password")) return next();
    this.password=bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect= async function (password) {
   return await bcrypt.compare(password, tis.password)
    
}
 

export const User= mongoose.model("User",userSchema)