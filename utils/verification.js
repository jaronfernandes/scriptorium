// Middleware function to verify JWT
//import jwt from "jsonwebtoken";

// Function to verify user access
// Here, an individual is an user IF they have role "USER" or "ADMIN"
export function verifyUser(req, res){
    // Check if we have a valid user
    const user = verifyToken(req.headers.authorization);
  
    if (!user) {
          return res.status(401).json({
          message: "Unauthorized",
          });
    }
    // Check if the user has the 'ADMIN' role
    if (user.role !== "USER" && user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden: Only users and admins can access this." }); 
    }
    return true;
}