
//create payslip

const Employee = require("../models/Employee");
const Payslip = require("../models/Payslip");


const createPayslip = async(req,res)=>{
    try{
        const {employeeId,month,year,basicSalary,allowances,deductions} = req.body;
        if(!employeeId || !month || !year || !basicSalary){
            return res.status(400).json({
                success:false,
                mseeage:"Missing fields"
            })
        }
        const netSalary = Number(basicSalary) + Number
        (allowances || 0) - Number(deductions || 0);

        const payslip = await Payslip.create({
            employeeId,
            month:Number(month),
            year:Number(year),
            basicSalary:Number(allowances || 0),
            deductions:Number(deductions || 0),
            netSalary

        })
        return res.status(201).json({
            success:true,
            data:payslip
        })
    } catch(error){
          return res.status(500).json({
                success:false,
                message:'unable to create payslip'
            })

    }

}

const getPayslips = async(req,res)=>{
    try{
        const session = req.session;
        const isAdmin = session.role === "ADMIN";
        if(isAdmin){
            const payslips = await Payslip.find().populate("employeeId").sort({createdAt:-1});
            const data = payslips.map((p)=>{
                const obj = p.toObject();
                return {
                    ...obj,
                    id:obj._id.employeeId,
                    employeeId:obj.employeeId?._id?.toString(),


                }
            })
            return res.json({data})
        }else{
            const employee = await Employee.findOne({userId:session.userId})
            if(!employee) return res.staus(404).json({
                message:"Not found"
            })
            const payslips = await Payslip.find({employeeId:employee._id}).sort({createdAt:-1})
            return res.json({data:payslips})
        }

    } catch(error){
         return res.status(500).json({
                success:false,
                message:'failed'
            })

    }

}
const getPayslipsById = async(req,res)=>{
    try{
        const payslip = await payslip.findById(req.params.id).populate("employeeId").lean()
        if(!payslip) return res.status(404).json({error:"Not Found"})

            const result = {
                ...payslip,
                id:payslip._id.toString(),
                employee:payslip.employeeId
            }
            return res,json(result)


    } catch(error){
         return res.status(500).json({
                success:false,
                message:'failed'
            })
    }
     

}


module.exports = {createPayslip,getPayslips,getPayslipsById}