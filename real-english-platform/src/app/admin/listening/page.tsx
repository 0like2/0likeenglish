"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, BookOpen, FileText, ChevronRight, Loader2, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getListeningBooks, createListeningBook, getListeningRounds, createListeningRound, deleteListeningBook, deleteListeningRound } from "@/lib/actions/listening";

interface ListeningBook {
    id: string;
    name: string;
    description: string;
    total_rounds: number;
    is_active: boolean;
    listening_rounds?: { count: number }[];
}

interface ListeningRound {
    id: string;
    book_id: string;
    round_number: number;
    title: string;
    answers: number[];
    question_count: number;
}

export default function AdminListeningPage() {
    const [books, setBooks] = useState<ListeningBook[]>([]);
    const [selectedBook, setSelectedBook] = useState<ListeningBook | null>(null);
    const [rounds, setRounds] = useState<ListeningRound[]>([]);
    const [loading, setLoading] = useState(true);

    // New Book Form
    const [showNewBook, setShowNewBook] = useState(false);
    const [newBookName, setNewBookName] = useState("");
    const [newBookDesc, setNewBookDesc] = useState("");
    const [submittingBook, setSubmittingBook] = useState(false);

    // New Round Form
    const [showNewRound, setShowNewRound] = useState(false);
    const [newRoundNumber, setNewRoundNumber] = useState(1);
    const [newRoundTitle, setNewRoundTitle] = useState("");
    const [newRoundAnswers, setNewRoundAnswers] = useState("");
    const [submittingRound, setSubmittingRound] = useState(false);

    useEffect(() => {
        loadBooks();
    }, []);

    async function loadBooks() {
        setLoading(true);
        const data = await getListeningBooks();
        setBooks(data);
        setLoading(false);
    }

    async function loadRounds(book: ListeningBook) {
        setSelectedBook(book);
        const data = await getListeningRounds(book.id);
        setRounds(data);
        // Set next round number
        setNewRoundNumber(data.length > 0 ? Math.max(...data.map(r => r.round_number)) + 1 : 1);
    }

    async function handleCreateBook() {
        if (!newBookName.trim()) {
            toast.error("교재명을 입력해주세요.");
            return;
        }

        setSubmittingBook(true);
        const result = await createListeningBook({
            name: newBookName,
            description: newBookDesc
        });

        if (result.success) {
            toast.success(result.message);
            setShowNewBook(false);
            setNewBookName("");
            setNewBookDesc("");
            loadBooks();
        } else {
            toast.error(result.message);
        }
        setSubmittingBook(false);
    }

    async function handleDeleteBook(bookId: string) {
        const result = await deleteListeningBook(bookId);
        if (result.success) {
            toast.success(result.message);
            if (selectedBook?.id === bookId) {
                setSelectedBook(null);
                setRounds([]);
            }
            loadBooks();
        } else {
            toast.error(result.message);
        }
    }

    async function handleDeleteRound(roundId: string) {
        if (!selectedBook) return;
        const result = await deleteListeningRound(roundId, selectedBook.id);
        if (result.success) {
            toast.success(result.message);
            loadRounds(selectedBook);
        } else {
            toast.error(result.message);
        }
    }

    async function handleCreateRound() {
        if (!selectedBook) return;

        // Parse answers (comma or space separated)
        const answersArray = newRoundAnswers
            .split(/[\s,]+/)
            .map(s => parseInt(s.trim()))
            .filter(n => !isNaN(n) && n >= 1 && n <= 5);

        if (answersArray.length !== 17) {
            toast.error(`정답은 17개여야 합니다. (1-17번, 현재 ${answersArray.length}개)`);
            return;
        }

        setSubmittingRound(true);
        const result = await createListeningRound({
            book_id: selectedBook.id,
            round_number: newRoundNumber,
            title: newRoundTitle || `${newRoundNumber}회`,
            answers: answersArray
        });

        if (result.success) {
            toast.success(result.message);
            setShowNewRound(false);
            setNewRoundAnswers("");
            setNewRoundTitle("");
            loadRounds(selectedBook);
        } else {
            toast.error(result.message);
        }
        setSubmittingRound(false);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">듣기 관리</h1>
                    <p className="text-slate-500">듣기 교재별 정답을 관리합니다.</p>
                </div>
                <Dialog open={showNewBook} onOpenChange={setShowNewBook}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            새 교재 추가
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>새 듣기 교재 추가</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>교재명 *</Label>
                                <Input
                                    placeholder="예: 2024 수능특강 영어듣기"
                                    value={newBookName}
                                    onChange={(e) => setNewBookName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>설명</Label>
                                <Textarea
                                    placeholder="교재 설명 (선택)"
                                    value={newBookDesc}
                                    onChange={(e) => setNewBookDesc(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowNewBook(false)}>취소</Button>
                            <Button onClick={handleCreateBook} disabled={submittingBook}>
                                {submittingBook ? <Loader2 className="w-4 h-4 animate-spin" /> : "추가"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Books List */}
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        교재 목록
                    </h2>
                    {books.length === 0 ? (
                        <Card className="p-8 text-center text-slate-400">
                            등록된 교재가 없습니다.
                        </Card>
                    ) : (
                        <div className="space-y-2">
                            {books.map((book) => (
                                <Card
                                    key={book.id}
                                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                                        selectedBook?.id === book.id
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-slate-200"
                                    }`}
                                    onClick={() => loadRounds(book)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-slate-900">{book.name}</h3>
                                            <p className="text-sm text-slate-500">
                                                {book.listening_rounds?.[0]?.count || 0}개 회차
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-slate-400 hover:text-red-500"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>교재 삭제</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            &quot;{book.name}&quot; 교재를 삭제하시겠습니까?
                                                            삭제 후에는 교재 목록에서 보이지 않습니다.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>취소</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            className="bg-red-600 hover:bg-red-700"
                                                            onClick={() => handleDeleteBook(book.id)}
                                                        >
                                                            삭제
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                            <ChevronRight className="w-5 h-5 text-slate-400" />
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Rounds List */}
                <div className="lg:col-span-2 space-y-4">
                    {selectedBook ? (
                        <>
                            <div className="flex justify-between items-center">
                                <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    {selectedBook.name} - 회차 목록
                                </h2>
                                <Dialog open={showNewRound} onOpenChange={setShowNewRound}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" variant="outline" className="gap-2">
                                            <Plus className="w-4 h-4" />
                                            회차 추가
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-lg">
                                        <DialogHeader>
                                            <DialogTitle>새 회차 추가</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>회차 번호 *</Label>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        value={newRoundNumber}
                                                        onChange={(e) => setNewRoundNumber(parseInt(e.target.value) || 1)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>제목 (선택)</Label>
                                                    <Input
                                                        placeholder={`${newRoundNumber}회`}
                                                        value={newRoundTitle}
                                                        onChange={(e) => setNewRoundTitle(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>정답 (17개) *</Label>
                                                <Textarea
                                                    placeholder="정답을 입력하세요 (콤마 또는 공백 구분)&#10;예: 3,1,2,5,4,1,2,3,4,5,5,4,3,2,1,2,3"
                                                    rows={3}
                                                    value={newRoundAnswers}
                                                    onChange={(e) => setNewRoundAnswers(e.target.value)}
                                                />
                                                <p className="text-xs text-slate-400">
                                                    현재 입력: {newRoundAnswers.split(/[\s,]+/).filter(s => s.trim() && !isNaN(parseInt(s))).length}개
                                                </p>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600">
                                                <p className="font-medium mb-1">문항 순서:</p>
                                                <p>1~17번 (총 17문항) - 듣기 문제만</p>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setShowNewRound(false)}>취소</Button>
                                            <Button onClick={handleCreateRound} disabled={submittingRound}>
                                                {submittingRound ? <Loader2 className="w-4 h-4 animate-spin" /> : "추가"}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {rounds.length === 0 ? (
                                <Card className="p-8 text-center text-slate-400">
                                    등록된 회차가 없습니다. 회차를 추가해주세요.
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {rounds.map((round) => (
                                        <Card key={round.id} className="p-4 border-slate-200">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                                        {round.round_number}회
                                                    </Badge>
                                                    <span className="font-medium text-slate-900">
                                                        {round.title}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Check className="w-4 h-4 text-green-500" />
                                                    <span className="text-sm text-slate-500">
                                                        {round.question_count}문항
                                                    </span>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-7 w-7 text-slate-400 hover:text-red-500"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>회차 삭제</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    {round.round_number}회 ({round.title})를 삭제하시겠습니까?
                                                                    이 회차의 정답 데이터가 삭제됩니다.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>취소</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    className="bg-red-600 hover:bg-red-700"
                                                                    onClick={() => handleDeleteRound(round.id)}
                                                                >
                                                                    삭제
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                            <div className="mt-2 text-xs text-slate-400 truncate">
                                                정답: {(round.answers as number[]).slice(0, 10).join(', ')}...
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <Card className="p-12 text-center text-slate-400">
                            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>왼쪽에서 교재를 선택하세요.</p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
