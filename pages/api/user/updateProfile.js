import { verifyToken } from '@/utils/verifyToken';
import multer from 'multer';

const upload = multer({ dest: 'uploads/avatars/' });

export default async function handler(req, res) {
  const user = verifyToken(req, res);
  if (user) {
    const { firstName, lastName, phoneNumber } = req.body;
    const avatar = req.file ? req.file.path : undefined;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { firstName, lastName, phoneNumber, avatar }
    });
    res.json(updatedUser);
  }
}