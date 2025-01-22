import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, FlatList, Dimensions } from 'react-native';
import { Card } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DataManager, StorageKeys } from '../../utils/storage';
import { Trash2, Move } from 'lucide-react-native';

export default function Plan() {
  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [taskDetailModalVisible, setTaskDetailModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
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

  const loadTasks = async () => {
    const savedTasks = await DataManager.getData(StorageKeys.TASKS);
    if (savedTasks) {
      setTasks(savedTasks);
    }
  };

  const getAbbreviatedName = (name) => {
    const words = name.split(' ');
    if (words.length === 1) {
      return name.substring(0, 3);
    }
    return words.map(word => word[0]).join('').substring(0, 3);
  };

  const deleteTask = async (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    const success = await DataManager.saveData(StorageKeys.TASKS, updatedTasks);
    if (success) {
      setTasks(updatedTasks);
      setTaskDetailModalVisible(false);
    }
  };

  const moveToUnassigned = async (taskId) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, quadrant: null } : task
    );
    const success = await DataManager.saveData(StorageKeys.TASKS, updatedTasks);
    if (success) {
      setTasks(updatedTasks);
      setTaskDetailModalVisible(false);
    }
  };

  const assignToQuadrant = async (taskId, quadrant) => {
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

  const renderTaskBubble = (task) => (
    <TouchableOpacity
      key={task.id}
      style={styles.taskBubble}
      onPress={() => {
        setSelectedTask(task);
        setTaskDetailModalVisible(true);
      }}
    >
      <Text style={styles.taskBubbleText}>{getAbbreviatedName(task.name)}</Text>
    </TouchableOpacity>
  );

  const renderQuadrant = (quadrantNumber) => {
    const quadrantTasks = tasks.filter(task => task.quadrant === quadrantNumber);
    return (
      <View style={[styles.matrixQuadrant, styles[`q${quadrantNumber}`]]}>
        <Text style={styles.quadrantTitle}>{getQuadrantName(quadrantNumber)}</Text>
        <View style={styles.bubbleContainer}>
          {quadrantTasks.map(task => renderTaskBubble(task))}
        </View>
      </View>
    );
  };

  const renderUnassignedTask = ({ item }) => (
    <TouchableOpacity onPress={() => setSelectedTask(item)}>
      <Card style={styles.taskCard}>
        <Card.Content>
          <View style={styles.taskHeader}>
            <Text style={styles.taskName}>{item.name}</Text>
            <View style={styles.taskActions}>
              {[1, 2, 3, 4].map(quadrant => (
                <TouchableOpacity
                  key={quadrant}
                  style={[styles.quadrantButton, styles[`q${quadrant}`]]}
                  onPress={() => assignToQuadrant(item.id, quadrant)}
                >
                  <Text style={styles.quadrantButtonText}>{quadrant}</Text>
                </TouchableOpacity>
              ))}
            </View>
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
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const getQuadrantName = (quadrant) => {
    switch (quadrant) {
      case 1: return 'Important & Urgent';
      case 2: return 'Important & Not Urgent';
      case 3: return 'Not Important & Urgent';
      case 4: return 'Not Important & Not Urgent';
      default: return 'Unassigned';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.matrix}>
        <View style={styles.matrixRow}>
          {renderQuadrant(1)}
          {renderQuadrant(2)}
        </View>
        <View style={styles.matrixRow}>
          {renderQuadrant(3)}
          {renderQuadrant(4)}
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
        renderItem={renderUnassignedTask}
        keyExtractor={item => item.id}
        style={styles.taskList}
        contentContainerStyle={styles.taskListContent}
      />

      {/* Task Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={taskDetailModalVisible}
        onRequestClose={() => setTaskDetailModalVisible(false)}
      >
        <View style={styles.modalView}>
          {selectedTask && (
            <>
              <Text style={styles.modalTitle}>{selectedTask.name}</Text>
              {selectedTask.dueBy && (
                <Text style={styles.modalText}>
                  Due: {new Date(selectedTask.dueBy).toLocaleDateString()}
                </Text>
              )}
              {selectedTask.estimatedTime && (
                <Text style={styles.modalText}>
                  Estimated Time: {selectedTask.estimatedTime} minutes
                </Text>
              )}
              <Text style={styles.modalText}>
                Quadrant: {getQuadrantName(selectedTask.quadrant)}
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.moveButton]}
                  onPress={() => moveToUnassigned(selectedTask.id)}
                >
                  <Move size={20} color="#fff" />
                  <Text style={styles.buttonText}>Move to Unassigned</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={() => deleteTask(selectedTask.id)}
                >
                  <Trash2 size={20} color="#fff" />
                  <Text style={styles.buttonText}>Delete Task</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setTaskDetailModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>

      {/* Add Task Modal */}
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
            <Text style={styles.buttonText}>Add Task</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Common
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
  },
    input: {
        width: '100%',
        padding: 10,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
    },
  // Bubbles
  bubbleContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  taskBubble: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    margin: 2,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  taskBubbleText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Quadrants
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
      borderRadius: 5,
  },
  quadrantTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: 'center',
  },
  q1: { backgroundColor: '#ffcdd2' },
  q2: { backgroundColor: '#c8e6c9' },
  q3: { backgroundColor: '#fff9c4' },
  q4: { backgroundColor: '#bbdefb' },
    quadrantButton: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    quadrantButtonText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#000',
    },
  // Buttons
  button: {
          backgroundColor: '#2196F3',
          padding: 10,
          borderRadius: 5,
          marginTop: 10,
          width: '100%',
          alignItems: 'center',
        },
    moveButton: {
      backgroundColor: '#2196F3',
    },
    deleteButton: {
      backgroundColor: '#f44336',
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold',
    },
     cancelButton: {
          backgroundColor: '#f44336',
        },
    cancelButtonText: {
        color: 'white',
      },
    closeButton: {
      marginTop: 20,
      padding: 10,
      backgroundColor: '#666',
      borderRadius: 5,
      width: '100%',
      alignItems: 'center',
    },
    closeButtonText: {
      color: 'white',
      fontWeight: 'bold',
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
  // Tasks
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
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskActions: {
    flexDirection: 'row',
    gap: 5,
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
   //Tags
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
  // Modal
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
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: 'column',
    gap: 10,
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 5,
    gap: 10,
  }
});