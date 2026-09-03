import { Schema, model, models } from "mongoose";

const ConnectionSchema = new Schema({
    name: { type: String, required: true },
    uri: { type: String, required: true },
    database: { type: String, required: true },
    status: { type: String, enum: ["connected", "disconnected", "error"], default: "disconnected" },
    deleted: { type: Boolean, default: false },
}, { timestamps: true });

ConnectionSchema.index({ name: 1 });
ConnectionSchema.index({ deleted: 1, createdAt: -1 });

export const Connection = models.Connection || model("Connection", ConnectionSchema);