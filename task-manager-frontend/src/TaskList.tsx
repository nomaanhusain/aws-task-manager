import { useEffect, useState, useRef } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { Box, Spinner, Text,
  Button, Heading,
  Table, Badge, Dialog, Portal,
  CloseButton, Presence,
  Editable, Flex,
  Select, createListCollection
 } from "@chakra-ui/react"

import CreateTaskForm from "./components/CreateTaskForm";
import DeleteTaskComponent from "./components/DeleteTaskComponent";

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
  // const [isStatusEditing, setIsStatusEditing] = useState(false)
  const dialogContentRef = useRef<HTMLDivElement>(null);

  const completion_optons = createListCollection({
    items: [
      { label: "Not Started", value: "not_started" },
      { label: "In Progress", value: "in_progress" },
      { label: "Completed", value: "completed" },
    ],
  })


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
      case "in_progress":
        return "blue";
      case "not_started":
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

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      const response = await fetch(
        `https://uctzoa3zi9.execute-api.eu-central-1.amazonaws.com/Prod/tasks/${taskId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ completion_status: newStatus }),
        }
      );
  
      if (!response.ok) throw new Error("Failed to update task");
  
      // Update UI state after successful update
      setTasks(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, completion_status: newStatus } : task
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // handle task deletion: update the task list in the UI
  const handleDeleteTask = (deletedId: string) => {
    setTasks(prev => prev.filter(task => task.id !== deletedId))
  }

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
            <Select.Root
              collection={completion_optons}
              defaultValue={[task.completion_status]}
              onValueChange={(e) => {handleStatusChange(task.id, e.value[0])}}
              size="sm"
              width="150px"
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                <Flex align="center" gap={2} px={2}>
                  <Box
                    w="10px"
                    h="10px"
                    borderRadius="full"
                    bg={getStatusColor(task.completion_status)}
                  />
                  <Text>{completion_optons.items.find((item) => item.value === task.completion_status)?.label}</Text>
                </Flex>
                </Select.Trigger>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {completion_optons.items.map((item) => (
                      <Select.Item item={item} key={item.value}>
                        <Badge colorPalette={getStatusColor(item.value)}>
                          {item.label}
                          </Badge>
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
            </Table.Cell>
            <Table.Cell>
              <DeleteTaskComponent taskId={task.id} onTaskDeleted={handleDeleteTask}/>
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
