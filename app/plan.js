import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, FlatList, PanResponder, Animated } from 'react-native';
import { Card } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DataManager, StorageKeys } from '../utils/storage';
import { Trash2 } from 'lucide-react-native';

export default function Plan() {
  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [pan] = useState(new Animated.ValueXY());
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

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([
      null,
      { dx: pan.x, dy: pan.y }
    ], { useNativeDriver: false }),
    onPanResponderRelease: (e, gesture) => {
      const { moveX, moveY, dx, dy } = gesture;
      const quadrant = determineQuadrant(moveX, moveY);
      if (selectedTask && quadrant) {
        updateTaskQuadrant(selectedTask.id, quadrant);
      }
      pan.setValue({ x: 0, y: 0 });
    }
  });

  const determineQuadrant = (x, y) => {
    // You'll need to adjust these values based on your layout
    const midX = width / 2;
    const midY = 200; // Height of matrix

    if (x < midX && y < midY) return 1;
    if (x >= midX && y < midY) return 2;
    if (x < midX && y >= midY) return 3;
    if (x >= midX && y >= midY) return 4;
    return null;
  };

  const loadTasks = async () => {
    const savedTasks = await DataManager.getData(StorageKeys.TASKS);
    if (savedTasks) {
      setTasks(savedTasks);
    }
  };

  const deleteTask = async (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    const success = await DataManager.saveData(StorageKeys.TASKS, updatedTasks);
    if (success) {
      setTasks(updatedTasks);
    }
  };

  const updateTaskQuadrant = async (taskId, quadrant) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, quadrant } : task
    );
    const success = await DataManager.saveData(StorageKeys.TASKS, updatedTasks);
    if (success) {
      setTasks(updatedTasks);
    }
  };

  const addTask = async () => {
    if (!newTask.name) return;

    const taskToAdd = {
      ...newTask,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };

    const updatedTasks = [...tasks, taskToAdd];
    const success = await DataManager.saveData(StorageKeys.TASKS, updatedTasks);

    if (success) {
      setTasks(updatedTasks);
      setModalVisible(false);
      setNewTask({
        id: '',
        name: '',
        dueBy: null,
        estimatedTime: '',
        tags: [],
        quadrant: null,
        createdAt: null
      });
    }
  };

  const getQuadrantName = (quadrant) => {
    switch (quadrant) {
      case 1:
        return 'Important & Urgent';
      case 2:
        return 'Important & Not Urgent';
      case 3:
        return 'Not Important & Urgent';
      case 4:
        return 'Not Important & Not Urgent';
      default:
        return 'Unassigned';
    }
  };

  const renderTask = ({ item }) => {
    const isSelected = selectedTask?.id === item.id;

    return (
      <Animated.View
        {...(isSelected ? panResponder.panHandlers : {})}
        style={[
          isSelected && {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y }
            ]
          }
        ]}
      >
        <TouchableOpacity onPress={() => setSelectedTask(item)}>
          <Card style={styles.taskCard}>
            <Card.Content>
              <View style={styles.taskHeader}>
                <Text style={styles.taskName}>{item.name}</Text>
                <TouchableOpacity onPress={() => deleteTask(item.id)}>
                  <Trash2 size={20} color="#666" />
                </TouchableOpacity>
              </View>
              <View style={styles.taskDetails}>
                {item.dueBy && (
                  <Text style={styles.taskDueDate}>
                    Due: {new Date(item.dueBy).toLocaleDateString()}
                  </Text>
                )}
                {item.estimatedTime && (
                  <Text style={styles.taskTime}>
                    Est. Time: {item.estimatedTime} mins
                  </Text>
                )}
                <Text style={styles.taskQuadrant}>
                  {getQuadrantName(item.quadrant)}
                </Text>
              </View>
              {item.tags.length > 0 && (
                <View style={styles.tagContainer}>
                  {item.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderQuadrantTasks = (quadrant) => {
    const quadrantTasks = tasks.filter(task => task.quadrant === quadrant);
    return (
      <FlatList
        data={quadrantTasks}
        renderItem={renderTask}
        keyExtractor={item => item.id}
        style={styles.quadrantList}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.matrix}>
        <View style={styles.matrixRow}>
          <View style={[styles.matrixQuadrant, styles.q1]}>
            <Text>Important & Urgent</Text>
            {renderQuadrantTasks(1)}
          </View>
          <View style={[styles.matrixQuadrant, styles.q2]}>
            <Text>Important & Not Urgent</Text>
            {renderQuadrantTasks(2)}
          </View>
        </View>
        <View style={styles.matrixRow}>
          <View style={[styles.matrixQuadrant, styles.q3]}>
            <Text>Not Important & Urgent</Text>
            {renderQuadrantTasks(3)}
          </View>
          <View style={[styles.matrixQuadrant, styles.q4]}>
            <Text>Not Important & Not Urgent</Text>
            {renderQuadrantTasks(4)}
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Add Task</Text>
      </TouchableOpacity>

      <FlatList
        data={tasks.filter(task => task.quadrant === null)}
        renderItem={renderTask}
        keyExtractor={item => item.id}
        style={styles.taskList}
        contentContainerStyle={styles.taskListContent}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <TextInput
            style={styles.input}
            placeholder="Task Name*"
            value={newTask.name}
            onChangeText={(text) => setNewTask({...newTask, name: text})}
          />
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>
              {newTask.dueBy
                ? `Due: ${new Date(newTask.dueBy).toLocaleDateString()}`
                : 'Set Due Date (Optional)'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={newTask.dueBy || new Date()}
              mode="date"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) {
                  setNewTask({...newTask, dueBy: date});
                }
              }}
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="Estimated Time (minutes)"
            value={newTask.estimatedTime}
            onChangeText={(text) => setNewTask({...newTask, estimatedTime: text})}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.button} onPress={addTask}>
            <Text>Add Task</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... existing styles ...
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  dateButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  quadrantList: {
    flex: 1,
    width: '100%',
  },
  // ... rest of existing styles ...
});