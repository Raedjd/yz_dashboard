import { Schema, Connection, Model, Document } from "mongoose";

export interface ICustomerPayload {
    CardCode: string;
    CardName: string;
    ZipCode?: string | null;
    Phone1?: string | null;
    FederalTaxID?: string | null;
    City?: string | null;
    EmailAddress?: string | null;
    AdditionalID?: string | null;
    IBAN?: string | null;
    DebitorAccount?: string | null;
    Website?: string | null;
    VatIDNum?: string | null;
    VATRegistrationNumber?: string | null;
    [key: string]: any; // passthrough
}

export interface ICustomer extends Document {
    CardCode: string;
    Type: string;
    Operation_type: string;
    Status: "LOADED" | "FAILED";
    Message?: string;
    SAPB1_payload: ICustomerPayload;
    YOOZ_payload: any;
    Last_updated?: string;
}

const CustomerSchema = new Schema<ICustomer>(
    {
        CardCode: { type: String, required: true },
        Type: { type: String, required: true },
        Operation_type: { type: String, required: true },
        Status: { type: String, enum: ["LOADED", "FAILED"], required: true },
        Message: { type: String },
        SAPB1_payload: { type: Schema.Types.Mixed, required: true },
        YOOZ_payload: { type: Schema.Types.Mixed },
        Last_updated: { type: String },
    },
    { strict: false }
);

export function getCustomerModel(conn: Connection): Model<ICustomer> {
    return (conn.models.Customer as Model<ICustomer>) || conn.model<ICustomer>("Customer", CustomerSchema, "YOOZ_CUSTOMERS");
}