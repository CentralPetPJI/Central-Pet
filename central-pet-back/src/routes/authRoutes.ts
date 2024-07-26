import { Router, Request, Response } from "express";
import { check, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import User from "../models/User";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

interface AuthRequest extends Request {
  user?: {
    _id: string;
  };
}

router.post(
  "/register",
  [
    check("username", "É necessário informar um nome de usuário")
      .not()
      .isEmpty(),
    check("email", "Por favor, insira um email válido").isEmail(),
    check("password", "Password precisa ter 6 ou mais caracteres").isLength({
      min: 6,
    }),
    check("passwordConfirm", "As senhas não conferem").custom(
      (value, { req }) => value === req.body.password
    ),
    check(
      "role",
      'Role is required and should be either "user" os "institution"'
    ).isIn(["user", "institution"]),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, role, cpf, cnpj } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: "Usuário já cadastrado" });
      }

      user = new User({ username, email, password, role, cpf, cnpj });

      await user.save();

      const payload = {
        user: {
          id: user._id,
        },
      };

      res.status(201).json({ msg: "Usuário cadastrado com sucesso" });
    } catch (err) {
      console.error((err as Error).message);
      res.status(500).send("Erro de servidor canário");
    }
  }
);

router.post(
  "/login",
  [
    check("email", "Por favor, insira um email válido").isEmail(),
    check("password", "Senha é obrigatória").exists().isLength({ min: 6 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: "Credenciais inválidas" });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Credenciais invalidas" });
      }

      const payload = {
        user: {
          _id: user._id,
          username: user.username,
        },
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: "1h",
      });

      res.json({
        token,
        user: { _id: user._id, username: user.username, email: user.email },
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Erro de servidor");
    }
  }
);

router.get(
  "/profile",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = (req as any).user?._id;
      if (!userId) {
        return res.status(404).json({ msg: "Faltando ID do usuário" });
      }

      const user = await User.findById(userId).select("-password");
      if (!user) {
        return res.status(404).json({ msg: "Usuário não encontrado" });
      }

      res.json(user);
    } catch (error) {
      console.error((error as Error).message);
      res.status(500).send("Erro no servidor");
    }
  }
);

export default router;
