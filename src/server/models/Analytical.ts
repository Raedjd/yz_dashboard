import { Schema, Connection, Model, Document } from "mongoose";

export interface IAnalytical extends Document {
    CenterCode: string;
    Type: "Analytical";
    Operation_type: string;
    Status: "LOADED" | "FAILED";
    Message?: string;
    SAPB1_payload: any;
    YOOZ_payload: {
        data: {
            dataBlocks: Record<string, any>;
        };
    };
    Last_updated?: string;
}

const AnalyticalSchema = new Schema<IAnalytical>(
    {
        CenterCode: { type: String, required: true },
        Type: { type: String, enum: ["Analytical"], required: true },
        Operation_type: { type: String, required: true },
        Status: { type: String, enum: ["LOADED", "FAILED"], required: true },
        Message: { type: String },
        SAPB1_payload: { type: Schema.Types.Mixed, default: null },
        YOOZ_payload: { type: Schema.Types.Mixed, required: true },
        Last_updated: { type: String },
    },
    { strict: false }
);

export function getAnalyticalModel(conn: Connection): Model<IAnalytical> {
    return (conn.models.Analytical as Model<IAnalytical>) || conn.model<IAnalytical>("Analytical", AnalyticalSchema, "YOOZ_ANALYTICAL");
}