"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updatePayment, getStudentPayment } from "@/lib/actions/admin";

interface PaymentManageDialogProps {
    studentId: string;
    studentName: string;
    currentStatus?: string;
}

export default function PaymentManageDialog({ studentId, studentName, currentStatus }: PaymentManageDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    const [classCount, setClassCount] = useState("4");
    const [status, setStatus] = useState<string>(currentStatus || "active");
    const [expiryDate, setExpiryDate] = useState("");
    const [amount, setAmount] = useState("0");

    // Load existing payment data when dialog opens
    useEffect(() => {
        if (open) {
            loadPaymentData();
        }
    }, [open]);

    async function loadPaymentData() {
        setFetching(true);
        try {
            const payment = await getStudentPayment(studentId);
            if (payment) {
                setClassCount(String(payment.class_count || 4));
                setStatus(payment.status || "active");
                setExpiryDate(payment.expiry_date ? payment.expiry_date.split('T')[0] : "");
                setAmount(String(payment.amount || 0));
            }
        } catch (e) {
            console.error(e);
        }
        setFetching(false);
    }

    async function handleSubmit() {
        setLoading(true);
        try {
            const result = await updatePayment(studentId, {
                class_count: parseInt(classCount),
                status: status as 'active' | 'pending' | 'expired',
                expiry_date: expiryDate || undefined,
                amount: parseInt(amount) || 0
            });

            if (result.success) {
                toast.success(result.message);
                setOpen(false);
                router.refresh();
            } else {
                toast.error(result.message || "업데이트 실패");
            }
        } catch (e: any) {
            toast.error(e.message || "오류가 발생했습니다.");
        }
        setLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                    <CreditCard className="w-3 h-3 mr-1" />
                    수강권
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        수강권 관리 - {studentName}
                    </DialogTitle>
                </DialogHeader>

                {fetching ? (
                    <div className="py-8 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        {/* 수강권 횟수 */}
                        <div className="space-y-2">
                            <Label>수강권 횟수</Label>
                            <Select value={classCount} onValueChange={setClassCount}>
                                <SelectTrigger>
                                    <SelectValue placeholder="수강권 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="4">4회권</SelectItem>
                                    <SelectItem value="8">8회권</SelectItem>
                                    <SelectItem value="12">12회권</SelectItem>
                                    <SelectItem value="16">16회권</SelectItem>
                                    <SelectItem value="20">20회권</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 결제 상태 */}
                        <div className="space-y-2">
                            <Label>결제 상태</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="상태 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-500" />
                                            수강중
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="pending">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-orange-500" />
                                            입금확인중
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="expired">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-red-500" />
                                            만료됨
                                        </span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 만료일 */}
                        <div className="space-y-2">
                            <Label>만료일 (다음 결제 예정일)</Label>
                            <Input
                                type="date"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                            />
                        </div>

                        {/* 결제 금액 */}
                        <div className="space-y-2">
                            <Label>결제 금액 (원)</Label>
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="400000"
                            />
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>취소</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || fetching}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                저장 중...
                            </>
                        ) : (
                            "저장"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
