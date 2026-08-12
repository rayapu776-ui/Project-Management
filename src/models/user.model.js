import mongoose, {Schema} from "mongoose"; 
import brcypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto"

const  userSchema = new Schema ({
    avatar: {
        type : {
            url: String,
            localPath : String ,
        },
        default:{
            url: ``,
            localPath : ``

        }
    },
    username : {
        type : String ,
        required : true ,
        unique : true,
        lowercase : true,
        trim : true,
        index : true,  
    },
    email : {
        type : String ,
        required : true,
        unique : true ,
        lowercase : true,
        trim : true,
    },
    fullName : {
        type : String ,
        trim : true,
    },
    password : {
        type : String,
        required : [true , "Password is required"]
    },
    isEmailVerified:{
        type : Boolean,
        default : false
    },
    refreshToken : {
        type : String 
    },
    forgotPasswordToken :{
        type : String 
    },
    forgetPasswordExpiry :{
        type : Date
    },
    emailVarficationToken : {
        type : String
    },
    emailVarficationExpiry : {
        type : Date
    }
},{
    timestamps : true,
},
)



// mongoose.model("User", userSchema);


userSchema.pre("save", async function (next){
    if(!this.isModiefied("password")) return next ()
        
   this.password = await brcypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await brcypt.compare(password, this.password)   
}

userSchema.methods.generateAccessToken = function () {
    jwt.sign({
        _id: this._id,
        email: this.email,
        username : this.username
    },
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn : process.env.ACCESS_TOKEN_EXPIRY}
)
}

userSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
        {
            _id : this._id,
            email: this.email,
            username : this.username
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: porcess.env.REFRESH_TOKEN_EXPIRY}
    )
}

userSchema.methods.generateTemporaryToken = function () {
    const unHashedToken = crypto.randomBytes(20).toString("hex")

    const hashedToken = crypto 
        .createHash("sha256")
        .update(unHashedToken)
        .digest("hex")

    const tokenExpiry = Date.now() + (20*60*1000) //20mins
    return {unHashedToken ,hashedToken , tokenExpiry }
}


export const User = mongoose.model("User", userSchema)