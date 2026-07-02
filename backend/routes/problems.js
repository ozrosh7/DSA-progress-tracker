const express = require('express');
const Problem = require('../models/Problem');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/problems - Get all problems for logged-in user
router.get('/', async (req, res) => {
    try {
        const problems = await Problem.find({ user: req.user.id }).sort({ solvedAt: -1 });
        res.json(problems);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /api/problems - Add a new problem
router.post('/', async (req, res) => {
    try {
        const { title, platform, difficulty, topic, timeTaken, notes } = req.body;
        
        const newProblem = new Problem({
            user: req.user.id,
            title,
            platform,
            difficulty,
            topic,
            timeTaken,
            notes
        });

        const savedProblem = await newProblem.save();
        res.status(201).json(savedProblem);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// DELETE /api/problems/:id - Delete a problem
router.delete('/:id', async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        // Ensure user owns the problem
        if (problem.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await Problem.findByIdAndDelete(req.params.id);
        res.json({ message: 'Problem removed' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
