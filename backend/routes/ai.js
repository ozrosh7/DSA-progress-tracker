const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const authMiddleware = require('../middleware/auth');
const Problem = require('../models/Problem');

const router = express.Router();
router.use(authMiddleware);

// Initialize SDK
// Initialize SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.get('/study-plan', async (req, res) => {
    try {
        const userId = req.user.id;
        const problems = await Problem.find({ user: userId });

        // Calculate weak topics
        const byTopic = {};
        problems.forEach(p => {
            byTopic[p.topic] = (byTopic[p.topic] || 0) + 1;
        });

        const weakTopics = Object.entries(byTopic)
            .filter(([_, count]) => count < 5)
            .map(([topic]) => topic);

        if (weakTopics.length === 0) {
            weakTopics.push('Advanced Data Structures'); // default if no weak topics
        }

        const prompt = `I am preparing for a software engineering coding interview at top tech companies. 
        I have solved ${problems.length} problems so far.
        My weakest topics right now are: ${weakTopics.join(', ')}.
        
        Please act as an expert technical interviewer and generate a short, highly actionable 3-step study plan for today to help me improve on these weak topics.
        Keep it concise, encouraging, and format it using simple markdown (bullet points).
        Limit the response to 3 short paragraphs.`;

        // Call Gemini API
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        res.json({ plan: response.text });
    } catch (err) {
        console.error("AI Error:", err);
        res.status(500).json({ message: 'Failed to generate study plan', error: err.message });
    }
});

module.exports = router;
