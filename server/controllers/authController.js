
//login for employee and admin
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const login = async (req, res) => {
    try {
        const { email, password, role_type } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Invalid credentials"
            })

        }
        if(role_type === "admin" && user.role !== "ADMIN"){
            return res.status(401).json({
                success: false,
                message: "Not authorized as admin"
            })
        }
          if(role_type === "employee" && user.role !== "EMPLOYEE"){
            return res.status(401).json({
                success: false,
                message: "Not authorized as employee"
            })
        }

        const isValid = await bcrypt.compare(password,user.password)
        if(!isValid){
             return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            })
        }
        const payload = {
            userId:user._id.toString(),
            role:user.role,
            email:user.email
        }

        const token = jwt.sign(payload,process.env.JWT_SECRET,{
            expiresIn:'7d'
        })
        return res.status(200).json({
                success: true,
               user:payload,
               token
            })

    } catch (error) {
        console.log("Login error",error)
        return res.status(500).json({
            success:false,
            message:'Login failed'
        })

    }

}

const session = async(req,res)=>{
    const session = req.session;
    return res.json({user:session})
}

const changePassword = async(req,res)=>{
    try{
        const session = req.session;
        const {currentPassword,newPassword} = req.body;
        if(!currentPassword || !newPassword){
            return res.status(400).json({
                success:false,
                message:"Both passwords are required"
            })
        }
        const user = await User.findById(session.userId)
        if(!user){
              return res.status(404).json({
                success:false,
                message:"User not found"
            })

        }
        const isValid = await bcrypt.compare(currentPassword,user.password);
        if(!isValid){
              return res.status(400).json({
                success:false,
                message:"current password is incoorect"
            })
        }
        const hashed = await bcrypt.hash(newPassword,10)
        await Use.findByIdAndUpdate(session.userId,{password:hashed})
          return res.status(200).json({
                success:true,
               
            })


    } catch(error){
        console.log(error)
          return res.status(500).json({
                success:false,
                message:"failed to change the password"
            })

    }
}

module.exports = {login,changePassword,session}