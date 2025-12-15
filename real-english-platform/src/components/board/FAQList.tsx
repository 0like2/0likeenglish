"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
    {
        question: "내신 기간에는 수업이 어떻게 진행되나요?",
        answer: "내신 기간 4주 전부터는 학교별 시험 범위에 맞춘 ‘내신 집중 대비’ 체제로 전환됩니다. 교과서 본문 암기, 부교재 변형 문제 풀이, 서술형 대비 특강이 포함됩니다.",
    },
    {
        question: "수업료 결제는 어떤 방식인가요?",
        answer: "수강료는 4회(또는 8회) 기준으로 선납해주시면 됩니다. 입금 후 선생님이 확인하면 대시보드에서 수강권 횟수가 충전됩니다.",
    },
    {
        question: "숙제를 제때 못하면 어떻게 되나요?",
        answer: "숙제는 수업 전날 자정까지 업로드해야 합니다. 미제출 시 보충 학습이 추가될 수 있으며, 학부모님께 알림이 갈 수 있습니다. (성실함이 성적 향상의 지름길입니다!)",
    },
    {
        question: "보강 규정이 궁금합니다.",
        answer: "개인 사정으로 인한 결석은 수업 하루 전까지 말씀해주셔야 보강 일정을 잡을 수 있습니다. 당일 취소 시에는 횟수가 차감될 수 있으니 유의해주세요.",
    },
];

export default function FAQList() {
    return (
        <Accordion type="single" collapsible className="w-full">
            {FAQS.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-medium text-slate-800 hover:text-blue-600">
                        Q. {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg">
                        A. {faq.answer}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
