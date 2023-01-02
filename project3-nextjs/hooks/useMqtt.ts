import { useEffect, useRef } from "react";
import { connect, type IClientOptions, type MqttClient, type ISubscriptionGrant } from "mqtt";

type UseMqttArgs = {
    brokerUrl: string;
    connectOptions?: IClientOptions;
    subscribeTo?: string | string[];
    callbacks?: UseMqttCallbacks;
};

type UseMqttCallbacks = {
    onComponentMount?: () => void;
    onConnect?: () => void;
    onReconnect?: () => void;
    onDisconnect?: () => void;
    onError?: () => void;
    onMessage?: (topic: string, message: Buffer) => void;
    onSubscribe?: (err: Error, granted: ISubscriptionGrant[]) => void;
};

export function useMqtt({ brokerUrl, connectOptions, subscribeTo, callbacks = {} }: UseMqttArgs) {
    const client = useRef<MqttClient>();
    const { onComponentMount, onConnect, onError, onReconnect, onDisconnect } = callbacks;
    useEffect(() => {
        onComponentMount && onComponentMount();
        client.current = connect(brokerUrl, connectOptions);
        onConnect && client.current.on("connect", onConnect);
        onError && client.current.on("error", onError);
        onReconnect && client.current.on("reconnect", onReconnect);
        onDisconnect && client.current.on("disconnect", onDisconnect);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { onMessage, onSubscribe } = callbacks;

    useEffect(() => {
        if (!client.current) return;
        onMessage && client.current.on("message", onMessage);
        subscribeTo && client.current.subscribe(subscribeTo, onSubscribe);
        return () => {
            if (subscribeTo) {
                client.current?.unsubscribe(subscribeTo);
                client.current?.removeAllListeners("message");
            }
        };
    }, [onMessage, onSubscribe, subscribeTo]);
}
