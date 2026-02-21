const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const batchRoutes = require('./routes/batchRoutes');
const admissionRoutes = require('./routes/admissionRoutes');
const statsRoutes = require('./routes/statsRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const gradeRoutes = require('./routes/gradeRoutes');

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true })); // Configure true origin in production
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from the React app
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/timetables', timetableRoutes);
app.use('/api/grades', gradeRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Serve frontend for any other routes in production
if (process.env.NODE_ENV === 'production') {
    app.get('(.*)', (req, res) =>
        res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'))
    );
}

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
