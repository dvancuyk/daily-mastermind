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
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Add, Delete } from '@mui/icons-material';
import dayjs from 'dayjs';

const SchedulePlanner = () => {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: '',
    startTime: null,
    duration: ''
  });

  // Generate time slots for the entire day (30-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    const startOfDay = dayjs().startOf('day');
    
    for (let i = 0; i < 48; i++) { // 48 half-hour slots in a day
      const time = startOfDay.add(i * 30, 'minute');
      slots.push(time);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Helper function to calculate how many slots an event spans
  const calculateEventSpan = (startTime, duration) => {
    return Math.ceil(duration / 30); // duration in minutes divided by 30 min slots
  };

  // Helper function to determine which slot an event starts in
  const getEventStartSlot = (startTime) => {
    if (!startTime) return 0;
    const minutes = startTime.hour() * 60 + startTime.minute();
    return Math.floor(minutes / 30);
  };

  useEffect(() => {
    const savedEvents = localStorage.getItem('scheduledEvents');
    if (savedEvents) {
      const parsedEvents = JSON.parse(savedEvents);
      const eventsWithDayjs = parsedEvents.map(event => ({
        ...event,
        startTime: event.startTime ? dayjs(event.startTime) : null
      }));
      setEvents(eventsWithDayjs);
    }
  }, []);

  useEffect(() => {
    const eventsForStorage = events.map(event => ({
      ...event,
      startTime: event.startTime ? event.startTime.toISOString() : null
    }));
    localStorage.setItem('scheduledEvents', JSON.stringify(eventsForStorage));
  }, [events]);

  const handleSubmit = () => {
    if (!newEvent.name || !newEvent.startTime || !newEvent.duration) {
      return;
    }

    const newEventWithId = {
      ...newEvent,
      id: Math.random().toString(36).substr(2, 9)
    };

    const updatedEvents = [...events, newEventWithId].sort((a, b) => 
      getEventStartSlot(a.startTime) - getEventStartSlot(b.startTime)
    );
    
    setEvents(updatedEvents);
    setShowForm(false);
    setNewEvent({
      name: '',
      startTime: null,
      duration: ''
    });
  };

  const deleteEvent = (id) => {
    setEvents(events.filter(event => event.id !== id));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card sx={{ maxWidth: 800, mx: 'auto', mt: 2 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Schedule Planner
          </Typography>

          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setShowForm(true)}
            sx={{ mb: 2 }}
          >
            Add Event
          </Button>

          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: '100px 1fr',
            gap: 1,
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            height: '70vh',
            overflow: 'auto'
          }}>
            {/* Time slots column */}
            <Box sx={{ 
              borderRight: '1px solid #e0e0e0',
              backgroundColor: '#f5f5f5'
            }}>
              {timeSlots.map((time, index) => (
                <Box
                  key={index}
                  sx={{
                    height: '60px',
                    borderBottom: '1px solid #e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 1,
                    fontSize: '0.875rem'
                  }}
                >
                  {time.format('h:mm A')}
                </Box>
              ))}
            </Box>

            {/* Events column */}
            <Box sx={{ position: 'relative', backgroundColor: '#fff' }}>
              {/* Grid lines */}
              {timeSlots.map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    height: '60px',
                    borderBottom: '1px solid #e0e0e0',
                  }}
                />
              ))}

              {/* Events */}
              {events.map((event) => {
                const startSlot = getEventStartSlot(event.startTime);
                const spanSlots = calculateEventSpan(event.startTime, event.duration);
                
                return (
                  <Paper
                    key={event.id}
                    sx={{
                      position: 'absolute',
                      top: `${startSlot * 60}px`,
                      left: '8px',
                      right: '8px',
                      height: `${spanSlots * 60 - 8}px`,
                      backgroundColor: '#bbdefb',
                      padding: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      zIndex: 1
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {event.name}
                    </Typography>
                    <IconButton
                      onClick={() => deleteEvent(event.id)}
                      size="small"
                      sx={{ padding: 0.5 }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Paper>
                );
              })}
            </Box>
          </Box>

          <Dialog 
            open={showForm} 
            onClose={() => setShowForm(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              Add New Event
            </DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Event Name"
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                />
                <TimePicker
                  label="Start Time"
                  value={newEvent.startTime}
                  onChange={(newValue) => setNewEvent({...newEvent, startTime: newValue})}
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  type="number"
                  value={newEvent.duration}
                  onChange={(e) => setNewEvent({...newEvent, duration: e.target.value})}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSubmit} variant="contained">
                Save Event
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};

export default SchedulePlanner;