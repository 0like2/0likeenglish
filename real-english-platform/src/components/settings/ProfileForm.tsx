"use client";

import { useFormState } from "react-dom";
import { updateProfile } from "@/app/actions/user";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User as UserIcon } from "lucide-react";
import SubmitButton from "@/components/settings/SubmitButton";
import { useEffect } from "react";
import { toast } from "sonner";

interface ProfileFormProps {
    email: string;
    initialName: string;
}

const initialState = {
    success: false,
    message: "",
};

export default function ProfileForm({ email, initialName }: ProfileFormProps) {
    const [state, formAction] = useFormState(updateProfile, initialState);

    useEffect(() => {
        if (state?.message) {
            if (state.success) {
                toast.success(state.message);
            } else {
                toast.error(state.message);
            }
        }
    }, [state]);

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                    id="email"
                    value={email}
                    disabled
                    className="bg-slate-50 text-slate-500"
                />
                <p className="text-xs text-slate-400">이메일은 변경할 수 없습니다.</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="name">이름 (Display Name)</Label>
                <div className="relative">
                    <UserIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                        id="name"
                        name="name"
                        defaultValue={initialName}
                        placeholder="이름을 입력하세요"
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="pt-2">
                <SubmitButton />
            </div>
        </form>
    );
}
