import type { IClientOptions } from "mqtt";

const mqttDomain = process.env.NEXT_PUBLIC_MICHAUX_MQTT;
export const brokerUrl = `ws://${mqttDomain}`;
export const connectOptions: IClientOptions = {
    username: process.env.NEXT_PUBLIC_MICHAUX_MQTT_USERNAME,
    password: process.env.NEXT_PUBLIC_MICHAUX_MQTT_PASSWORD,
    port: Number(process.env.NEXT_PUBLIC_MICHAUX_MQTT_PORT),
    keepalive: 60,
};
export const RECEIVE_EPC_TOPIC = process.env.NEXT_PUBLIC_MICHAUX_MQTT_RECEIVE_EPC_TOPIC as string;
export const ALIVE_TOPIC = process.env.NEXT_PUBLIC_MICHAUX_MQTT_ALIVE_TOPIC as string;
