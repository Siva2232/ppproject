// src/context/TaskContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const TASK_KEY = "crm-compass-tasks-v3";

const TaskContext = createContext(undefined);

/**
 * Provider that loads / persists tasks in localStorage.
 * Exposes:
 *   - tasks
 *   - addTask
 *   - toggleTask
 *   - updateTask
 *   - deleteTask   (optional, not used in UI yet)
 */
export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);

  // ── Load from localStorage on mount ─────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(TASK_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setTasks(parsed);
        } else {
          setTasks([]);
        }
      }
    } catch (error) {
      console.error("Failed to load tasks from localStorage:", error);
      setTasks([]);
    }
  }, []);

  // ── Persist every change ───────────────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem(TASK_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error("Failed to save tasks to localStorage:", error);
    }
  }, [tasks]);

  // ── Helpers ─────────────────────────────────────────────────────────────
  const addTask = useCallback((newTask) => {
    setTasks((prev) => [newTask, ...prev]);
  }, []);

  const toggleTask = useCallback((id) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  }, []);

  const updateTask = useCallback((id, updates) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        toggleTask,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) {
    throw new Error("useTaskContext must be used within TaskProvider");
  }
  return ctx;
};