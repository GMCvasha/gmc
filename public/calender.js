const calendarDays = document.getElementById('calendar-days');
const currentMonthYear = document.getElementById('current-month-year');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');
const eventDateInput = document.getElementById('event-date');
const eventTitleInput = document.getElementById('event-title');
const addEventButton = document.getElementById('add-event');

let events = [];
let currentDate = new Date();

async function fetchEvents() {
  const response = await fetch('https://gmc.onrender.com/api/events');
  events = await response.json();
  renderCalendar();
}

function renderCalendar() {
  calendarDays.innerHTML = '';
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  currentMonthYear.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.appendChild(createCalendarDay());
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const day = createCalendarDay(i);
    const event = events.find(event => event.date === `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
    if (event) {
      day.classList.add('event');
    }
    calendarDays.appendChild(day);
  }
}

function createCalendarDay(day) {
  const dayElement = document.createElement('div');
  if (day) {
    dayElement.textContent = day;
    dayElement.addEventListener('click', () => {
      eventDateInput.value = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    });
  }
  return dayElement;
}

async function addEvent() {
  const date = eventDateInput.value;
  const title = eventTitleInput.value;
  if (date && title) {
    const response = await fetch('https://gmc.onrender.com/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ date, title })
    });

    const newEvent = await response.json();
    events.push(newEvent);
    renderCalendar();
    eventDateInput.value = '';
    eventTitleInput.value = '';
  }
}

prevMonthButton.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextMonthButton.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

addEventButton.addEventListener('click', addEvent);

fetchEvents();
