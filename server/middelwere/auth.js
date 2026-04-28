

const protect = async(req,res,next)=>{
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({
                success:false,
                message:"Unauthorized"
            })
        }
        const token = authHeader.split(" ")[1]
        const session = jwt.verify(tojen,process.env.JWT_SECRET)
        if(!session){
            return res.status(401).json({
                success:false,
                message:"Unauthorized"
            })
        }
        req.session = session;
        next()

    } catch(error){
         return res.status(401).json({
                success:false,
                message:"Unauthorized"
            })

    }
}

const protectAdmin = (req,res,next)=>{
    if(req?.session?.role !== "ADMIN"){
          return res.status(403).json({
                success:false,
                message:"Admin access required"
            })
    }
    next()
}
module.exports = {protect,protectAdmin};