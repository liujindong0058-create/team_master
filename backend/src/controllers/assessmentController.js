const { Assessment, Member, Team } = require('../models');

const createAssessment = (req, res) => {
  const { memberId } = req.params;
  const { dimensions, comment, period } = req.body;
  
  const requiredDimensions = ['professional', 'collaboration', 'attitude', 'growth', 'contribution'];
  for (const dim of requiredDimensions) {
    if (!dimensions[dim] || dimensions[dim] < 1 || dimensions[dim] > 5) {
      return res.status(400).json({ message: `Invalid value for ${dim}` });
    }
  }
  
  const member = Member.findById(memberId);
  if (!member) {
    return res.status(404).json({ message: 'Member not found' });
  }
  
  const team = Team.findById(member.teamId);
  if (!team || team.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  const assessment = Assessment.create({
    memberId,
    assessorId: req.user.id,
    dimensions,
    comment: comment || '',
    period: period || 'month',
    assessedAt: new Date()
  });
  
  res.status(201).json({ message: 'Assessment created', assessment });
};

const getAssessments = (req, res) => {
  const { memberId } = req.params;
  
  const member = Member.findById(memberId);
  if (!member) {
    return res.status(404).json({ message: 'Member not found' });
  }
  
  const team = Team.findById(member.teamId);
  if (!team || team.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  const assessments = Assessment.findByMemberId(memberId);
  res.status(200).json({ assessments });
};

const getAssessment = (req, res) => {
  const { id } = req.params;
  
  const assessment = Assessment.findById(id);
  if (!assessment) {
    return res.status(404).json({ message: 'Assessment not found' });
  }
  
  const member = Member.findById(assessment.memberId);
  const team = Team.findById(member.teamId);
  if (!team || team.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  res.status(200).json({ assessment });
};

const updateAssessment = (req, res) => {
  const { id } = req.params;
  const { dimensions, comment } = req.body;
  
  const assessment = Assessment.findById(id);
  if (!assessment) {
    return res.status(404).json({ message: 'Assessment not found' });
  }
  
  if (assessment.assessorId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  const updatedAssessment = Assessment.update(id, { dimensions, comment });
  res.status(200).json({ message: 'Assessment updated', assessment: updatedAssessment });
};

module.exports = { createAssessment, getAssessments, getAssessment, updateAssessment };