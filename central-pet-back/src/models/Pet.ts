import mongoose, { Schema, Document } from "mongoose";
import { Pet as SharedPet } from "@shared/types/Pet";

export interface IPet extends Omit<SharedPet, 'id'>, Document {}

const petSchema: Schema = new mongoose.Schema<IPet>({
    name: { type: String, required: true },
    caracteristicasFisicas: { type: String, required: false },
    caracteristicasComportamentais: { type: String, required: false},
    observacoes: { types: String },
    photo: { type: String, required: true },
    species: { type: String, required: true },
    forAdoption: { type: Boolean, required: true, default: true },
    age: { type: Number, required: true },
    registeredBy: mongoose.Schema.Types.ObjectId
});

const Pet = mongoose.model<IPet>('Pet', petSchema);
export default Pet;