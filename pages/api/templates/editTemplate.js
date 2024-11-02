import prisma from '../../../../utils/db';
import { verifyAccessToken, generateRefreshToken } from '../../../../utils/auth';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: "Must be a GET request." });
    }

    const token = req.headers.authorization;

    if (!auth_header) {
        return res.status(401).json({ message: 'No Token' });
    }

    try {
        const verified_token = verifyAccessToken(token);

        if (!verified_token) {
            return res.status(401).json({ error: "Invalid token" });
        }
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    /**
     * Assume: title: String, explanation: String, tags: String[], code: String, refreshToken: String
     */
}