chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ data: [] });
});
let timerInterval;
let startTime;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "startTracking") {
    startTracking();
  } else if (message.type === "endTracking") {
    endTracking();
  } else if (message.type === "clear") {
    clearData();
  }
});

const startTracking = () => {
  chrome.storage.local.get("data", ({ data }) => {
    startTime = Date.now();

    const newData = {
      date: new Date().toLocaleDateString(),
      duration: null,
      startTime: new Date().toISOString(),
      endTime: null,
    };
    const updatedData = data ? [...data, newData] : [newData];
    chrome.storage.local.set({ data: updatedData });
    timerInterval = setInterval(updateTimer, 1000);
  });
};

const endTracking = () => {
  chrome.storage.local.get("data", ({ data }) => {
    const currentDateData = data.find(
      (entry) =>
        entry.date === new Date().toLocaleDateString() && entry.endTime === null
    );
    if (currentDateData) {
      currentDateData.endTime = new Date().toISOString();
      const durationMilliseconds =
        new Date(currentDateData.endTime) - new Date(currentDateData.startTime);
      currentDateData.duration = durationMilliseconds;
      chrome.storage.local.set({ data });
      clearInterval(timerInterval);

      chrome.runtime.sendMessage({ type: "updateList" });
    }
  });
};

const clearData = () => {
  chrome.storage.local.remove("data", () => {
    console.log("Data cleared successfully");
  });
  chrome.runtime.sendMessage({ type: "updateList" });
};

function updateTimer() {
  console.log("elapsedTime startTime", startTime);
  const elapsedTime = Date.now() - startTime;
  console.log("send uodate", elapsedTime);
  sendMessageToPopup({ type: "updateTimer", elapsedTime: elapsedTime });
}

function sendMessageToPopup(message) {
  chrome.runtime.sendMessage(message, (response) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
    }
  });
}
