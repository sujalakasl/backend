import mongoose from 'mongoose';


export const connectDB = async () => {

    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");

    } catch (error) {
        console.error(`Error connecting to database!!!: ${error.message}`);
        process.exit(1);//exit with error
    }
}