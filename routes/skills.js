const express = require('express');
const router = express.Router();
const { getAllSkills, createSkill, updateSkill, deleteSkill } = require('../db/queries');

// Get all skills
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const skills = await getAllSkills(category);
    res.json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

// Create new skill (protected)
router.post('/', async (req, res) => {
  try {
    const { name, level, category } = req.body;

    if (!name || level === undefined || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (level < 0 || level > 100) {
      return res.status(400).json({ error: 'Level must be between 0 and 100' });
    }

    const skillData = { name, level, category };
    const newSkill = await createSkill(skillData);
    res.status(201).json(newSkill);
  } catch (error) {
    console.error('Error creating skill:', error);
    res.status(500).json({ error: 'Failed to create skill' });
  }
});

// Update skill (protected)
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (req.body.level !== undefined && (req.body.level < 0 || req.body.level > 100)) {
      return res.status(400).json({ error: 'Level must be between 0 and 100' });
    }

    const updatedSkill = await updateSkill(id, req.body);

    if (!updatedSkill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    res.json(updatedSkill);
  } catch (error) {
    console.error('Error updating skill:', error);
    res.status(500).json({ error: 'Failed to update skill' });
  }
});

// Delete skill (protected)
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deletedSkill = await deleteSkill(id);

    if (!deletedSkill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Error deleting skill:', error);
    res.status(500).json({ error: 'Failed to delete skill' });
  }
});

module.exports = router;
