import prisma from '../../../../utils/db';
import { verifyToken } from '../../../../utils/verifyToken';

/*
As a user, I want to edit an existing code template’s title, explanation, tags, and code, or delete it entirely.
*/

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
export default async function handler(req, res) {
    if (req.method === 'PUT') {
        const accessToken = req.headers.authorization;
        const { title, explanation, tags, code, templateId } = req.body;
        const updates = {};

        const verified_token = verifyToken(req, res);
        if (!verified_token) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (!templateId) {
            return res.status(400).json({ error: "Template ID is required." });
        }
        
        try {
            const template = await prisma.codeTemplate.findUnique({
                where: {
                    id: parseInt(templateId),
                }
            });
            
            // check if template exists AND if the user is the author of the template
            // 404 request because it wasn't found and 403 because they're trying to access an unauthorized resource.
            if (!template) {
                return res.status(404).json({ error: "Template not found." });
            } else if (template.authorId !== verified_token.userId) {
                return res.status(403).json({ error: "Forbidden Modification." });
            }
    
            if (title) {
                updates.title = title;
            }
            if (explanation) {
                updates.explanation = explanation;
            }
            if (tags) {
                updates.tags = tags;
            }
            if (code) {
                updates.code = code;
            }
    
            const updatedTemplate = await prisma.codeTemplate.update({
                where: {
                    id: parseInt(templateId),
                },
                data: updates
            });
    
            res.status(200).json(updatedTemplate);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else if (req.method === 'DELETE') {
        const accessToken = req.headers.authorization;
        const { templateId } = req.body;

        const verified_token = verifyToken(req, res);
        if (!verified_token) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        try {
            const template = await prisma.codeTemplate.findUnique({
                where: {
                    id: parseInt(templateId),
                }
            });

            // check if template exists AND if the user is the author of the template
            // 404 request because it wasn't found and 403 because they're trying to access an unauthorized resource.
            if (!template) {
                return res.status(404).json({ error: "Template not found." });
            } else if (template.authorId !== verified_token.userId) {
                return res.status(403).json({ error: "Forbidden Deletion." });
            }

            await prisma.codeTemplate.delete({
                where: {
                    id: parseInt(templateId),
                }
            });
            res.status(200).json({ message: "Template deleted successfully." });
        } catch (error) {
            // Likely failed to delete the code template
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(405).json({ message: "Method must be a PUT or DELETE request." });
    }
}