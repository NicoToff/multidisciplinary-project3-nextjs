import { useEffect } from "react";

export function useMainTitle(title: string) {
    useEffect(() => {
        const mainTitleElement = document.getElementById("main-title");
        mainTitleElement!.innerText = title;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
