import express from 'express';
import User from '../models/user.model.js'; 
console.log("User imported as: ", User);
import {registerValidation, loginValidation} from '../validation.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();


const router = express.Router();

router.post('/register',async (req,res)=> {

    // let's validate the data before we make a user
    const {error} = registerValidation(req.body);
    if (error) return res.status(400).json({message:error.details[0].message});

    // check if the user is already in the database
    const emailExist = await User.findOne({email: req.body.email});
    if (emailExist) return res.status(400).json({message:'Email already exists'})

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password,salt);

    // create a new user
    const user= new User({
        name:req.body.name,
        email:req.body.email,
        password:hashedPassword
    });
    try{
        const savedUser=await user.save();
        res.json({user: user._id});
    }catch(err){
        res.status(400).json({err})
    }
});


// login
router.post('/login',async (req,res)=> {
    
    // let's validate the data before we make a user
    const {error} = loginValidation(req.body);
    if (error) return res.status(400).json({message:error.details[0].message});

    // check if email is correct
    const user = await User.findOne({email: req.body.email});
    if (!user) return res.status(400).json({message:'Email not found'})
    
    // check is pasword is correct
    const validPassword = await bcrypt.compare(req.body.password,user.password);
    if (!validPassword) return res.status(400).json({message:'Password is wrong'});

    // create and assign a token
    const token =jwt.sign({ userId: user._id}, process.env.TOKEN_SECRET);
    res.header('auth-token',token).json({token});
})

export default router;