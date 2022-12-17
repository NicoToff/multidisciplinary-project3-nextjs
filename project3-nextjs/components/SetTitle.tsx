import { useEffect } from "react";

export function SetTitle({ mainTitle }: { mainTitle: string }) {
    useEffect(() => {
        const mainTitleElement = document.getElementById("main-title");
        mainTitleElement!.innerText = mainTitle;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}
