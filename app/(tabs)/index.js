import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList, TouchableOpacity, Modal, TextInput, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";

const STORAGE_TASKS_KEY = "tasks";

const HomeScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [taskDetails, setTaskDetails] = useState({ name: "", time: "", date: "" });
  const router = useRouter();

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

  const handleCreateTask = () => {
    const { name, time, date } = taskDetails;
    if (!name.trim() || !time.trim() || !date.trim()) {
      alert("All fields are required!");
      return;
    }

    const newTask = {
      id: Date.now(),
      name,
      time: `${time.trim()} hours`,
      date,
    };

    setTasks([...tasks, newTask]);
    setTaskDetails({ name: "", time: "", date: "" });
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Button title="Go to Plan" onPress={() => router.push("/plan")} />
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskRow}>
            <Text>{item.name}</Text>
            <Text>{item.time}</Text>
            <Text>{item.date}</Text>
          </View>
        )}
        ListFooterComponent={
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Icon name="add-circle" size={50} color="blue" />
          </TouchableOpacity>
        }
      />
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
            placeholder="Date (YYYY-MM-DD)"
            onChangeText={(text) => setTaskDetails({ ...taskDetails, date: text })}
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
  taskRow: { padding: 10, borderBottomWidth: 1 },
  modalContent: { flex: 1, justifyContent: "center", padding: 20 },
});

export default HomeScreen;
