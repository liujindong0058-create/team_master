const { v4: uuidv4 } = require('uuid');

let users = [];
let teams = [];
let members = [];
let notes = [];
let assessments = [];
let tasks = [];

const User = {
  create: (data) => {
    const user = {
      id: uuidv4(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    users.push(user);
    return user;
  },
  findByEmail: (email) => users.find(u => u.email === email),
  findById: (id) => users.find(u => u.id === id),
  update: (id, data) => {
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...data, updatedAt: new Date() };
      return users[index];
    }
    return null;
  },
  delete: (id) => {
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      return users.splice(index, 1)[0];
    }
    return null;
  }
};

const Team = {
  create: (data) => {
    const team = {
      id: uuidv4(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    teams.push(team);
    return team;
  },
  findByOwnerId: (ownerId) => teams.filter(t => t.ownerId === ownerId),
  findById: (id) => teams.find(t => t.id === id),
  update: (id, data) => {
    const index = teams.findIndex(t => t.id === id);
    if (index !== -1) {
      teams[index] = { ...teams[index], ...data, updatedAt: new Date() };
      return teams[index];
    }
    return null;
  },
  delete: (id) => {
    const index = teams.findIndex(t => t.id === id);
    if (index !== -1) {
      const deleted = teams.splice(index, 1)[0];
      members = members.filter(m => m.teamId !== id);
      return deleted;
    }
    return null;
  }
};

const Member = {
  create: (data) => {
    const member = {
      id: uuidv4(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    members.push(member);
    return member;
  },
  findByTeamId: (teamId) => members.filter(m => m.teamId === teamId && m.status === 'active'),
  findById: (id) => members.find(m => m.id === id),
  update: (id, data) => {
    const index = members.findIndex(m => m.id === id);
    if (index !== -1) {
      members[index] = { ...members[index], ...data, updatedAt: new Date() };
      return members[index];
    }
    return null;
  },
  delete: (id) => {
    const index = members.findIndex(m => m.id === id);
    if (index !== -1) {
      members[index].status = 'removed';
      members[index].updatedAt = new Date();
      return members[index];
    }
    return null;
  }
};

const Note = {
  create: (data) => {
    const note = {
      id: uuidv4(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    notes.push(note);
    return note;
  },
  findByMemberId: (memberId) => notes.filter(n => n.memberId === memberId),
  findById: (id) => notes.find(n => n.id === id),
  update: (id, data) => {
    const index = notes.findIndex(n => n.id === id);
    if (index !== -1) {
      notes[index] = { ...notes[index], ...data, updatedAt: new Date() };
      return notes[index];
    }
    return null;
  },
  delete: (id) => {
    const index = notes.findIndex(n => n.id === id);
    if (index !== -1) {
      return notes.splice(index, 1)[0];
    }
    return null;
  },
  getTimeline: (teamId) => {
    const teamMembers = members.filter(m => m.teamId === teamId).map(m => m.id);
    return notes
      .filter(n => teamMembers.includes(n.memberId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};

const Assessment = {
  create: (data) => {
    const assessment = {
      id: uuidv4(),
      ...data,
      createdAt: new Date()
    };
    assessments.push(assessment);
    return assessment;
  },
  findByMemberId: (memberId) => assessments
    .filter(a => a.memberId === memberId)
    .sort((a, b) => new Date(b.assessedAt) - new Date(a.assessedAt)),
  findById: (id) => assessments.find(a => a.id === id),
  update: (id, data) => {
    const index = assessments.findIndex(a => a.id === id);
    if (index !== -1) {
      assessments[index] = { ...assessments[index], ...data };
      return assessments[index];
    }
    return null;
  }
};

const Task = {
  create: (data) => {
    const task = {
      id: uuidv4(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    tasks.push(task);
    return task;
  },
  findByTeamId: (teamId) => tasks.filter(t => t.teamId === teamId),
  findById: (id) => tasks.find(t => t.id === id),
  update: (id, data) => {
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...data, updatedAt: new Date() };
      return tasks[index];
    }
    return null;
  },
  delete: (id) => {
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      return tasks.splice(index, 1)[0];
    }
    return null;
  },
  recommendMembers: (teamId, requiredDimensions) => {
    const teamMembers = members.filter(m => m.teamId === teamId && m.status === 'active');
    return teamMembers.map(member => {
      const memberAssessments = assessments
        .filter(a => a.memberId === member.id)
        .sort((a, b) => new Date(b.assessedAt) - new Date(a.assessedAt));
      
      const latestAssessment = memberAssessments[0];
      let score = 0;
      let totalWeight = 0;
      
      if (latestAssessment) {
        Object.entries(requiredDimensions).forEach(([dimension, weight]) => {
          const dimScore = latestAssessment.dimensions[dimension] || 3;
          score += dimScore * weight;
          totalWeight += weight;
        });
      } else {
        score = 3 * Object.values(requiredDimensions).reduce((a, b) => a + b, 0);
        totalWeight = Object.values(requiredDimensions).reduce((a, b) => a + b, 0);
      }
      
      return {
        ...member,
        recommendationScore: totalWeight > 0 ? score / totalWeight : 3
      };
    }).sort((a, b) => b.recommendationScore - a.recommendationScore);
  }
};

module.exports = { User, Team, Member, Note, Assessment, Task };