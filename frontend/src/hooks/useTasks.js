import { useCallback, useEffect, useState } from "react";
import { ApiError, createTask as createTaskRequest, deleteTask, fetchTasks, updateTask } from "../services/api.js";

const friendlyError = (error) =>
  error instanceof ApiError ? error.message : "Something went wrong. Please try again.";

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [busyTaskIds, setBusyTaskIds] = useState(() => new Set());
  const [error, setError] = useState(null);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setTasks(await fetchTasks());
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const createTask = useCallback(async (payload) => {
    setIsCreating(true);
    setError(null);
    try {
      const task = await createTaskRequest(payload);
      setTasks((current) => [task, ...current]);
      return true;
    } catch (err) {
      setError(friendlyError(err));
      return false;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const changeTask = useCallback(async (taskId, changes) => {
    setBusyTaskIds((current) => new Set(current).add(taskId));
    setError(null);
    try {
      const updatedTask = await updateTask(taskId, changes);
      setTasks((current) => current.map((task) => (task.id === taskId ? updatedTask : task)));
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusyTaskIds((current) => {
        const next = new Set(current);
        next.delete(taskId);
        return next;
      });
    }
  }, []);

  const removeTask = useCallback(async (taskId) => {
    setBusyTaskIds((current) => new Set(current).add(taskId));
    setError(null);
    try {
      await deleteTask(taskId);
      setTasks((current) => current.filter((task) => task.id !== taskId));
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusyTaskIds((current) => {
        const next = new Set(current);
        next.delete(taskId);
        return next;
      });
    }
  }, []);

  return {
    tasks,
    isLoading,
    isCreating,
    busyTaskIds,
    error,
    loadTasks,
    createTask,
    changeTask,
    removeTask,
  };
}