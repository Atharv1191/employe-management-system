const Employee = require("../models/Employee");
const Attendance = require('../models/Attendance');
const LeaveApplication = require("../models/LeaveApplication");
const DEPARTMENTS = require("../constants/departments");
const Payslip = require("../models/Payslip");

const getDashboard = async (req, res) => {
    try {
        const session = req.session;
        if (session.role === "ADMIN") {
            const [totalEmployees, todayAttendance, pendingLeaves] = await Promise.all([
                Employee.countDocuments({ isDeleted: { $ne: true } }),
                Attendance.countDocuments({
                    date: {
                        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        $lt: new Date(new Date().setHours(24, 0, 0, 0))
                    }
                }),
                LeaveApplication.countDocuments({ status: "PENDING" })
            ]);

            return res.json({
                role: "ADMIN",
                totalEmployees,
                totalDepartments: DEPARTMENTS.length,
                todayAttendance,          // Fix 1: was `todatAttendance`
                pendingLeaves
            });
        } else {
            const employee = await Employee.findOne({
                userId: session.userId,
            }).lean();

            if (!employee) {
                return res.status(404).json({  // Fix 2: was `.josn(`
                    success: false,
                    message: "employee not found"
                });
            }

            const today = new Date();
            const [currentMonthAttendance, pendingLeaves, latestPayslip] = await Promise.all([
                Attendance.countDocuments({
                    employeeId: employee._id,
                    date: {
                        $gte: new Date(today.getFullYear(), today.getMonth(), 1),
                        $lt: new Date(today.getFullYear(), today.getMonth() + 1, 1),
                    }
                }),
                LeaveApplication.countDocuments({
                    employeeId: employee._id,
                    status: "PENDING",
                }),
                Payslip.findOne({
                    employeeId: employee._id,
                }).sort({
                    createdAt: -1
                }).lean()
            ]);

            return res.status(200).json({
                role: "EMPLOYEE",
                employee: { ...employee, id: employee._id.toString() },
                currentMonthAttendance,
                pendingLeaves,
                latestPaySlip: latestPayslip        // Fix 3: was `latestPayslips` (undefined)
                    ? { ...latestPayslip, id: latestPayslip._id.toString() }  // Fix 4: was `{...latestPayslip.id:...}`
                    : null
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "failed"
        });
    }
};
module.exports = {getDashboard}
