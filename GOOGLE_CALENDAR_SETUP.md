# Google Calendar Integration Setup

## Overview
The booking page now displays a calendar showing your availability based on your Google Calendar. The calendar automatically fetches events and marks available dates (weekdays without conflicts).

## Setup Instructions

### 1. Get Google Calendar API Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Search for "Calendar API"
   - Click "Enable"
4. Create credentials:
   - Click "Create Credentials" → "API Key"
   - Copy your API key
5. Get your Calendar ID:
   - Go to Google Calendar Settings
   - Find "Calendar ID" under the calendar details (looks like: `your-email@gmail.com` or a hash)

### 2. Configure Environment Variables

Create a `.env.local` file in the root of your project (next to `package.json`):

```env
GOOGLE_CALENDAR_ID=your-calendar-id-here
GOOGLE_CALENDAR_API_KEY=your-api-key-here
```

Example:
```env
GOOGLE_CALENDAR_ID=chris@example.com
GOOGLE_CALENDAR_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. How It Works

- The calendar displays the next 30 days
- **Green dates** = Available (no events scheduled)
- **Gray dates** = Unavailable (events scheduled) or weekends
- Only weekdays are shown as potentially available
- When a visitor selects an available date, they get confirmation

### 4. Testing

If you haven't set up Google Calendar credentials yet, the calendar will display **mock availability** so you can test the UI. Once you add the environment variables, it will fetch real data from your Google Calendar.

### 5. Optional: Public vs Private Calendar

- **Public Calendar**: Anyone with the Calendar ID can see it (recommended)
- **Private Calendar**: You'll need to use OAuth (more complex setup)

For a business use case, a public calendar is sufficient.

## File Structure

```
src/
├── components/
│   ├── AvailabilityCalendar.jsx     # Main calendar component
│   ├── AvailabilityCalendar.css     # Calendar styling
│   └── BookingForm.astro            # Displays the calendar
├── pages/
│   ├── booking.astro                # Booking page
│   └── api/
│       └── calendar/
│           └── availability.ts      # Backend API endpoint
```

## Customization

### Change Available Days

Edit `/src/pages/api/calendar/availability.ts`:
- Find the `processCalendarEvents` function
- Modify `isWeekday` logic to include/exclude specific days
- Currently excludes Sundays (0) and Saturdays (6)

### Change Date Range

In `AvailabilityCalendar.jsx`, modify the fetch request or endpoint to return more/fewer days.

### Styling

Edit `/src/components/AvailabilityCalendar.css` to customize colors, sizes, and theme.