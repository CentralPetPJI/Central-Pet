"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const petSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    caracteristicasFisicas: { type: String, required: false },
    caracteristicasComportamentais: { type: String, required: false },
    observacoes: { types: String },
    photo: { type: String, required: true },
    species: { type: String, required: true },
    forAdoption: { type: Boolean, required: true, default: true },
    age: { type: Number, required: true },
    registeredBy: mongoose_1.default.Schema.Types.ObjectId
});
const Pet = mongoose_1.default.model('Pet', petSchema);
exports.default = Pet;
