import { z, ZodError } from "zod";

export interface FormattedError {
    field: string;
    message: string;
}

export function formatZodErrors(error: ZodError): FormattedError[] {
    return error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
    }));
}

export class ValidationErrorApi extends Error {
    public errors: FormattedError[];

    constructor(errors: FormattedError[]) {
        super(errors.map((e) => `${e.field}: ${e.message}`).join(" | "));
        this.name = "ValidationError";
        this.errors = errors;
    }
}