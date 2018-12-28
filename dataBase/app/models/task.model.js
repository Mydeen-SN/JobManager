const mongoose = require('mongoose');

const TaskSchema = mongoose.Schema({
    title: String,
    description:String,
    reportTeamPriority: Number,
    assignTeamPriority: Number,
    dueDate : Date,
    status: String,
    routeCause: String,
    controlName: String,
    reporter: String,
    assignee: String,
    issueType: String,
    issuePriority: Number
}, {
    timestamps: true
});

module.exports = mongoose.model('Job_Manager', TaskSchema);