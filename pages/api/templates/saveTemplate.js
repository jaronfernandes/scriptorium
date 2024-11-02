import prisma from '../../../../utils/db';
import { verifyAccessToken, generateRefreshToken } from '../../../../utils/auth';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: "Must be a POST request." });
    }

    /**
     * Assume: title: String, explanation: String, tags: String[], code: String, refreshToken: String
     */
    
    const accessToken = req.headers.authorization;
    const { title, explanation, tags, code } = req.body;

    const verified_token = verifyAccessToken(accessToken);

    if (!verified_token) {
        return res.status(401).json({ error: "Invalid token" });
    }

    const user = await prisma.user.findUnique({
        where: {
            username: verified_token.username
        }
    });

    if (!user) {
        return res.status(401).json({ error: "User not found" });
    }

    const newRefreshToken = generateRefreshToken({
        userId: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, phoneNumber: user.phoneNumber, role: user.role, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
    });

    try {
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

        const template = await prisma.template.create({
            data: {
                title,
                explanation,
                code,
                user: {
                    connect: { id: user.id }
                },
                tags: {
                    connect: newTags.map(tagId => ({ id: tagId }))
                }
            }
        });

        if (!template) {
            return res.status(500).json({ "refreshToken": newRefreshToken, error: "Failed to save template" });
        }
        
        // after tags and templates are created (or existing), create the relationship between the two.
        await prisma.codeTemplateTag.createMany({
            data: newTags.map(tag => ({
                templateId: template.id,
                tagId: tag,  // don't do id since newTags is an array of tag ids already
                assignedBy: user.firstName // Store who assigned the tag, if needed
            }))
        });

        return res.status(201).json({ savedTemplate: template, refreshToken: newRefreshToken });
    } catch (error) {
        return res.status(400).json({ refreshToken: newRefreshToken, error: error.message });
    }
}