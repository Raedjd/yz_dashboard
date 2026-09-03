import { Schema, Connection, Model, Document } from "mongoose";

export interface IPurchaseDeliveryNote extends Document {
    DocNum: string;
    Type: "PurchaseDeliveryNotes";
    Operation_type: string;
    Status: "LOADED" | "FAILED";
    Message?: string;
    SAPB1_payload: any;
    YOOZ_payload: {
        initiator?: string;
        data: {
            dataBlocks: {
                YZ_COMMONS?: any;
                YZ_ORDER?: any;
                YZ_ORDER_LINE?: any[];
                [key: string]: any;
            };
        };
    };
    Last_updated?: string;
}

const PurchaseDeliveryNoteSchema = new Schema<IPurchaseDeliveryNote>(
    {
        DocNum: { type: String, required: true },
        Type: { type: String, enum: ["PurchaseDeliveryNotes"], required: true },
        Operation_type: { type: String, required: true },
        Status: { type: String, enum: ["LOADED", "FAILED"], required: true },
        Message: { type: String },
        SAPB1_payload: { type: Schema.Types.Mixed, default: null },
        YOOZ_payload: { type: Schema.Types.Mixed, required: true },
        Last_updated: { type: String },
    },
    { strict: false }
);

export function getPurchaseDeliveryNoteModel(conn: Connection): Model<IPurchaseDeliveryNote> {
    return (
        (conn.models.PurchaseDeliveryNote as Model<IPurchaseDeliveryNote>) ||
        conn.model<IPurchaseDeliveryNote>("PurchaseDeliveryNote", PurchaseDeliveryNoteSchema, "YOOZ_PURCHASEDELIVERYNOTES")
    );
}