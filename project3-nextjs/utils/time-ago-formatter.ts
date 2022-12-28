const fallbackFormatter = new Intl.RelativeTimeFormat("en-UK", {
    numeric: "auto",
});

const DIVISIONS: { amount: number; name: Intl.RelativeTimeFormatUnit }[] = [
    { amount: 60, name: "seconds" },
    { amount: 60, name: "minutes" },
    { amount: 24, name: "hours" },
    { amount: 7, name: "days" },
    { amount: 4.34524, name: "weeks" },
    { amount: 12, name: "months" },
    { amount: Number.POSITIVE_INFINITY, name: "years" },
];

const capitalizeFirst = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);

export function formatTimeAgo(date: Date | number, formatter: Intl.RelativeTimeFormat = fallbackFormatter) {
    let duration = (new Date(date).getTime() - Date.now()) / 1000;

    for (let i = 0; i <= DIVISIONS.length; i++) {
        const division = DIVISIONS[i];
        if (Math.abs(duration) < division.amount) {
            return capitalizeFirst(formatter.format(Math.round(duration), division.name));
        }
        duration /= division.amount;
    }

    return "Unknow time ago";
}
