export const determineShift = (date) => {
    const hours = date.getHours();
    // "if time after night 8 clock its night shift before 8 day shift"
    // Assuming 8 PM (20:00).
    if (hours >= 20 || hours < 8) {
        // If it's after 8 PM or before 8 AM, usually considered night shift range or just after 8PM?
        // Strict reading: "after night 8 clock its night shift before 8 day shift" -> "before 8" might mean 8 PM?
        // "After 8 PM is night shift"
        // "Before 8 PM is day shift" (assuming day starts in morning)
        // I'll stick to: >= 20:00 is Night, < 20:00 is Day.
        return 'Night Shift';
    }
    return 'Day Shift';
};

export const formatDate = (date) => {
    return date.toLocaleDateString();
};

export const formatTime = (date) => {
    return date.toLocaleTimeString();
};
