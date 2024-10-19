/*
    User story to satisfy: 
    "As the system administrator, I want to sort blog posts and comments based on the total number of reports 
    they received so that I can find the inappropriate content easier."

    Overall purpose of the file: Creates an GET endpoint that takes user info fron req.query
    and sorts content.
*/
//Imports
import prisma from "../../../utils/db"; 
import { verifyAdmin} from "../../../utils/verification";

//Handler
export default async function handler (req, res){
    // Verify if it's a system admin who is trying to access
    // TODO: Commented out for now since unsure about implementation
    // const isAdmin = verifyAdmin(req, res);
    // if (!isAdmin){
    //     return; // JSON response already handled under the case where we have a non-admin user visiting
    // }

    // Checking if request type is correct
    if (req.method !== "GET"){
        return res.status(405).json({error: "Method not supported"});
    }
    // Getting GET body content
    //TODO: Anything else to extract?. 
    // For now, assyume contentType can be: "blogPosts", "comments", or "both" 
    const {contentType} = req.query;

    // TODO: Continue implementation. Refer to @192 on Piazza for more details
}
