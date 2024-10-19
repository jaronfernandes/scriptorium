/*
    User story to satisfy: 
    "As the system administrator, I want to hide a content that I deem inappropriate so that Scriptorium remains safe for everyone. 
    This content would then be hidden from everyone, except for the author. 
    The author can still see the content (with a flag that indicates the reports), but cannot edit it."

    Overall purpose of the file: Creates an endpoint that takes user info fron req.body and 
    makes a piece of content (either a report or a comment) hidden
*/

// Imports 
import prisma from "../../../utils/db"; 
import { verifyAdmin} from "../../../utils/verification";

// Handler
export default async function handler (req, res){
    // Verify if it's a system who is trying to access
    // TODO: Commented out for now since unsure about implementation
    // const isAdmin = verifyAdmin(req, res);
    // if (!isAdmin){
    //     return; // JSON response already handled under the case where we have a non-admin user visiting
    // }

    // Checking if request type is correct
    if (req.method !== "POST"){
        return res.status(405).json({error: "Method not supported"});
    }
}