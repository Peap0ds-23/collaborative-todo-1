"use client";

import { useState, useTransition } from "react";
import { signin } from "@/actions/auth/actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/icons";

export default function SignInForm() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [isPending, startTransition] = useTransition();

    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formDataToSubmit = new FormData();
        formDataToSubmit.append("email", formData.email);
        formDataToSubmit.append("password", formData.password);

        startTransition(() => {
            signin(formDataToSubmit);
        });
    };

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    placeholder="m@example.com"
                    type="email"
                    value={formData.email}
                    onChange={handleChange("email")}
                    required
                />
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
                    required
                />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                    <>
                        <LoadingSpinner className="w-4 h-4 mr-2" />
                        Signing in...
                    </>
                ) : (
                    "Sign in"
                )}
            </Button>
        </form>
    );
}

