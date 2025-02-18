// import { useEffect, useRef, useState } from 'react';
// import { Client, Message } from '@stomp/stompjs';
// import SockJS from 'sockjs-client';
// import { getItem } from '@react-native-async-storage/async-storage';
// import { BaseApi } from '../utils/axiosInstance';

// interface UseStompProps {
//     subscribeUrl: string;
//     trigger: any[];
//     flag?: boolean;
//     onDisconnect?: () => void;
//     onConnect?: () => void;
//     onStompError?: (frame: any) => void;
//     onWebSocketError?: (error: any) => void;
//     reconnectDelay?: number;
// }

// const useStomp = ({ subscribeUrl, trigger, flag = true, onConnect, onDisconnect, onStompError, onWebSocketError, reconnectDelay }: UseStompProps) => {
//     const stompClientRef = useRef<Client | null>(null);
//     const [object, setObject] = useState<any>(null);

//     useEffect(() => {
//         const initializeWebSocket = async () => {
//             const token = await getItem('token');
//             const socket = new SockJS(BaseApi + "/ws");
//             const stompClient = new Client({
//                 webSocketFactory: () => socket,
//                 reconnectDelay: reconnectDelay ? reconnectDelay : 5000,
//                 connectHeaders: {
//                     Authorization: `Bearer ${token}`,
//                 },
//                 onConnect: () => {
//                     if (flag) {
//                         stompClient.subscribe(subscribeUrl, (message: any) => {
//                             const newMessage: Message = JSON.parse(message.body);
//                             setObject(newMessage);
//                         });
//                     }
//                     onConnect && onConnect();
//                 },
//                 onDisconnect: () => {
//                     console.log("❎ WebSocket disconnected");
//                     onDisconnect && onDisconnect();
//                 },
//                 onStompError: (frame: any) => {
//                     console.error("🚨 Broker reported error: " + frame.headers["message"]);
//                     console.error("📄 Additional details: " + frame.body);
//                     onStompError && onStompError(frame);
//                 },
//                 onWebSocketError: (error: any) => {
//                     console.error("🔌 WebSocket error:", error);
//                     onWebSocketError && onWebSocketError(error);
//                 },
//             });

//             stompClient.activate();
//             stompClientRef.current = stompClient;
//         };

//         initializeWebSocket();

//         return () => {
//             console.log("🔄 Cleaning up WebSocket...");
//             if (stompClientRef.current) {
//                 stompClientRef.current.deactivate();
//             }
//         };
//     }, [...trigger]);

//     return object;
// };

// export default useStomp;