module.exports = async () => {
    const episodes = await require('./episodes')();

    // Find first page break
    const lastEpNum = episodes[0].ep_num;
    let pageBreak = lastEpNum - (lastEpNum % 10);
    if (lastEpNum - pageBreak < 5) pageBreak -= 10;

    // Break episodes into pages at page breaks
    const pages = [];
    while (episodes.length) {
        const breakIdx = episodes.findIndex((ep) => ep.ep_num <= pageBreak);
        if (breakIdx !== -1) {
            pages.push(episodes.splice(0, breakIdx + 1));
            pageBreak -= 10;
        } else {
            pages.push(episodes.splice(0, episodes.length));
        }
    }

    return pages;
};
