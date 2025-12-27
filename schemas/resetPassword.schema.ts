import { z } from "zod"

export const resetPasswordSchema = z.object({
    newPassword: z.string()
        .min(8, { message: "password must be at least 8 characters long" })
        .regex(/[A-Z]/, { message: "password must contain at least one uppercase letter" })
        .regex(/[a-z]/, { message: "password must contain at least one lowercase letter" })
        .regex(/[0-9]/, { message: "password must contain at least one number" })
        .regex(/[@$!%*?&#]/, { message: "password must contain at least one special character" })
})