import mongoose  from "mongoose";

const connectDb= async()=>{
  try {
    await mongoose.connect(process.env.MONGO_URI,{dbName:"mernAuthentication",})
    console.log("MongoDb Connected");
  } catch (error) {
    console.log("Failed to connect with DB");
  }
}

export default  connectDb;