import mongoose from "mongoose";

 const databaseURL: string = "mongodb://127.0.0.1:27017/newsapp";
const connectDB =async ()=>{

    try {
        await mongoose.connect(databaseURL);
    } catch (error) {
    console.log('Connect error:',error);
    }
}


 export default connectDB;