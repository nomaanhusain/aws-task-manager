import { useEffect, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { Authenticator } from "@aws-amplify/ui-react";
// import "@aws-amplify/ui-react/styles.css";
// import CreateTaskForm from "./components/CreateTaskForm";
import TaskList from "./TaskList";
import { Button } from "@chakra-ui/react"

function App() {
  const [displayName, setDisplayName] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(0);
  const handleTaskCreated = () => {
    setRefreshFlag(prev => prev + 1);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      const res = await fetch(
        "https://uctzoa3zi9.execute-api.eu-central-1.amazonaws.com/Prod/me",
        {
          headers: {
            Authorization: token!,
          },
        }
      );

      const data = await res.json();
      setDisplayName(data.username || data.nickname || "User");
    };

    fetchUser();
  }, []);

  return (
    <Authenticator>
      {({ signOut }) => (
        <main className="p-6 font-sans max-w-xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Hello, {displayName}</h1>

          <TaskList 
            refresh={refreshFlag}
            onTaskCreated={handleTaskCreated}
          />

          <Button
            onClick={signOut}
            className="bg-red-500 text-white px-4 py-2 rounded mt-4"
          >
            Sign Out
          </Button>
        </main>
      )}
    </Authenticator>
  );
}

export default App;
