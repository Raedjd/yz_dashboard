import { Schema, Connection, Model, Document } from "mongoose";

export interface IEmailTemplate {
    subject: string;
    body: string;
}

export interface ISchedule extends Document {
    connectionId: string;
    name: string;
    enabled: boolean;
    frequency: "once" | "every1min" | "hourly" | "daily" | "weekly" | "monthly";
    time: string;
    recipients: string;
    exportFormat: "csv" | "json" | "excel";
    modules: string[];
    includeStats: boolean;
    includeErrors: boolean;
    includeOnlyFailed: boolean;
    emailTemplate: IEmailTemplate;
    startDate?: string;
    reportFromDate?: string;
    reportToDate?: string;
    lastExecutionDate?: string;
}

const EmailTemplateSchema = new Schema<IEmailTemplate>(
    {
        subject: { type: String, required: true },
        body: { type: String, required: true },
    },
    { _id: false }
);

const ScheduleSchema = new Schema<ISchedule>(
    {
        connectionId: { type: String, required: true },
        name: { type: String, required: true },
        enabled: { type: Boolean, required: true, default: true },
        frequency: {
            type: String,
            enum: ["once", "every1min", "hourly", "daily", "weekly", "monthly"],
            required: true,
        },
        time: {
            type: String,
            required: true,
            match: /^\d{2}:\d{2}$/,
        },
        recipients: { type: String, required: true },
        exportFormat: { type: String, enum: ["csv", "json", "excel"], required: true },
        modules: { type: [String], required: true, validate: (v: string[]) => v.length > 0 },
        includeStats: { type: Boolean, default: true },
        includeErrors: { type: Boolean, default: true },
        includeOnlyFailed: { type: Boolean, default: false },
        emailTemplate: { type: EmailTemplateSchema, required: true },
        startDate: { type: String },
        reportFromDate: { type: String },
        reportToDate: { type: String },
        lastExecutionDate: { type: String },
    },
    { timestamps: true }
);

export function getScheduleModel(conn: Connection): Model<ISchedule> {
    return (conn.models.Schedule as Model<ISchedule>) || conn.model<ISchedule>("Schedule", ScheduleSchema);
}