/*
    User story to satisfy: 
    "As the system administrator, I want to sort blog posts and comments based on the total number of reports 
    they received so that I can find the inappropriate content easier."

    Overall purpose of the file: Creates an GET endpoint that takes user info fron req.query
    and sorts content.

    TODO: Massive implementation assumption (permitted based on Piazza post @192). Assuming that the sorted page displays
    the sorted blog posts seperate from the sorted comment entries. In other words, the system admin can only request for sorted blog posts OR
    sorted comments ONLY at 1 given time.
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
    // For now, assume contentType can be: "BlogPost", "Comment". Not supporting the "Both" option as of now
    const {contentType} = req.query;

    // Validating req.query entry
    // Check if required fields are defined
    // Using the ? operator in case either variable are undefined
    // If content type after trimming is still undefined, we are missing info
    if(!contentType?.trim()){
        return res.status(400).json({ error: "Missing required fields: contentType" });
    }

    // Checking if contentType is neither of the intended types
    if(contentType !== "BlogPost" && contentType !== "Comment"){
        return res.status(400).json({ error: "Invalid content type. Must be reporting either a BlogPost or Comment."});
    }

    // Try statement to retrieve all non-hidden blog posts AND all non-hidden comments
    try {
        // Defining common returned variable
        let retrievedContent = [];
        // Defining common search condition
        const contentSearchCondition = {hidden:false};

        // Fetching all non-hidden blog posts
        //Note: Using Prisma's aggregation feature: https://www.prisma.io/docs/orm/prisma-client/queries/aggregation-grouping-summarizing
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
        //Note: Using Prisma's aggregation feature: https://www.prisma.io/docs/orm/prisma-client/queries/aggregation-grouping-summarizing
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
        // For each returned JSON entry, it makes a new attribte called reportCount, with the number of reports each entries has gained
        // Developer note: See OneNote notes for sample format
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