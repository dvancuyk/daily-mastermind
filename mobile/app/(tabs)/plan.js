import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  Paper,
  Grid2
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Delete, Add, ArrowBack } from '@mui/icons-material';

export default function Plan() {
  const [tasks, setTasks] = useState([]);
  const [newTaskModal, setNewTaskModal] = useState(false);
  const [taskDetailModal, setTaskDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTask, setNewTask] = useState({
    id: '',
    name: '',
    dueBy: null,
    estimatedTime: '',
    tags: [],
    quadrant: null,
    createdAt: null
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  };

  const saveTasks = (updatedTasks) => {
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
  };

  const getAbbreviatedName = (name) => {
    const words = name.split(' ');
    if (words.length === 1) {
      return name.substring(0, 3);
    }
    return words.map(word => word[0]).join('').substring(0, 3);
  };

  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    saveTasks(updatedTasks);
    setTaskDetailModal(false);
  };

  const moveToUnassigned = (taskId) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, quadrant: null } : task
    );
    saveTasks(updatedTasks);
    setTaskDetailModal(false);
  };

  const assignToQuadrant = (taskId, quadrant) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, quadrant } : task
    );
    saveTasks(updatedTasks);
  };

  const addTask = () => {
    if (!newTask.name) return;

    const taskToAdd = {
      ...newTask,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };

    const updatedTasks = [...tasks, taskToAdd];
    saveTasks(updatedTasks);
    setNewTaskModal(false);
    setNewTask({
      id: '',
      name: '',
      dueBy: null,
      estimatedTime: '',
      tags: [],
      quadrant: null,
      createdAt: null
    });
  };

  const renderTaskBubble = (task) => (
    <Box
      key={task.id}
      onClick={() => {
        setSelectedTask(task);
        setTaskDetailModal(true);
      }}
      sx={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '8px',
        margin: '2px',
        minWidth: '40px',
        textAlign: 'center',
        cursor: 'pointer',
        boxShadow: 1,
        '&:hover': {
          boxShadow: 2,
        }
      }}
    >
      <Typography variant="caption" fontWeight="bold">
        {getAbbreviatedName(task.name)}
      </Typography>
    </Box>
  );

  const getQuadrantName = (quadrant) => {
    switch (quadrant) {
      case 1: return 'Important & Urgent';
      case 2: return 'Important & Not Urgent';
      case 3: return 'Not Important & Urgent';
      case 4: return 'Not Important & Not Urgent';
      default: return 'Unassigned';
    }
  };

  const getQuadrantColor = (quadrant) => {
    switch (quadrant) {
      case 1: return '#ffcdd2';
      case 2: return '#c8e6c9';
      case 3: return '#fff9c4';
      case 4: return '#bbdefb';
      default: return '#ffffff';
    }
  };

  const renderQuadrant = (quadrantNumber) => {
    const quadrantTasks = tasks.filter(task => task.quadrant === quadrantNumber);
    return (
      <Paper
        elevation={2}
        sx={{
          p: 2,
          height: '100%',
          backgroundColor: getQuadrantColor(quadrantNumber),
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Typography variant="subtitle2" align="center" gutterBottom>
          {getQuadrantName(quadrantNumber)}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {quadrantTasks.map(task => renderTaskBubble(task))}
        </Box>
      </Paper>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Grid2 container spacing={2} >
          <Grid2 size={6}>
            {renderQuadrant(1)}
          </Grid2>
          <Grid2 size={6}>
            {renderQuadrant(2)}
          </Grid2>
        </Grid2>
        <Grid2 container spacing={2} rowSpacing={2}>
          <Grid2 size={6}>
            {renderQuadrant(3)}
          </Grid2>
          <Grid2 size={6}>
            {renderQuadrant(4)}
          </Grid2>
        </Grid2>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setNewTaskModal(true)}
          sx={{ mb: 2 }}
        >
          Add Task
        </Button>

        {/* Unassigned Tasks */}
        <Box>
          {tasks
            .filter(task => task.quadrant === null)
            .map(task => (
              <Card key={task.id} sx={{ mb: 1 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">{task.name}</Typography>
                    <Box>
                      {[1, 2, 3, 4].map(quadrant => (
                        <IconButton
                          key={quadrant}
                          size="small"
                          onClick={() => assignToQuadrant(task.id, quadrant)}
                          sx={{ 
                            bgcolor: getQuadrantColor(quadrant),
                            mr: 0.5,
                            '&:hover': { bgcolor: getQuadrantColor(quadrant) }
                          }}
                        >
                          {quadrant}
                        </IconButton>
                      ))}
                    </Box>
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    {task.dueBy && (
                      <Typography variant="body2" color="text.secondary">
                        Due: {new Date(task.dueBy).toLocaleDateString()}
                      </Typography>
                    )}
                    {task.estimatedTime && (
                      <Typography variant="body2" color="text.secondary">
                        Est. Time: {task.estimatedTime} mins
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
        </Box>

        {/* New Task Modal */}
        <Dialog 
          open={newTaskModal} 
          onClose={() => setNewTaskModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add New Task</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Task Name"
              fullWidth
              value={newTask.name}
              onChange={(e) => setNewTask({...newTask, name: e.target.value})}
              sx={{ mb: 2 }}
            />
            <DatePicker
              label="Due Date (Optional)"
              value={newTask.dueBy}
              onChange={(date) => setNewTask({...newTask, dueBy: date})}
              renderInput={(params) => <TextField {...params} fullWidth />}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Estimated Time (minutes)"
              fullWidth
              type="number"
              value={newTask.estimatedTime}
              onChange={(e) => setNewTask({...newTask, estimatedTime: e.target.value})}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNewTaskModal(false)}>Cancel</Button>
            <Button onClick={addTask} variant="contained">Add Task</Button>
          </DialogActions>
        </Dialog>

        {/* Task Detail Modal */}
        <Dialog 
          open={taskDetailModal} 
          onClose={() => setTaskDetailModal(false)}
          maxWidth="sm"
          fullWidth
        >
          {selectedTask && (
            <>
              <DialogTitle>{selectedTask.name}</DialogTitle>
              <DialogContent>
                {selectedTask.dueBy && (
                  <Typography variant="body1" gutterBottom>
                    Due: {new Date(selectedTask.dueBy).toLocaleDateString()}
                  </Typography>
                )}
                {selectedTask.estimatedTime && (
                  <Typography variant="body1" gutterBottom>
                    Estimated Time: {selectedTask.estimatedTime} minutes
                  </Typography>
                )}
                <Typography variant="body1" gutterBottom>
                  Quadrant: {getQuadrantName(selectedTask.quadrant)}
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button
                  startIcon={<ArrowBack />}
                  onClick={() => moveToUnassigned(selectedTask.id)}
                >
                  Move to Unassigned
                </Button>
                <Button
                  startIcon={<Delete />}
                  color="error"
                  onClick={() => deleteTask(selectedTask.id)}
                >
                  Delete Task
                </Button>
                <Button onClick={() => setTaskDetailModal(false)}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}