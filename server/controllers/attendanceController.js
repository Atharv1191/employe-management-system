const Employee = require("../models/Employee");
const Attendance = require('../models/Attendance')
const {inngest} = require("../inngest/index")
//clock in/out for employee


const clockInOut = async (req, res) => {
    try {
        const session = req.session;
        const employee = await Employee.findOne({ userId: session.userId });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        if (employee.isDeleted) {
            return res.status(403).json({
                success: false,
                message: "Your account is deactivated. You cannot clock in/out"
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existing = await Attendance.findOne({
            employeeId: employee._id,  // Fix 1: typo "emmployeeId" → "employeeId"
            date: today
        });

        const now = new Date();

        if (!existing) {
            const isLate = now.getHours() > 9 || now.getMinutes() > 0;  // Fix 2: comma → dot on getMinutes(), and && → || for correct late logic
            const attendance = await Attendance.create({
                employeeId: employee._id,
                date: today,
                checkIn: now,
                status: isLate ? "LATE" : "PRESENT"  // Fix 3: removed duplicate "status" key
            });
            await inngest.send({
                name: "employee/check-out",
                data:{
                    employeeId:employee._id,
                    attendanceId:attendance._id
                }
            })


            return res.status(200).json({
                success: true,
                type: "CHECK_IN",
                data: attendance
            });

        } else if (!existing.checkOut) {
            const checkInTime = new Date(existing.checkIn).getTime();
            const diffMs = now.getTime() - checkInTime;
            const diffHours = diffMs / (1000 * 60 * 60);

            existing.checkOut = now;

            const workingHours = parseFloat(diffHours.toFixed(2));

            // Fix 4: corrected duplicate condition and full day threshold was missing
            let dayType;
            if (workingHours >= 8) dayType = "Full Day";
            else if (workingHours >= 6) dayType = "Three Quarter Day";
            else if (workingHours >= 4) dayType = "Half Day";
            else dayType = "Short Day";

            existing.workingHours = workingHours;
            existing.dayType = dayType;

            await existing.save();

            return res.json({
                success: true,  // Fix 5: typo "suceess" → "success"
                type: "CHECK_OUT",
                data: existing
            });

        } else {
            return res.status(400).json({  // Fix 6: already clocked out should return an error, not success
                success: false,
                message: "Already clocked out for today"
            });
        }

    } catch (error) {
        console.log("Attendance Error", error);
        return res.status(500).json({ message: "Operation failed" });
    }
};

const getAttendence = async(req,res)=>{
    try{
        const session = req.session;
        const employee = await Employee.findOne({userId:session.userId});
        if(!employee) return res.status(404).json({
            success:false,
            message:"Employee not found"
        })

        const limit = parseInt(req.query.limit || 30);
        const history = await Attendance.find({employeeId:employee._id}).sort({date:-1}).limit(limit)

        return res.status(200).json({
            success:true,
            data:history,
            employee:{isDeleted:employee.isDeleted}

        })


    } catch(error){
          console.log("Attendance Error", error);
        return res.status(500).json({ message: "failed to fetch attendance" });
    }

}

module.exports = {clockInOut,getAttendence}