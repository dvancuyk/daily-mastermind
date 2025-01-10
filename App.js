import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";

const STORAGE_TASKS_KEY = "tasks";
const STORAGE_QUADRANTS_KEY = "quadrants";

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [quadrants, setQuadrants] = useState({
    "Important/Urgent": [],
    "Important/Not Urgent": [],
    "Not Important/Urgent": [],
    "Not Important/Not Urgent": [],
  });

  // Load tasks and quadrants from storage on mount
  useEffect(() => {
    const loadStorageData = async () => {
      const savedTasks = await AsyncStorage.getItem(STORAGE_TASKS_KEY);
      const savedQuadrants = await AsyncStorage.getItem(STORAGE_QUADRANTS_KEY);

      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedQuadrants) setQuadrants(JSON.parse(savedQuadrants));
    };

    loadStorageData();
  }, []);

  // Save tasks and quadrants to storage when they change
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(tasks));
    AsyncStorage.setItem(STORAGE_QUADRANTS_KEY, JSON.stringify(quadrants));
  }, [tasks, quadrants]);

  // Create a new task
  const handleCreateTask = () => {
    if (!newTask.trim()) {
      Alert.alert("Task name is required");
      return;
    }
    const newTaskObject = { id: Date.now(), name: newTask, quadrant: null };
    setTasks([...tasks, newTaskObject]);
    setNewTask("");
  };

  // Assign a task to a quadrant
  const handleAssignTask = (task) => {
    Alert.alert(
      "Assign Task to Quadrant",
      `Choose a quadrant for "${task.name}"`,
      [
        { text: "Important/Urgent", onPress: () => moveTaskToQuadrant(task, "Important/Urgent") },
        { text: "Important/Not Urgent", onPress: () => moveTaskToQuadrant(task, "Important/Not Urgent") },
        { text: "Not Important/Urgent", onPress: () => moveTaskToQuadrant(task, "Not Important/Urgent") },
        { text: "Not Important/Not Urgent", onPress: () => moveTaskToQuadrant(task, "Not Important/Not Urgent") },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const moveTaskToQuadrant = (task, quadrant) => {
    setQuadrants({
      ...quadrants,
      [quadrant]: [...quadrants[quadrant], task],
    });
    setTasks(tasks.filter((t) => t.id !== task.id));
  };

  return (
    <View style={styles.container}>
      {/* Eisenhower Matrix Pane */}
      <FlatList
        ListHeaderComponent={
          <View style={styles.matrixContainer}>
            {Object.keys(quadrants).map((key) => (
              <View key={key} style={styles.quadrant}>
                <Text style={styles.quadrantHeader}>{key}</Text>
                <FlatList
                  data={quadrants[key]}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => <Text style={styles.taskItem}>{item.name}</Text>}
                />
              </View>
            ))}
          </View>
        }
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskRow}>
            <Text style={styles.taskItem}>{item.name}</Text>
            <TouchableOpacity
              style={styles.assignButton}
              onPress={() => handleAssignTask(item)}
            >
              <Icon name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.addTaskContainer}>
            <TextInput
              style={styles.input}
              placeholder="New Task Name"
              value={newTask}
              onChangeText={setNewTask}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleCreateTask}>
              <Icon name="add-circle" size={40} color="#007bff" />
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  matrixContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 5,
  },
  quadrant: {
    width: "50%",
    height: 200,
    borderWidth: 1,
    borderColor: "black",
    padding: 5,
  },
  quadrantHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  taskItem: {
    fontSize: 14,
    marginVertical: 2,
  },
  taskRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "gray",
    padding: 5,
    borderRadius: 5,
    marginRight: 10,
  },
  addTaskContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    padding: 5,
  },
  addButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  assignButton: {
    backgroundColor: "#007bff",
    borderRadius: 5,
    padding: 5,
  },
});

export default App;
