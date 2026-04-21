import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './AvailabilityCalendar.css';

export default function AvailabilityCalendar() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectionError, setSelectionError] = useState('');

  useEffect(() => {
    // Fetch events from your backend endpoint
    // In your backend, you'll handle the Google Calendar API integration
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const response = await fetch('/api/calendar/availability');
      const data = await response.json();
      setEvents(data.events || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      setLoading(false);
    }
  };

  const isDateAvailable = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.some(event => event.date === dateStr && event.available === true);
  };

  const isDateSelected = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return selectedDates.some(d => d.toISOString().split('T')[0] === dateStr);
  };

  const getTileClass = ({ date }) => {
    const isSelected = isDateSelected(date);
    const isAvailable = isDateAvailable(date);

    if (isSelected && isAvailable) {
      return 'available-date selected-date';
    } else if (isSelected && !isAvailable) {
      return 'unavailable-date selected-date';
    } else if (isAvailable) {
      return 'available-date';
    }
    return '';
  };



  const removeDateSelection = (dateToRemove) => {
    const dateStr = dateToRemove.toISOString().split('T')[0];
    setSelectedDates(prev => prev.filter(d => d.toISOString().split('T')[0] !== dateStr));
    setSelectionError('');
  };

  const isDateConsecutive = (newDate, currentDates) => {
    if (currentDates.length === 0) return true;
    if (currentDates.length === 1) return true;

    const newDateMs = newDate.getTime();
    const sortedDates = [...currentDates].sort((a, b) => a.getTime() - b.getTime());
    
    const minDateMs = sortedDates[0].getTime();
    const maxDateMs = sortedDates[sortedDates.length - 1].getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    
    // Check if new date extends the range at either end
    const isAdjacentToMin = (newDateMs - minDateMs) === dayMs;
    const isAdjacentToMax = (newDateMs - maxDateMs) === dayMs;
    const isBeforeMin = (minDateMs - newDateMs) === dayMs;
    const isAfterMax = (maxDateMs - newDateMs) === -dayMs;
    
    return isAdjacentToMin || isAdjacentToMax || isBeforeMin || isAfterMax;
  };

  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDates(prev => {
      const isAlreadySelected = prev.some(d => d.toISOString().split('T')[0] === dateStr);
      if (isAlreadySelected) {
        return prev.filter(d => d.toISOString().split('T')[0] !== dateStr);
      } else {
        // Check if new date maintains consecutiveness
        if (!isDateConsecutive(date, prev)) {
          setSelectionError('Dates must be consecutive. Select a date adjacent to your current selection.');
          return prev;
        }
        setSelectionError('');
        return [...prev, date];
      }
    });
  };

  const allSelectedDatesAvailable = selectedDates.length > 0 && selectedDates.every(date => isDateAvailable(date));
  const someSelectedDatesUnavailable = selectedDates.length > 0 && selectedDates.some(date => !isDateAvailable(date));

  if (loading) {
    return (
      <div className="availability-calendar">
        <div className="loading">
          <p>Loading availability...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="availability-calendar">
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color available"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-color unavailable"></div>
          <span>Unavailable</span>
        </div>
        <div className="legend-item">
          <div className="legend-color selected-indicator"></div>
          <span>Selected</span>
        </div>
      </div>
      <div className="calendar-container">
        <h2>Our Availability</h2>
        <p className="calendar-description">
          Select your preferred tour dates. You must select consecutive dates (e.g., March 5-8). Once all dates are available, you can contact us to book your tour.
        </p>

        <Calendar
          onChange={setDate}
          value={date}
          minDate={new Date()}
          tileClassName={getTileClass}
          onClickDay={handleDateClick}
          className="custom-availability-calendar"
        />

        {selectionError && (
          <div className="error-message">
            {selectionError}
          </div>
        )}

        {selectedDates.length > 0 && (
          <div className="selected-date-info">
            <div className="selected-dates-header">
              <h3>Selected Dates ({selectedDates.length})</h3>
              <button
                type="button"
                className="clear-selection-btn"
                onClick={() => {
                  setSelectedDates([]);
                  setSelectionError('');
                }}
                title="Clear all selections"
              >
                Clear All
              </button>
            </div>
            
            {selectedDates.length > 0 && (
              <div className="date-range-display">
                {(() => {
                  const sorted = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
                  const startDate = sorted[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  const endDate = sorted[sorted.length - 1].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  return (
                    <p className="range-text">
                      📅 <strong>{startDate}</strong> to <strong>{endDate}</strong>
                    </p>
                  );
                })()}
              </div>
            )}
            
            <div className="selected-dates-list">
              {selectedDates.map(selectedDate => {
                const isAvailable = isDateAvailable(selectedDate);
                const dateStr = selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                });
                return (
                  <div key={selectedDate.toISOString()} className={`selected-date-item ${!isAvailable ? 'unavailable' : 'available'}`}>
                    <div className="date-content">
                      <span className="date-text">{dateStr}</span>
                      <span className={`status-badge ${!isAvailable ? 'status-unavailable' : 'status-available'}`}>
                        {isAvailable ? '✓ Available' : '✗ Not Available'}
                      </span>
                    </div>
                    <button 
                      type="button"
                      className="remove-date-btn" 
                      onClick={() => removeDateSelection(selectedDate)}
                      title="Remove this date"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
            {allSelectedDatesAvailable && (
              <div className="booking-ready-message">
                <h4>✓ All dates available!</h4>
                <p>Your tour dates are ready to book:</p>
                <p className="booking-dates-summary">
                  {(() => {
                    const sorted = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
                    const startDate = sorted[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const endDate = sorted[sorted.length - 1].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    return `${startDate} - ${endDate}`;
                  })()}
                </p>
                <p>Contact us to complete your booking:</p>
                <div className="contact-options">
                  <a href="tel:+4512345678" className="contact-btn phone-btn">
                    <span className="btn-icon">📞</span>
                    <span className="btn-content">
                      <strong>Call Us</strong>
                      <small>+45 12 34 56 78</small>
                    </span>
                  </a>
                  <a href="mailto:booking@cphtouring.com" className="contact-btn email-btn">
                    <span className="btn-icon">✉️</span>
                    <span className="btn-content">
                      <strong>Email Us</strong>
                      <small>booking@cphtouring.com</small>
                    </span>
                  </a>
                </div>
              </div>
            )}
            {someSelectedDatesUnavailable && (
              <div className="warning-message">
                ⚠️ Some selected dates are not available. Please remove unavailable dates to enable booking.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}