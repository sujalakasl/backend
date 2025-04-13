import mongoose from "mongoose";

//create a book schema
const bookSchema = new mongoose.Schema({
title:{
    type:String,
    required:true,
    unique:true
},
caption:{
    type:String,
    required:true
},
image:{
    type:String,
    required:true
},
rating:{
    type:Number,
    required:true,
    min:0,
    max:5
},
user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
},

},{timestamps: true} );

const Book = mongoose.model("Book", bookSchema);

export default Book;