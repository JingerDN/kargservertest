const Router=require("express");
const User=require("../models/User");
const bcrypt=require("bcryptjs");
const config=require("config");
const jwt=require("jsonwebtoken");
const {check,validationResult}=require("express-validator");
const router=new Router();
const authMiddleware=require("../middleware/auth.middleware");
//const fileService=require("../services/fileService");
//const File=require("../models/File");

router.get("/checkget",(req,res)=>{
    return res.json({message:"Get request is working"});
})

router.post("/registration",
[
    check('email','Uncorrect email').isEmail(),
    check('password','Password must be longer than 6 and shorter than 20 characters').isLength({min:6,max:20}) 
],
async (req,res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        const {email,password}=req.body;
        const candidate=await User.findOne({email});
        if(candidate){
            return res.status(400).json({message:`User with email ${email} already exist`});
        }
        const hashPassword=await bcrypt.hash(password,8);
        const user= new User({email,password:hashPassword});
        await user.save();
        console.log(user.id);//have got
        //await fileService.createDir(req, new File({user:user.id,name:" "}))
        console.log("wat's up there?");//not work
        return res.json({message:`User was created`});

    }
    catch(e){

    }
});
router.post("/login",
async(req,res)=>{
    try{
        const { email, password } = await req.body;
        const user=await User.findOne({email});

        if(!user){
            return res.status(400).json({message:"User not found"});
        }

        const isPassValid=bcrypt.compareSync(password,user.password);
        if(!isPassValid){
            return res.status(401).json({message:"Invalid password"});
        }

        const token=jwt.sign({id:user.id},config.get("secretKey"),{expiresIn:"1h"});
        return res.json({
            token,
            user:{
                id:user.id,
                email:user.email,
                diskSpace:user.diskSpace,
                usedSpace:user.usedSpace,
                avatar:user.avatar

            }
        })
    }
    catch(e){
        console.log(e);
        res.send({message:"Server error"});
    }

});
router.get("/auth",authMiddleware,
async(req,res)=>{
    try{
        const user=await User.findOne({_id:req.user.id});
        console.log(user);
        const token=jwt.sign({id:user.id},config.get("secretKey"),{expiresIn:"1h"});
        return res.json({
            token,
            user:{
                id:user.id,
                email:user.email,
                diskSpace:user.diskSpace,
                usedSpace:user.usedSpace,
                avatar:user.avatar

            }
        });
    }
    catch(e){
        console.log(e);
        res.send({message:"Server error"});
    }

});
module.exports=router;

