import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("MongoDB is connected succesfully");


    } catch (error) {
        console.log(error);
        
        console.log("MongoDB are failed connections");

    }
}
