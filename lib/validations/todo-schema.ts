import { z } from "zod";

function getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export const dueDateSchema = z
    .string()
    .min(1, { message: "Please select a due date" })
    .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        { message: "Year must be a valid 4-digit number (YYYY-MM-DD format)" }
    )
    .refine(
        (dateStr) => {
            const date = new Date(dateStr);
            return !isNaN(date.getTime());
        },
        { message: "Please select a valid date" }
    )
    .refine(
        (dateStr) => {
            const today = getTodayDateString();
            return dateStr >= today;
        },
        { message: "Due date cannot be in the past" }
    );

export function validateDueDate(date: string | undefined): string | null {
    if (!date || date.trim() === "") {
        return "Please select a due date";
    }

    const result = dueDateSchema.safeParse(date);

    if (!result.success) {
        return result.error.issues[0]?.message || "Invalid date";
    }

    return null;
}
