let timerDisplay;
let timerState = {
  running: false,
  startTime: null,
  elapsedTime: 0,
};

document.addEventListener("DOMContentLoaded", () => {
  insertData();
  const startButton = document.getElementById("startButton");
  const endButton = document.getElementById("endButton");
  timerDisplay = document.getElementById("timer");
  const clearButton = document.getElementById("clearData");
  endButton.addEventListener("click", endTracking);
  clearButton.addEventListener("click", clearData);
  startButton.addEventListener("click", startTracking);
});
let startTime;

function clearData() {
  chrome.runtime.sendMessage({ type: "clear" });
}

function startTracking() {
  startTime = Date.now();
  chrome.runtime.sendMessage({ type: "startTracking" });
  startButton.disabled = true;
  endButton.disabled = false;
}

function endTracking() {
  startButton.disabled = false;
  endButton.disabled = true;

  chrome.runtime.sendMessage({ type: "endTracking" });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("onMessage  message", message);
  if (message.type === "updateList") {
    timerDisplay.textContent = "00:00:00";
    insertData();
  } else if (message.type === "updateTimer") {
    console.log("elapsedTime", message, message?.elapsedTime);
    timerDisplay.textContent = formatDuration(message?.elapsedTime);
  }
});

const formatDuration = (milliseconds) => {
  let seconds = Math.round(milliseconds / 1000);
  let hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  let minutes = Math.floor(seconds / 60);
  seconds %= 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
};

const insertData = () => {
  chrome.storage.local.get("data", ({ data }) => {
    const groupedData = groupByDate(data);
    let html = "";
    groupedData?.forEach((group) => {
      html += `
        <tr>
          <td>${group.date}</td>
          <td>${formatDuration(calculateTotalDuration(group.timestamps))}</td>
          <td>
            <table>
              <thead>
                <tr>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                ${group.timestamps
                  .map(
                    (timestamp) => `
                  <tr>
                    <td>${new Date(
                      timestamp.startTime
                    ).toLocaleTimeString()}</td>
                    <td>${new Date(timestamp.endTime).toLocaleTimeString()}</td>
                    <td>${formatDuration(timestamp.duration)}</td>
                  </tr>`
                  )
                  .join("")}
              </tbody>
            </table>
          </td>
        </tr>`;
    });
    dataBody.innerHTML = html;
  });
};

const groupByDate = (data) => {
  const groupedData = {};
  data?.forEach((entry) => {
    if (!groupedData[entry.date]) {
      groupedData[entry.date] = [];
    }
    groupedData[entry.date].push(entry);
  });
  const result = [];
  for (const date in groupedData) {
    if (Object.hasOwnProperty.call(groupedData, date)) {
      result.push({ date, timestamps: groupedData[date] });
    }
  }
  return result;
};

const calculateTotalDuration = (timestamps) => {
  return timestamps.reduce((total, timestamp) => total + timestamp.duration, 0);
};
