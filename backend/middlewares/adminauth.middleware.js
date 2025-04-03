



export const verifyAdmin = async (req,res,next) => {

    if(!req.teacher){
        return res
            .status(401)
            .json({success:false, message: "You are not Logged In"})
    }

    if(!req.teacher.isAdmin){
        return res
            .status(421)
            .json({success:false, message: "You are not an admin"})
    }


    next()


}