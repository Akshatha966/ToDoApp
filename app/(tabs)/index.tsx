import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Keyboard,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Task = {
  id: string;
  text: string;
  completed: boolean;
  priority: "Low" | "Medium" | "High";
};

const priorities: Task["priority"][] = ["Low", "Medium", "High"];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"All" | "Completed" | "Pending">("All");
  const [priority, setPriority] = useState<Task["priority"]>("Low");

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [tasks]);

  function addOrEditTask() {
    if (input.trim() === "") return;
    if (editId) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === editId
            ? { ...task, text: input.trim(), priority }
            : task
        )
      );
      setEditId(null);
    } else {
      setTasks((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: input.trim(),
          completed: false,
          priority,
        },
      ]);
    }
    setInput("");
    setPriority("Low");
    Keyboard.dismiss();
  }

  function toggleComplete(id: string) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

  function startEdit(task: Task) {
    setInput(task.text);
    setPriority(task.priority);
    setEditId(task.id);
    inputRef.current?.focus();
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === "All") return true;
    if (filter === "Completed") return task.completed;
    if (filter === "Pending") return !task.completed;
    return true;
  });

  function priorityColor(p: Task["priority"]) {
    switch (p) {
      case "High":
        return "#e74c3c";
      case "Medium":
        return "#f39c12";
      case "Low":
      default:
        return "#27ae60";
    }
  }

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.container}>
      <SafeAreaView style={{ flex: 1, width: "100%" }}>
        <Text style={styles.title}>🌟 ToDoList</Text>
        <Text style={styles.subtitle}>Made by Akshatha R H</Text>
        <View style={styles.inputRow}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Add or edit task..."
            value={input}
            onChangeText={setInput}
            onSubmitEditing={addOrEditTask}
            returnKeyType="done"
          />
          <TouchableOpacity onPress={addOrEditTask} style={styles.addButton}>
            <Text style={styles.addButtonText}>{editId ? "Save" : "Add"}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.priorityRow}>
          <Text style={styles.priorityLabel}>Priority:</Text>
          {priorities.map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPriority(p)}
              style={[
                styles.priorityButton,
                priority === p && {
                  backgroundColor: priorityColor(p),
                },
              ]}
            >
              <Text
                style={[
                  styles.priorityText,
                  priority === p && { color: "white", fontWeight: "bold" },
                ]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.filterRow}>
          {["All", "Completed", "Pending"].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f as any)}
              style={[
                styles.filterButton,
                filter === f && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f && { fontWeight: "bold", color: "#764ba2" },
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks here! 🎉</Text>
          </View>
        ) : (
          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item.id}
            style={{ flex: 1, marginTop: 10 }}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => (
              <Animated.View style={[styles.taskCard]}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    item.completed && styles.checkboxCompleted,
                  ]}
                  onPress={() => toggleComplete(item.id)}
                >
                  {item.completed && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onLongPress={() => startEdit(item)}
                >
                  <Text
                    style={[
                      styles.taskText,
                      item.completed && {
                        textDecorationLine: "line-through",
                        color: "#999",
                      },
                    ]}
                  >
                    {item.text}
                  </Text>
                </TouchableOpacity>
                <View
                  style={[
                    styles.priorityIndicator,
                    { backgroundColor: priorityColor(item.priority) },
                  ]}
                />
                <TouchableOpacity
                  onPress={() => deleteTask(item.id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteText}>🗑️</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "white",
    marginBottom: 5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "white",
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 20,
    fontStyle: "italic",
    opacity: 0.8,
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 30,
    fontSize: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 3,
  },
  addButton: {
    backgroundColor: "#764ba2",
    marginLeft: 10,
    paddingHorizontal: 18,
    borderRadius: 30,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  priorityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  priorityLabel: {
    color: "white",
    fontWeight: "700",
    marginRight: 10,
    fontSize: 16,
  },
  priorityButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "white",
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  priorityText: {
    color: "#333",
    fontWeight: "600",
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#ddd",
  },
  filterButtonActive: {
    backgroundColor: "white",
  },
  filterText: {
    color: "#555",
    fontWeight: "600",
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginBottom: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#764ba2",
    marginRight: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxCompleted: {
    backgroundColor: "#764ba2",
  },
  checkmark: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  taskText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 10,
  },
  deleteButton: {
    padding: 6,
  },
  deleteText: {
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  emptyText: {
    color: "white",
    fontSize: 18,
    fontStyle: "italic",
  },
});
