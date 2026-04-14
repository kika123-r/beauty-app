const API_URL = '/api/send-email';

export const sendBookingConfirmation = async ({ clientEmail, salonName, serviceName, date, time, price }) => {
  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'booking_confirmed',
        to: clientEmail,
        data: { salonName, serviceName, date, time, price },
      }),
    });
  } catch (err) {
    console.error('Email error:', err);
  }
};

export const sendBookingCancellation = async ({ clientEmail, serviceName, date, time }) => {
  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'booking_cancelled',
        to: clientEmail,
        data: { serviceName, date, time },
      }),
    });
  } catch (err) {
    console.error('Email error:', err);
  }
};

export const sendLastMinuteNotification = async ({ clientEmail, salonName, serviceName, date, time, price, salonId }) => {
  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'last_minute',
        to: clientEmail,
        data: {
          salonName, serviceName, date, time, price,
          bookingUrl: `https://beauty-app-lac.vercel.app/book/${salonId}`,
        },
      }),
    });
  } catch (err) {
    console.error('Email error:', err);
  }
};

export const sendReminder = async ({ clientEmail, salonName, serviceName, date, time }) => {
  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'reminder',
        to: clientEmail,
        data: { salonName, serviceName, date, time },
      }),
    });
  } catch (err) {
    console.error('Email error:', err);
  }
};
