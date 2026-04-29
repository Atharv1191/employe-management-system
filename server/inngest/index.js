const { Inngest } = require("inngest");
const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const LeaveApplication = require("../models/LeaveApplication");
const sendEmail = require("../configs/nodemiler");

const inngest = new Inngest({ id: "fullstack-ems" });

// Auto checkout for employees
const autoCheckout = inngest.createFunction(
    { id: "auto-check-out", triggers: [{ event: "employee/check-out" }] },
    async ({ event, step }) => {
        const { employeeId, attendanceId } = event.data;

        await step.sleepUntil(
            "wait-for-9-hours",
            new Date(new Date().getTime() + 9 * 60 * 60 * 1000)
        );

        let attendance = await step.run("get-attendance", () =>
            Attendance.findById(attendanceId)
        );

        if (!attendance.checkOut) {
            const employee = await step.run("get-employee", () =>
                Employee.findById(employeeId)
            );

            await sendEmail({
                to: employee.email,
                subject: "Attendance Reminder: Please Check Out",
                body: `
                <div style="max-width: 600px;">
                    <h2>Hi ${employee.firstName}, 👋</h2>
                    <p style="font-size: 16px;">You have a check-in in ${employee.department} today:</p>
                    <p style="font-size: 18px; font-weight: bold; color: #007bff; margin: 8px 0;">${attendance?.checkIn?.toLocaleTimeString()}</p>
                    <p style="font-size: 16px;">Please make sure to check-out in one hour.</p>
                    <p style="font-size: 16px;">If you have any questions, please contact your admin.</p>
                    <br />
                    <p style="font-size: 16px;">Best Regards,</p>
                    <p style="font-size: 16px;">EMS</p>
                </div>
            `
            });

            await step.sleepUntil(
                "wait-for-1-hour",
                new Date(new Date().getTime() + 1 * 60 * 60 * 1000)
            );

            attendance = await step.run("get-attendance-final", () =>
                Attendance.findById(attendanceId)
            );

            if (!attendance?.checkOut) {
                await step.run("mark-half-day", async () => {
                    attendance.checkOut = new Date(attendance.checkIn.getTime() + 4 * 60 * 60 * 1000);
                    attendance.workingHours = 4;
                    attendance.dayType = "Half Day";
                    attendance.status = "LATE";
                    await attendance.save();
                });
            }
        }
    }
);

// Leave application reminder
const leaveApplicationReminder = inngest.createFunction(
    { id: "leave-application-reminder", triggers: [{ event: "leave/pending" }] },
    async ({ event, step }) => {
        const { leaveApplicationId } = event.data;

        await step.sleepUntil(
            "wait-for-24-hours",
            new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
        );

        const leaveApplication = await step.run("get-leave-application", () =>
            LeaveApplication.findById(leaveApplicationId)
        );

        if (leaveApplication.status === "PENDING") {
            const employee = await step.run("get-employee", () =>
                Employee.findById(leaveApplication.employeeId)
            );

            await sendEmail({
                to: process.env.ADMIN_EMAIL,
                subject: "Leave Application Reminder: Action Required",
                body: `
                <div style="max-width: 600px;">
                    <h2>Hi Admin, 👋</h2>
                    <p style="font-size: 16px;">You have a leave application in ${employee.department} today:</p>
                    <p style="font-size: 18px; font-weight: bold; color: #007bff; margin: 8px 0;">${leaveApplication?.startDate?.toLocaleDateString()}</p>
                    <p style="font-size: 16px;">Please make sure to take action on this leave application.</p>
                    <br />
                    <p style="font-size: 16px;">Best Regards,</p>
                    <p style="font-size: 16px;">EMS</p>
                </div>`
            });
        }
    }
);

// Cron: check attendance and email absent employees
const attendanceReminderCron = inngest.createFunction(
    { id: "attendance-reminder-cron", triggers: [{ cron: "0 6 * * *" }] },
    async ({ step }) => {
        const today = await step.run("get-today-date", async () => {
            const startUTC = new Date(
                new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) + "T00:00:00+05:30"
            );
            const endUTC = new Date(startUTC.getTime() + 24 * 60 * 60 * 1000);
            return { startUTC: startUTC.toISOString(), endUTC: endUTC.toISOString() };
        });

        const activeEmployees = await step.run("get-active-employees", async () => {
            const employees = await Employee.find({
                isDeleted: false,
                employmentStatus: "ACTIVE"
            }).lean();
            return employees.map(emp => ({
                _id: emp._id.toString(),
                firstName: emp.firstName,
                lastName: emp.lastName,
                email: emp.email,
                department: emp.department
            }));
        });

        const onLeaveIds = await step.run("get-on-leave-employees", async () => {
            const leaveApplications = await LeaveApplication.find({
                status: "APPROVED",
                startDate: { $lte: today.endUTC },
                endDate: { $gte: today.startUTC }
            }).lean();
            return leaveApplications.map(leave => leave.employeeId.toString());
        });

        const checkedInIds = await step.run("get-checked-in-employees", async () => {
            const attendances = await Attendance.find({
                checkIn: { $gte: today.startUTC, $lt: today.endUTC }
            }).lean();
            return attendances.map(att => att.employeeId.toString());
        });

        const absentEmployees = activeEmployees.filter(
            emp => !onLeaveIds.includes(emp._id) && !checkedInIds.includes(emp._id)
        );

        if (absentEmployees.length > 0) {
            await step.run("send-reminder-emails", async () => {
                const emailPromises = absentEmployees.map(emp =>
                    sendEmail({
                        to: emp.email,
                        subject: "Attendance Reminder: Please Check In",
                        body: `
                        <div style="max-width: 600px; font-family: Arial, sans-serif;">
                            <h2>Hi ${emp.firstName}, 👋</h2>
                            <p style="font-size: 16px;">We noticed you haven't marked your attendance yet today.</p>
                            <p style="font-size: 16px;">The deadline was <strong>11:30 AM</strong> and your attendance is still missing.</p>
                            <p style="font-size: 16px;">Please check in as soon as possible or contact your admin if you're facing any issues.</p>
                            <br />
                            <p style="font-size: 14px; color: #666;">Department: ${emp.department}</p>
                            <br />
                            <p style="font-size: 16px;">Best Regards,</p>
                            <p style="font-size: 16px;"><strong>QuickEMS</strong></p>
                        </div>`
                    })
                );
                await Promise.all(emailPromises);
            });
        }

        return { totalActive: activeEmployees.length, totalAbsent: absentEmployees.length };
    }
);

const functions = [autoCheckout, leaveApplicationReminder, attendanceReminderCron];

module.exports = { inngest, functions };
