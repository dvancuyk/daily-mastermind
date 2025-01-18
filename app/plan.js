import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';
import { Card } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DataManager, StorageKeys } from '../utils/storage';

export default function Plan() {
  const [tasks, setTasks] = useState([]);

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

    const updatedTasks = [...tasks, newTask];
    const success = await DataManager.saveData(StorageKeys.TASKS, updatedTasks);

    if (success) {
      setTasks(updatedTasks);
      setModalVisible(false);
      setNewTask({
        name: '',
        dueBy: new Date(),
        estimatedTime: '',
        tags: [],
        quadrant: 1,
      });
    }
  };

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
        </View>
      </Modal>
    </View>
  );
}