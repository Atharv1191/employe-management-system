
const express = require("express")

const cors = require("cors");
const multer = require("multer");
const connectDB = require("./configs/db");
const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRouts")
const profileRoutes = require('./routes/profileRoutes')
const attendanceRoutes = require('./routes/attendanceRoutes')
const leaveRoutes = require('./routes/LeaveRoutes')
const payslipRoutes = require('./routes/payslipsRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')

const { serve } = require("inngest/express");
const {inngest,functions} = require("./inngest/index")
require("dotenv").config()


const app = express();

const PORT = process.env.PORT || 4000;

 connectDB()

//middelewere
app.use(cors());
app.use(express.json());
app.use(multer().none())


//Routes
app.get('/',(req,res)=>{
    res.send("server is running")

})
app.use('/api/auth',authRoutes)
app.use('/api/employees',employeeRoutes)
app.use('/api/profile',profileRoutes)
app.use('/api/attendance',attendanceRoutes)
app.use('/api/leave',leaveRoutes)
app.use('/api/payslips',payslipRoutes)
app.use('/api/dashboard',dashboardRoutes)
app.use("/api/inngest",serve({client:inngest,functions}))

app.listen(PORT,()=>console.log(`server is running on port ${PORT}`))

