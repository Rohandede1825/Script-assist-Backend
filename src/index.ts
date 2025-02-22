import express from 'express'
import mongoose  from 'mongoose'
import jwt from 'jsonwebtoken'
import { userMiddleware } from './middleware';
import cors from 'cors';
import { ContentModel, LinkModel, UserModel } from './db';
const port = process.env.PORT || 3000;
import { JWT_PASSWORD } from './config';
import { random } from './utils';

const app = express();
app.use(express.json())

app.use(cors());


const corsOptions = {
  origin: "https://script-assist-alpha.vercel.app/", 
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(corsOptions));

app.post('/api/v1/signup',  async(req, res)=>{
    const email = req.body.email;
    const existingUser = await UserModel.findOne({
        email
    })

    if(existingUser){
        res.status(411).json({
            message:"user already exists"
        })
        return;
    }

   try {
     const email = req.body.email;
     const password= req.body.password;
 
     await UserModel.create({
         email:email,
         password:password
     })
 
     res.json({
         message:"user created"
     })
   } catch (error) {
        res.status(411).json({
            message:"sommething went wrong "
        })
   }


   app.post('/api/v1/signIn', async(req, res)=>{
        const email = req.body.email;
        const password= req.body.password;

        const existUser = await UserModel.findOne({
            email, password
        })

        if(existUser){
            const token = jwt.sign({
                id:existUser._id
            }, JWT_PASSWORD)

            res.json({
                token
            })
        }else{
            res.status(403).json("invalid credentials")
        }
   })
})






app.listen(port)










