import prisma from '../../../../utils/db';
import { verifyToken } from '../../../../utils/auth';

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

        const verified_token = verifyToken(accessToken);
        if (!verified_token) {
            return res.status(401).json({ error: "Unauthorized" });
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
    } else if (req.method === 'DELETE') {
        const accessToken = req.headers.authorization;
        const { templateId } = req.body;

        const verified_token = verifyToken(accessToken);
        if (!verified_token) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        try {
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