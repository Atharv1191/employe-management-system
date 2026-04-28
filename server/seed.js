const connectDB = require("./configs/db")
const User = require("./models/User")
const bcrypt = require("bcrypt")
require("dotenv").config()

const TemporaryPassword = "admin123"

async function registerAdmin() {
    try {
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL
        if (!ADMIN_EMAIL) {
            console.error("Missing ADMIN_EMAIL in environment variables")
            process.exit(1)
        }

        await connectDB()

        const existingAdmin = await User.findOne({ email: ADMIN_EMAIL })
        if (existingAdmin) {
            console.log("User already exists as role", existingAdmin.role)
            process.exit(0)
        }

        const hashedPassword = await bcrypt.hash(TemporaryPassword, 10)  // ✅ awaited

        const admin = await User.create({
            email: ADMIN_EMAIL,
            password: hashedPassword,
            role: "ADMIN"
        })

        console.log("Admin user created successfully with email:", admin.email)
        console.log("\nemail:", admin.email)
        console.log("password:", TemporaryPassword)
        console.log("Please change the password after first login.")
        process.exit(0)
    } catch (error) {
        console.error("Error occurred while registering admin:", error)
        process.exit(1)
    }
}

registerAdmin()