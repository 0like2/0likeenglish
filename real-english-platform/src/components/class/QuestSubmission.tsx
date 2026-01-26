"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Check, Loader2, Headphones, FileText, CheckCircle2, XCircle, ClipboardCheck, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { createBrowserClient } from "@supabase/ssr";
import { submitQuestProof } from "@/app/actions/quest";
import { compressImage, formatFileSize } from "@/lib/image-compressor";
import { getListeningBooks, getListeningRounds, submitListeningExam } from "@/lib/actions/listening";
import { getEasyBooks, getEasyRounds, submitEasyExam } from "@/lib/actions/easy";
import { getAvailableExams, submitExam } from "@/lib/actions/exam";

interface QuestSubmissionProps {
    questId: string;
    questType?: string; // '단어' | '듣기' | '모의고사' | etc
    currentCount: number;
    targetCount: number;
    isCompleted: boolean;
}

// Listening OMR ranges (17 questions: 1-17번)
const LISTENING_ONLY_RANGES = [
    { start: 1, end: 17 }
];

// Easy Problems OMR ranges (10 questions: 18-20, 25-28, 43-45번)
const EASY_PROBLEMS_RANGES = [
    { start: 18, end: 20 },
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

interface EasyBook {
    id: string;
    name: string;
}

interface EasyRound {
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

    // Listening state (17문항: 1-17번)
    const [showListeningDialog, setShowListeningDialog] = useState(false);
    const [books, setBooks] = useState<ListeningBook[]>([]);
    const [selectedBook, setSelectedBook] = useState("");
    const [rounds, setRounds] = useState<ListeningRound[]>([]);
    const [selectedRound, setSelectedRound] = useState("");
    const [showListeningOMR, setShowListeningOMR] = useState(false);
    const [listeningAnswers, setListeningAnswers] = useState<number[]>(new Array(17).fill(0));
    const [submitting, setSubmitting] = useState(false);
    const [listeningResult, setListeningResult] = useState<{
        score: number;
        correctCount: number;
        totalCount: number;
        details: { isCorrect: boolean; correctAnswer: number }[];
    } | null>(null);

    // Easy Problems state (10문항: 18-20, 25-28, 43-45번)
    const [showEasyDialog, setShowEasyDialog] = useState(false);
    const [easyBooks, setEasyBooks] = useState<EasyBook[]>([]);
    const [selectedEasyBook, setSelectedEasyBook] = useState("");
    const [easyRounds, setEasyRounds] = useState<EasyRound[]>([]);
    const [selectedEasyRound, setSelectedEasyRound] = useState("");
    const [showEasyOMR, setShowEasyOMR] = useState(false);
    const [easyAnswers, setEasyAnswers] = useState<number[]>(new Array(10).fill(0));
    const [easyResult, setEasyResult] = useState<{
        score: number;
        correctCount: number;
        totalCount: number;
        details: { isCorrect: boolean; correctAnswer: number; questionNumber: number }[];
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
    const isEasyProblems = questType?.includes('쉬운문제') || questType?.toLowerCase().includes('easy');
    const isMockExam = questType?.includes('모의') || questType?.toLowerCase().includes('mock') || questType?.toLowerCase().includes('exam');
    const isVocab = questType?.includes('단어') || questType?.toLowerCase().includes('vocab');

    // Load listening books when dialog opens
    useEffect(() => {
        if (showListeningDialog && books.length === 0) {
            loadBooks();
        }
    }, [showListeningDialog]);

    // Load easy books when dialog opens
    useEffect(() => {
        if (showEasyDialog && easyBooks.length === 0) {
            loadEasyBooks();
        }
    }, [showEasyDialog]);

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

    async function loadEasyBooks() {
        const data = await getEasyBooks();
        setEasyBooks(data);
    }

    async function loadEasyRounds(bookId: string) {
        setSelectedEasyBook(bookId);
        setSelectedEasyRound("");
        const data = await getEasyRounds(bookId);
        setEasyRounds(data);
    }

    async function loadExams() {
        const data = await getAvailableExams();
        setExams(data);
    }

    // Photo upload for vocab (with compression)
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);

            // 이미지 압축 (3MB → ~100KB)
            const compressedFile = await compressImage(file, {
                maxWidth: 800,
                maxHeight: 800,
                quality: 0.7,
                maxSizeMB: 0.2
            });

            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            const fileName = `homework/${questId}/${Date.now()}.jpg`;
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(fileName, compressedFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(fileName);

            await submitQuestProof(questId, publicUrl);
            toast.success("인증 완료! 횟수가 추가되었습니다.");
            router.refresh();

        } catch (error) {
            console.error(error);
            toast.error("업로드 실패. 다시 시도해주세요.");
        } finally {
            setUploading(false);
        }
    };

    // Listening OMR - simple 1-17 index (qNum - 1)
    const handleSelectListeningAnswer = (qNum: number, value: number) => {
        if (listeningResult) return;
        if (submitting) return; // 더블클릭 방지
        const idx = qNum - 1;
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
        setListeningAnswers(new Array(17).fill(0));
        setListeningResult(null);
    };

    const handleSubmitListening = async () => {
        if (submitting) return; // 더블클릭 방지
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
        setListeningAnswers(new Array(17).fill(0));
        setListeningResult(null);
        if (hadResult) router.refresh();
    };

    // Easy Problems OMR - convert question number to array index
    const getEasyIndex = (qNum: number): number => {
        if (qNum >= 18 && qNum <= 20) return qNum - 18;       // 0-2
        if (qNum >= 25 && qNum <= 28) return 3 + (qNum - 25); // 3-6
        if (qNum >= 43 && qNum <= 45) return 7 + (qNum - 43); // 7-9
        return -1;
    };

    const handleSelectEasyAnswer = (qNum: number, value: number) => {
        if (easyResult) return;
        if (submitting) return; // 더블클릭 방지
        const idx = getEasyIndex(qNum);
        if (idx === -1) return;
        const newAnswers = [...easyAnswers];
        newAnswers[idx] = value;
        setEasyAnswers(newAnswers);
    };

    const startEasyOMR = () => {
        if (!selectedEasyRound) {
            toast.error("회차를 선택해주세요.");
            return;
        }
        setShowEasyOMR(true);
        setEasyAnswers(new Array(10).fill(0));
        setEasyResult(null);
    };

    const handleSubmitEasy = async () => {
        if (submitting) return; // 더블클릭 방지
        setSubmitting(true);
        const res = await submitEasyExam(selectedEasyRound, easyAnswers);
        setSubmitting(false);

        if (res.success) {
            setEasyResult({
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

    const closeEasyDialog = () => {
        const hadResult = !!easyResult;
        setShowEasyDialog(false);
        setShowEasyOMR(false);
        setSelectedEasyBook("");
        setSelectedEasyRound("");
        setEasyAnswers(new Array(10).fill(0));
        setEasyResult(null);
        if (hadResult) router.refresh();
    };

    // Mock Exam OMR - simple 0-44 index mapping
    const handleSelectMockExamAnswer = (qNum: number, value: number) => {
        if (mockExamResult) return;
        if (submitting) return; // 더블클릭 방지
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
        if (submitting) return; // 더블클릭 방지
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
                            // OMR Grid (17문항: 1-17번)
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* 1-9번 */}
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-slate-500 border-b pb-1">1~9번</h4>
                                        {Array.from({ length: 9 }).map((_, i) => {
                                            const qNum = i + 1;
                                            const idx = qNum - 1;
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
                                                                    disabled={!!listeningResult || submitting}
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
                                    {/* 10-17번 */}
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-slate-500 border-b pb-1">10~17번</h4>
                                        {Array.from({ length: 8 }).map((_, i) => {
                                            const qNum = 10 + i;
                                            const idx = qNum - 1;
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
                                                                    disabled={!!listeningResult || submitting}
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

    // Easy Problems quest (쉬운문제풀이)
    if (isEasyProblems) {
        return (
            <>
                <Button
                    variant="outline"
                    className="w-full border-dashed border-orange-300 text-orange-600 hover:bg-orange-50"
                    onClick={() => setShowEasyDialog(true)}
                >
                    <BookOpen className="w-4 h-4 mr-2" />
                    쉬운문제 풀기
                </Button>

                <Dialog open={showEasyDialog} onOpenChange={(open) => !open && closeEasyDialog()}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-orange-600" />
                                쉬운문제풀이 (18-20, 25-28, 43-45번)
                            </DialogTitle>
                        </DialogHeader>

                        {!showEasyOMR ? (
                            // Book/Round Selection
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">교재 선택</label>
                                    <Select value={selectedEasyBook} onValueChange={loadEasyRounds}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="교재를 선택하세요" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {easyBooks.map((book) => (
                                                <SelectItem key={book.id} value={book.id}>
                                                    {book.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedEasyBook && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">회차 선택</label>
                                        <Select value={selectedEasyRound} onValueChange={setSelectedEasyRound}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="회차를 선택하세요" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {easyRounds.map((round) => (
                                                    <SelectItem key={round.id} value={round.id}>
                                                        {round.round_number}회 - {round.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <DialogFooter>
                                    <Button variant="outline" onClick={closeEasyDialog}>취소</Button>
                                    <Button
                                        className="bg-orange-600 hover:bg-orange-700"
                                        onClick={startEasyOMR}
                                        disabled={!selectedEasyRound}
                                    >
                                        시작하기
                                    </Button>
                                </DialogFooter>
                            </div>
                        ) : (
                            // OMR Grid (10문항: 18-20, 25-28, 43-45번)
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-3 gap-4">
                                    {EASY_PROBLEMS_RANGES.map((range, rIdx) => (
                                        <div key={rIdx} className="space-y-2">
                                            <h4 className="text-sm font-medium text-slate-500 border-b pb-1">
                                                {range.start}~{range.end}번
                                            </h4>
                                            {Array.from({ length: range.end - range.start + 1 }).map((_, i) => {
                                                const qNum = range.start + i;
                                                const idx = getEasyIndex(qNum);
                                                const selected = easyAnswers[idx];
                                                const detail = easyResult?.details[idx];

                                                return (
                                                    <div key={qNum} className="flex items-center gap-1">
                                                        <span className={`w-6 text-right text-sm font-medium ${
                                                            easyResult ? (detail?.isCorrect ? "text-green-600" : "text-red-600") : "text-slate-600"
                                                        }`}>
                                                            {qNum}.
                                                        </span>
                                                        <div className="flex gap-0.5">
                                                            {[1, 2, 3, 4, 5].map((opt) => {
                                                                const isSelected = selected === opt;
                                                                const isCorrect = detail?.correctAnswer === opt;
                                                                const isWrong = easyResult && isSelected && !detail?.isCorrect;

                                                                return (
                                                                    <button
                                                                        key={opt}
                                                                        onClick={() => handleSelectEasyAnswer(qNum, opt)}
                                                                        disabled={!!easyResult || submitting}
                                                                        className={`w-6 h-6 rounded-full text-xs font-medium transition-all ${
                                                                            easyResult
                                                                                ? isCorrect
                                                                                    ? "bg-green-500 text-white"
                                                                                    : isWrong
                                                                                        ? "bg-red-500 text-white"
                                                                                        : "bg-slate-100 text-slate-400"
                                                                                : isSelected
                                                                                    ? "bg-orange-600 text-white"
                                                                                    : "bg-slate-100 text-slate-600 hover:bg-orange-100"
                                                                        }`}
                                                                    >
                                                                        {opt}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        {easyResult && (
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

                                {easyResult && (
                                    <div className="bg-orange-50 p-4 rounded-lg text-center">
                                        <p className="text-sm text-orange-600 mb-1">채점 결과</p>
                                        <p className="text-3xl font-bold text-orange-700">{easyResult.score}점</p>
                                        <p className="text-sm text-orange-600">
                                            {easyResult.correctCount} / {easyResult.totalCount} 정답
                                        </p>
                                    </div>
                                )}

                                <DialogFooter>
                                    {!easyResult ? (
                                        <Button
                                            className="w-full bg-orange-600 hover:bg-orange-700"
                                            onClick={handleSubmitEasy}
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
                                        <Button className="w-full" onClick={closeEasyDialog}>
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
