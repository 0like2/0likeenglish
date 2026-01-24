"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronRight, Headphones, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { getListeningBooks, getListeningRounds, getMyListeningHistory } from "@/lib/actions/listening";

interface ListeningBook {
    id: string;
    name: string;
    description: string;
    listening_rounds?: { count: number }[];
}

interface ListeningRound {
    id: string;
    round_number: number;
    title: string;
}

interface Submission {
    round_id: string;
    score: number;
}

export default function ListeningPage() {
    const [books, setBooks] = useState<ListeningBook[]>([]);
    const [selectedBook, setSelectedBook] = useState<ListeningBook | null>(null);
    const [rounds, setRounds] = useState<ListeningRound[]>([]);
    const [history, setHistory] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const [booksData, historyData] = await Promise.all([
            getListeningBooks(),
            getMyListeningHistory()
        ]);
        setBooks(booksData);
        setHistory(historyData);
        setLoading(false);
    }

    async function loadRounds(book: ListeningBook) {
        setSelectedBook(book);
        const data = await getListeningRounds(book.id);
        setRounds(data);
    }

    function getSubmission(roundId: string) {
        return history.find(h => h.round_id === roundId);
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 pb-20">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-4">
                        <Headphones className="w-8 h-8 text-purple-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">듣기 평가</h1>
                    <p className="text-slate-500">교재를 선택하고 회차별 듣기 문제를 풀어보세요.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Books */}
                    <div className="space-y-4">
                        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                            <BookOpen className="w-5 h-5" />
                            교재 선택
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
                                                ? "border-purple-500 bg-purple-50"
                                                : "border-slate-200 hover:border-purple-200"
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
                                            <ChevronRight className="w-5 h-5 text-slate-400" />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Rounds */}
                    <div className="lg:col-span-2 space-y-4">
                        {selectedBook ? (
                            <>
                                <h2 className="font-semibold text-slate-700">
                                    {selectedBook.name} - 회차 목록
                                </h2>
                                {rounds.length === 0 ? (
                                    <Card className="p-8 text-center text-slate-400">
                                        등록된 회차가 없습니다.
                                    </Card>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {rounds.map((round) => {
                                            const submission = getSubmission(round.id);
                                            return (
                                                <Link key={round.id} href={`/listening/${round.id}`}>
                                                    <Card className={`p-4 h-full cursor-pointer transition-all hover:shadow-md hover:border-purple-300 ${
                                                        submission ? "bg-green-50 border-green-200" : "border-slate-200"
                                                    }`}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <Badge variant="outline" className={
                                                                submission ? "bg-green-100 text-green-700" : "bg-purple-50 text-purple-700"
                                                            }>
                                                                {round.round_number}회
                                                            </Badge>
                                                            {submission && (
                                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                            )}
                                                        </div>
                                                        <p className="text-sm font-medium text-slate-900">{round.title}</p>
                                                        {submission && (
                                                            <p className="text-xs text-green-600 mt-1">
                                                                최근 점수: {submission.score}점
                                                            </p>
                                                        )}
                                                    </Card>
                                                </Link>
                                            );
                                        })}
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
        </div>
    );
}
