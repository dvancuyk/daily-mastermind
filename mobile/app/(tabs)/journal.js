import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { DataManager, StorageKeys } from '../../utils/storage';


const MOODS = ['😊 Happy', '😢 Sad', '😐 Neutral', '😠 Angry', '😴 Tired'];

export default function Journal() {
  const [entries, setEntries] = useState([]);
   const [entry, setEntry] = useState('');
    const [selectedMood, setSelectedMood] = useState('');
    const [tags, setTags] = useState([]);
    const [newTag, setNewTag] = useState('');
  const [currentEntry, setCurrentEntry] = useState({
    text: '',
    mood: '',
    tags: [],
    date: new Date().toISOString(),
  });

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const savedEntries = await DataManager.getData(StorageKeys.JOURNAL_ENTRIES);
    if (savedEntries) {
      setEntries(savedEntries);
    }
  };

  const saveEntry = async () => {
    if (!currentEntry.text) return;

    const newEntries = [...entries, currentEntry];
    const success = await DataManager.saveData(StorageKeys.JOURNAL_ENTRIES, newEntries);

    if (success) {
      setEntries(newEntries);
      setCurrentEntry({
        text: '',
        mood: '',
        tags: [],
        date: new Date().toISOString(),
      });
    }
  };

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>

      <View style={styles.moodContainer}>
        <Text style={styles.label}>How are you feeling today?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {MOODS.map((mood) => (
            <TouchableOpacity
              key={mood}
              onPress={() => setSelectedMood(mood)}
              style={[
                styles.moodButton,
                selectedMood === mood && styles.selectedMood,
              ]}
            >
              <Text>{mood}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TextInput
        style={styles.journalInput}
        multiline
        placeholder="Write your thoughts..."
        value={entry}
        onChangeText={setEntry}
      />

      <View style={styles.tagsContainer}>
        <Text style={styles.label}>Tags</Text>
        <View style={styles.tagInput}>
          <TextInput
            value={newTag}
            onChangeText={setNewTag}
            placeholder="Add a tag"
            style={styles.tagTextInput}
          />
          <TouchableOpacity onPress={addTag} style={styles.addTagButton}>
            <Text>Add</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tagsList}>
          {tags.map((tag) => (
            <Chip
              key={tag}
              onClose={() => setTags(tags.filter((t) => t !== tag))}
              style={styles.chip}
            >
              {tag}
            </Chip>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Journal Screen Styles
  moodContainer: {
    marginBottom: 20,
  },
  moodButton: {
    padding: 10,
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedMood: {
    backgroundColor: '#e3e3e3',
  },
  journalInput: {
    height: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
  }
});