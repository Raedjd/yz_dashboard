import { z } from "zod";
import { formatZodErrors, ValidationErrorApi } from "@/server/utils/validatorError";

export const createDocumentSchema = z.object({
    RefDoc: z.string({
        required_error: "RefDoc is required",
        invalid_type_error: "RefDoc must be a string",
    }),
});

export function validateCreateDocument(dto: any) {
    const result = createDocumentSchema.safeParse(dto);
    if (!result.success) {
        throw new ValidationErrorApi(formatZodErrors(result.error));
    }
    return result.data;
}