"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";

interface HomeworkItem {
    id: string;
    title: string;
    completed: boolean;
    evaluation?: string; // "perfect", "average", "incomplete"
}

interface HomeworkChecklistProps {
    items: HomeworkItem[];
}

export default function HomeworkChecklist({ items: initialItems }: HomeworkChecklistProps) {
    const [items, setItems] = useState(initialItems);

    const toggleComplete = (id: string) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
        ));
    };

    return (
        <Card className="shadow-md border-slate-100 h-full">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-xl font-bold text-slate-800">✅ 숙제 체크리스트</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                {items.length === 0 ? (
                    <p className="text-slate-500 text-center py-4">등록된 숙제가 없습니다.</p>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="space-y-3 pb-4 last:pb-0 border-b last:border-0 border-slate-100">
                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id={item.id}
                                    checked={item.completed}
                                    onCheckedChange={() => toggleComplete(item.id)}
                                    className="mt-1"
                                />
                                <div className="grid gap-1.5 leading-none w-full">
                                    <Label
                                        htmlFor={item.id}
                                        className={`text-base font-medium cursor-pointer ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}
                                    >
                                        {item.title}
                                    </Label>

                                    {item.completed && (
                                        <div className="pt-2 animate-in slide-in-from-top-2 fade-in">
                                            <p className="text-xs text-slate-500 mb-2">자가 진단:</p>
                                            <RadioGroup defaultValue="average" className="flex gap-4">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="perfect" id={`r1-${item.id}`} className="text-green-600 border-green-600 focus:ring-green-600" />
                                                    <Label htmlFor={`r1-${item.id}`} className="text-sm font-normal">완벽</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="average" id={`r2-${item.id}`} className="text-blue-600 border-blue-600" />
                                                    <Label htmlFor={`r2-${item.id}`} className="text-sm font-normal">보통</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="poor" id={`r3-${item.id}`} className="text-slate-400 border-slate-400" />
                                                    <Label htmlFor={`r3-${item.id}`} className="text-sm font-normal">미흡</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
