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
router.post('/register', [
    (0, express_validator_1.check)('username', 'É necessário informar um nome de usuário').not().isEmpty(),
    (0, express_validator_1.check)('email', 'Por favor, insira um email válido').isEmail(),
    (0, express_validator_1.check)('password', 'Password precisa ter 6 ou mais caracteres').isLength({ min: 6 }),
    (0, express_validator_1.check)('role', 'Role is required and should be either "user" os "institution"').isIn(['user', 'institution']),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { username, email, password, role } = req.body;
    try {
        let user = await User_1.default.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'Usuário já cadastrado' });
        }
        user = new User_1.default({ username, email, password, role });
        await user.save();
        const payload = {
            user: {
                id: user.id,
            },
        };
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err)
                throw err;
            res.status(201).json({ token });
        });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Erro de servidor canário');
    }
});
router.post('/login', [
    (0, express_validator_1.check)('email', 'Por favor, insira um email válido').isEmail(),
    (0, express_validator_1.check)('password', 'Senha é obrigatória').exists(),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        let user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Credenciais invalidas' });
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Credenciais invalidas' });
        }
        const payload = {
            user: {
                id: user.id,
            },
        };
        jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err)
                throw err;
            res.json({ token });
        });
    }
    catch (err) {
        res.status(500).send('Erro de servidor');
    }
});
router.get('/profile', authMiddleware_1.default, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'Usuário não encontrado' });
        }
        res.json(user);
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Erro no servidor');
    }
});
exports.default = router;
