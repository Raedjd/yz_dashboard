import { Schema, Connection, Model, Document } from "mongoose";

// ==========================================
// COLLECTION TYPES
// ==========================================
export const collectionTypes = [
    "YOOZ_TRANSFORMED_ITEMS_DOCUMENTS",
    "YOOZ_CUSTOMERS",
    "YOOZ_SUPPLIERS",
    "YOOZ_ANALYTICAL",
    "YOOZ_ACCOUNTS",
    "YOOZ_PAYMENTS",
    "YOOZ_PURCHASEDELIVERYNOTES",
] as const;

export type CollectionType = typeof collectionTypes[number];

// ==========================================
// GENERIC SCHEMA (passthrough, comme Zod .passthrough())
// ==========================================
export interface IGenericCollection extends Document {
    Status?: string;
    Last_updated?: string;
    [key: string]: any;
}

const GenericCollectionSchema = new Schema<IGenericCollection>(
    {
        Status: { type: String },
        Last_updated: { type: String },
    },
    { strict: false }
);

// ==========================================
// MODEL FACTORY PAR TYPE DE COLLECTION
// ==========================================
export function getModelByCollectionType(conn: Connection, type: CollectionType): Model<IGenericCollection> {
    // le nom du modèle Mongoose = le nom de la collection, pour éviter toute confusion
    return (
        (conn.models[type] as Model<IGenericCollection>) ||
        conn.model<IGenericCollection>(type, GenericCollectionSchema, type)
    );
}