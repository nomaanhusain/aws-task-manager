import { useState } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import TaskList from "./TaskList";
import { Button, Box, Text, Flex } from "@chakra-ui/react"


function App() {
  const [refreshFlag, setRefreshFlag] = useState(0);
  const handleTaskCreated = () => {
    setRefreshFlag(prev => prev + 1);
  };

  return (
    <Authenticator>
      {({ signOut, user}) => (
        <Box minH="100vh">
          {/* Top Navbar */}
          <Flex
            as="header"
            boxShadow="sm"
            px={2}
            py={4}
            align="center"
            justify="space-between"
          >
            <Text fontSize="lg" fontWeight="bold">
              Hello, {user?.signInDetails?.loginId}
            </Text>
            <Button colorScheme="red" onClick={signOut}>
              Sign Out
            </Button>
          </Flex>

          {/* Main Content */}
          <Box mx="auto" p={6}>
            <TaskList
              refresh={refreshFlag}
              onTaskCreated={handleTaskCreated}
              displayName={user?.signInDetails?.loginId || "defaultUser@xyz.com"}
            />
          </Box>
        </Box>
      )}
</Authenticator>
  );
}

export default App;
