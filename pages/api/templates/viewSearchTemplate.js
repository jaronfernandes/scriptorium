import prisma from '../../../../utils/db';
import { verifyAccessToken, generateRefreshToken } from '../../../../utils/auth';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: "Must be a GET request." });
    }

    const accessToken = req.headers.authorization;
    const { accessToken } = req.body;

    const verified_token = verifyAccessToken(accessToken);
    if (!verified_token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
       const templates = await prisma.codeTemplate.findMany({
            where: {
                user: {
                    username: verified_token.username
                }
            }
        });
        return res.status(200).json({ "templates": templates
       })
    } catch (error) {
        return res.status(401).json({ "error": error.message });
    }
}