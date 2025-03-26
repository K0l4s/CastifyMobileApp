import { useEffect, useRef, useState } from 'react';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BaseApi } from '../utils/axiosInstance';
import { TextEncoder, TextDecoder } from 'text-encoding';
import * as Keychain from 'react-native-keychain';

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

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

const useStomp = ({
  subscribeUrl,
  trigger,
  flag = true,
  onConnect,
  onDisconnect,
  onStompError,
  onWebSocketError,
  reconnectDelay,
}: UseStompProps) => {
  const stompClientRef = useRef<Client | null>(null);
  const [object, setObject] = useState<any>(null);

  useEffect(() => {
    console.log('🔄 Khởi tạo WebSocket...');

    const initializeStomp = async () => {
      let token = '';
      try {
        const credentials = await Keychain.getGenericPassword();
        if (credentials) {
          const tokenData = JSON.parse(credentials.password);
          token = tokenData.access_token;
        } else {
          console.warn('⚠️ Không tìm thấy token trong Keychain');
        }
      } catch (error) {
        console.error('❌ Lỗi khi lấy token từ Keychain:', error);
      }

      const socket = new SockJS(BaseApi + '/ws');
      socket.onopen = () => {
        console.log('✅ WebSocket connection opened');
      };
      socket.onclose = () => {
        console.log('❎ WebSocket connection closed');
      };
      socket.onerror = (error) => {
        console.error('🔌 WebSocket error:', error);
      };
      socket.onmessage = (event) => {
        console.log('📥 WebSocket message received:', event.data);
        const newMessage: Message = JSON.parse(event.data);
        setObject(newMessage);
      };

      const stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: reconnectDelay ? reconnectDelay : 5000,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        onConnect: () => {
          console.log('✅ WebSocket connected successfully');

          if (flag) {
            stompClient.subscribe(subscribeUrl, (message) => {
              const newMessage: Message = JSON.parse(message.body);
              setObject(newMessage);
            });
          }
          onConnect && onConnect();
        },
        onDisconnect: () => {
          console.log('❎ WebSocket disconnected');
          onDisconnect && onDisconnect();
        },
        onStompError: (frame) => {
          console.error('🚨 Broker reported error: ' + frame.headers['message']);
          console.error('📄 Additional details: ' + frame.body);
          onStompError && onStompError(frame);
        },
        onWebSocketError: (error) => {
          console.error('🔌 WebSocket error:', error);
          onWebSocketError && onWebSocketError(error);
        },
      });

      stompClient.activate();
      stompClientRef.current = stompClient;

      return () => {
        console.log('🔄 Cleaning up WebSocket...');
        stompClient.deactivate();
      };
    };

    initializeStomp();

    return () => {
      stompClientRef.current?.deactivate();
    };
  }, [...trigger]);

  return object;
};

export default useStomp;
