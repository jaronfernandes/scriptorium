import prisma from '../../../utils/db';
import { verifyToken } from '../../../utils/verifyToken';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: "Must be a POST request." });
    }

    /**
     * Assume: title: String, explanation: String, tags: String[], code: String, refreshToken: String
     */
    
    const accessToken = req.headers.authorization;
    const { title, explanation, tags, code, language } = req.body;

    const verified_token = verifyToken(req, res);

    if (!verified_token) {
        return res.status(401).json({ error: "Invalid token" });
    }

    const user = await prisma.user.findUnique({
        where: {
            id: verified_token.id
        }
    });

    let loweredLanguage = language.toLowerCase();

    if (!user) {
        return res.status(401).json({ error: "User not found" });
    } else if (loweredLanguage !== "javascript" && loweredLanguage !== "python" 
        && loweredLanguage !== "java" && loweredLanguage !== "c++" && loweredLanguage !== "c") {
        return res.status(400).json({ error: "Invalid language" });
    }

    try {
        // const newTags = []
        console.log(tags);

        // for (let tagName of tags) {
        //     let tag = await prisma.tag.findUnique({
        //         where: { name: tagName }
        //     });

        //     if (!tag) {
        //         tag = await prisma.tag.create({
        //             data: { name: tagName }
        //         });
        //     }
        //     newTags.push(tag.id);
        // }

        // const newTags = await Promise.all(
        //     tags.map(async (tag) => {
        //         let newTag = await prisma.tag.findUnique({
        //             where: { 
        //                 name: tag 
        //             }
        //         });

        //         if (!newTag) {
        //             newTag = await prisma.tag.create({
        //                 data: { name: tag }
        //             })
        //         }
                
        //         return newTag.id;

        //         // return existingTag
        //         //     ? existingTag.id
        //         //     : await prisma.tag.create({ data: { name: tag } }).then(tag => tag.id);
        //     })
        // )

        console.log("newTags");

        const newTags = await Promise.all(
            tags.map(async (tag) => {
              const existingTag = await prisma.tag.findUnique({
                where: { name: tag.name },
              });
              return existingTag
                ? { id: existingTag.id }
                : await prisma.tag.create({ data: { name: tag.name } });
            })
          );

          console.log("newTags2");
          console.log(newTags);
          
          // After ensuring newTags contains the correct IDs
          const template = await prisma.codeTemplate.create({
            data: {
              title,
              explanation,
              code,
              language,
              userId: user.id,
              tags: {
                connect: newTags.map(tag => ({ id: tag.id })),
              },
            },
          });

          console.log("template");
          
          // Check for success
          if (!template) {
            return res.status(500).json({ error: "Failed to save template" });
          }
          
          
        // // after tags and templates are created (or existing), create the relationship between the two.
        // await prisma.codeTemplateTag.createMany({
        //     data: newTags.map(tag => ({
        //         templateId: template.id,
        //         tagId: tag,  // don't do id since newTags is an array of tag ids already
        //         assignedBy: user.firstName // Store who assigned the tag, if needed
        //     }))
        // });

        return res.status(201).json({ savedTemplate: template });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}