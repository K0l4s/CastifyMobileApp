import { useEffect, useRef, useState } from 'react';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BaseApi } from '../utils/axiosInstance';
import { TextEncoder, TextDecoder } from 'text-encoding';
import { WebSensor } from 'react-native-reanimated/lib/typescript/js-reanimated/WebSensor';

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

interface UseStompProps {
    subscribeUrl: string;
    trigger:any[];
    flag?:boolean;
    onDisconnect?: () => void;
    onConnect?: () => void;
    onStompError?: (frame: any) => void;
    onWebSocketError?: (error: any) => void;
    reconnectDelay?: number;
}
const useStomp = ({ subscribeUrl,trigger,flag=true,onConnect,onDisconnect,onStompError,onWebSocketError,reconnectDelay }: UseStompProps) => {
    // const [client, setClient] = useState<Client | null>(null);
    const stompClientRef = useRef<Client | null>(null);
    const [object, setObject] = useState<any>(null);
    useEffect(() => {
        console.log("🔄 Khởi tạo WebSocket...");

        const socket = new SockJS("http://10.0.2.2:9090/ws");
        socket.onopen = () => {
            console.log("✅ WebSocket connection opened");
        }
        socket.onclose = () => {
            console.log("❎ WebSocket connection closed");
        }
        socket.onerror = (error) => {
            console.error("🔌 WebSocket error:", error);
        }
        socket.onmessage = (event) => {
            console.log("📥 WebSocket message received:", event.data);
            const newMessage: Message = JSON.parse(event.data);
            setObject(newMessage);
        }
        const stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: reconnectDelay? reconnectDelay : 5000,
            connectHeaders: {
                Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJrb2xhcyIsImlhdCI6MTc0MjY1NDAyNSwiZXhwIjoxNzQyNzQwNDI1fQ.qdjSRUuRuqjDRvhPAN-uczACq7bgiwRHVcrGIX3SBkw`,
            },
            onConnect: () => {
                console.log("✅ WebSocket connected successfully");

                // 📥 Nhận tin nhắn trong nhóm hiện tại
                if (flag) {
                    stompClient.subscribe(subscribeUrl, (message) => {
                        const newMessage: Message = JSON.parse(message.body);
                        setObject(newMessage);
                        // setMessages((prev) => [...prev, newMessage]);
                        // scroll to the bottom
                    });
                }
                onConnect && onConnect();
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

        stompClient.activate();
        stompClientRef.current = stompClient;

        return () => {
            console.log("🔄 Cleaning up WebSocket...");
            stompClient.deactivate();
        };
    }, [...trigger]);

    return object;
};

export default useStomp;