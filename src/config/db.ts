import mongoose from "mongoose"
import dotenv from "dotenv"
import { log } from "console"

dotenv.config()

const connectDB = async  ()=> {
    try{
        await mongoose.connect(process.env.ATLAS_DB!)
        console.log("✅MONGO DB CONNECTED");
        
    }catch(error){
        console.error("❌ MongoDB connection error:", error);
         process.exit(1);
    }
    
}

export default connectDB