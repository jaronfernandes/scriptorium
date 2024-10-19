/*
    User story to satisfy: 
    "As a user, I want to report an inappropriate blog post or comment 
    so that the website is purged of abusive content. I want to add additional explanation when submitting my report."

    Overall purpose of the file: Creates an endpoint that takes user info fron req.body and makes a new report entry in prisma
*/

// Imports 
import prisma from "../../../utils/db"; 
import { verifyUser, verifyAdmin} from "../../../utils/verification";

//Handler 
export default async function handler (req, res){

    // // Verify if it's a user (or system admin) who is trying to access
    // // TODO: Commented out for now since unsure about implementation
    // const isUser = verifyUser(req, res);
    // const isAdmin = verifyAdmin(req, res);
    // if (!isUser && !isAdmin){
    //     return; // JSON response already handled under the case where we have a visitor trying to access
    // }

    // Checking if request type is correct
    if (req.method !== "POST"){
        return res.status(405).json({error: "Method not supported"});
    }

    // Getting POST body content
    const{contentType, explanation, blogPostId, commentId} = req.body;
    
    // Check if required fields are defined
    // Using the ? operator in case either variable are undefined
    if(!contentType?.trim() || !explanation?.trim()){
        return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if contentType is neither of the accepted types 
    if (contentType !== "BlogPost" && contentType !== "Comment" ) {
        return res.status(400).json({ error: "Invalid content type. Must be reporting either a 'BlogPost' or 'Comment'." });
    }

    // Check for mismatch between contentType and the ids
    if (contentType === "BlogPost" && !blogPostId) {
        return res.status(400).json({ error: "Content type is Blog Post, but missing Blog Post Id" });
    } 
    
    if (contentType === "Comment" && !commentId) {
        return res.status(400).json({ error: "Content type is Comment, but missing Comment Id" });
    } 

    // Attempt to create the new report field
    try {
        let newReport;
        if (contentType === "BlogPost"){
            const data = {
                contentType,
                explanation,
                blogPost: {
                    connect: { id: blogPostId }, // Establish the relationship with the Blog Post instance. 
                },
                //Omitting comment
            }
            newReport = await prisma.report.create({
                data
            });
        } else { //Assume here that contentType === "Comment"
            const data = {
                contentType,
                explanation,
                //Omitting blogPost
                comment: {
                    connect: { id: commentId }, // Establish the relationship with the Blog Post instance. 
                },
            }
            newReport = await prisma.report.create({
                data
            });
        }
        // Return the created author
        return res.status(201).json(newReport); // 201 status for successful creation
      } catch (error) {
        // Handle error during report creation
        console.error("Error creating report:", error); // Log the error
        return res.status(500).json({ error: "Failed to create report" });
    }
}