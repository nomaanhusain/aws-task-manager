import { useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import {
    Button
  } from "@chakra-ui/react"

import { LuTrash2 } from "react-icons/lu"

type Props = {
    taskId: string;
    onTaskDeleted: (id: string) => void; //callback for parent component
}

export default function DeleteTaskComponent({ taskId, onTaskDeleted }: Props) {

    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            const session = await fetchAuthSession();
            const token = session.tokens?.idToken?.toString();

            const response = await fetch(`https://uctzoa3zi9.execute-api.eu-central-1.amazonaws.com/Prod/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok){
                onTaskDeleted(taskId); // Notify parent component of successful deletion
            }

            if (!response.ok) {
                throw new Error('Failed to delete task');
            }
        } catch (error) {
            console.error("Failed to delete task:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button variant="outline" size="sm" onClick={handleDelete} loading={loading} colorPalette="red">
                <LuTrash2 />
        </Button>
        
    );
}