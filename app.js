// JavaScript for FPstats App

document.addEventListener("DOMContentLoaded", function() {
  const pitch = document.getElementById("pitch");
  const undoButton = document.getElementById("undoButton");
  const clearButton = document.getElementById("clearButton");
  const filterCheckboxes = document.querySelectorAll(".filter-checkbox");
  const fullGameButton = document.getElementById("fullGameButton");
  const firstHalfButton = document.getElementById("firstHalfButton");
  const secondHalfButton = document.getElementById("secondHalfButton");

  let eventHistory = [];
  let currentHalf = "full-game";
  let drawingLine = false;
  let startPos = null;

  const events = [
    { name: 'Ball Won', color: 'blue' },
    { name: 'Ball Lost', color: 'red' },
    { name: 'Chance', color: 'orange' }, // Updated color here
    { name: 'Goal', color: 'green' }
  ];

  events.forEach(event => {
    const button = document.querySelector(`.event-button.${event.color}`);
    button.addEventListener("click", function() {
      pitch.addEventListener("mousedown", function(eventClick) {
        drawingLine = true;
        startPos = { x: eventClick.offsetX, y: eventClick.offsetY };
      }, { once: true });

      pitch.addEventListener("mouseup", function(eventClick) {
        if (drawingLine) {
          drawingLine = false;
          const endPos = { x: eventClick.offsetX, y: eventClick.offsetY };

          const dot = document.createElement("div");
          dot.classList.add("event-dot", event.color, currentHalf !== "full-game" ? currentHalf : "first-half");
          dot.style.backgroundColor = event.color;
          dot.style.width = "10px";
          dot.style.height = "10px";
          dot.style.borderRadius = "50%";
          dot.style.transform = "translate(-50%, -50%)";
          dot.style.position = "absolute";
          dot.style.top = `${endPos.y}px`;
          dot.style.left = `${endPos.x}px`;

          const passLine = document.createElement("div");
          passLine.classList.add("pass-line", currentHalf !== "full-game" ? currentHalf : "first-half");
          passLine.style.top = `${startPos.y}px`;
          passLine.style.left = `${startPos.x}px`;
          const dx = endPos.x - startPos.x;
          const dy = endPos.y - startPos.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * 180 / Math.PI;

          passLine.style.width = `${length}px`;
          passLine.style.transform = `rotate(${angle}deg)`;

          pitch.appendChild(passLine);
          pitch.appendChild(dot);
          eventHistory.push({ dot, passLine });
        }
      }, { once: true });
    });
  });

  undoButton.addEventListener("click", function() {
    const lastEvent = eventHistory.pop();
    if (lastEvent) {
      pitch.removeChild(lastEvent.dot);
      pitch.removeChild(lastEvent.passLine);
    }
  });

  clearButton.addEventListener("click", function() {
    eventHistory.forEach(event => {
      pitch.removeChild(event.dot);
      pitch.removeChild(event.passLine);
    });
    eventHistory = [];
  });

  fullGameButton.addEventListener("click", function() {
    currentHalf = "full-game";
    fullGameButton.style.backgroundColor = "#aaaaaa";
    firstHalfButton.style.backgroundColor = "#dddddd";
    secondHalfButton.style.backgroundColor = "#dddddd";
    applyFilters();
  });

  firstHalfButton.addEventListener("click", function() {
    currentHalf = "first-half";
    fullGameButton.style.backgroundColor = "#dddddd";
    firstHalfButton.style.backgroundColor = "#aaaaaa";
    secondHalfButton.style.backgroundColor = "#dddddd";
    applyFilters();
  });

  secondHalfButton.addEventListener("click", function() {
    currentHalf = "second-half";
    fullGameButton.style.backgroundColor = "#dddddd";
    firstHalfButton.style.backgroundColor = "#dddddd";
    secondHalfButton.style.backgroundColor = "#aaaaaa";
    applyFilters();
  });

  filterCheckboxes.forEach(checkbox => {
    checkbox.addEventListener("change", function() {
      applyFilters();
    });
  });

  function applyFilters() {
    const filters = Array.from(filterCheckboxes)
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.getAttribute("data-filter"));

    const dots = document.querySelectorAll(".event-dot");
    const lines = document.querySelectorAll(".pass-line");

    dots.forEach(dot => {
      const dotClasses = dot.classList;
      const matchesFilters = filters.every(filter => dotClasses.contains(filter)) || filters.length === 0;
      const matchesHalf = currentHalf === "full-game" || dotClasses.contains(currentHalf);

      if (matchesFilters && matchesHalf) {
        dot.style.display = "block";
      } else {
        dot.style.display = "none";
      }
    });

    lines.forEach(line => {
      const lineClasses = line.classList;
      const matchesFilters = filters.every(filter => lineClasses.contains(filter)) || filters.length === 0;
      const matchesHalf = currentHalf === "full-game" || lineClasses.contains(currentHalf);

      if (matchesFilters && matchesHalf) {
        line.style.display = "block";
      } else {
        line.style.display = "none";
      }
    });
  }
});


