import prisma from '../../../../utils/db';
import { verifyRefreshToken, generateRefreshToken } from '../../../../utils/auth';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: "Must be a POST request." });
    }

    const { title, explanation, tags, code, refreshToken } = req.body;

    const verified_token = verifyToken(refreshToken);

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
        for (let i = 0; i < tags.length; i++) {
            const findTag = await prisma.tag.findUnique({
                where: {
                    name: tags[i]
                }
            });

            if (!findTag) {
                const tag = await prisma.tag.create({
                    data: {
                        name: tags[i]
                    }
                });
            }
        }

        const template = await prisma.template.create({
            data: {
                title,
                explanation,
                tags,
                code,
                user: {
                    connect: {
                        id: user.id
                    }
                }
            }
        });
    } catch (error) {
        return res.status(401).json({ "refreshToken": newRefreshToken, error: error.message });
    }

}