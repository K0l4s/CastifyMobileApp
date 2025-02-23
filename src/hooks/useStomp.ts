import { useEffect, useRef, useState } from 'react';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BaseApi } from '../utils/axiosInstance';

interface UseStompProps {
    subscribeUrl: string;
    trigger: any[];
    flag?: boolean;
    onDisconnect?: () => void;
    onConnect?: () => void;
    onStompError?: (frame: any) => void;
    onWebSocketError?: (error: any) => void;
    reconnectDelay?: number;
}

const useStomp = ({ subscribeUrl, trigger, flag = true, onConnect, onDisconnect, onStompError, onWebSocketError, reconnectDelay }: UseStompProps) => {
    const stompClientRef = useRef<Client | null>(null);
    const [object, setObject] = useState<any>(null);

    useEffect(() => {
        console.log("🔄 Khởi tạo WebSocket...");
        const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJrb2xhcyIsImlhdCI6MTc0MDA3Nzc3NSwiZXhwIjoxNzQwMTY0MTc1fQ.47LESZIw6Au_iO485-H4i5rFdVLFjWguYgf_BpQf1cI"
        
        // Ensure BaseApi ends with no trailing slash
        const wsUrl = `${BaseApi.replace(/\/$/, '')}/ws`;
        const socket = new SockJS(wsUrl);

        const stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: reconnectDelay || 5000,
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            debug: (str) => {
                console.log('STOMP Debug:', str);
            },
            onConnect: () => {
                console.log("✅ WebSocket connected successfully");

                try {
                    if (flag && stompClient.connected) {
                        stompClient.subscribe(subscribeUrl, (message) => {
                            try {
                                const newMessage: Message = JSON.parse(message.body);
                                setObject(newMessage);
                            } catch (error) {
                                console.error("Error parsing message:", error);
                            }
                        });
                    }
                    onConnect && onConnect();
                } catch (error) {
                    console.error("Error in onConnect handler:", error);
                }
            },
            onDisconnect: () => {
                console.log("❎ WebSocket disconnected");
                onDisconnect && onDisconnect();
            },
            onStompError: (frame) => {
                console.error("🚨 Broker reported error: " + frame.headers["message"]);
                console.error("📄 Additional details: " + frame.body);
                onStompError && onStompError(frame);
            },
            onWebSocketError: (error) => {
                console.error("🔌 WebSocket error:", error);
                onWebSocketError && onWebSocketError(error);
            },
        });

        try {
            stompClient.activate();
            stompClientRef.current = stompClient;
        } catch (error) {
            console.error("Error activating STOMP client:", error);
        }

        return () => {
            console.log("🔄 Cleaning up WebSocket...");
            if (stompClient.connected) {
                stompClient.deactivate();
            }
        };
    }, [...trigger]);

    return object;
};

export default useStomp;