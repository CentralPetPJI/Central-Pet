import { Router, Request, Response } from "express";
import { check, validationResult } from "express-validator";
import authMiddleware from "../middleware/authMiddleware";
import Pet from "../models/Pet";

const router = Router();

router.post(
  "/register",
  authMiddleware,
  [
    check("name", "Nome é obrigatório").not().isEmpty(),
    check("photo", "Foto é obrigatório para cadastrar o pet").not().isEmpty(),
    check("species", "A espécie do pet é obrigatória").not().isEmpty(),
    check(
      "age",
      "A idade é obrigatória (pode chutar se não souber ou se o pet foi acolhido)"
    ).isInt(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      caracteristicasFisicas,
      caracteristicasComportamentais,
      observacoes,
      photo,
      species,
      forAdoption,
      age,
    } = req.body;

    try {
      const pet = new Pet({
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
    } catch (error) {
      console.error((error as Error).message);
      res.status(500).send("Erro de servidor");
    }
  }
);

router.get("/hello", async (req: Request, res: Response) => {
  console.log("hello");
  res.status(200).json({ msg: "só lágrimas" });
});
export default router;
