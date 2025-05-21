import { useEffect, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import {
  Box,
  Checkbox,
  CheckboxGroup,
  Stack,
  Text,
  Button,
  Field,
  Input,
} from "@chakra-ui/react";
// import { toaster } from "@/components/ui/toaster"
import { useToast } from "@chakra-ui/toast";

type User = {
  user_id: string;
  username: string;
};



type Props = {
  onTaskCreated: () => void;
};

export default function CreateTaskForm({ onTaskCreated }: Props) {
  const [title, setTitle] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const toast = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      const res = await fetch("https://uctzoa3zi9.execute-api.eu-central-1.amazonaws.com/Prod/users", {
        headers: { Authorization: token! },
      });

      const data = await res.json();
      console.log("Fetched users:", data);
      setUsers(data);
    };

    fetchUsers();
  }, []);

  const handleToggleAssign = (userId: string) => {
    setAssignedTo((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();

    await fetch("https://uctzoa3zi9.execute-api.eu-central-1.amazonaws.com/Prod/tasks/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token!,
      },
      body: JSON.stringify({ title, assignedTo }),
    });

    toast({
      title: "Task created",
      description: "Your task has been successfully created.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });

    setTitle("");
    setAssignedTo([]);
    onTaskCreated();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded">

    <Field.Root 
      required>
      <Field.Label>
        Task Title
        <Field.RequiredIndicator />
      </Field.Label>
      <Input placeholder="Some Awesome Task" 
        value={title}
        onChange={(e) => setTitle(e.target.value)}/>
    </Field.Root>


    <Box>
      <Text fontWeight="bold" mb={2}>Assign to:</Text>
      <CheckboxGroup value={assignedTo}>
        <Stack>
          {users.map((user) => (
            <Checkbox.Root
              key={user.user_id}
              value={user.user_id}
              checked={assignedTo.includes(user.user_id)}
              onCheckedChange={() => handleToggleAssign(user.user_id)}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>{user.username}</Checkbox.Label>
            </Checkbox.Root>
          ))}
        </Stack>
      </CheckboxGroup>
    </Box>

    <Button
      type="submit"
      mt={4}
      colorScheme="blue"
    >
      Create Task
    </Button>
    </form>
  );
}