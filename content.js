chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "GET_SELECTION") {
    const text = window.getSelection().toString();
    sendResponse({ text });
  }
});
~