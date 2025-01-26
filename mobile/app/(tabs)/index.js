import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Button,
} from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { DataManager, StorageKeys } from '../../utils/storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Today() {
  const [schedule, setSchedule] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [quadrantTasks, setQuadrantTasks] = useState([
    { id: '1', name: 'Task 1 - Quadrant A' },
    { id: '2', name: 'Task 2 - Quadrant B' },
    { id: '3', name: 'Task 3 - Quadrant C' },
    { id: '4', name: 'Task 4 - Quadrant D' },
  ]);

  // Generate time slots from 0:00 to 23:00
  const timeSlots = Array.from({ length: 24 }, (_, i) => ({
    id: `time-${i}`,
    time: `${String(i).padStart(2, '0')}:00`,
    tasks: [],
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

  const assignTaskToTimeSlot = (timeSlotId, task) => {
    setSchedule((prevSchedule) =>
      prevSchedule.map((slot) =>
        slot.id === timeSlotId
          ? { ...slot, tasks: [...slot.tasks, task] }
          : slot
      )
    );
    setQuadrantTasks((prevTasks) =>
      prevTasks.filter((item) => item.id !== task.id)
    );
    setDrawerVisible(false);
  };

  const renderItem = ({ item, drag, isActive }) => (
    <ScaleDecorator>
      <TouchableOpacity
        activeOpacity={1}
        onLongPress={drag}
        disabled={isActive}
        style={[
          styles.timeSlot,
          { backgroundColor: isActive ? '#eee' : '#fff' },
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

  const onDragEnd = async ({ data }) => {
    setSchedule(data);
    await DataManager.saveData(StorageKeys.SCHEDULE, data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.date}>
        {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
      </Text>
      <Text style={styles.date}>
        {new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </Text>
      <Button title="Open Task Drawer" onPress={() => setDrawerVisible(true)} />
      <GestureHandlerRootView>
        <DraggableFlatList
          data={schedule}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          onDragEnd={onDragEnd}
        />
      </GestureHandlerRootView>

      {/* Drawer Modal */}
      <Modal
        visible={drawerVisible}
        animationType="slide"
        onRequestClose={() => setDrawerVisible(false)}
      >
        <View style={styles.drawerContainer}>
          <Text style={styles.drawerTitle}>Select Task to Assign</Text>
          <FlatList
            data={quadrantTasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.taskItem}
                onPress={() => assignTaskToTimeSlot(schedule[0].id, item)} // Example: assigns to the first time slot
              >
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
          <Button title="Close Drawer" onPress={() => setDrawerVisible(false)} />
        </View>
      </Modal>
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
    textAlign: 'center',
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
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  taskItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
