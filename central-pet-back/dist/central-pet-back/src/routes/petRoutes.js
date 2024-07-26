"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const Pet_1 = __importDefault(require("../models/Pet"));
const router = (0, express_1.Router)();
router.post("/register", authMiddleware_1.default, [
    (0, express_validator_1.check)("name", "Nome é obrigatório").not().isEmpty(),
    (0, express_validator_1.check)("photo", "Foto é obrigatório para cadastrar o pet").not().isEmpty(),
    (0, express_validator_1.check)("species", "A espécie do pet é obrigatória").not().isEmpty(),
    (0, express_validator_1.check)("age", "A idade é obrigatória (pode chutar se não souber ou se o pet foi acolhido)").isInt(),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, caracteristicasFisicas, caracteristicasComportamentais, observacoes, photo, species, forAdoption, age, } = req.body;
    try {
        const pet = new Pet_1.default({
            name,
            caracteristicasFisicas,
            caracteristicasComportamentais,
            observacoes,
            photo,
            species,
            forAdoption,
            age,
        });
        await pet.save();
        res.status(201).json(pet);
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Erro de servidor");
    }
});
router.get("/hello", async (req, res) => {
    console.log("hello");
    res.status(200).json({ msg: "só lágrimas" });
});
exports.default = router;
