document.addEventListener('DOMContentLoaded', () => {
  const calendarContainer = document.getElementById('calendar');
  const prevMonthsButton = document.getElementById('prev-months');
  const nextMonthsButton = document.getElementById('next-months');
  const eventDateInput = document.getElementById('event-date');
  const eventTitleInput = document.getElementById('event-title');
  const addEventButton = document.getElementById('add-event');

  let events = [];
  let currentDate = new Date();

  async function fetchEvents() {
    const response = await fetch('https://gmc.onrender.com/api/events');
    events = await response.json();
    renderCalendars();
  }

  function renderCalendars() {
    calendarContainer.innerHTML = '';
    const startMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1); // Start 1 month before
    const endMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0); // End 2 months after

    for (let date = startMonth; date <= endMonth; date.setMonth(date.getMonth() + 1)) {
      const calendar = createCalendar(date);
      calendarContainer.appendChild(calendar);
    }
  }

  function createCalendar(date) {
    const calendar = document.createElement('div');
    calendar.className = 'calendar';

    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.innerHTML = `
      <h2>${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}</h2>
    `;

    const daysOfWeek = document.createElement('div');
    daysOfWeek.id = 'days-of-week';
    daysOfWeek.innerHTML = `
      <div>Sun</div>
      <div>Mon</div>
      <div>Tue</div>
      <div>Wed</div>
      <div>Thu</div>
      <div>Fri</div>
      <div>Sat</div>
    `;

    const calendarDays = document.createElement('div');
    calendarDays.id = 'calendar-days';

    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.appendChild(createCalendarDay());
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const day = createCalendarDay(i);
      const event = events.find(e => new Date(e.date).getDate() === i && new Date(e.date).getMonth() === date.getMonth());
      if (event) {
        day.classList.add('event');
        day.setAttribute('data-title', event.title); // Set event title as a data attribute
      }
      calendarDays.appendChild(day);
    }

    calendar.appendChild(header);
    calendar.appendChild(daysOfWeek);
    calendar.appendChild(calendarDays);

    return calendar;
  }

  function createCalendarDay(dayNumber) {
    const day = document.createElement('div');
    day.textContent = dayNumber || '';
    return day;
  }

  async function addEvent() {
    const date = eventDateInput.value;
    const title = eventTitleInput.value;
    if (date && title) {
      await fetch('https://gmc.onrender.com/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, title }),
      });
      eventDateInput.value = '';
      eventTitleInput.value = '';
      fetchEvents();
    }
  }

  prevMonthsButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 3);
    renderCalendars();
  });

  nextMonthsButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 3);
    renderCalendars();
  });

  addEventButton.addEventListener('click', addEvent);

  fetchEvents();
});
