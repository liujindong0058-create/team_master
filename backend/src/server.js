const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/teams');
const memberRoutes = require('./routes/members');
const noteRoutes = require('./routes/notes');
const assessmentRoutes = require('./routes/assessments');
const taskRoutes = require('./routes/tasks');
const { errorHandler } = require('./middleware/error');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/tasks', taskRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});