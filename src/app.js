require('dotenv').config();
const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const cookieParser=require("cookie-parser");
const auth = require("./middleware/auth");
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const crypto = require('crypto');
const Road=require('./models/roads');
 //require("./db/conn");
mongoose.connect("mongodb+srv://sakshigupta72985:mongocluster@cluster0.e0q8bep.mongodb.net/user");
const User= require("./models/user");
const {json} = require("express");
const roads = require('./models/roads');
const port =process.env.PORT || 3000;
const static_path = path.join(__dirname,"../public");
const template_path = path.join(__dirname,"../templates/views");
const partials_path = path.join(__dirname,"../templates/partials");
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));
app.use(express.static(static_path));
app.set("view engine","hbs");
app.set("views",template_path);
hbs.registerPartials(partials_path);
const ResetToken = mongoose.model('ResetToken', {
    userId: String,
    token: String,
    expiresAt: Date,
  });
  app.get("/",(req,res)=>{
    res.render("index",{data:true});
});
app.get('/search/:name',async(req,res)=>{
  const roadName=req.params.name;
  const result=await Road.find({"roadName":roadName});
  if(result){
    res.status(201).send(result);
    console.log(result)
  }else{
    res.status(404).json({"err":"invalid request"})
  }
})
app.get('/updateRoad/:token', async (req, res) => {
  const token = req.params.token;
  try {
    res.render('updateRoad', {token});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}); 
app.get("/updateRequest",(req,res)=>{
  res.render("updateRequest");
});
app.get("/search",(req,res)=>{
  res.render("search");
});
app.get("/login",(req,res)=>{
     res.render("login");
});
app.get("/signup",(req,res)=>{
    res.render("signup");
});
app.get('/admin',(req,res)=>{
  res.render('admin')
})
 app.get("/aboutus",(req,res)=>{
     res.render("aboutus");
 });
app.get("/forgot-password",(req,res,next)=>{
    res.render("forgot-password");

});
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'sakshigupta72985@gmail.com', // Replace with your Gmail email
      pass: 'mzqm mptd memv vfqa', // Replace with your Gmail password connect ETIMEDOUT 74.125.68.108:465
    },
  });
  app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
     const userId= user.id
      const token = await ResetToken.findOne( {userId} );
      console.log("token is")
      console.log(token.token)
      const mailOptions = {
        from: 'yoyo72985@gmail.com', // Replace with your Gmail email
        to: user.email,
        subject: 'Password Reset Request',
        text: `Click the following link to reset your password: http://localhost:3000/reset-password/${token.token}`,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ message: 'Error sending email' });
        }
        console.log('Email sent: ' + info.response);
        res.json({ message: 'Password reset email sent' });
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  app.post('/admin-update-road', async (req, res) => {
    const { email } = req.body;
    const { name } = req.body;
    try {
      const road = await Road.findOne({ name });
      if (!road) {
        return res.status(404).json({ message: 'Road not found' });
      }
      console.log(road)
      const roadId= road._id
      console.log(roadId)
      const mailOptions = {
        from: 'yoyo72985@gmail.com', // Replace with your Gmail email
        to: email,
        subject: 'Update details Request',
        text: `Click the following link to update road data: http://localhost:3000/updateRoad/${roadId}`,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ message: 'Error sending email' });
        }
        console.log('Email sent: ' + info.response);
        res.json({ message: 'Email to update roads detail is sent' });
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  app.post('/road-update-request', async (req, res) => {
      const mailOptions = {
        from: `email`, // Replace with your Gmail email
        to: 'sakshigupta72985@gmail.com',//'',
        subject: 'Road updation',
        text: `I want to update the ${req.body.name} road details. My email is ${req.body.email}`,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ message: 'Error sending email' });
        }
        console.log('Email sent: ' + info.response);
        res.json({ message: 'Road updation email sent' });
      });
  });
  //$2a$10$/aItsAfmx5LWFRXjyKCl6u5YSk6p7QY.ixuk42b2ZDovb0UiQb6Ku
   app.put('/reset-password/:token', async (req, res) => {
     const { token } = req.params;
     const { newPassword } = req.body;
     try {
       const resetToken = await ResetToken.findOne({ token });
       console.log(token)
       if (!resetToken || resetToken.expiresAt < new Date()) {
         return res.status(400).json({ message: 'Invalid or expired token' });
       }
       const user = await User.findById(resetToken.userId);
       if (!user) {
         return res.status(404).json({ message: 'User not found' });
       }
       const hashedPassword = await bcrypt.hash(newPassword, 10);
       user.password = hashedPassword;
       await user.save();
       res.json({ message: 'Password reset successful' });
     } catch (error) {
         console.log(error);
         res.status(500).json({ message: 'Internal server error' });
       }
     });
     app.get('/reset-password/:token', async (req, res) => {
         const token = req.params.token;
         try {
           const user = await User.findOne({
             resetToken: token,
             resetTokenExpiry: { $gt: Date.now() },
           });
           res.render('reset-password', { token });
         } catch (err) {
           console.error(err);
           res.status(500).json({ message: 'Internal server error' });
         }
      }); 
app.get("/search-road/:name",async(req,res)=>{
  const name=req.params.name;
  let result=await Road.find({name:name}).select('-_id')
  res.send(result)
});
app.put('/road-update/:id',async(req,res)=>{
  const name=req.body.name
  const contractorCompany=req.body.contractorCompany
  const  contractorName=req.body.contractorName
  const contractstartingDate=req.body.contractstartingDate
  const contractendingDate=req.body.contractendingDate
  const Tenure=req.body.Tenure
  console.log(name,contractorCompany, contractorName,contractstartingDate,contractendingDate,Tenure)
      try {
          let result=await Road.updateOne({
              _id:req.params.id},{$set:{
                name:name,
                contractorCompany:contractorCompany,
                contractorName: contractorName,
                contractstartingDate:contractstartingDate,
                contractendingDate: contractendingDate,
                Tenure:Tenure
              }})
              res.send(result)
      } catch (error) {
          res.json({err:error.message})
      }
})
app.get("/logout",auth,async(req,res)=>{
    try{
        console.log(req.user);
        req.user.tokens = req.user.tokens.filter((currElement)=>{
            return currElement.token===!req.token
        })
        res.clearCookie("jwt");
        console.log("logout successfully..")
        await req.user.save();
        res.render("login");
    }catch(error){
        res.status(500).send(error);
    }
})
app.get('*',(req,res)=>{
    res.render("404",{
        errorcoment:"<h1>Opps 🤦‍♀️ page couldn't be found</h1>",
    });
});
app.post("/signup",async (req,res)=>{
    try{
        const password = req.body.password;
        const cpassword = req.body.confirm_password;
        if(password===cpassword){
            const registerEmployee= new User({
                name:req.body.name,
                email:req.body.email,
                password:await bcrypt.hash(password,10),
                confirm_password:cpassword
            })
            console.log("the success part"+registerEmployee);
            const token =  await registerEmployee.generateAuthToken();
            console.log("the token part"+token);
            res.cookie("jwt",token,{
                expires:new Date(Date.now()+ 300000),
                httpOnly:true
            });
            const registered = await registerEmployee.save();
            console.log("the page part"+registered);
            res.status(201).render("front");

        }else{
            res.send("password are not matching")
        }
    }catch(error){
        res.status(400).send(error);
    }
});
app.post("/login",async(req,res)=>{
    try{
        const email = req.body.email;
        const password = req.body.password;
        if(email==="sakshi@gmail.com" && password==="1234"){
          res.status(201).render("admin");
        }else{
        const useremail = await User.findOne({email:email});
        const isMatch =await bcrypt.compare(password,useremail.password);
        const token =  await useremail.generateAuthToken();
        console.log("the token part  "+ token);
        res.cookie("jwt",token,{
            expires:new Date(Date.now()+ 300000),
            httpOnly:true
        });
      const expiresAt = new Date(Date.now() + 300000);
      const e = useremail._id;
      await ResetToken.deleteMany({userId:e})
      
      const resetToken = new ResetToken({
        userId: useremail._id,
        token,
        expiresAt,
      });
      await resetToken.save();
        if(isMatch){
            res.status(201).render("front");

        }else{
            res.send("Invalid login details");
        }
      }
    }catch(error){       
      res.status(400).send("invalid login details");

    } 
}
);
app.listen(port,()=>{
    console.log(`server is running at port no ${port}`);
})