// app/api/webhook/route.ts
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
// 1. SETUP GOOGLE AUTH
const auth = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

const calendar = google.calendar({ version: 'v3', auth });

// 2. SETUP EMAIL TRANSPORTER (The "Mailman")
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MY_EMAIL, 
    pass: process.env.GMAIL_APP_PASSWORD, 
  },
});

// --- HELPER FUNCTIONS ---
async function checkAvailability(date: string) {
  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    
    // 1. Calculate Time 
    const startTime = new Date(date);
    const endTime = new Date(startTime.getTime() + 30 * 60000); 

    console.log("------------------------------------------------");
    console.log(`🔍 Checking Time: ${startTime.toISOString()} -> ${endTime.toISOString()}`);
    console.log(`📅 Calendar ID: ${calendarId}`);

    // 2. Ask Google
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startTime.toISOString(),
        timeMax: endTime.toISOString(),
        timeZone: 'UTC', 
        items: [{ id: calendarId }]
      }
    });

    // 3. LOG THE RAW RESPONSE
    console.log("🤖 Google Response:", JSON.stringify(response.data, null, 2));

    // 4. Safely extract busy slots
    const calendars = response.data.calendars || {};
    const firstCalendarKey = Object.keys(calendars)[0];
    const busySlots = calendars[firstCalendarKey]?.busy || [];

    if (busySlots.length > 0) {
      console.log(`❌ CONFLICT FOUND: ${JSON.stringify(busySlots)}`);
      return "I'm sorry, that time slot is already booked.";
    }

    console.log("✅ No conflicts found. Slot is free.");
    return "Yes, that time slot is available.";

  } catch (error: any) {
    console.error("🔥 Error checking availability:", error);
    return "I can check that, but I'm having trouble connecting to the calendar right now.";
  }
}

async function bookAppointment(name: string, email: string, time: string) {
  try {
    console.log(`Booking for ${name} at ${time}`);
    
    const startTime = new Date(time);
    const endTime = new Date(startTime.getTime() + 30 * 60000); 

   
    await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID, 
      requestBody: {
        summary: `Call with ${name}`,
        description: `Client Email: ${email}`,
        start: { dateTime: startTime.toISOString() },
        end: { dateTime: endTime.toISOString() },
      },
    });

    // B. Send the Confirmation Email 
    await transporter.sendMail({
      from: `"Riley from Wellness" <${process.env.MY_EMAIL}>`,
      to: email, 
      subject: 'Appointment Confirmed! ✅',
      text: `Hi ${name},\n\nYour appointment is confirmed for ${startTime.toLocaleString()}.\n\nSee you then!\n- Wellness Partners`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Appointment Confirmed! 🎉</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>You are all set for:</p>
          <p style="font-size: 18px; font-weight: bold;">${startTime.toLocaleString()}</p>
          <hr />
          <p>We look forward to seeing you.</p>
        </div>
      `
    });

    return "Success! I have booked the slot and sent a confirmation email.";
  } catch (error: any) {
    console.error("Booking Error:", error);
    throw new Error(error.message); 
  }
}

// --- MAIN ROUTE HANDLER ---

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (body.message && body.message.type === 'tool-calls') {
      const toolCalls = body.message.toolCallList;
      const results = [];

      for (const call of toolCalls) {
        let result = "";

        if (call.function.name === 'checkAvailability') {
          result = await checkAvailability(call.function.arguments.date);
        } else if (call.function.name === 'bookAppointment') {
          const { name, email, time } = call.function.arguments;
          result = await bookAppointment(name, email, time);
        }

        results.push({
          toolCallId: call.id,
          result: result
        });
      }

      return NextResponse.json({ results: results });
    }

    return NextResponse.json({ status: 'OK' });
    
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}