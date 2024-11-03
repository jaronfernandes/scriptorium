import prisma from '../../../utils/db';

/*
As a visitor, I want to search through all available templates by title, 
tags, or content so that I can quickly find relevant code for my needs.
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

    const { title, tags, content } = req.query;

    try {
        const filter_settings = {};

        console.log("hi");
        console.log(title, tags, content);

        if (title) {
            filter_settings.title = {
                contains: title,
            }
        }

        console.log("hi2");
        console.log(filter_settings);

        if (tags) {
            filter_settings.tags = {
                every: {
                    name: {
                        in: tags,
                    }
                }
            }
        }

        console.log("hi3");
        // this could mean explanations, but ill assume code for now 
        // since technically code is the content of the code template
        if (content) {
            filter_settings.code = {
                contains: content,
            }
        }

        console.log("hi4");
        console.log(filter_settings);

        const templates = await prisma.codeTemplate.findMany({
            where: filter_settings
        });

        console.log("hi5");

        return res.status(200).json(templates);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}