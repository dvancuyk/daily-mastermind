import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Drawer,
  Button, 
  TextField, 
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Checkbox,
  Divider
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ExpandMore, Plus, Trash, Clock } from 'lucide-react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const CalendarPage = () => {
  const [scheduledPlans, setScheduledPlans] = useState([]);
  const [anytimePlans, setAnytimePlans] = useState([]);
  const [donePlans, setDonePlans] = useState([]);
  const [expanded, setExpanded] = useState('scheduled');
  const [scheduledModalOpen, setScheduledModalOpen] = useState(false);
  const [anytimeModalOpen, setAnytimeModalOpen] = useState(false);
// Form states
const [newPlan, setNewPlan] = useState({
  name: '',
  time: null,
  duration: 30,
  subtasks: [],
  completed: false
});

const [newSubtask, setNewSubtask] = useState('');
const [drawerOpen, setDrawerOpen] = useState(false);
  const [existingTasks, setExistingTasks] = useState([
    { id: 1, name: 'Weekly Team Meeting', duration: 60, subtasks: ['Review sprint goals', 'Discuss blockers'] },
    { id: 2, name: 'Exercise', duration: 45, subtasks: ['Warm up', 'Main workout', 'Cool down'] },
    { id: 3, name: 'Study Session', duration: 90, subtasks: ['Review notes', 'Practice problems'] },
    // Add more template tasks as needed
  ]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskSelectionModalOpen, setTaskSelectionModalOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleTaskSelect = (task) => {
    setSelectedTask(task);
    setTaskSelectionModalOpen(true);
    setDrawerOpen(false);
  };

  const handleScheduleExistingTask = (time) => {
    if (selectedTask && time) {
      const newScheduledPlan = {
        ...selectedTask,
        time: time,
        endTime: new Date(time.getTime() + selectedTask.duration * 60000),
        subtasks: selectedTask.subtasks.map(task => ({ text: task, completed: false })),
        id: Date.now()
      };
      
      setScheduledPlans(prev => [...prev, newScheduledPlan].sort((a, b) => a.time - b.time));
      setTaskSelectionModalOpen(false);
      setSelectedTask(null);
    }
  };

  const TaskSelectionModal = () => (
    <Dialog 
      open={taskSelectionModalOpen} 
      onClose={() => setTaskSelectionModalOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Schedule "{selectedTask?.name}"</DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <TimePicker
            label="Select Time"
            onChange={(newTime) => handleScheduleExistingTask(newTime)}
            className="w-full mt-4"
          />
        </LocalizationProvider>
        
        <View className="mt-4">
          <Text className="font-semibold">Duration: {selectedTask?.duration} minutes</Text>
          <Text className="font-semibold mt-2">Subtasks:</Text>
          <View className="ml-4">
            {selectedTask?.subtasks.map((subtask, index) => (
              <Text key={index} className="mt-1">• {subtask}</Text>
            ))}
          </View>
        </View>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setTaskSelectionModalOpen(false)} color="inherit">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Get current date information
  const currentDate = new Date();
  const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
  const fullDate = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });


  // Time slots for the scheduled section
  const startTime = "12:00 AM";
  const endTime = "11:59 PM";

    // Handle opening the scheduled plan modal
    const handleOpenScheduledModal = () => {
      setScheduledModalOpen(true);
    };
  
    // Handle opening the anytime plan modal
    const handleOpenAnytimeModal = () => {
      setAnytimeModalOpen(true);
    };

      // Handle closing modals
  const handleCloseScheduledModal = () => {
    setScheduledModalOpen(false);
    // Reset form state
    setNewPlan({
      name: '',
      time: null,
      duration: 30,
      subtasks: [],
      completed: false
    });
  };

  const handleCloseAnytimeModal = () => {
    setAnytimeModalOpen(false);
    // Reset form state
    setNewPlan({
      name: '',
      time: null,
      duration: 30,
      subtasks: [],
      completed: false
    });
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setNewPlan(prev => ({
        ...prev,
        subtasks: [...prev.subtasks, { text: newSubtask.trim(), completed: false }]
      }));
      setNewSubtask('');
    }
  };

  const handleRemoveSubtask = (index) => {
    setNewPlan(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index)
    }));
  };

  const handleScheduledPlanSubmit = () => {
    if (newPlan.name && newPlan.time) {
      const endTime = new Date(newPlan.time);
      endTime.setMinutes(endTime.getMinutes() + newPlan.duration);
      
      const planToAdd = {
        ...newPlan,
        endTime,
        id: Date.now()
      };
      
      setScheduledPlans(prev => [...prev, planToAdd].sort((a, b) => a.time - b.time));
      setScheduledModalOpen(false);
      setNewPlan({
        name: '',
        time: null,
        duration: 30,
        subtasks: [],
        completed: false
      });
    }
  };

  const handleAnytimePlanSubmit = () => {
    if (newPlan.name) {
      const planToAdd = {
        ...newPlan,
        id: Date.now()
      };
      
      setAnytimePlans(prev => [...prev, planToAdd]);
      setAnytimeModalOpen(false);
      setNewPlan({
        name: '',
        time: null,
        duration: 30,
        subtasks: [],
        completed: false
      });
    }
  };

  const PlanModal = ({ open, onClose, scheduled = false }) => (
    <Dialog open={open} onClose={onClose} className="p-4">
      <DialogTitle className="text-xl font-bold">
        Add New {scheduled ? 'Scheduled' : 'Anytime'} Plan
      </DialogTitle>
      <DialogContent className="space-y-4">
        <TextField
          label="Plan Name"
          value={newPlan.name}
          onChange={(e) => setNewPlan(prev => ({ ...prev, name: e.target.value }))}
          fullWidth
          className="mb-4"
        />
        
        {scheduled && (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <TimePicker
              label="Start Time"
              value={newPlan.time}
              onChange={(newTime) => setNewPlan(prev => ({ ...prev, time: newTime }))}
              className="w-full mb-4"
            />
            <TextField
              label="Duration (minutes)"
              type="number"
              value={newPlan.duration}
              onChange={(e) => setNewPlan(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
              fullWidth
              className="mb-4"
            />
          </LocalizationProvider>
        )}
        
        <View className="space-y-2">
          <Text className="font-semibold mb-2">Subtasks</Text>
          <View className="flex-row space-x-2">
            <TextField
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              placeholder="Add a subtask"
              className="flex-1"
            />
            <IconButton onClick={handleAddSubtask} color="primary">
              <Plus size={24} />
            </IconButton>
          </View>
          
          <ScrollView className="max-h-40">
            {newPlan.subtasks.map((subtask, index) => (
              <View key={index} className="flex-row items-center justify-between p-2 bg-gray-100 rounded mb-2">
                <Text>{subtask.text}</Text>
                <IconButton onClick={() => handleRemoveSubtask(index)} color="error">
                  <Trash size={20} />
                </IconButton>
              </View>
            ))}
          </ScrollView>
        </View>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button 
          onClick={scheduled ? handleScheduledPlanSubmit : handleAnytimePlanSubmit}
          color="primary"
          variant="contained"
        >
          Add Plan
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <View className="flex-1 bg-white p-4">
      {/* Header Section */}
      <View className="items-center mb-6">
        <Text className="text-2xl font-bold">{dayOfWeek}</Text>
        <Text className="text-lg text-gray-600">{fullDate}</Text>
      </View>

      {/* Scheduled Accordion */}
  <Accordion expanded={expanded === 'scheduled'} onChange={(e, isExpanded) => setExpanded(isExpanded ? 'scheduled' : false)}>
        <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
          <Text className="text-lg font-semibold">Scheduled</Text>
        </AccordionSummary>
        <AccordionDetails>
        <Text className="text-gray-600">12:00 AM</Text>
            {scheduledPlans.length === 0 ? (
              <View className="bg-gray-100 p-3 rounded">
                <Text>No Plans Yet</Text>
              </View>
            ) : (
              scheduledPlans.map((plan) => (
                <View key={plan.id} className="bg-blue-100 p-3 rounded">
                  <Text className="font-bold">{plan.time.toLocaleTimeString()}</Text>
                  <Text>{plan.name}</Text>
                  {plan.subtasks.length > 0 && (
                    <View className="ml-4 mt-2">
                      {plan.subtasks.map((subtask, index) => (
                        <Text key={index} className="text-sm">• {subtask.text}</Text>
                      ))}
                    </View>
                  )}
                  <Text className="text-gray-600">
                    {plan.endTime.toLocaleTimeString()}
                  </Text>
                </View>
              ))
            )}
            <Text className="text-gray-600">11:59 PM</Text>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenScheduledModal}
            className="mt-4 w-full"
          >
            Add Plan
          </Button>
        </AccordionDetails>
      </Accordion>

      {/* Anytime section */}
      <Accordion expanded={expanded === 'anytime'} onChange={(e, isExpanded) => setExpanded(isExpanded ? 'anytime' : false)}>
        <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
          <Text className="text-lg font-semibold">Anytime</Text>
        </AccordionSummary>
        <AccordionDetails>
          {/* ... (previous anytime plans content) */}
          <Button
            variant="outlined"
            onClick={handleOpenAnytimeModal}
            className="mt-4 w-full"
          >
            Add New Plan
          </Button>
        </AccordionDetails>
      </Accordion>

      {/* Scheduled Plan Modal */}
      <Dialog 
        open={scheduledModalOpen} 
        onClose={handleCloseScheduledModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Scheduled Plan</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Plan Name"
            fullWidth
            value={newPlan.name}
            onChange={(e) => setNewPlan(prev => ({ ...prev, name: e.target.value }))}
            className="mb-4"
          />
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <TimePicker
              label="Start Time"
              value={newPlan.time}
              onChange={(newTime) => setNewPlan(prev => ({ ...prev, time: newTime }))}
              className="w-full mb-4"
            />
          </LocalizationProvider>
          
          <TextField
            label="Duration (minutes)"
            type="number"
            value={newPlan.duration}
            onChange={(e) => setNewPlan(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
            fullWidth
            className="mb-4"
          />
          
          {/* Subtasks section */}
          <View className="mt-4">
            <Text className="font-semibold mb-2">Subtasks</Text>
            <View className="flex flex-row space-x-2">
              <TextField
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add a subtask"
                className="flex-1"
              />
              <IconButton onClick={handleAddSubtask} color="primary">
                <Plus />
              </IconButton>
            </View>
            
            {/* Subtasks list */}
            <ScrollView className="max-h-40 mt-2">
              {newPlan.subtasks.map((subtask, index) => (
                <View key={index} className="flex flex-row items-center justify-between p-2 bg-gray-100 rounded mb-2">
                  <Text>{subtask.text}</Text>
                  <IconButton onClick={() => handleRemoveSubtask(index)} color="error">
                    <Trash />
                  </IconButton>
                </View>
              ))}
            </ScrollView>
          </View>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseScheduledModal} color="inherit">Cancel</Button>
          <Button onClick={handleScheduledPlanSubmit} color="primary" variant="contained">
            Add Plan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Anytime Plan Modal */}
      <Dialog 
        open={anytimeModalOpen} 
        onClose={handleCloseAnytimeModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Anytime Plan</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Plan Name"
            fullWidth
            value={newPlan.name}
            onChange={(e) => setNewPlan(prev => ({ ...prev, name: e.target.value }))}
            className="mb-4"
          />
          
          {/* Subtasks section */}
          <View className="mt-4">
            <Text className="font-semibold mb-2">Subtasks</Text>
            <View className="flex flex-row space-x-2">
              <TextField
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add a subtask"
                className="flex-1"
              />
              <IconButton onClick={handleAddSubtask} color="primary">
                <Plus />
              </IconButton>
            </View>
            
            {/* Subtasks list */}
            <ScrollView className="max-h-40 mt-2">
              {newPlan.subtasks.map((subtask, index) => (
                <View key={index} className="flex flex-row items-center justify-between p-2 bg-gray-100 rounded mb-2">
                  <Text>{subtask.text}</Text>
                  <IconButton onClick={() => handleRemoveSubtask(index)} color="error">
                    <Trash />
                  </IconButton>
                </View>
              ))}
            </ScrollView>
          </View>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAnytimeModal} color="inherit">Cancel</Button>
          <Button onClick={handleAnytimePlanSubmit} color="primary" variant="contained">
            Add Plan
          </Button>
        </DialogActions>
      </Dialog>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <View className="w-80">
          <View className="p-4 bg-blue-500">
            <Text className="text-xl font-bold text-white">Available Tasks</Text>
          </View>
          <List>
            {existingTasks.map((task) => (
              <React.Fragment key={task.id}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleTaskSelect(task)}>
                    <View className="flex-1">
                      <ListItemText 
                        primary={task.name}
                        secondary={
                          <View>
                            <View className="flex-row items-center">
                              <Clock size={16} className="mr-1" />
                              <Text className="text-gray-600">{task.duration} mins</Text>
                            </View>
                            <Text className="text-gray-600">
                              {task.subtasks.length} subtasks
                            </Text>
                          </View>
                        }
                      />
                    </View>
                  </ListItemButton>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </View>
      </Drawer>

      <TaskSelectionModal />
    </View>
  );
};

export default CalendarPage;