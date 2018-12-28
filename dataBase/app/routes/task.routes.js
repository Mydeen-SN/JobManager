module.exports = (app) => {
    const tasks = require('../controllers/task.controller.js');

    // Create a new Note
    app.post('/tasks', tasks.create);

    // Retrieve all Notes
    app.post('/GetTasks', tasks.findAll);

    // Retrieve a single Note with noteId
    app.get('/tasks/:taskId', tasks.findOne);

    // Update a Note with noteId
    app.post('/upateTask/:taskId', tasks.update);

    // Delete a Note with noteId
    app.delete('/tasks/:taskId', tasks.delete);
}