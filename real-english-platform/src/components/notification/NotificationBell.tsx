"use client";

import { useState, useEffect, useTransition } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getUnreadNotificationCount
} from "@/lib/actions/notification";
import { useRouter } from "next/navigation";

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    link: string | null;
    is_read: boolean;
    created_at: string;
    sender_name: string | null;
}

export default function NotificationBell() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isPending, startTransition] = useTransition();
    const [isLoading, setIsLoading] = useState(false);

    // 초기 로드: 안읽은 개수만 가져오기
    useEffect(() => {
        const loadUnreadCount = async () => {
            const count = await getUnreadNotificationCount();
            setUnreadCount(count);
        };
        loadUnreadCount();

        // 30초마다 폴링
        const interval = setInterval(loadUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    // Sheet 열릴 때 최신 알림 로드
    const handleOpenChange = async (isOpen: boolean) => {
        setOpen(isOpen);
        if (isOpen) {
            setIsLoading(true);
            const latest = await getNotifications(20);
            setNotifications(latest);
            setIsLoading(false);
        }
    };

    // 알림 클릭 시 읽음 처리 + 페이지 이동
    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.is_read) {
            startTransition(async () => {
                await markNotificationAsRead(notification.id);
                setUnreadCount(prev => Math.max(0, prev - 1));
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
                );
            });
        }

        if (notification.link) {
            setOpen(false);
            router.push(notification.link);
        }
    };

    // 모두 읽음 처리
    const handleMarkAllRead = async () => {
        startTransition(async () => {
            await markAllNotificationsAsRead();
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        });
    };

    // 알림 타입별 스타일
    const getTypeStyle = (type: string) => {
        switch (type) {
            case 'homework_submit':
                return { color: 'bg-green-500', label: '숙제' };
            case 'feedback':
                return { color: 'bg-blue-500', label: '피드백' };
            case 'payment_update':
                return { color: 'bg-orange-500', label: '수강권' };
            case 'class_assign':
                return { color: 'bg-indigo-500', label: '배정' };
            case 'announcement':
                return { color: 'bg-purple-500', label: '공지' };
            default:
                return { color: 'bg-slate-500', label: '알림' };
        }
    };

    // 상대 시간 포맷
    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return '방금 전';
        if (diffMins < 60) return `${diffMins}분 전`;
        if (diffHours < 24) return `${diffHours}시간 전`;
        if (diffDays === 1) return '어제';
        if (diffDays < 7) return `${diffDays}일 전`;
        return date.toLocaleDateString('ko-KR');
    };

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label="알림"
                >
                    <Bell className="w-5 h-5 text-slate-600" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 text-xs flex items-center justify-center"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[380px] sm:max-w-[400px] p-0">
                <SheetHeader className="border-b px-4 py-4">
                    <div className="flex items-center justify-between">
                        <SheetTitle>알림</SheetTitle>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleMarkAllRead}
                                disabled={isPending}
                                className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                                모두 읽음
                            </Button>
                        )}
                    </div>
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-80px)]">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                            <Bell className="w-12 h-12 mb-4 opacity-30" />
                            <p>새로운 알림이 없습니다</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => {
                                const typeStyle = getTypeStyle(notification.type);
                                return (
                                    <button
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={cn(
                                            "w-full text-left px-4 py-4 transition-colors",
                                            "hover:bg-slate-50 focus:outline-none focus:bg-slate-50",
                                            !notification.is_read && "bg-blue-50/50"
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* 타입 인디케이터 */}
                                            <div className={cn(
                                                "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                                                typeStyle.color
                                            )} />

                                            <div className="flex-1 min-w-0">
                                                {/* 타이틀 + 시간 */}
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className={cn(
                                                        "text-sm",
                                                        !notification.is_read && "font-semibold"
                                                    )}>
                                                        {notification.title}
                                                    </span>
                                                    <span className="text-xs text-slate-400 flex-shrink-0">
                                                        {formatTime(notification.created_at)}
                                                    </span>
                                                </div>

                                                {/* 메시지 */}
                                                <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>

                                                {/* 보낸 사람 */}
                                                {notification.sender_name && (
                                                    <span className="text-xs text-slate-400 mt-1 block">
                                                        {notification.sender_name}
                                                    </span>
                                                )}
                                            </div>

                                            {/* 안읽음 표시 */}
                                            {!notification.is_read && (
                                                <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-2" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
