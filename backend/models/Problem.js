const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    platform: {
        type: String,
        enum: ['LeetCode', 'Codeforces', 'AlgoZenith', 'GFG', 'Other'],
        default: 'LeetCode'
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        required: true
    },
    topic: {
        type: String,
        enum: ['Arrays', 'Strings', 'Graphs', 'Trees', 'DP', 'Greedy', 'Heaps', 'Hashmaps', 'Stacks', 'Queues', 'Other'],
        required: true
    },
    timeTaken: {
        type: Number, // in minutes
        default: 0
    },
    notes: {
        type: String,
        default: ''
    },
    solvedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Problem', ProblemSchema);
