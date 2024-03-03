document.addEventListener("DOMContentLoaded", function () {
  const startButton = document.createElement("button");
  startButton.innerText = "Start Tracking";
  startButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "startTracking" });
  });
  document.body.appendChild(startButton);

  const endButton = document.createElement("button");
  endButton.innerText = "End Tracking";
  endButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "endTracking" });
  });
  document.body.appendChild(endButton);
});
