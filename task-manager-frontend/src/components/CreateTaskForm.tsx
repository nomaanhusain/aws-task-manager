import { useEffect, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import {
  Box,
  Button,
  Field,
  Input,
  Spinner,
} from "@chakra-ui/react";
// import { toaster } from "@/components/ui/toaster"
import { useToast } from "@chakra-ui/toast";
import AssignUserCombobox from "./AssignUserComboBox";

type User = {
  user_id: string;
  username: string;
};



type Props = {
  onTaskCreated: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
};

export default function CreateTaskForm({ onTaskCreated, containerRef }: Props) {
  const [title, setTitle] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      const res = await fetch("https://uctzoa3zi9.execute-api.eu-central-1.amazonaws.com/Prod/users", {
        headers: { Authorization: token! },
      });

      const data = await res.json();
      // console.log("Fetched users:", data);
      setUsers(data);
    };

    fetchUsers();
  }, []);

  // const handleToggleAssign = (userId: string) => {
  //   setAssignedTo((prev) =>
  //     prev.includes(userId)
  //       ? prev.filter((id) => id !== userId)
  //       : [...prev, userId]
  //   );
  // };

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
        assignedTo={assignedTo}
        setAssignedTo={setAssignedTo}
        containerRef={containerRef}
      />
    )}

      <Button
        type="submit"
        mt={8}
        colorScheme="blue"
        width="full"
        size="md"
        loading={isSubmitting} // Add this state if you want loading indicator
        loadingText="Creating..."
      >
        Create Task
      </Button>
    </Box>
  </form>
  );
}