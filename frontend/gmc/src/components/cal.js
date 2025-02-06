import { useState, useEffect } from "react";
import "./styles/cal.css";

const API_URL = "https://gmc-l83v.onrender.com/api/events";

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [eventDate, setEventDate] = useState("");
  const [eventTitle, setEventTitle] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handlePrevMonths = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 3, 1));
  };

  const handleNextMonths = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 3, 1));
  };

  const handleAddEvent = async () => {
    if (!eventDate || !eventTitle) return;

    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: eventDate, title: eventTitle }),
      });

      setEventDate("");
      setEventTitle("");
      fetchEvents();
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  const renderCalendars = () => {
    const startMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const endMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0);
    const calendars = [];

    for (let date = new Date(startMonth); date <= endMonth; date.setMonth(date.getMonth() + 1)) {
      calendars.push(<Calendar key={date.toString()} date={new Date(date)} events={events} />);
    }

    return calendars;
  };

  return (
    <div>
      <section className="calsec">
        <div id="calendar-container">
          <button onClick={handlePrevMonths}>Prev</button>
          <div id="calendar">{renderCalendars()}</div>
          <button onClick={handleNextMonths}>Next</button>
        </div>
      </section>

      <div id="event-form">
        <h3>Add Event</h3>
        <form onSubmit={(e) => e.preventDefault()}>
          <label>Date:</label>
          <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
          <label>Title:</label>
          <input type="text" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} required />
          <button type="button" onClick={handleAddEvent}>Add Event</button>
        </form>
      </div>
    </div>
  );
};

const Calendar = ({ date, events }) => {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  return (
    <div className="calendar">
      <div className="calendar-header">
        <h2>{date.toLocaleString("default", { month: "long" })} {date.getFullYear()}</h2>
      </div>

      <div className="days-of-week">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <div className="calendar-days">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="empty"></div>
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const event = events.find(e => new Date(e.date).getDate() === day && new Date(e.date).getMonth() === date.getMonth());

          return (
            <div key={day} className={`day ${event ? "event" : ""}`} title={event?.title || ""}>
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarPage;
