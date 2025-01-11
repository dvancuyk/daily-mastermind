import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import DropDownPicker from "react-native-dropdown-picker";

const STORAGE_TASKS_KEY = "tasks";
const STORAGE_QUADRANTS_KEY = "quadrants";

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [quadrants, setQuadrants] = useState({
    "Important/Urgent": [],
    "Important/Not Urgent": [],
    "Not Important/Urgent": [],
    "Not Important/Not Urgent": [],
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [taskDetails, setTaskDetails] = useState({ name: "", time: "", tags: "" });

  // Dropdown menu state
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
  ]);

  useEffect(() => {
    const loadStorageData = async () => {
      const savedTasks = await AsyncStorage.getItem(STORAGE_TASKS_KEY);
      const savedQuadrants = await AsyncStorage.getItem(STORAGE_QUADRANTS_KEY);

      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedQuadrants) setQuadrants(JSON.parse(savedQuadrants));
    };

    loadStorageData();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(tasks));
    AsyncStorage.setItem(STORAGE_QUADRANTS_KEY, JSON.stringify(quadrants));
  }, [tasks, quadrants]);

  const handleCreateTask = () => {
    const { name, time, tags } = taskDetails;
    if (!name.trim() || !time.trim()) {
      Alert.alert("Both name and time are required");
      return;
    }

    const newTask = {
      id: Date.now(),
      name: name.trim(),
      time: `${time.trim()} hours`,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
    };

    setTasks([...tasks, newTask]);
    setTaskDetails({ name: "", time: "", tags: "" });
    setModalVisible(false);
  };

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
      {/* Master Layout */}
      <View style={styles.header}>
        <TouchableOpacity>
          <DropDownPicker
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setItems}
            style={styles.dropdown}
            placeholder="Menu"
          />
        </TouchableOpacity>
        <Text style={styles.title}>Mastermind</Text>
      </View>

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
                  renderItem={({ item }) => (
                    <Text style={styles.taskItem}>
                      {item.name} ({item.time})
                    </Text>
                  )}
                />
              </View>
            ))}
          </View>
        }
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskRow}>
            <View>
              <Text style={styles.taskItem}>{item.name}</Text>
              <Text style={styles.taskDetail}>Time: {item.time}</Text>
              <Text style={styles.taskDetail}>
                Tags: {item.tags.length ? item.tags.join(", ") : "None"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.assignButton}
              onPress={() => handleAssignTask(item)}
            >
              <Icon name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Icon name="add-circle" size={40} color="#007bff" />
          </TouchableOpacity>
        }
      />

      {/* Add Task Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Task</Text>
            <TextInput
              style={styles.input}
              placeholder="Task Name"
              value={taskDetails.name}
              onChangeText={(text) => setTaskDetails({ ...taskDetails, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Time (in hours)"
              keyboardType="numeric"
              value={taskDetails.time}
              onChangeText={(text) => setTaskDetails({ ...taskDetails, time: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Tags (comma-separated)"
              value={taskDetails.tags}
              onChangeText={(text) => setTaskDetails({ ...taskDetails, tags: text })}
            />
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
              <Button title="Add Task" onPress={handleCreateTask} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#007bff",
  },
  dropdown: { width: 150, zIndex: 1000 },
  title: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  matrixContainer: { flexDirection: "row", flexWrap: "wrap", padding: 5 },
  quadrant: { width: "50%", height: 200, borderWidth: 1, borderColor: "black", padding: 5 },
  quadrantHeader: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  taskItem: { fontSize: 14, fontWeight: "bold" },
  taskDetail: { fontSize: 12, color: "gray" },
  taskRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 5 },
  addButton: { alignItems: "center", marginVertical: 20 },
  assignButton: { backgroundColor: "#007bff", borderRadius: 5, padding: 5 },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: "white", padding: 20, borderRadius: 10, width: "80%" },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "gray", padding: 10, borderRadius: 5, marginBottom: 10 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
});

export default App;
