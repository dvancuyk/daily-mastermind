import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { DataManager, StorageKeys } from '../utils/storage';

export default function Today() {
  const [schedule, setSchedule] = useState([]);

  // Generate time slots from 0:00 to 23:00
  const timeSlots = Array.from({ length: 24 }, (_, i) => ({
    id: `time-${i}`,
    time: `${String(i).padStart(2, '0')}:00`,
    tasks: []
  }));

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    const savedSchedule = await DataManager.getData(StorageKeys.SCHEDULE);
    if (savedSchedule) {
      setSchedule(savedSchedule);
    } else {
      setSchedule(timeSlots);
    }
  };

  const renderItem = ({ item, drag, isActive }) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          activeOpacity={1}
          onLongPress={drag}
          disabled={isActive}
          style={[
            styles.timeSlot,
            { backgroundColor: isActive ? '#eee' : '#fff' }
          ]}
        >
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
          <View style={styles.taskContainer}>
            {item.tasks.map((task, index) => (
              <View key={index} style={styles.task}>
                <Text>{task.name}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  const onDragEnd = async ({ data }) => {
    setSchedule(data);
    await DataManager.saveData(StorageKeys.SCHEDULE, data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
      <DraggableFlatList
        data={schedule}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onDragEnd={onDragEnd}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  date: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  timeSlot: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  timeContainer: {
    width: 60,
  },
  timeText: {
    fontWeight: 'bold',
  },
  taskContainer: {
    flex: 1,
    marginLeft: 10,
  },
  task: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  }
});