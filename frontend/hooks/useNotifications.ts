// useNotifications Hook - Real-time notifications via Socket.IO

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/lib/auth-store';
import { authService } from '@/lib/authService';

export interface Notification {
    id: number;
    type: 'stock_alert' | 'new_order' | 'system';
    title: string;
    description?: string;
    data?: any;
    read: boolean;
    created_at: string;
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated, user } = useAuthStore();
    const token = authService.getToken();

    // Fetch initial notifications from API
    const fetchNotifications = useCallback(async () => {
        if (!token) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/notifications`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const result = await response.json();
                setNotifications(result.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Initialize Socket.IO connection
    useEffect(() => {
        // Only connect if user is authenticated admin
        if (!isAuthenticated || !token || user?.role?.toLowerCase() !== 'admin') {
            setLoading(false);
            return;
        }

        // Create Socket.IO connection
        // ⚠️ IMPORTANT: Socket.IO connects to BASE URL, not /api/v1
        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace('/api/v1', '');
        const newSocket = io(baseUrl, {
            auth: {
                token,
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        });

        newSocket.on('connect', () => {
            console.log('✅ Socket.IO connected');
            setConnected(true);
            fetchNotifications(); // Load existing notifications on connect
        });

        newSocket.on('notification', (notification: Notification) => {
            console.log('📬 New notification received:', notification);
            setNotifications((prev) => [notification, ...prev]);

            // Optional: Show browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(notification.title, {
                    body: notification.description,
                    icon: '/favicon.ico',
                });
            }
        });

        newSocket.on('disconnect', (reason) => {
            console.log('⚠️  Socket.IO disconnected:', reason);
            setConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('❌ Socket.IO connection error:', error.message);
            setConnected(false);
        });

        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            console.log('🔌 Closing Socket.IO connection');
            newSocket.close();
        };
    }, [isAuthenticated, token, user?.role, fetchNotifications]);

    // Mark notification as read
    const markAsRead = useCallback(async (id: number) => {
        if (!token) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/notifications/${id}/read`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                setNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, read: true } : n))
                );
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    }, [token]);

    // Mark all as read
    const markAllAsRead = useCallback(async () => {
        if (!token) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/notifications/mark-all-read`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            }
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    }, [token]);

    // Clear all notifications
    const clearAll = useCallback(async () => {
        if (!token) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/notifications`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                setNotifications([]);
            }
        } catch (error) {
            console.error('Failed to clear notifications:', error);
        }
    }, [token]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    return {
        notifications,
        connected,
        loading,
        markAsRead,
        markAllAsRead,
        clearAll,
        unreadCount,
    };
}
