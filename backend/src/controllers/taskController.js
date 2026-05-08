const { Task, Team } = require('../models');

const createTask = (req, res) => {
  const { teamId } = req.params;
  const { title, description, requiredDimensions, priority, dueDate } = req.body;
  
  if (!title) {
    return res.status(400).json({ message: 'Task title is required' });
  }
  
  const team = Team.findById(teamId);
  if (!team || team.ownerId !== req.user.id) {
    return res.status(404).json({ message: 'Team not found' });
  }
  
  const task = Task.create({
    teamId,
    title,
    description: description || '',
    requiredDimensions: requiredDimensions || {},
    priority: priority || 'medium',
    status: 'pending',
    dueDate
  });
  
  res.status(201).json({ message: 'Task created', task });
};

const getTasks = (req, res) => {
  const { teamId } = req.params;
  
  const team = Team.findById(teamId);
  if (!team || team.ownerId !== req.user.id) {
    return res.status(404).json({ message: 'Team not found' });
  }
  
  const tasks = Task.findByTeamId(teamId);
  res.status(200).json({ tasks });
};

const getTask = (req, res) => {
  const { id } = req.params;
  
  const task = Task.findById(id);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }
  
  const team = Team.findById(task.teamId);
  if (!team || team.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  res.status(200).json({ task });
};

const updateTask = (req, res) => {
  const { id } = req.params;
  const { title, description, memberId, priority, status, review } = req.body;
  
  const task = Task.findById(id);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }
  
  const team = Team.findById(task.teamId);
  if (!team || team.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  const updatedTask = Task.update(id, { title, description, memberId, priority, status, review });
  res.status(200).json({ message: 'Task updated', task: updatedTask });
};

const deleteTask = (req, res) => {
  const { id } = req.params;
  
  const task = Task.findById(id);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }
  
  const team = Team.findById(task.teamId);
  if (!team || team.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  Task.delete(id);
  res.status(200).json({ message: 'Task deleted' });
};

const recommendMembers = (req, res) => {
  const { teamId } = req.params;
  const { requiredDimensions } = req.body;
  
  const team = Team.findById(teamId);
  if (!team || team.ownerId !== req.user.id) {
    return res.status(404).json({ message: 'Team not found' });
  }
  
  const recommended = Task.recommendMembers(teamId, requiredDimensions || {});
  res.status(200).json({ recommended });
};

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask, recommendMembers };