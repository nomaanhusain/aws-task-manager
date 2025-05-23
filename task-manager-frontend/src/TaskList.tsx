import { useEffect, useState, useRef } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { Box, Spinner, Text,
  Button, Heading,
  Table, Badge, Dialog, Portal,
  CloseButton, Presence,
  Editable
 } from "@chakra-ui/react"

import CreateTaskForm from "./components/CreateTaskForm";

type Task = {
  id: string;
  title: string;
  completion_status: string;
};
type Props = {
  refresh: number;
  onTaskCreated: () => void;
};

export default function TaskList({ onTaskCreated, refresh }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const dialogContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();

        const response = await fetch("https://uctzoa3zi9.execute-api.eu-central-1.amazonaws.com/Prod/tasks/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [refresh]);
  

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "green";
      case "in progress":
        return "blue";
      case "not started":
        return "yellow";
      default:
        return "gray";
    }
  };

  const handleTaskCreated = () => {
    onTaskCreated();
    setOpen(false);  // Close the dialog
  };

  const updateTaskTitle = async (taskId: string, newTitle: string) => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      const response = await fetch(`https://uctzoa3zi9.execute-api.eu-central-1.amazonaws.com/Prod/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTitle }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update task title");
      }
    } catch (error) {
      console.error("Error updating title:", error);
      // Optionally show toast or UI feedback
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading tasks...</Text>
      </Box>
    );
  }
  return (
    <Box p={5} borderWidth="2px" borderRadius="lg" boxShadow="md">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Heading as="h2" size="lg">
          Your Tasks
        </Heading>
        <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
          <Dialog.Trigger asChild>
            <Button variant="outline">Create New Task</Button>
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>Create New Task</Dialog.Title>
                  <Dialog.CloseTrigger asChild position="absolute" right="2" top="2">
                    <CloseButton size="sm" />
                  </Dialog.CloseTrigger>
                </Dialog.Header>
                <Dialog.Body>
                <div ref={dialogContentRef}>  {/*This is the ref for the dialog content for rendering the Combobox in the dialog box instead of parent comp*/}
                  <CreateTaskForm onTaskCreated={handleTaskCreated} containerRef={dialogContentRef} />
                </div>
                </Dialog.Body>
                <Dialog.Footer>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" />
                  </Dialog.CloseTrigger>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
          
        </Dialog.Root>
      </Box>
      {tasks.length === 0 ? (
          <Text textAlign="center" py={10} color="gray.500">
            No tasks yet. Create your first task!
          </Text>
      ) : (
      <Presence
        present={true}
        animationStyle={{ _open: "scale-fade-in", _closed: "scale-fade-out" }}
        animationDuration="moderate"
      >
        <Table.Root size="sm" interactive>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Task</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
      <Table.Body>
        {tasks.map((task) => (
          <Table.Row key={task.id}>
            <Table.Cell>
              <Editable.Root defaultValue={task.title} onValueCommit={(newTitle) => updateTaskTitle(task.id, newTitle.value)}>
              <Editable.Preview />
                <Editable.Input />
              </Editable.Root>
            </Table.Cell>
            <Table.Cell>
              <Badge colorPalette={getStatusColor(task.completion_status)}>
                {task.completion_status}
              </Badge>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
      </Table.Root>
      </Presence>
      )}
    </Box>
  );
}
