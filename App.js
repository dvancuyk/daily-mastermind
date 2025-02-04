import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Button,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import { signInWithGoogle, fetchTasksFromGoogleKeep } from "./GoogleKeepImport";
import { Menu, MenuItem } from "react-native-material-menu";

const STORAGE_TASKS_KEY = "tasks";

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [taskDetails, setTaskDetails] = useState({ name: "", time: "", tags: "" });
  const [authToken, setAuthToken] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    const loadStorageData = async () => {
      const savedTasks = await AsyncStorage.getItem(STORAGE_TASKS_KEY);
      if (savedTasks) setTasks(JSON.parse(savedTasks));
    };

    loadStorageData();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const handleImportTasks = async () => {
    try {
      if (!authToken) {
        const token = await signInWithGoogle();
        setAuthToken(token);
      }

      const importedTasks = await fetchTasksFromGoogleKeep(authToken);
      setTasks((prevTasks) => [...prevTasks, ...importedTasks]);
    } catch (error) {
      Alert.alert("Error importing tasks", error.message);
    }
  };

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

  return (
    <View style={styles.container}>
      {/* Header with Menu */}
      <View style={styles.header}>
        <Menu
          visible={menuVisible}
          anchor={
            <TouchableOpacity onPress={() => setMenuVisible(true)}>
              <Icon name="menu" size={30} color="black" />
            </TouchableOpacity>
          }
          onRequestClose={() => setMenuVisible(false)}
        >
          <MenuItem onPress={handleImportTasks}>Import from Google Keep</MenuItem>
        </Menu>
        <Text style={styles.title}>Mastermind</Text>
      </View>

      {/* Task List */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskRow}>
            <Text>{item.name}</Text>
            <Text>{item.time}</Text>
            <Text>{item.tags.join(", ")}</Text>
          </View>
        )}
        ListFooterComponent={
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Icon name="add-circle" size={50} color="blue" />
          </TouchableOpacity>
        }
      />

      {/* Add Task Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <TextInput
            placeholder="Task Name"
            onChangeText={(text) => setTaskDetails({ ...taskDetails, name: text })}
          />
          <TextInput
            placeholder="Time (in hours)"
            keyboardType="numeric"
            onChangeText={(text) => setTaskDetails({ ...taskDetails, time: text })}
          />
          <TextInput
            placeholder="Tags (comma-separated)"
            onChangeText={(text) => setTaskDetails({ ...taskDetails, tags: text })}
          />
          <Button title="Add Task" onPress={handleCreateTask} />
          <Button title="Close" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: { fontSize: 20, fontWeight: "bold" },
  taskRow: { padding: 10, borderBottomWidth: 1 },
  modalContent: { flex: 1, justifyContent: "center", padding: 20 },
});

export default App;
