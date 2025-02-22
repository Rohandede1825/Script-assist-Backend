import mongoose, { model,  Schema } from "mongoose";


mongoose.connect('mongodb://localhost:27017/Brainly')

const UserSchema = new Schema ({
    email:{
        type:String,
    },
    password:String

})

export const UserModel =  model ( "User", UserSchema);



const ContentSchema = new Schema ({
    title:String,
    link:String,
   /* tags:[{type:mongoose.Types.ObjectId, ref:'Tag'}],
    userId:{
        type:mongoose.Types.ObjectId, 
        ref:'User', 
        require:true
    }*/
})

export const ContentModel = model ("Content", ContentSchema)

const LinkSchema = new Schema ({
    hash:String, 
    userId:{type:mongoose.Types.ObjectId, ref:'User',require:true,
    unique:true
},
})

export const LinkModel = model("Link", LinkSchema)