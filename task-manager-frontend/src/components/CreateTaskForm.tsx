import { useEffect, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import {
  Box,
  Button,
  Field,
  Input,
  Spinner,
} from "@chakra-ui/react";

import AssignUserCombobox from "./AssignUserComboBox";

type User = {
  user_id: string;
  username: string;
};



type Props = {
  onTaskCreated: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  currentUsername: string; // prop to pass current user ID
};

export default function CreateTaskForm({ onTaskCreated, containerRef, currentUsername }: Props) {
  const [title, setTitle] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [assigned_to, setassigned_to] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      const res = await fetch("https://uctzoa3zi9.execute-api.eu-central-1.amazonaws.com/Prod/users", {
        headers: { Authorization: token! },
      });

      const data = await res.json();
      // Filter out the current user from the list
      const filteredUsers = data.filter((user: User) => user.username !== currentUsername);
      setUsers(filteredUsers);
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();

    await fetch("https://uctzoa3zi9.execute-api.eu-central-1.amazonaws.com/Prod/tasks/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token!,
      },
      body: JSON.stringify({ title, assigned_to }),
    });

    setTitle("");
    setassigned_to([]);
    onTaskCreated();
    }finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
    <Box 
      p={6}
      borderRadius="lg" 
      boxShadow="sm"
      borderWidth="1px"
      borderColor="gray.100"
    >
      <Field.Root required>
        <Field.Label fontSize="sm" fontWeight="medium" mb={1}>
          Task Title
          <Field.RequiredIndicator color="red.500" />
        </Field.Label>
        <Input 
          placeholder="My new awesome task" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          borderRadius="md"
          size="md"
        />
      </Field.Root>

      {users.length === 0 ? (
      <Spinner size="md" />
      ) : (
      <AssignUserCombobox
        users={users}
        assigned_to={assigned_to}
        setassigned_to={setassigned_to}
        containerRef={containerRef}
      />
    )}

      <Button
        type="submit"
        mt={8}
        colorScheme="blue"
        width="full"
        size="md"
        loading={isSubmitting}
        loadingText="Creating..."
      >
        Create Task
      </Button>
    </Box>
  </form>
  );
}