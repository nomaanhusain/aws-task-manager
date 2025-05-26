import {
  Badge,
  Combobox,
  Box,
  Text,
  Portal,
  Wrap,
  createListCollection,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";

type User = {
  user_id: string;
  username: string;
};

type Props = {
  users: User[];
  assigned_to: string[];
  setassigned_to: (ids: string[]) => void;
  containerRef: React.RefObject<HTMLElement | null>;
}

export default function AssignUserCombobox({ users, assigned_to, setassigned_to, containerRef }: Props) {
  const [searchValue, setSearchValue] = useState("");

  const filteredUsers = useMemo(
    () =>
      users.filter((user) =>
        user.username.toLowerCase().includes(searchValue.toLowerCase())
      ),
    [users, searchValue]
  );

  const collection = useMemo(
    () =>
      createListCollection({
        items: filteredUsers.map((u) => ({ id: u.user_id, value: u.username })),
      }),
    [filteredUsers]
  );

  const handleValueChange = (details: Combobox.ValueChangeDetails) => {
    setassigned_to(details.value); // this will be an array of user_id strings
  };


  return (
    <Box mt={6}>
      <Text 
        fontWeight="medium" 
        fontSize="sm"
        mb={3}>
          Assign to
      </Text>

      

      <Combobox.Root
        collection={collection}
        multiple
        closeOnSelect={false}
        value={assigned_to}
        onValueChange={handleValueChange}
        onInputValueChange={(details) => setSearchValue(details.inputValue)}
        width="full"
      >
        <Wrap gap="2" mb={2}>
          {assigned_to.map((id) => {
            const user = users.find((u) => u.user_id === id);
            return user ? <Badge key={id}>{user.username}</Badge> : null;
          })}
        </Wrap>

        <Combobox.Control>
          <Combobox.Input placeholder="Search users..." />
          <Combobox.IndicatorGroup>
            <Combobox.Trigger />
          </Combobox.IndicatorGroup>
        </Combobox.Control>

        <Portal container={containerRef}>
          <Combobox.Positioner>
            <Combobox.Content>
              <Combobox.ItemGroup>
                {filteredUsers.length === 0 ? (
                  <Combobox.Empty>No users found</Combobox.Empty>
                ) : (
                  filteredUsers.map((user) => (
                    <Combobox.Item key={user.user_id} item={user.user_id}>
                      {user.username}
                      <Combobox.ItemIndicator />
                    </Combobox.Item>
                  ))
                )}
              </Combobox.ItemGroup>
            </Combobox.Content>
          </Combobox.Positioner>
        </Portal>
      </Combobox.Root>
    </Box>
  );
}