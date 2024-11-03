import prisma from '../../../../utils/db';
import { verifyToken } from '../../../../utils/verifyToken';


/*
As a user, I want to view and search through my list of my saved templates, 
including their titles, explanations, and tags, so that I can easily find and reuse them.
*/

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: "Must be a GET request." });
    }

    const accessToken = req.headers.authorization;
    const { title, explanation, tags } = req.query;

    const verified_token = verifyToken(req, res);
    if (!verified_token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const filter_settings = {
            authorId: verified_token.userId,
        }
        if (title) {
            filter_settings.title = {
                contains: title,
                mode: "insensitive"
            }
        }
        if (explanation) {
            filter_settings.explanation = {
                contains: explanation,
                mode: "insensitive"
            }
        }
        // Finds if at least one of the tags is in the given list of tags to find matches with.
        // TODO: Could make it more strict by allowing only templates that have all the tags in the list.
        // UPDATE: i did it (basically just changed "some" to "every" LOLOL) - suggested by ChatGPT.
        if (tags) {
            filter_settings.tags = {
                every: {
                    name: {
                        in: tags,
                    }
                }
            }
        }

       const templates = await prisma.codeTemplate.findMany({
            where: filter_settings
        });

        return res.status(200).json({ "templates": templates });
    } catch (error) {
        return res.status(401).json({ "error": error.message });
    }
}