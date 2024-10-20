/*
    User story to satisfy: 
    "As the system administrator, I want to sort blog posts and comments based on the total number of reports 
    they received so that I can find the inappropriate content easier."

    Overall purpose of the file: Creates an GET endpoint that takes user info fron req.query
    and sorts content.

    TODO: Massive implementation assumption (permitted based on Piazza post @192). Assuming that the sorted page displays
    both sorted blog posts and comment entries. In other words, there ISN'T a seperate sorted page for sorted blog posts ONLY or
    sorted comments ONLY.
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
    // For now, assyume contentType can be: "BlogPost", "Comment". Not supporting the "Both" option as of now
    const {contentType} = req.query;

    // Validating req.query entry
    // Check if required fields are defined
    // Using the ? operator in case either variable are undefined
    if(!contentType?.trim() || (contentType !== "BlogPost" && contentType !== "Comment")){
        return res.status(400).json({ error: "Missing required fields" });
    }

    // Checking if contentType is neither of the intended types
    if(contentType !== "BlogPost" && contentType !== "Comment"){
        return res.status(400).json({ error: "Missing required fields" });
    }


    // Try statement to retrieve all non-hidden blog posts AND all non-hidden comments
    try {
        // Defining common returned variable
        let retrievedContent = [];
        // Defining common search condition
        const contentSearchCondition = {hidden:false};

        // Fetching all non-hidden blog posts
        if (contentType === "BlogPost"){
            retrievedContent = await prisma.blogPost.findMany({
                where: contentSearchCondition,
                include: { // creates an additional nested object to store the number of reports a blog post garnered
                    _count: {
                        select: { reports: true }
                    }
                }
            });

        }

        // Fetching all non-hidden comments
        if (contentType === "Comment"){
            retrievedContent = await prisma.comment.findMany({
                where: contentSearchCondition,
                include: { // creates an additional nested object to store the number of reports a comment garnered
                    _count: {
                        select: { reports: true } 
                    }
                }
            });
        }

        // Flatten output JSON object (to make sorting entries easier)
        // See OneNote notes for sample format
        let formattedContent = retrievedContent.map(({ _count, ...restOfContent}) => ({
            ...restOfContent,
            reportCount: _count.reports
        }));

        // Sort the entries in descending order from having the most reports to having the least reports 
        formattedContent.sort((a,b) => (b.reportCount - a.reportCount));
        
        // Return the results
        return res.status(200).json(formattedContent);
    } catch (error) {
        // console.error("Error fetching and/or sorting content:", error); // For debugging purposes
        return res.status(500).json({ error: "Failed to fetch or sort content" });
    }
}
