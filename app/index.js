import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { DragDropContext, Droppable, Draggable } from 'react-native-drag-drop';
import { DataManager, StorageKeys } from '../utils/storage';

export default function Today() {
  const [schedule, setSchedule] = useState({});

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    const savedSchedule = await DataManager.getData(StorageKeys.SCHEDULE);
    if (savedSchedule) {
      setSchedule(savedSchedule);
    }
  };

  const updateSchedule = async (newSchedule) => {
    const success = await DataManager.saveData(StorageKeys.SCHEDULE, newSchedule);
    if (success) {
      setSchedule(newSchedule);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>

      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) return;
          const { source, destination } = result;
          // Update schedule logic here
        }}
      >
        {timeSlots.map((time) => (
          <Droppable key={time} droppableId={time}>
            {(provided) => (
              <View
                ref={provided.innerRef}
                style={styles.timeSlot}
                {...provided.droppableProps}
              >
                <Text style={styles.timeText}>{time}</Text>
                {schedule[time]?.map((task, index) => (
                  <Draggable
                    key={task.id}
                    draggableId={task.id}
                    index={index}
                  >
                    {(provided) => (
                      <View
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={styles.task}
                      >
                        <Text>{task.name}</Text>
                      </View>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </View>
            )}
          </Droppable>
        ))}
      </DragDropContext>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  date: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
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
  },
  // Plan Screen Styles
  matrix: {
    height: 300,
    marginBottom: 20,
  },
  matrixRow: {
    flex: 1,
    flexDirection: 'row',
  },
  matrixQuadrant: {
    flex: 1,
    margin: 5,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  q1: { backgroundColor: '#ffcdd2' },
  q2: { backgroundColor: '#c8e6c9' },
  q3: { backgroundColor: '#fff9c4' },
  q4: { backgroundColor: '#bbdefb' },
  // Today Screen Styles
  timeSlot: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  timeText: {
    width: 60,
    fontWeight: 'bold',
  },
  task: {
    backgroundColor: '#e3e3e3',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
});b