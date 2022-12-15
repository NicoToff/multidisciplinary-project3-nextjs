import React, { useState, useEffect } from "react";

type TimeProps = {
    setTime: (time: number) => void;
};

export function Time({ setTime }: TimeProps) {
    useEffect(() => {
        const interval = setInterval(() => {
            setTime(Date.now());
        }, 1000);
        return () => clearInterval(interval);
    }, [setTime]);

    return <></>;
}
