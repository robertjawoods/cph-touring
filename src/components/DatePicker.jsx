import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './DatePicker.css';

export default function DatePicker({ onDateSelect }) {
  const [date, setDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
    setIsOpen(false);
    if (onDateSelect) {
      onDateSelect(selectedDate);
    }
  };

  return (
    <div className="date-picker">
      <div className="date-input" onClick={() => setIsOpen(!isOpen)}>
        <input
          type="text"
          value={date.toLocaleDateString()}
          readOnly
          placeholder="Select preferred dates"
          className="date-display"
        />
        <span className="calendar-icon">📅</span>
      </div>

      {isOpen && (
        <div className="calendar-popup">
          <Calendar
            onChange={handleDateChange}
            value={date}
            minDate={new Date()}
            className="custom-calendar"
          />
        </div>
      )}

      {isOpen && <div className="calendar-overlay" onClick={() => setIsOpen(false)}></div>}
    </div>
  );
}