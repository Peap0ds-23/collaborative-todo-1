"use client";

import { useState, useTransition } from "react";
import { signup } from "@/actions/auth/actions";
import { signupSchema } from "@/lib/validations/signup-schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignUpForm() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState<any>({});
    const [isPending, startTransition] = useTransition();

    const validateField = (field: string, value: string): string | undefined => {
        const result = (signupSchema.shape as any)[field].safeParse(value);
        if (!result.success) {
            return result.error.issues[0]?.message;
        }
        return undefined;
    };

    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev: any) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleBlur = (field: string) => () => {
        const error = validateField(field, (formData as any)[field]);
        setErrors((prev: any) => ({ ...prev, [field]: error }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const result = signupSchema.safeParse(formData);
        if (!result.success) {
            const fieldErrors: any = {};
            for (const issue of result.error.issues) {
                const field = issue.path[0] as string;
                if (!fieldErrors[field]) {
                    fieldErrors[field] = issue.message;
                }
            }
            setErrors(fieldErrors);
            return;
        }

        const formDataToSubmit = new FormData();
        formDataToSubmit.append("name", formData.name);
        formDataToSubmit.append("email", formData.email);
        formDataToSubmit.append("password", formData.password);

        startTransition(() => {
            signup(formDataToSubmit);
        });
    };

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    name="name"
                    placeholder="Peter Parker"
                    type="text"
                    value={formData.name}
                    onChange={handleChange("name")}
                    onBlur={handleBlur("name")}
                />
                {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    placeholder="m@example.com"
                    type="email"
                    value={formData.email}
                    onChange={handleChange("email")}
                    onBlur={handleBlur("email")}
                />
                {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type="password"
                    value={formData.password}
                    onChange={handleChange("password")}
                    onBlur={handleBlur("password")}
                />
                {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                )}
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Signing up..." : "Sign Up"}
            </Button>
        </form>
    );
}
