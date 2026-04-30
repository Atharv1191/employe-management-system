const jwt = require("jsonwebtoken")  // ✅ Add kiya

// const protect = async (req, res, next) => {
//     try {
//         const authHeader = req.headers.authorization;
//         if (!authHeader || !authHeader.startsWith("Bearer ")) {
//             return res.status(401).json({ success: false, message: "Unauthorized" })
//         }
//         const token = authHeader.split(" ")[1]
//         const session = jwt.verify(token, process.env.JWT_SECRET)  // ✅ tojen → token
//         if (!session) {
//             return res.status(401).json({ success: false, message: "Unauthorized" })
//         }
//         req.session = session;
//         next()
//     } catch (error) {
//         return res.status(401).json({ success: false, message: "Unauthorized" })
//     }
// }
const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log("Auth Header:", authHeader)  // ← add karo
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Unauthorized" })
        }
        const token = authHeader.split(" ").pop()

        console.log("Token:", token)  // ← add karo
        console.log("JWT_SECRET:", process.env.JWT_SECRET)  // ← add karo
        
        const session = jwt.verify(token, process.env.JWT_SECRET)
        console.log("Session:", session)  // ← add karo
        
        if (!session) {
            return res.status(401).json({ success: false, message: "Unauthorized" })
        }
        req.session = session;
        next()
    } catch (error) {
        console.log("Auth Error:", error.message)  // ← add karo
        return res.status(401).json({ success: false, message: "Unauthorized" })
    }
}

const protectAdmin = (req, res, next) => {
    if (req?.session?.role !== "ADMIN") {
        return res.status(403).json({ success: false, message: "Admin access required" })
    }
    next()
}

module.exports = { protect, protectAdmin };