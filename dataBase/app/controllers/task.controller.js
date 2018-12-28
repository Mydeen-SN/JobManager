const Task = require('../models/task.model.js');

// Create and Save a new task
exports.create = (req, res) => {
    // Validate request
    if(!req.body.title) {
        return res.status(400).send({
            message: "Title content can not be empty"
        });
    }

    // Create a task
    const task = new Task({
        title: req.body.title,
        description: req.body.description,
        reportTeamPriority: req.body.reportTeamPriority,
        assignTeamPriority: req.body.assignTeamPriority,
        status: req.body.status,
        routeCause: req.body.routeCause,
        dueDate:req.body.dueDate,
        controlName: req.body.controlName,
        reporter: req.body.reporter,
        assignee: req.body.assignee,
        issueType: req.body.issueType,
        issuePriority: req.body.issuePriority
    });

    // Save task in the database
    task.save()
    
    .then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the task."
        });
    });
};

// Retrieve and return all tasks from the database.
exports.findAll = (req, res) => {
    Task.find()
    .then(tasks => {
        res.send({"result":tasks, "count":tasks.length});
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving tasks."
        });
    });
};

// Find a single task with a taskId
exports.findOne = (req, res) => {
    Task.findById(req.params.taskId)
    .then(task => {
        if(!task) {
            return res.status(404).send({
                message: "Task not found with id " + req.params.taskId
            });            
        }
        res.send(task);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Task not found with id " + req.params.taskId
            });                
        }
        return res.status(500).send({
            message: "Error retrieving task with id " + req.params.taskId
        });
    });
};

// Update a task identified by the taskId in the request
exports.update = (req, res) => {
    // Validate Request
    if(!req.params.taskId) {
        return res.status(400).send({
            message: "Task ID cannot be empty"
        });
    }

    // Find note and update it with the request body
    Task.findByIdAndUpdate(req.params.taskId, {
       // title: req.body.title || "Untitled Note",
       status: req.body.status,
       dueDate : req.body.dueDate,
       reportTeamPriority : req.body.reportTeamPriority
    }, {new: true})
    .then(task => {
        if(!task) {
            return res.status(404).send({
                message: "Task not found with id " + req.params.noteId
            });
        }
        res.send(task);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Task not found with id " + req.params.taskId
            });                
        }
        return res.status(500).send({
            message: "Error updating task with id " + req.params.taskId
        });
    });
};

// Delete a task with the specified taskId in the request
exports.delete = (req, res) => {
    // //Task.deleteMany({});
    // //Task.deleteMany({"reporter":""});
    // Task.remove({"reporter":""});
    // res.send({message: "Task deleted successfully!"});
    Task.findByIdAndRemove(req.params.taskId)
    .then(task => {
        if(!task) {
            return res.status(404).send({
                message: "Task not found with id " + req.params.taskId
            });
        }
        res.send({message: "Task deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Task not found with id " + req.params.taskId
            });                
        }
        return res.status(500).send({
            message: "Could not delete task with id " + req.params.taskId
        });
    });
};