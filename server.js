const app = require('./app');
const { createAttendanceTable } = require('./models/attendanceModel');
const { createAvailabilityTable } = require('./models/availabilityModel');
const serverTimeRoute = require('./routes/serverTime');
const checkAvailabilityRoute = require('./routes/checkAvailability');

const PORT = process.env.PORT || 5000;

app.use('/api', serverTimeRoute);
app.use('/api/availability', checkAvailabilityRoute);

app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  await createAttendanceTable();
  await createAvailabilityTable();
});
