const Employee = require("../models/Employee");

//get profile

const getProfile = async(req,res)=>{
    try{
        const session = req.session;
        const employee = await Employee.findOne({userId:session.userId})
        if(!employee){
            //authenticated user is not an employee - return admin profile

            return res.json({
                firstName:"Admin",
                lastName:"",
                email:session.email
            })
        }
        return res.json({
            employee
        })
    } catch(error){
        return res.status(500).json({
            error: "Failed to fetch profile"
        })

    }

}

const updateProfile = async(req,res)=>{
    try{
        const session = req.session;
        const employee = await Employee.findOne({userId:session.userId})
        if(!employee){
            return res.status(404).json({
                success:false,
                message:'employee not found'
            })
        }
        if(employee.isDeleted){
            return res.status(403).json({
                success:false,
                message:'Your account is deactivited. you cannot update your profile'
            })
        }
        await Employee.findByIdAndUpdate(employee._id,{
            bio:req.body.bio
        })
        return res.status(200).json({
                success:true,
                
            })
    } catch(error){
        return res.status(500).json({
                success:false,
                message:'failed to update profile'
            })

    }
}

module.exports = {getProfile,updateProfile}