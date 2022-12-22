import { useEffect, useRef } from "react";
import { connect, type IClientOptions, type MqttClient } from "mqtt";

type UseMqttCallbacks = {
    onComponentMount?: () => void;
    onConnect?: () => void;
    onError?: () => void;
};

export function useMqtt({
    brokerUrl,
    connectOptions,
    callbacks,
}: {
    brokerUrl: string;
    connectOptions?: IClientOptions;
    callbacks: UseMqttCallbacks;
}) {
    const client = useRef<MqttClient>();
    const { onComponentMount, onConnect, onError } = callbacks;
    useEffect(() => {
        client.current = connect(brokerUrl, connectOptions);
        client.current.on("connect", () => {
            console.log("Connected to broker");
            onConnect && onConnect();
        });
        client.current.on("error", () => {
            console.log("Error connecting to broker");
            onError && onError();
        });
        onComponentMount && onComponentMount();
    }, []);

    return client.current;
}
