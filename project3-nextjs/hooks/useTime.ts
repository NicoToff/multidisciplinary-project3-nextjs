import { useState, useEffect } from "react";

type UseTimeProps = { delay?: number; action?: () => void };

/**
 * Every second, returns the current time in milliseconds.
 *
 * Also, if an action is provided, it will be executed every second.
 * The delay can also be adjusted (in milliseconds).
 * @param delay (Optional prop) Delay in milliseconds. Default is 1000.
 * @param action (Optional prop) Action to be executed every second. Default is undefined (no action).
 * @returns The current time in milliseconds.
 */
export function useTime({ delay = 1000, action }: UseTimeProps = {}) {
    const [time, setTime] = useState(Date.now());
    useEffect(() => {
        const interval = setInterval(() => {
            setTime(Date.now());
            action && action();
        }, delay);
        return () => clearInterval(interval);
    }, [delay, action]);
    return time;
}
