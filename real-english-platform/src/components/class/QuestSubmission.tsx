"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Check, Loader2, Headphones, FileText, CheckCircle2, XCircle, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import { createBrowserClient } from "@supabase/ssr";
import { submitQuestProof } from "@/app/actions/quest";
import { getListeningBooks, getListeningRounds, submitListeningExam } from "@/lib/actions/listening";
import { getAvailableExams, submitExam } from "@/lib/actions/exam";

interface QuestSubmissionProps {
    questId: string;
    questType?: string; // '단어' | '듣기' | '모의고사' | etc
    currentCount: number;
    targetCount: number;
    isCompleted: boolean;
}

// Listening OMR ranges (27 questions: 1-20, 25-28, 43-45)
const LISTENING_RANGES = [
    { start: 1, end: 20 },
    { start: 25, end: 28 },
    { start: 43, end: 45 }
];

// Mock Exam OMR ranges (45 questions: 1-45)
const MOCK_EXAM_RANGES = [
    { start: 1, end: 15 },
    { start: 16, end: 30 },
    { start: 31, end: 45 }
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

interface MockExam {
    id: string;
    title: string;
    category: string;
}

export default function QuestSubmission({
    questId,
    questType,
    currentCount,
    targetCount,
    isCompleted
}: QuestSubmissionProps) {
    const router = useRouter();
    const [uploading, setUploading] = useState(false);

    // Listening state
    const [showListeningDialog, setShowListeningDialog] = useState(false);
    const [books, setBooks] = useState<ListeningBook[]>([]);
    const [selectedBook, setSelectedBook] = useState("");
    const [rounds, setRounds] = useState<ListeningRound[]>([]);
    const [selectedRound, setSelectedRound] = useState("");
    const [showListeningOMR, setShowListeningOMR] = useState(false);
    const [listeningAnswers, setListeningAnswers] = useState<number[]>(new Array(27).fill(0));
    const [submitting, setSubmitting] = useState(false);
    const [listeningResult, setListeningResult] = useState<{
        score: number;
        correctCount: number;
        totalCount: number;
        details: { isCorrect: boolean; correctAnswer: number }[];
    } | null>(null);

    // Mock Exam state
    const [showMockExamDialog, setShowMockExamDialog] = useState(false);
    const [exams, setExams] = useState<MockExam[]>([]);
    const [selectedExam, setSelectedExam] = useState("");
    const [showMockExamOMR, setShowMockExamOMR] = useState(false);
    const [mockExamAnswers, setMockExamAnswers] = useState<number[]>(new Array(45).fill(0));
    const [mockExamResult, setMockExamResult] = useState<{
        score: number;
        details: { questionIndex: number; isCorrect: boolean; studentAnswer: number; correctAnswer: number }[];
    } | null>(null);

    const isListening = questType?.includes('듣기') || questType?.toLowerCase().includes('listen');
    const isMockExam = questType?.includes('모의') || questType?.toLowerCase().includes('mock') || questType?.toLowerCase().includes('exam');
    const isVocab = questType?.includes('단어') || questType?.toLowerCase().includes('vocab');

    // Load listening books when dialog opens
    useEffect(() => {
        if (showListeningDialog && books.length === 0) {
            loadBooks();
        }
    }, [showListeningDialog]);

    // Load mock exams when dialog opens
    useEffect(() => {
        if (showMockExamDialog && exams.length === 0) {
            loadExams();
        }
    }, [showMockExamDialog]);

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

    async function loadExams() {
        const data = await getAvailableExams();
        setExams(data);
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
            router.refresh(); // 화면 새로고침

        } catch (error) {
            console.error(error);
            toast.error("업로드 실패. 다시 시도해주세요.");
        } finally {
            setUploading(false);
        }
    };

    // Listening OMR - convert question number to array index
    const getListeningIndex = (qNum: number) => {
        if (qNum <= 20) return qNum - 1;
        if (qNum <= 28) return 20 + (qNum - 25);
        return 24 + (qNum - 43);
    };

    const handleSelectListeningAnswer = (qNum: number, value: number) => {
        if (listeningResult) return;
        const idx = getListeningIndex(qNum);
        const newAnswers = [...listeningAnswers];
        newAnswers[idx] = value;
        setListeningAnswers(newAnswers);
    };

    const startListeningOMR = () => {
        if (!selectedRound) {
            toast.error("회차를 선택해주세요.");
            return;
        }
        setShowListeningOMR(true);
        setListeningAnswers(new Array(27).fill(0));
        setListeningResult(null);
    };

    const handleSubmitListening = async () => {
        setSubmitting(true);
        const res = await submitListeningExam(selectedRound, listeningAnswers);
        setSubmitting(false);

        if (res.success) {
            setListeningResult({
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

    const closeListeningDialog = () => {
        const hadResult = !!listeningResult;
        setShowListeningDialog(false);
        setShowListeningOMR(false);
        setSelectedBook("");
        setSelectedRound("");
        setListeningAnswers(new Array(27).fill(0));
        setListeningResult(null);
        if (hadResult) router.refresh(); // 채점 완료 후 화면 새로고침
    };

    // Mock Exam OMR - simple 0-44 index mapping
    const handleSelectMockExamAnswer = (qNum: number, value: number) => {
        if (mockExamResult) return;
        const idx = qNum - 1; // Questions 1-45 map to index 0-44
        const newAnswers = [...mockExamAnswers];
        newAnswers[idx] = value;
        setMockExamAnswers(newAnswers);
    };

    const startMockExamOMR = () => {
        if (!selectedExam) {
            toast.error("모의고사를 선택해주세요.");
            return;
        }
        setShowMockExamOMR(true);
        setMockExamAnswers(new Array(45).fill(0));
        setMockExamResult(null);
    };

    const handleSubmitMockExam = async () => {
        setSubmitting(true);
        const res = await submitExam(selectedExam, mockExamAnswers);
        setSubmitting(false);

        if (res.success) {
            setMockExamResult({
                score: res.score!,
                details: res.details!
            });
            toast.success(`채점 완료! ${res.score}점`);
        } else {
            toast.error(res.message || "채점 실패");
        }
    };

    const closeMockExamDialog = () => {
        const hadResult = !!mockExamResult;
        setShowMockExamDialog(false);
        setShowMockExamOMR(false);
        setSelectedExam("");
        setMockExamAnswers(new Array(45).fill(0));
        setMockExamResult(null);
        if (hadResult) router.refresh(); // 채점 완료 후 화면 새로고침
    };

    // Completed state
    if (isCompleted) {
        return (
            <Button disabled variant="outline" className="w-full bg-green-50 text-green-600 border-green-200">
                <Check className="w-4 h-4 mr-2" />
                이번 주 완료
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
                    듣기 풀기
                </Button>

                <Dialog open={showListeningDialog} onOpenChange={(open) => !open && closeListeningDialog()}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Headphones className="w-5 h-5 text-purple-600" />
                                듣기 평가
                            </DialogTitle>
                        </DialogHeader>

                        {!showListeningOMR ? (
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
                                    <Button variant="outline" onClick={closeListeningDialog}>취소</Button>
                                    <Button
                                        className="bg-purple-600 hover:bg-purple-700"
                                        onClick={startListeningOMR}
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
                                    {LISTENING_RANGES.map((range, rIdx) => (
                                        <div key={rIdx} className="space-y-2">
                                            <h4 className="text-sm font-medium text-slate-500 border-b pb-1">
                                                {range.start}~{range.end}번
                                            </h4>
                                            {Array.from({ length: range.end - range.start + 1 }).map((_, i) => {
                                                const qNum = range.start + i;
                                                const idx = getListeningIndex(qNum);
                                                const selected = listeningAnswers[idx];
                                                const detail = listeningResult?.details[idx];

                                                return (
                                                    <div key={qNum} className="flex items-center gap-1">
                                                        <span className={`w-6 text-right text-sm font-medium ${
                                                            listeningResult ? (detail?.isCorrect ? "text-green-600" : "text-red-600") : "text-slate-600"
                                                        }`}>
                                                            {qNum}.
                                                        </span>
                                                        <div className="flex gap-0.5">
                                                            {[1, 2, 3, 4, 5].map((opt) => {
                                                                const isSelected = selected === opt;
                                                                const isCorrect = detail?.correctAnswer === opt;
                                                                const isWrong = listeningResult && isSelected && !detail?.isCorrect;

                                                                return (
                                                                    <button
                                                                        key={opt}
                                                                        onClick={() => handleSelectListeningAnswer(qNum, opt)}
                                                                        disabled={!!listeningResult}
                                                                        className={`w-6 h-6 rounded-full text-xs font-medium transition-all ${
                                                                            listeningResult
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
                                                        {listeningResult && (
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

                                {listeningResult && (
                                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                                        <p className="text-sm text-purple-600 mb-1">채점 결과</p>
                                        <p className="text-3xl font-bold text-purple-700">{listeningResult.score}점</p>
                                        <p className="text-sm text-purple-600">
                                            {listeningResult.correctCount} / {listeningResult.totalCount} 정답
                                        </p>
                                    </div>
                                )}

                                <DialogFooter>
                                    {!listeningResult ? (
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
                                        <Button className="w-full" onClick={closeListeningDialog}>
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

    // Mock Exam quest
    if (isMockExam) {
        return (
            <>
                <Button
                    variant="outline"
                    className="w-full border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
                    onClick={() => setShowMockExamDialog(true)}
                >
                    <ClipboardCheck className="w-4 h-4 mr-2" />
                    모의고사 풀기
                </Button>

                <Dialog open={showMockExamDialog} onOpenChange={(open) => !open && closeMockExamDialog()}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <ClipboardCheck className="w-5 h-5 text-blue-600" />
                                모의고사
                            </DialogTitle>
                        </DialogHeader>

                        {!showMockExamOMR ? (
                            // Exam Selection
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">모의고사 선택</label>
                                    <Select value={selectedExam} onValueChange={setSelectedExam}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="모의고사를 선택하세요" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {exams.map((exam) => (
                                                <SelectItem key={exam.id} value={exam.id}>
                                                    [{exam.category}] {exam.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={closeMockExamDialog}>취소</Button>
                                    <Button
                                        className="bg-blue-600 hover:bg-blue-700"
                                        onClick={startMockExamOMR}
                                        disabled={!selectedExam}
                                    >
                                        시작하기
                                    </Button>
                                </DialogFooter>
                            </div>
                        ) : (
                            // 45-question OMR Grid
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-3 gap-4">
                                    {MOCK_EXAM_RANGES.map((range, rIdx) => (
                                        <div key={rIdx} className="space-y-2">
                                            <h4 className="text-sm font-medium text-slate-500 border-b pb-1">
                                                {range.start}~{range.end}번
                                            </h4>
                                            {Array.from({ length: range.end - range.start + 1 }).map((_, i) => {
                                                const qNum = range.start + i;
                                                const idx = qNum - 1;
                                                const selected = mockExamAnswers[idx];
                                                const detail = mockExamResult?.details[idx];

                                                return (
                                                    <div key={qNum} className="flex items-center gap-1">
                                                        <span className={`w-6 text-right text-sm font-medium ${
                                                            mockExamResult ? (detail?.isCorrect ? "text-green-600" : "text-red-600") : "text-slate-600"
                                                        }`}>
                                                            {qNum}.
                                                        </span>
                                                        <div className="flex gap-0.5">
                                                            {[1, 2, 3, 4, 5].map((opt) => {
                                                                const isSelected = selected === opt;
                                                                const isCorrect = detail?.correctAnswer === opt;
                                                                const isWrong = mockExamResult && isSelected && !detail?.isCorrect;

                                                                return (
                                                                    <button
                                                                        key={opt}
                                                                        onClick={() => handleSelectMockExamAnswer(qNum, opt)}
                                                                        disabled={!!mockExamResult}
                                                                        className={`w-6 h-6 rounded-full text-xs font-medium transition-all ${
                                                                            mockExamResult
                                                                                ? isCorrect
                                                                                    ? "bg-green-500 text-white"
                                                                                    : isWrong
                                                                                        ? "bg-red-500 text-white"
                                                                                        : "bg-slate-100 text-slate-400"
                                                                                : isSelected
                                                                                    ? "bg-blue-600 text-white"
                                                                                    : "bg-slate-100 text-slate-600 hover:bg-blue-100"
                                                                        }`}
                                                                    >
                                                                        {opt}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        {mockExamResult && (
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

                                {mockExamResult && (
                                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                                        <p className="text-sm text-blue-600 mb-1">채점 결과</p>
                                        <p className="text-3xl font-bold text-blue-700">{mockExamResult.score}점</p>
                                        <p className="text-sm text-blue-600">
                                            {mockExamResult.details.filter(d => d.isCorrect).length} / 45 정답
                                        </p>
                                    </div>
                                )}

                                <DialogFooter>
                                    {!mockExamResult ? (
                                        <Button
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                            onClick={handleSubmitMockExam}
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
                                        <Button className="w-full" onClick={closeMockExamDialog}>
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
                                사진으로 인증하기
                            </>
                        )}
                    </span>
                </Button>
            </label>
        </div>
    );
}
