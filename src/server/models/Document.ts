import { Schema, Connection, Model, Document as MongooseDocument } from "mongoose";

export interface IMessageError {
    message: string;
    timestamp: string;
    attempt: number;
}

export interface IDocument extends MongooseDocument {
    RefDoc?: string;
    YoozDocNum: string;
    Type: string;
    Status: "LOADED" | "FAILED" | "OPEN";
    Payload: any;
    SAPB1_payload: any;
    Last_updated?: string;
    Error?: string;
    FileName?: string;
    messages_error?: IMessageError[];
}

const MessageErrorSchema = new Schema<IMessageError>(
    {
        message: { type: String, required: true },
        timestamp: { type: String, required: true },
        attempt: { type: Number, required: true },
    },
    { _id: false }
);

const DocumentSchema = new Schema<IDocument>(
    {
        RefDoc: { type: String },
        YoozDocNum: { type: String, required: true },
        Type: { type: String, required: true },
        Status: { type: String, enum: ["LOADED", "FAILED", "OPEN"], required: true },
        Payload: { type: Schema.Types.Mixed },
        SAPB1_payload: { type: Schema.Types.Mixed },
        Last_updated: { type: String },
        Error: { type: String },
        FileName: { type: String },
        messages_error: { type: [MessageErrorSchema], default: undefined },
    },
    { strict: false }
);

export function getDocumentModel(conn: Connection): Model<IDocument> {
    return (conn.models.Document as Model<IDocument>) || conn.model<IDocument>("Document", DocumentSchema, "YOOZ_TRANSFORMED_ITEMS_DOCUMENTS");
}