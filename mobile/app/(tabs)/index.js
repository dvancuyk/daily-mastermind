import React from 'react';
import { 
  Box,
  Checkbox,
  Typography,
  IconButton,
  Button,
  Avatar,
  Paper
} from '@mui/material';
import { duration, styled } from '@mui/material/styles';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent, { timelineOppositeContentClasses, } from '@mui/lab/TimelineOppositeContent';
import { TimelineDot } from '@mui/lab';
import { Add, CalendarMonth, CheckCircle, CircleOutlined } from '@mui/icons-material';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';


const ScheduleView = () => {
  const events = [
    { id: 1, title: 'Read AI paper', time: '10:00 AM', duration: '1 hour' },
    { id: 2, title: 'Meeting with PM', time: '11:00 AM', duration: '30 minutes' },
    { id: 3, title: 'Lunch with friends', time: '12:00 PM', duration: '1 hour' },
    { id: 4, title: 'Gym', time: '2:00 PM', duration: '1 hour' },
  ];

  return (
    <Paper 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        bgcolor: 'grey.50'
      }}
    >
      <Box>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 2, 
          pb: 1,
          justifyContent: 'space-between' 
        }}>
          <Box sx={{ width: 48, display: 'flex', alignItems: 'center' }}>
            <Avatar
              src="https://cdn.usegalileo.ai/sdxl10/baeed253-7290-4d5e-bd89-359c24a74e22.png"
              sx={{ width: 32, height: 32 }}
            />
          </Box>
          <Typography
            variant="h6"
            sx={{
              flex: 1,
              textAlign: 'center',
              fontWeight: 700,
              letterSpacing: '-0.015em'
            }}
          >
            Good Morning, Jess
          </Typography>
          <Box sx={{ width: 48, display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton>
              <CalendarMonth />
            </IconButton>
          </Box>
        </Box>

        {/* Today Section */}
        <Typography
          variant="h5"
          sx={{
            px: 2,
            pb: 1.5,
            pt: 2.5,
            fontWeight: 700,
            letterSpacing: '-0.015em'
          }}
        >
          Today
        </Typography>

        {/* Timeline Events */}
        <Timeline
          sx={{
            [`& .${timelineOppositeContentClasses.root}`]: {
              flex: 0.2,
            },
          }}
        >
          <TimelineItem>
            <TimelineOppositeContent
              sx={{ m: 'auto 0' }}
              align="right"
              variant="body2"
              color="text.secondary">
            12:00 AM
            </TimelineOppositeContent>
            <TimelineSeparator>
          <TimelineDot />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent sx={{ py: '12px', px: 2 }}>
          </TimelineContent>
          </TimelineItem>
          {events.map((event, index) => (
            <TimelineItem key={event.id}>
              <TimelineOppositeContent
                        sx={{ m: 'auto 0' }}
                        align="right"
                        variant="body2"
                        color="text.secondary">
                {event.time}
              </TimelineOppositeContent>
              <TimelineSeparator>
          <TimelineConnector />
          <TimelineDot />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent sx={{ py: '12px', px: 2 }}>
          <Typography variant="h6" component="span">
            {event.title}
            <Checkbox icon={<CircleOutlined />} checkedIcon={<CheckCircle />} />
          </Typography>
          <Typography>{event.duration}</Typography>
        </TimelineContent>
      </TimelineItem>
          ))}
          <TimelineItem>
              <TimelineOppositeContent
                        sx={{ m: 'auto 0' }}
                        align="right"
                        variant="body2"
                        color="text.secondary">
                11:59 PM
              </TimelineOppositeContent>
              <TimelineSeparator>
          <TimelineConnector />
          <TimelineDot />
            </TimelineSeparator>
            <TimelineContent sx={{ py: '12px', px: 2 }}>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      </Box>

    </Paper>
  );
};

export default ScheduleView;