import prisma from '../../../../utils/db';
import { verifyToken } from '../../../../utils/auth';

/*
As a visitor, I want to use an existing code template, run or modify it, 
and if desired, save it as a new template with a notification that it’s a 
forked version, so I can build on others’ work. Saving a template is only 
available to authenticated users.
*/
/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export default async function handler(req, res) {
    if (req.method === 'GET') { // this is gonna be for viewing a template
        const { templateId, modifiedCode, stdin, language } = req.query;

        const template = await prisma.template.findUnique({
            where: {
                id: parseInt(templateId),
            }
        });

        if (!template) {
            return res.status(404).json({ error: "Template not found" });
        }
        

        // TODO:  "...use an existing code template, run or modify it...""
        // Wtf does run it mean? Do i have to connect this to Carmen's code execution API?
        // Finish later, me sleepy.
    } else if (req.method === "POST") { // this is gonna be for saving (forking) a template
        const accessToken = req.headers.authorization;
        const { title, explanation, language, tags, code, templateId } = req.body;

        const verified_token = verifyToken(accessToken);

        if (!verified_token) {
            return res.status(401).json({ error: "Invalid token" });
        }
        
        try {
            // TODO: delete this comment after testing
            // could just do verified_token.userId instead of querying the user, but i wanna see if this alternative
            // works first try or not.
            const user = await prisma.user.findUnique({
                where: {
                    username: verified_token.username
                }
            });
    
            if (!user) {
                return res.status(401).json({ error: "User not found" });
            }
    
            const template = await prisma.template.findUnique({
                where: {
                    id: parseInt(templateId),
                }
            });
    
            if (!template) {
                return res.status(404).json({ error: "Template not found" });
            }
    
            const newTags = []
    
            for (let tagName of tags) {
                let tag = await prisma.tag.findUnique({
                    where: { name: tagName }
                });
    
                if (!tag) {
                    tag = await prisma.tag.create({
                        data: { name: tagName }
                    });
                }
                newTags.push(tag.id);
            }
            
            // This code was generated by ChatGPT since I had no idea how to implement the new created attribute 
            const forkedTemplate = await prisma.template.create({
                data: {
                    title,
                    explanation,
                    code,
                    userId: user.id,
                    tags: {
                        connect: newTags.map(tagId => ({ id: tagId }))
                    },
                    parentId: template.id,  // This is the key attribute that indicates it's a forked version
                }
            });
    
            if (!forkedTemplate) {
                return res.status(500).json({ error: "Failed to fork the Code Template." });
            }
    
            res.status(201).json({ template: forkedTemplate });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    } else {
        res.status(405).json({ message: "Must be a GET or POST method." });
    }
}