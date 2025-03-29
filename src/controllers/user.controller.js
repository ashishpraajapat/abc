import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import jwt  from "jsonwebtoken";
const generateAccessandRefreshTokens= async(userid)=>{
    try {
        const user = await User.findById(userid)
        const accessToken=await user.generateAccessToken()
       const refreshToken= user.generateRefreshToken()
       user.refreshToken=refreshToken
      await  user.save({validateBeforeSave:false})
      return {accessToken,refreshToken}
    } 
    
    catch (error) {
        throw new apiError(500, "something went wrong while genrating tokens")
    }
}
const registerUser= asyncHandler(async (req,res)=>{

   console.log("REQUEST IS COMMING!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n")
    //getting data from user
    const{ fullname, email, username,password}= req.body
    // console.log("email: ",email)

    //validation
    if(fullname.trim()===""){
        throw new apiError(400,"fullname is required")
    }
    if(username.trim()===""){
        throw new apiError(400,"username  is required")
    }
    if(email.trim()===""){
        throw new apiError(400,"email is required")
    }
    if(password.trim()===""){
        throw new apiError(400,"password is required")
    }

    const existed=await User.findOne({$or:[{username},{email}]})
    if(existed){
        throw new apiError(409,"User with email and username already exist")
    }

//    const avatarLocalpath= req.files?.avatar[0]?.path;
//    const CoverImgLocalpath= req.files?.coverImg[0]?.path;
    const avatarFile = req.files?.avatar ? req.files.avatar[0] : null;
    const coverImgFile = req.files?.coverImage ? req.files.coverImage[0] : null;
    const avatarLocalpath = avatarFile?.path; // This is the path to the avatar file
    const CoverImgLocalpath = coverImgFile?.path || "";
    if(!avatarLocalpath){
        throw new apiError(400,"Avatar img is not there..")
    }

    await User.create({
        fullname:fullname,
        username:username.toLowerCase(),
        email:email,
        password:password,
        avatar:avatarLocalpath,
        coverImage:CoverImgLocalpath,
    
    })
    const user = await User.findOne({ username }).select("-password -refreshToken");
   if(!user){
    throw new apiError(500,"something went wrong while registering the user")
   }
   else{
    console.log("user created")
   }
   const userResponse = {
    fullname: user.fullname,
    avatar: user.avatar,
    coverImage: user.coverImage,
    email: user.email,
    username: user.username,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
//   console.log("USER: ",user)
//   console.log("\nUSER RESPONSE: ",userResponse)
 return res.status(201).json(
    new apiResponse(200,userResponse,"user registered successfully!!")
 )
})
const loginUser= asyncHandler(async (req,res)=>{

    // checking Req.body
    console.log(req.body)
    const {email,username, password} = req.body
    
    if(!username || !email){
        throw new apiError(400,"username and email required!!")
    }
    const user= await User.findOne(
        {
            $or:[{username},{email}]
        }
    )
    if(!user){
        throw new apiError(404, "user does not exist")
    }
    const ispassValid=await user.isPasswordCorrect(password)
    if(!ispassValid){
        throw new apiError(401,"Invalid user Credentials")
    }
const {accessToken,refreshToken} = await generateAccessandRefreshTokens(user._id)
    //check for username, email
    //find the user
    //check for validation, passwword checking
    // access and refresh tokens
    // send cookies


    const loggedInUser=await User.findById(user._id).
    select('--password --refreshToken')

    const options = {
        httpOnly: true,
        // secure: true // Ensure your site is served over HTTPS in production.
    };
    
    return res.status(200)
        .cookie("accessToken", accessToken, options)  // Use .cookie instead of .cookies
        .cookie("refreshToken", refreshToken, options) // Same for refreshToken
        .json(new apiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged in successfully"
        ));
})
const logoutUser= asyncHandler(async(req,res)=>{
     const user= User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new: true
        }
     )
     const options={
        httpOnly:true,
        // secure: true
    }
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new apiResponse(200,{},"User Logged Out")
    )
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    try {
        const incomingRefreshToken= req.cookies.refreshToken|| req.body.refreshToken
        
        if(!incomingRefreshToken){
            throw new apiError(401,"unauthorized token")
        }
       const decodedtoken= jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
        const user=User.findById(decodedtoken?._id)
        if(!user){
            throw new apiError(401,"Invalid credential")
        }
        if(incomingRefreshToken!==user?.refreshToken){
            throw new apiError(401, ' Refresh token is expired or used')
        }
        const options= {
            httpOnly:true,
            // secure:true
        }
        const {accessToken,new_refreshToken}=await generateAccessandRefreshTokens(user._id)
    
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshtoken",new_refreshToken,options)
        .json(
            new apiResponse(
                200,
                {accessToken,refreshToken: new_refreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new apiError(401,error?.message||"invalid refresh token")
    }
})
export {registerUser,loginUser,logoutUser,refreshAccessToken}