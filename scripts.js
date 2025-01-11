let selectedEvent = null;
let eventList = JSON.parse(localStorage.getItem('eventList')) || [];
let currentHalf = 1;
let timerInterval = null;
let elapsedTime = 0;

function selectEvent(eventType) {
  selectedEvent = eventType;
  console.log(`Selected event: ${eventType}`);
}

function addEvent(event) {
  console.log('Pitch clicked');
  if (!selectedEvent) {
    alert('Please select an event type first.');
    return;
  }

  const pitch = document.getElementById('pitchImage');
  const rect = pitch.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  console.log(`Click coordinates: (${x}, ${y})`);

  if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
    console.log('Click out of bounds, no dot added.');
    return;
  }

  const formattedTime = formatTime(elapsedTime);
  const zone = calculateZone(x, y, rect.width, rect.height);
  const timestamp = new Date().toISOString();

  const eventData = {
    eventType: selectedEvent,
    time: formattedTime,
    half: currentHalf,
    zone: zone,
    coordinates: { x: x, y: y },
    timestamp: timestamp
  };

  eventList.push(eventData);
  console.log('Event added:', eventData);
  renderDot(eventData);
  addToTable(eventData);

  localStorage.setItem('eventList', JSON.stringify(eventList));
}

function renderDot(eventData) {
  const dot = document.createElement('div');
  dot.className = 'event-dot';
  dot.style.backgroundColor = getEventColor(eventData.eventType);
  dot.style.left = `${eventData.coordinates.x}px`;
  dot.style.top = `${eventData.coordinates.y}px`;
  dot.style.position = 'absolute';
  dot.setAttribute('data-index', eventList.length - 1);
  dot.setAttribute('data-event-type', eventData.eventType);
  console.log('Rendering dot at:', eventData.coordinates);
  document.getElementById('pitch').appendChild(dot);
}

function getEventColor(eventType) {
  switch (eventType) {
    case 'Ball Won': return 'blue';
    case 'Ball Lost': return 'red';
    case 'Chance': return 'yellow';
    case 'Goal': return 'green';
    default: return 'black';
  }
}

function calculateZone(x, y, width, height) {
  const columns = 6;
  const rows = 5;
  const zoneWidth = width / columns;
  const zoneHeight = height / rows;
  const col = Math.floor(x / zoneWidth);
  const row = Math.floor(y / zoneHeight);
  return row * columns + col + 1;
}

function addToTable(eventData) {
  const row = document.createElement('tr');
  row.setAttribute('data-index', eventList.length - 1);
  row.setAttribute('data-event-type', eventData.eventType);
  row.innerHTML = `
    <td>${eventData.eventType}</td>
    <td>${eventData.time}</td>
    <td>${eventData.half}</td>
    <td>${eventData.zone}</td>
    <td>(${eventData.coordinates.x}, ${eventData.coordinates.y})</td>
    <td>${eventData.timestamp}</td>
  `;
  document.getElementById('dataTable').appendChild(row);
}

function filterEvents() {
  const selectedEvents = Array.from(document.querySelectorAll('.filter-checkbox:checked')).map(cb => cb.value);
  document.querySelectorAll('.event-dot').forEach(dot => {
    const eventType = dot.getAttribute('data-event-type');
    dot.style.display = selectedEvents.includes(eventType) ? 'block' : 'none';
  });
  document.querySelectorAll('#dataTable tr').forEach(row => {
    const eventType = row.getAttribute('data-event-type');
    row.style.display = selectedEvents.includes(eventType) ? '' : 'none';
  });
}

document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
  checkbox.addEventListener('change', filterEvents);
});

function startTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  } else {
    timerInterval = setInterval(() => {
      elapsedTime++;
      document.getElementById('elapsedTime').textContent = formatTime(elapsedTime);
    }, 1000);
  }
}

function switchHalf() {
  currentHalf = currentHalf === 1 ? 2 : 1;
  document.getElementById('currentHalf').textContent = currentHalf === 1 ? '1st Half' : '2nd Half';
}

function clearEvents() {
  eventList = [];
  document.querySelectorAll('.event-dot').forEach(dot => dot.remove());
  document.getElementById('dataTable').innerHTML = '';
  localStorage.removeItem('eventList');
}

function undoEvent() {
  if (eventList.length > 0) {
    eventList.pop();
    const lastDot = document.querySelector('.event-dot:last-child');
    if (lastDot) lastDot.remove();
    const lastRow = document.querySelector('#dataTable tr:last-child');
    if (lastRow) lastRow.remove();
    localStorage.setItem('eventList', JSON.stringify(eventList));
  } else {
    alert('No events to undo.');
  }
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

eventList.forEach(eventData => {
  renderDot(eventData);
  addToTable(eventData);
});

