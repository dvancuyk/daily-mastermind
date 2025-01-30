import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, Button, Chip, Paper } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DataGrid } from '@mui/x-data-grid';

const MOODS = ['😊 Happy', '😢 Sad', '😐 Neutral', '😠 Angry', '😴 Tired'];

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState({
    id: Date.now(),
    text: '',
    mood: '',
    tags: [],
    date: new Date(),
  });
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    const savedEntries = localStorage.getItem('journalEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  };

  const saveEntry = () => {
    if (!currentEntry.text) return;

    const newEntries = [...entries, { ...currentEntry, id: Date.now() }];
    localStorage.setItem('journalEntries', JSON.stringify(newEntries));
    setEntries(newEntries);
    setCurrentEntry({
      id: Date.now(),
      text: '',
      mood: '',
      tags: [],
      date: new Date(),
    });
  };

  const addTag = () => {
    if (newTag && !currentEntry.tags.includes(newTag)) {
      setCurrentEntry({
        ...currentEntry,
        tags: [...currentEntry.tags, newTag],
      });
      setNewTag('');
    }
  };

  const handleTagDelete = (tagToDelete) => {
    setCurrentEntry({
      ...currentEntry,
      tags: currentEntry.tags.filter((tag) => tag !== tagToDelete),
    });
  };

  const columns = [
    { field: 'date', headerName: 'Date', width: 200, 
      valueFormatter: (params) => new Date(params.value).toLocaleString() },
    { field: 'mood', headerName: 'Mood', width: 120 },
    { field: 'text', headerName: 'Entry', width: 300 },
    { 
      field: 'tags', 
      headerName: 'Tags', 
      width: 300,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {params.value.map((tag) => (
            <Chip key={tag} label={tag} size="small" />
          ))}
        </Box>
      ),
    },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            New Journal Entry
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              How are you feeling today?
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {MOODS.map((mood) => (
                <Chip
                  key={mood}
                  label={mood}
                  onClick={() => setCurrentEntry({ ...currentEntry, mood })}
                  color={currentEntry.mood === mood ? 'primary' : 'default'}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Write your thoughts..."
            value={currentEntry.text}
            onChange={(e) => setCurrentEntry({ ...currentEntry, text: e.target.value })}
            sx={{ mb: 2 }}
          />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Tags
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                size="small"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button variant="contained" onClick={addTag}>
                Add Tag
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {currentEntry.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleTagDelete(tag)}
                />
              ))}
            </Box>
          </Box>

          <Button
            variant="contained"
            onClick={saveEntry}
            disabled={!currentEntry.text}
            sx={{ mt: 2 }}
          >
            Save Entry
          </Button>
        </Paper>

        <DataGrid
          rows={entries}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
          autoHeight
        />
      </Box>
    </LocalizationProvider>
  );
};

export default Journal;