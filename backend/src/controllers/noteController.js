const { Note, Member, Team } = require('../models');

const addNote = (req, res) => {
  console.log('addNote called with:', req.params, req.body);
  console.log('Current user:', req.user);
  
  const { memberId } = req.params;
  const { content, type, privacy, images } = req.body;
  
  if (!content || content.trim().length === 0) {
    console.log('Error: Content is required');
    return res.status(400).json({ message: 'Content is required' });
  }
  
  const member = Member.findById(memberId);
  console.log('Found member:', member);
  
  if (!member) {
    console.log('Error: Member not found');
    return res.status(404).json({ message: 'Member not found' });
  }
  
  const team = Team.findById(member.teamId);
  console.log('Found team:', team);
  
  if (!team) {
    console.log('Error: Team not found');
    return res.status(403).json({ message: 'Forbidden - Team not found' });
  }
  
  if (team.ownerId !== req.user.id) {
    console.log('Error: Forbidden - team.ownerId:', team.ownerId, 'req.user.id:', req.user.id);
    return res.status(403).json({ message: 'Forbidden - Owner mismatch' });
  }
  
  const note = Note.create({
    memberId,
    authorId: req.user.id,
    content,
    type: type || 'daily',
    privacy: privacy || 'private',
    images: images || []
  });
  
  console.log('Note created:', note);
  res.status(201).json({ message: 'Note added', note });
};

const getNotes = (req, res) => {
  const { memberId } = req.params;
  
  const member = Member.findById(memberId);
  if (!member) {
    return res.status(404).json({ message: 'Member not found' });
  }
  
  const team = Team.findById(member.teamId);
  if (!team || team.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  const notes = Note.findByMemberId(memberId);
  res.status(200).json({ notes });
};

const getNote = (req, res) => {
  const { id } = req.params;
  
  const note = Note.findById(id);
  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }
  
  const member = Member.findById(note.memberId);
  const team = Team.findById(member.teamId);
  if (!team || team.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  res.status(200).json({ note });
};

const updateNote = (req, res) => {
  const { id } = req.params;
  const { content, type, privacy, images } = req.body;
  
  const note = Note.findById(id);
  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }
  
  if (note.authorId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  const updatedNote = Note.update(id, { content, type, privacy, images });
  res.status(200).json({ message: 'Note updated', note: updatedNote });
};

const deleteNote = (req, res) => {
  const { id } = req.params;
  
  const note = Note.findById(id);
  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }
  
  if (note.authorId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  Note.delete(id);
  res.status(200).json({ message: 'Note deleted' });
};

const getTimeline = (req, res) => {
  const { teamId } = req.query;
  
  const team = Team.findById(teamId);
  if (!team || team.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  const timeline = Note.getTimeline(teamId);
  res.status(200).json({ timeline });
};

module.exports = { addNote, getNotes, getNote, updateNote, deleteNote, getTimeline };