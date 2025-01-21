import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, FlatList } from 'react-native';
import { Card } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DataManager, StorageKeys } from '../utils/storage';

export default function Plan() {
  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTask, setNewTask] = useState({
    id: '',
    name: '',
    dueBy: new Date(),
    estimatedTime: '',
    tags: [],
    quadrant: 1, // 1: Important & Urgent, 2: Important & Not Urgent, 3: Not Important & Urgent, 4: Not Important & Not Urgent
    createdAt: null
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const savedTasks = await DataManager.getData(StorageKeys.TASKS);
    if (savedTasks) {
      setTasks(savedTasks);
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
        dueBy: new Date(),
        estimatedTime: '',
        tags: [],
        quadrant: 1,
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
        return 'Unclassified';
    }
  };

  const renderTask = ({ item }) => (
    <Card style={styles.taskCard}>
      <Card.Content>
        <Text style={styles.taskName}>{item.name}</Text>
        <View style={styles.taskDetails}>
          <Text style={styles.taskDueDate}>
            Due: {new Date(item.dueBy).toLocaleDateString()}
          </Text>
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
  );

  return (
    <View style={styles.container}>
      <View style={styles.matrix}>
        <View style={styles.matrixRow}>
          <TouchableOpacity
            style={[styles.matrixQuadrant, styles.q1]}
            onPress={() => setNewTask({...newTask, quadrant: 1})}
          >
            <Text>Important & Urgent</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.matrixQuadrant, styles.q2]}
            onPress={() => setNewTask({...newTask, quadrant: 2})}
          >
            <Text>Important & Not Urgent</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.matrixRow}>
          <TouchableOpacity
            style={[styles.matrixQuadrant, styles.q3]}
            onPress={() => setNewTask({...newTask, quadrant: 3})}
          >
            <Text>Not Important & Urgent</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.matrixQuadrant, styles.q4]}
            onPress={() => setNewTask({...newTask, quadrant: 4})}
          >
            <Text>Not Important & Not Urgent</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Add Task</Text>
      </TouchableOpacity>

      <FlatList
        data={tasks}
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
          <DateTimePicker
            value={newTask.dueBy}
            mode="date"
            onChange={(event, date) => setNewTask({...newTask, dueBy: date})}
          />
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
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
  },
  matrix: {
    height: 200,
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
  addButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  taskList: {
    flex: 1,
  },
  taskListContent: {
    paddingBottom: 20,
  },
  taskCard: {
    marginBottom: 10,
    elevation: 2,
  },
  taskName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  taskDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  taskDueDate: {
    color: '#666',
    fontSize: 12,
  },
  taskTime: {
    color: '#666',
    fontSize: 12,
  },
  taskQuadrant: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  tag: {
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 5,
    marginBottom: 5,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  cancelButtonText: {
    color: 'white',
  }
});