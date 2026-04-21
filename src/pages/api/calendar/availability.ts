// API endpoint for fetching calendar availability from Google Calendar
// This endpoint requires Google Calendar API credentials to be set up

export async function GET() {
  try {
    // Get the next 30 days of availability
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    // Check environment variables for Google Calendar setup
    const calendarId = import.meta.env.GOOGLE_CALENDAR_ID;
    const apiKey = import.meta.env.GOOGLE_CALENDAR_API_KEY;

    if (!calendarId || !apiKey) {
      // Return mock data if credentials not set up
      return new Response(
        JSON.stringify({
          events: generateMockAvailability(startDate, endDate),
          message: 'Mock availability data. Configure Google Calendar API credentials to see real data.'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch from Google Calendar API
    const events = await fetchGoogleCalendarEvents(
      calendarId,
      apiKey,
      startDate,
      endDate
    );

    const availability = processCalendarEvents(events, startDate, endDate);

    return new Response(
      JSON.stringify({ events: availability }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Calendar API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch calendar availability' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function fetchGoogleCalendarEvents(
  calendarId: string,
  apiKey: string,
  startDate: Date,
  endDate: Date
) {
  const timeMin = startDate.toISOString();
  const timeMax = endDate.toISOString();

  const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);
    return [];
  }
}

function processCalendarEvents(events: any[], startDate: Date, endDate: Date) {
  const availability = [];
  const busyDates = new Set();

  // Mark dates with events as busy
  events.forEach((event: any) => {
    if (event.start?.dateTime) {
      const eventDate = new Date(event.start.dateTime);
      const dateStr = eventDate.toISOString().split('T')[0];
      busyDates.add(dateStr);
    }
  });

  // Generate availability for each day in the range
  const current = new Date(startDate);
  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];
    const isWeekday = current.getDay() !== 0 && current.getDay() !== 6; // Not Sunday or Saturday
    const isAvailable = !busyDates.has(dateStr) && isWeekday;

    availability.push({
      date: dateStr,
      available: isAvailable,
      dayOfWeek: current.toLocaleDateString('en-US', { weekday: 'short' })
    });

    current.setDate(current.getDate() + 1);
  }

  return availability;
}

function generateMockAvailability(startDate: Date, endDate: Date) {
  // Generate mock data with random available dates
  const availability = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];
    const dayOfWeek = current.getDay();
    
    // Mark weekdays as available (randomly), skip weekends
    const isWeekday = dayOfWeek !== 0 && dayOfWeek !== 6;
    const isAvailable = isWeekday && Math.random() > 0.3; // 70% available on weekdays

    availability.push({
      date: dateStr,
      available: isAvailable,
      dayOfWeek: current.toLocaleDateString('en-US', { weekday: 'short' })
    });

    current.setDate(current.getDate() + 1);
  }

  return availability;
}