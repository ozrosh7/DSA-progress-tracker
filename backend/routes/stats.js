const express = require('express');
const Problem = require('../models/Problem');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/stats — full analytics for dashboard
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const problems = await Problem.find({ user: userId });

        // Total problems solved
        const total = problems.length;

        // By topic breakdown
        const byTopic = {};
        problems.forEach(p => {
            byTopic[p.topic] = (byTopic[p.topic] || 0) + 1;
        });

        // By difficulty breakdown
        const byDifficulty = { Easy: 0, Medium: 0, Hard: 0 };
        problems.forEach(p => {
            byDifficulty[p.difficulty]++;
        });

        // By platform breakdown
        const byPlatform = {};
        problems.forEach(p => {
            byPlatform[p.platform] = (byPlatform[p.platform] || 0) + 1;
        });

        // Daily streak calculation
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let streak = 0;
        let currentDate = new Date(today);

        while (true) {
            const dayStart = new Date(currentDate);
            const dayEnd = new Date(currentDate);
            dayEnd.setHours(23, 59, 59, 999);

            const solvedOnDay = problems.filter(p => {
                const solved = new Date(p.solvedAt);
                return solved >= dayStart && solved <= dayEnd;
            });

            if (solvedOnDay.length === 0) break;
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        }

        // Problems per day (last 14 days)
        const last14Days = [];
        for (let i = 13; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setHours(23, 59, 59, 999);

            const count = problems.filter(p => {
                const solved = new Date(p.solvedAt);
                return solved >= date && solved <= nextDate;
            }).length;

            last14Days.push({
                date: date.toISOString().split('T')[0],
                count
            });
        }

        // Weak topics — topics with fewer than 5 problems
        const weakTopics = Object.entries(byTopic)
            .filter(([_, count]) => count < 5)
            .map(([topic]) => topic);

        res.json({
            total,
            streak,
            byTopic,
            byDifficulty,
            byPlatform,
            last14Days,
            weakTopics
        });

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
