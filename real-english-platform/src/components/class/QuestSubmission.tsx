"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Check, Loader2, Headphones, FileText, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { createBrowserClient } from "@supabase/ssr";
import { submitQuestProof } from "@/app/actions/quest";
import { getListeningBooks, getListeningRounds, submitListeningExam } from "@/lib/actions/listening";

interface QuestSubmissionProps {
    questId: string;
    questType?: string; // '단어' | '듣기' | '모의고사' | etc
    currentCount: number;
    targetCount: number;
    isCompleted: boolean;
}

// Listening OMR ranges
const RANGES = [
    { start: 1, end: 20 },
    { start: 25, end: 28 },
    { start: 43, end: 45 }
];

interface ListeningBook {
    id: string;
    name: string;
}

interface ListeningRound {
    id: string;
    round_number: number;
    title: string;
}

export default function QuestSubmission({
    questId,
    questType,
    currentCount,
    targetCount,
    isCompleted
}: QuestSubmissionProps) {
    const [uploading, setUploading] = useState(false);

    // Listening state
    const [showListeningDialog, setShowListeningDialog] = useState(false);
    const [books, setBooks] = useState<ListeningBook[]>([]);
    const [selectedBook, setSelectedBook] = useState("");
    const [rounds, setRounds] = useState<ListeningRound[]>([]);
    const [selectedRound, setSelectedRound] = useState("");
    const [showOMR, setShowOMR] = useState(false);
    const [answers, setAnswers] = useState<number[]>(new Array(27).fill(0));
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<{
        score: number;
        correctCount: number;
        totalCount: number;
        details: { isCorrect: boolean; correctAnswer: number }[];
    } | null>(null);

    const isListening = questType?.includes('듣기') || questType?.toLowerCase().includes('listen');
    const isVocab = questType?.includes('단어') || questType?.toLowerCase().includes('vocab');

    // Load listening books when dialog opens
    useEffect(() => {
        if (showListeningDialog && books.length === 0) {
            loadBooks();
        }
    }, [showListeningDialog]);

    async function loadBooks() {
        const data = await getListeningBooks();
        setBooks(data);
    }

    async function loadRounds(bookId: string) {
        setSelectedBook(bookId);
        setSelectedRound("");
        const data = await getListeningRounds(bookId);
        setRounds(data);
    }

    // Photo upload for vocab
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            const fileExt = file.name.split('.').pop();
            const fileName = `homework/${questId}/${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(fileName);

            await submitQuestProof(questId, publicUrl);
            toast.success("인증 완료! 횟수가 추가되었습니다.");

        } catch (error) {
            console.error(error);
            toast.error("업로드 실패. 다시 시도해주세요.");
        } finally {
            setUploading(false);
        }
    };

    // Listening OMR
    const getIndex = (qNum: number) => {
        if (qNum <= 20) return qNum - 1;
        if (qNum <= 28) return 20 + (qNum - 25);
        return 24 + (qNum - 43);
    };

    const handleSelectAnswer = (qNum: number, value: number) => {
        if (result) return;
        const idx = getIndex(qNum);
        const newAnswers = [...answers];
        newAnswers[idx] = value;
        setAnswers(newAnswers);
    };

    const startOMR = () => {
        if (!selectedRound) {
            toast.error("회차를 선택해주세요.");
            return;
        }
        setShowOMR(true);
        setAnswers(new Array(27).fill(0));
        setResult(null);
    };

    const handleSubmitListening = async () => {
        setSubmitting(true);
        const res = await submitListeningExam(selectedRound, answers);
        setSubmitting(false);

        if (res.success) {
            setResult({
                score: res.score!,
                correctCount: res.correctCount!,
                totalCount: res.totalCount!,
                details: res.details!
            });
            toast.success(`채점 완료! ${res.score}점`);
        } else {
            toast.error(res.message || "채점 실패");
        }
    };

    const closeDialog = () => {
        setShowListeningDialog(false);
        setShowOMR(false);
        setSelectedBook("");
        setSelectedRound("");
        setAnswers(new Array(27).fill(0));
        setResult(null);
    };

    // Completed state
    if (isCompleted) {
        return (
            <Button disabled variant="outline" className="w-full bg-green-50 text-green-600 border-green-200">
                <Check className="w-4 h-4 mr-2" />
                완료됨 ({currentCount}/{targetCount})
            </Button>
        );
    }

    // Listening quest
    if (isListening) {
        return (
            <>
                <Button
                    variant="outline"
                    className="w-full border-dashed border-purple-300 text-purple-600 hover:bg-purple-50"
                    onClick={() => setShowListeningDialog(true)}
                >
                    <Headphones className="w-4 h-4 mr-2" />
                    듣기 풀기 ({currentCount}/{targetCount})
                </Button>

                <Dialog open={showListeningDialog} onOpenChange={(open) => !open && closeDialog()}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Headphones className="w-5 h-5 text-purple-600" />
                                듣기 평가
                            </DialogTitle>
                        </DialogHeader>

                        {!showOMR ? (
                            // Book/Round Selection
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">교재 선택</label>
                                    <Select value={selectedBook} onValueChange={loadRounds}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="교재를 선택하세요" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {books.map((book) => (
                                                <SelectItem key={book.id} value={book.id}>
                                                    {book.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedBook && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">회차 선택</label>
                                        <Select value={selectedRound} onValueChange={setSelectedRound}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="회차를 선택하세요" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {rounds.map((round) => (
                                                    <SelectItem key={round.id} value={round.id}>
                                                        {round.round_number}회 - {round.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <DialogFooter>
                                    <Button variant="outline" onClick={closeDialog}>취소</Button>
                                    <Button
                                        className="bg-purple-600 hover:bg-purple-700"
                                        onClick={startOMR}
                                        disabled={!selectedRound}
                                    >
                                        시작하기
                                    </Button>
                                </DialogFooter>
                            </div>
                        ) : (
                            // OMR Grid
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-3 gap-4">
                                    {RANGES.map((range, rIdx) => (
                                        <div key={rIdx} className="space-y-2">
                                            <h4 className="text-sm font-medium text-slate-500 border-b pb-1">
                                                {range.start}~{range.end}번
                                            </h4>
                                            {Array.from({ length: range.end - range.start + 1 }).map((_, i) => {
                                                const qNum = range.start + i;
                                                const idx = getIndex(qNum);
                                                const selected = answers[idx];
                                                const detail = result?.details[idx];

                                                return (
                                                    <div key={qNum} className="flex items-center gap-1">
                                                        <span className={`w-6 text-right text-sm font-medium ${
                                                            result ? (detail?.isCorrect ? "text-green-600" : "text-red-600") : "text-slate-600"
                                                        }`}>
                                                            {qNum}.
                                                        </span>
                                                        <div className="flex gap-0.5">
                                                            {[1, 2, 3, 4, 5].map((opt) => {
                                                                const isSelected = selected === opt;
                                                                const isCorrect = detail?.correctAnswer === opt;
                                                                const isWrong = result && isSelected && !detail?.isCorrect;

                                                                return (
                                                                    <button
                                                                        key={opt}
                                                                        onClick={() => handleSelectAnswer(qNum, opt)}
                                                                        disabled={!!result}
                                                                        className={`w-6 h-6 rounded-full text-xs font-medium transition-all ${
                                                                            result
                                                                                ? isCorrect
                                                                                    ? "bg-green-500 text-white"
                                                                                    : isWrong
                                                                                        ? "bg-red-500 text-white"
                                                                                        : "bg-slate-100 text-slate-400"
                                                                                : isSelected
                                                                                    ? "bg-purple-600 text-white"
                                                                                    : "bg-slate-100 text-slate-600 hover:bg-purple-100"
                                                                        }`}
                                                                    >
                                                                        {opt}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        {result && (
                                                            detail?.isCorrect
                                                                ? <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                                : <XCircle className="w-3 h-3 text-red-500" />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>

                                {result && (
                                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                                        <p className="text-sm text-purple-600 mb-1">채점 결과</p>
                                        <p className="text-3xl font-bold text-purple-700">{result.score}점</p>
                                        <p className="text-sm text-purple-600">
                                            {result.correctCount} / {result.totalCount} 정답
                                        </p>
                                    </div>
                                )}

                                <DialogFooter>
                                    {!result ? (
                                        <Button
                                            className="w-full bg-purple-600 hover:bg-purple-700"
                                            onClick={handleSubmitListening}
                                            disabled={submitting}
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    채점 중...
                                                </>
                                            ) : (
                                                "채점하기"
                                            )}
                                        </Button>
                                    ) : (
                                        <Button className="w-full" onClick={closeDialog}>
                                            닫기
                                        </Button>
                                    )}
                                </DialogFooter>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </>
        );
    }

    // Default: Photo upload (for vocab, grammar, other)
    return (
        <div className="flex flex-col gap-2">
            <input
                type="file"
                id={`upload-${questId}`}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
            />
            <label htmlFor={`upload-${questId}`}>
                <Button
                    variant="outline"
                    className="w-full border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
                    asChild
                    disabled={uploading}
                >
                    <span className="cursor-pointer flex items-center justify-center">
                        {uploading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                업로드 중...
                            </>
                        ) : (
                            <>
                                <Camera className="w-4 h-4 mr-2" />
                                사진으로 인증하기 ({currentCount}/{targetCount})
                            </>
                        )}
                    </span>
                </Button>
            </label>
        </div>
    );
}
