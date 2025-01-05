import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, Button, TextInput, Alert, TouchableOpacity } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

const initialTasks = [
  { id: 1, name: "Sample Task", quadrant: null },
];

const App = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTask, setNewTask] = useState("");
  const [quadrants, setQuadrants] = useState({
    "Important/Urgent": [],
    "Important/Not Urgent": [],
    "Not Important/Urgent": [],
    "Not Important/Not Urgent": [],
  });

  // Create a new task
  const handleCreateTask = () => {
    if (!newTask.trim()) {
      Alert.alert("Task name is required");
      return;
    }
    setTasks([...tasks, { id: Date.now(), name: newTask, quadrant: null }]);
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
  <SafeAreaView style={{ flex: 1 }}>
    <View style={styles.container}>
      {/* Eisenhower Matrix Pane */}
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

      {/* Task Management Pane */}
      <View style={styles.taskPane}>
        <Text style={styles.header}>Task List</Text>
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.taskRow}>
              <Text style={styles.taskItem}>{item.name}</Text>
              <Button title="Assign" onPress={() => handleAssignTask(item)} />
            </View>
          )}
        />
        <TextInput
          style={styles.input}
          placeholder="New Task Name"
          value={newTask}
          onChangeText={setNewTask}
        />
        <Button title="Create Task" onPress={handleCreateTask} />
      </View>
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
  },
  matrixContainer: {
    flex: 4,
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 5,
  },
  quadrant: {
    width: "50%",
    height: "50%",
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
  taskPane: {
    flex: 1,
    padding: 10,
    borderLeftWidth: 1,
    borderColor: "black",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  taskRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 5,
    marginVertical: 10,
    borderRadius: 5,
  },
});

export default App;
