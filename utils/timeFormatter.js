export const formatDuration = (str) => {
    if (!str) return '';
    let totalMins = 0;
    const cleanStr = String(str).trim();
    if (/^\d+$/.test(cleanStr)) {
        totalMins = parseInt(cleanStr, 10);
    } else {
        const hMatch = cleanStr.match(/(\d+(?:\.\d+)?)\s*(?:hora|h)/i);
        const mMatch = cleanStr.match(/(\d+)\s*(?:min|m)/i);
        if (hMatch || mMatch) {
            if (hMatch) {
                totalMins += parseFloat(hMatch[1]) * 60;
            }
            if (mMatch) {
                totalMins += parseInt(mMatch[1], 10);
            }
        } else {
            const numMatch = cleanStr.match(/(\d+)/);
            if (numMatch) {
                totalMins = parseInt(numMatch[1], 10);
            } else {
                return cleanStr;
            }
        }
    }
    totalMins = Math.round(totalMins);
    if (totalMins <= 0) return cleanStr;
    if (totalMins < 60) {
        return `${totalMins} min`;
    }
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    if (m === 0) {
        return `${h}h`;
    }
    return `${h}h ${m}min`;
};
