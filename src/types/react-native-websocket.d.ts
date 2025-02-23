declare module "react-native-websocket" {
    export default class WebSocket {
        constructor(url: string, protocols?: string | string[], options?: any);
        onopen?: (event: any) => void;
        onmessage?: (event: { data: string }) => void;
        onerror?: (event: any) => void;
        onclose?: (event: any) => void;
        send(data: string): void;
        close(code?: number, reason?: string): void;
    }
}
