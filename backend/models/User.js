import mongoose from "mongoose";

const schema= new mongoose.Schema({
  name:{
    type:string,
    require:true,
  },
   email:{
    type:string,
    require:true,
    unique:true,
  },
   password:{
    type:string,
    require:true,
  },
  role:{
    type:string,
   default:"user"
  },
  
},{timestamps:true});

export const User=mongoose.model("User",schema);