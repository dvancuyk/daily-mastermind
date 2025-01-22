import React from "react";
import { Button, View, Text, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PlanScreen = () => {
  const [tasks, setTasks] = React.useState([]);
  const router = useRouter();

  React.useEffect(() => {
    const loadTasks = async () => {
      const savedTasks = await AsyncStorage.getItem("tasks");
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    };

    loadTasks();
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const todayTasks = tasks.filter((task) => task.date === today);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tasks for Today</Text>
      {todayTasks.length > 0 ? (
        <FlatList
          data={todayTasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.taskRow}>
              <Text>{item.name}</Text>
              <Text>{item.time}</Text>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noTasks}>No tasks for today!</Text>
      )}
      <Button title="Back to Home" onPress={() => router.push("/")} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  taskRow: { padding: 10, borderBottomWidth: 1 },
  noTasks: { marginTop: 20, textAlign: "center", fontSize: 16 },
});

export default PlanScreen;
