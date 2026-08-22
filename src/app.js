import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

//basic configuration 
app.use(express.json({ limit : "16kb"}))
app.use(express.urlencoded({extended: true , limit : "16kb"}))
app.use(express.static("public"))

app.use(cookieParser)


//cors configuration 
app.use(cors({
    origin : process.env.CROS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials : true,
    methods : ["GET","POST","PUT","PAYCH","DELETE","OPTIONS"],
    allowedHeaders : ["Content-Type","Authorization"],
    
}))


//import the routes
import healthCheckRouter from "./routes/healthCheck.route.js";
import authpRouter from "./routes/auth.routes.js"
import projectRouter from "./routes/project.routes.js"

app.use("/api/v1/heathcheck", healthCheckRouter)
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/projects", projectRouter)



app.get("/", (req , res) =>{
    res.send("Welcome to basecampy");
})
export default app;