import { z } from "zod";
import { formatZodErrors, ValidationErrorApi } from "@/server/utils/validatorError";

export const createUserSchema = z.object({
    name: z.string({
        required_error: "Name is required",
        invalid_type_error: "Name must be a string",
    }),
    email: z.string({
        required_error: "Email is required",
        invalid_type_error: "Email must be a string",
    }).email("Email must be a valid email address"),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;

export function validateCreateUser(dto: unknown): CreateUserDto {
    const result = createUserSchema.safeParse(dto);
    if (!result.success) {
        throw new ValidationErrorApi(formatZodErrors(result.error));
    }
    return result.data;
}