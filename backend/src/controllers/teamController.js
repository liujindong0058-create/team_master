const { Team } = require('../models');

const createTeam = (req, res) => {
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Team name is required' });
  }
  
  const team = Team.create({
    name,
    description: description || '',
    ownerId: req.user.id
  });
  
  res.status(201).json({ message: 'Team created', team });
};

const getTeams = (req, res) => {
  const teams = Team.findByOwnerId(req.user.id);
  res.status(200).json({ teams });
};

const getTeam = (req, res) => {
  const { id } = req.params;
  const team = Team.findById(id);
  
  if (!team) {
    return res.status(404).json({ message: 'Team not found' });
  }
  
  if (team.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  res.status(200).json({ team });
};

const updateTeam = (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  
  const team = Team.findById(id);
  
  if (!team) {
    return res.status(404).json({ message: 'Team not found' });
  }
  
  if (team.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  const updatedTeam = Team.update(id, { name, description });
  res.status(200).json({ message: 'Team updated', team: updatedTeam });
};

const deleteTeam = (req, res) => {
  const { id } = req.params;
  
  const team = Team.findById(id);
  
  if (!team) {
    return res.status(404).json({ message: 'Team not found' });
  }
  
  if (team.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  Team.delete(id);
  res.status(200).json({ message: 'Team deleted' });
};

module.exports = { createTeam, getTeams, getTeam, updateTeam, deleteTeam };