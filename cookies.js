// based on: https://stackoverflow.com/a/50099635/305019
chrome.tabs.executeScript({
  code: 'performance.getEntriesByType("resource").map(e => e.name).concat(performance.getEntriesByType("navigation").map(e => e.name))',
}, data => {
  if (chrome.runtime.lastError || !data || !data[0]) return;
  const urls = data[0].map(url => url.split(/[#?]/)[0]);
  const uniqueUrls = [...new Set(urls).values()].filter(Boolean);
  Promise.all(
    uniqueUrls.map(url =>
      new Promise(resolve => {
        chrome.cookies.getAll({url}, resolve);
      })
    )
  ).then(results => {
    // convert the array of arrays into a deduplicated flat array of cookies
    const cookies = [
      ...new Map(
        [].concat(...results)
          .map(c => [JSON.stringify(c), c])
      ).values()
    ];

    // do something with the cookies here
    console.log(uniqueUrls, cookies);

    // download the cookies to a cookies.json file
    var blob = new Blob([JSON.stringify(cookies, null, 1)], {type: "application/json"});
    var url = URL.createObjectURL(blob);
    chrome.downloads.download({url, filename: "cookies.json"});
 });
});
