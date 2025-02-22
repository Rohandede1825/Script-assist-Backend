import express from 'express'
import mongoose  from 'mongoose'
import jwt from 'jsonwebtoken'
import { userMiddleware } from './middleware';
import cors from 'cors';
import { ContentModel, LinkModel, UserModel } from './db';
const port = 3000;
import { JWT_PASSWORD } from './config';
import { random } from './utils';

const app = express();
app.use(express.json())

app.use(cors());

// ✅ (Optional) Custom CORS Configuration
const corsOptions = {
  origin: "https://script-assist-alpha.vercel.app/", // Allow requests only from this origin
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(corsOptions));

app.post('/api/v1/signup',  async(req, res)=>{
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


app.post('/api/v1/content/', userMiddleware,  async (req, res) => {
    const link = req.body.link;
    const type= req.body.type;

    await ContentModel.create({
        link,
        type,
        title: req.body.title,
        tags:[],
        //@ts-ignore
        userId:req.userId,
    })
     res.json({
        message:"content added "
    })
})

app.get('/api/v1/content', userMiddleware, (req, res)=>{
    //@ts-ignore
    const userId = req.userId;

    const content  = ContentModel.find({
        userId: userId,
    }).populate("userId", "email")

    res.json({
        content
    })
})

app.delete('api/v1/content', userMiddleware, async (req, res)=>{
    const contentId = req.body.contentId;
    await ContentModel.deleteMany({
        contentId,
        //@ts-ignore
        userId: req.userId
    })
    res.json({
        message:"content deleted"
    })
})

app.post('api/v1/brain/share', userMiddleware, async (req, res)=>{
    const share = req.body.share

    if(share){
        const existingLink = await LinkModel.findOne({
            //@ts-ignore
            userId:req.userId
        })
        if(existingLink){
            return
        }
        const hash = random(10);
        await LinkModel.create({
            //@ts-ignore
            userId: req.userId,
            //@ts-ignore
            hash: hash
        })
        res.json({
            //@ts-ignore
            hash:existingLink.hash
        })

    }else{
        await LinkModel.deleteOne({
            //@ts-ignore
            userId:req.userId
        })
        res.json({
            message:"Removed link "
        })
    }
})

//26.41



app.post('api/v1/brain:shareLink', async(req, res)=>{
    const hash = req.params.shareLink;
    const links = await LinkModel.findOne({
        hash
    })
    
    if(!links){
        res.status(411).json({
            message:"sorry incorrect input"
        })
        return;
    }

    const content = await ContentModel.find({
        userId:links?.userId
    })
    const user = await UserModel.find({
        userId: links.userId
    })
    if(!user){
        message:"user is not present or null"
    }
    
    res.json({
        //@ts-ignore
        email:user.email,
        content:content
    })
})




app.listen(port)










