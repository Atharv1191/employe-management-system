const Employee = require("../models/Employee");
const LeaveApplication = require("../models/LeaveApplication");
const {inngest} = require("../inngest/index")

const createLeave = async (req, res) => {
    try {
        const session = req.session;
        const employee = await Employee.findOne({ userId: session.userId });
        if (!employee) {
            return res.status(404).json({
                message: "Employee not found",
                success: false
            });
        }
        if (employee.isDeleted) {
            return res.status(403).json({
                message: "Your account is deactivated. You cannot apply for leave.",
                success: false
            });
        }
        const { type, startDate, endDate, reason } = req.body;
        if (!type || !startDate || !endDate || !reason) {
            return res.status(400).json({
                message: "Missing fields.",
                success: false
            });
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(startDate) <= today || new Date(endDate) <= today) {
            return res.status(400).json({
                message: "Leave date must be in future",
                success: false
            });
        }
        if (new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({
                message: "End date cannot be before start date",
                success: false
            });
        }
        const leave = await LeaveApplication.create({
            employeeId: employee._id,
            type,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            reason,
            status: "PENDING",
        });
        await inngest.send({
            name:"leave/pending",
            data:{
                leaveApplicationId:leave._id
            }

        })
        return res.status(201).json({
            success: true,
            leave
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false
        });
    }
};

const getLeaves = async (req, res) => {
    try {
        const session = req.session;
        const isAdmin = session.role === "ADMIN";
        if (isAdmin) {
            const status = req.query.status;
            const where = status ? { status } : {};
            const leaves = await LeaveApplication.find(where).populate("employeeId").sort({ createdAt: -1 });
            const data = leaves.map((l) => {
                const obj = l.toObject();
                return {
                    ...obj,
                    id: obj._id.toString(),
                    employee: obj.employeeId,
                    employeeId: obj.employeeId?._id?.toString(),
                };
            });
            return res.status(200).json({
                success: true,
                data
            });
        } else {
            const employee = await Employee.findOne({ userId: session.userId }).lean();
            if (!employee) {
                return res.status(404).json({
                    message: "Employee not found",
                    success: false
                });
            }
            const leaves = await LeaveApplication.find({ employeeId: employee._id }).sort({ createdAt: -1 });
            return res.status(200).json({
                success: true,
                data: leaves,
                employee: { ...employee, id: employee._id.toString() }
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false
        });
    }
};

const updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const validStatuses = ["APPROVED", "REJECTED", "PENDING"];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid or missing status",
                success: false
            });
        }
        const leave = await LeaveApplication.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
        if (!leave) {
            return res.status(404).json({
                message: "Leave application not found",
                success: false
            });
        }
        return res.status(200).json({
            success: true,
            leave
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false
        });
    }
};

module.exports = { createLeave, getLeaves, updateLeaveStatus };