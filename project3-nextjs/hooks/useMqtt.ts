import { useEffect, useRef } from "react";
import { connect, type IClientOptions, type MqttClient, type ISubscriptionGrant } from "mqtt";

type UseMqttArgs = {
    brokerUrl: string;
    connectOptions?: IClientOptions;
    subscribeTo?: string | string[];
    callbacks: UseMqttCallbacks;
};

type UseMqttCallbacks = {
    onComponentMount?: () => void;
    onConnect?: () => void;
    onReconnect?: () => void;
    onError?: () => void;
    onMessage?: (topic: string, message: Buffer) => void;
    onSubscribe?: (err: Error, granted: ISubscriptionGrant[]) => void;
};

export function useMqtt({ brokerUrl, connectOptions, subscribeTo, callbacks }: UseMqttArgs) {
    const client = useRef<MqttClient>();
    const { onComponentMount, onConnect, onError, onReconnect } = callbacks;
    useEffect(() => {
        onComponentMount && onComponentMount();
        client.current = connect(brokerUrl, connectOptions);
        client.current.on("connect", () => {
            console.log("Connected to broker");
            onConnect && onConnect();
        });
        client.current.on("error", () => {
            console.log("Error connecting to broker");
            onError && onError();
        });
        client.current.on("reconnect", () => {
            console.log("Reconnecting to broker");
            onReconnect && onReconnect();
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { onMessage, onSubscribe } = callbacks;

    useEffect(() => {
        if (!client.current) return;
        if (subscribeTo) {
            client.current.subscribe(subscribeTo, onSubscribe);
        }
        if (onMessage) {
            client.current.on("message", onMessage);
        }
        return () => {
            if (subscribeTo) {
                client.current?.unsubscribe(subscribeTo);
                client.current?.removeAllListeners();
            }
        };
    }, [onMessage, onSubscribe, subscribeTo]);

    return client.current;
}
