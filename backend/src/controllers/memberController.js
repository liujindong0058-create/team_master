const { Member, Team } = require('../models');

const addMember = (req, res) => {
  const { teamId } = req.params;
  const { name, position } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Member name is required' });
  }
  
  const team = Team.findById(teamId);
  if (!team || team.ownerId !== req.user.id) {
    return res.status(404).json({ message: 'Team not found' });
  }
  
  const member = Member.create({
    teamId,
    name,
    position: position || '',
    joinDate: new Date(),
    status: 'active',
    strengths: '',
    weaknesses: '',
    tags: '',
    futureDirection: ''
  });
  
  res.status(201).json({ message: 'Member added', member });
};

const getMembers = (req, res) => {
  const { teamId } = req.params;
  
  const team = Team.findById(teamId);
  if (!team || team.ownerId !== req.user.id) {
    return res.status(404).json({ message: 'Team not found' });
  }
  
  const members = Member.findByTeamId(teamId);
  res.status(200).json({ members });
};

const getMember = (req, res) => {
  const { id } = req.params;
  
  const member = Member.findById(id);
  if (!member) {
    return res.status(404).json({ message: 'Member not found' });
  }
  
  const team = Team.findById(member.teamId);
  if (!team || team.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  res.status(200).json({ member });
};

const updateMember = (req, res) => {
  const { id } = req.params;
  const { name, position, joinDate, strengths, weaknesses, tags, futureDirection } = req.body;
  
  const member = Member.findById(id);
  if (!member) {
    return res.status(404).json({ message: 'Member not found' });
  }
  
  const team = Team.findById(member.teamId);
  if (!team || team.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  const updatedMember = Member.update(id, { name, position, joinDate, strengths, weaknesses, tags, futureDirection });
  res.status(200).json({ message: 'Member updated', member: updatedMember });
};

const deleteMember = (req, res) => {
  const { id } = req.params;
  
  const member = Member.findById(id);
  if (!member) {
    return res.status(404).json({ message: 'Member not found' });
  }
  
  const team = Team.findById(member.teamId);
  if (!team || team.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  Member.delete(id);
  res.status(200).json({ message: 'Member removed' });
};

module.exports = { addMember, getMembers, getMember, updateMember, deleteMember };