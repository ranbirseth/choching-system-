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
const allowedOrigins = [
    'https://choching-system-w9ua.vercel.app',
    'https://choching-system-5.onrender.com', // Also allow the render URL itself
    'http://localhost:5173',
    'http://localhost:5174', // Common alternative vite ports
    'http://localhost:5175'
];

app.use(cors({
    origin: function (origin, callback) {
        console.log(`Request Origin: ${origin}`);
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from the React app (Only if deploying everything on one service)
// if (process.env.NODE_ENV === 'production') {
//     app.use(express.static(path.join(__dirname, '../client/dist')));
// }

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

// Serve frontend for any other routes (Commented out because you are using Vercel)
// if (process.env.NODE_ENV === 'production') {
//     app.get('*', (req, res) =>
//         res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'))
//     );
// }

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
