"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = (0, express_1.Router)();
router.post("/register", [
    (0, express_validator_1.check)("username", "É necessário informar um nome de usuário")
        .not()
        .isEmpty(),
    (0, express_validator_1.check)("email", "Por favor, insira um email válido").isEmail(),
    (0, express_validator_1.check)("password", "Password precisa ter 6 ou mais caracteres").isLength({
        min: 6,
    }),
    (0, express_validator_1.check)("passwordConfirm", "As senhas não conferem").custom((value, { req }) => value === req.body.password),
    (0, express_validator_1.check)("role", 'Role is required and should be either "user" os "institution"').isIn(["user", "institution"]),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { username, email, password, role, cpf, cnpj } = req.body;
    try {
        let user = await User_1.default.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: "Usuário já cadastrado" });
        }
        user = new User_1.default({ username, email, password, role, cpf, cnpj });
        await user.save();
        const payload = {
            user: {
                id: user._id,
            },
        };
        res.status(201).json({ msg: "Usuário cadastrado com sucesso" });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Erro de servidor canário");
    }
});
router.post("/login", [
    (0, express_validator_1.check)("email", "Por favor, insira um email válido").isEmail(),
    (0, express_validator_1.check)("password", "Senha é obrigatória").exists().isLength({ min: 6 }),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        let user = await User_1.default.findOne({ email });
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
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        res.json({
            token,
            user: { _id: user._id, username: user.username, email: user.email },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Erro de servidor");
    }
});
router.get("/profile", authMiddleware_1.default, async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(404).json({ msg: "Faltando ID do usuário" });
        }
        const user = await User_1.default.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ msg: "Usuário não encontrado" });
        }
        res.json(user);
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Erro no servidor");
    }
});
exports.default = router;
