import { Alert, List } from "@mantine/core";

export function ErrorAlert({ message, details = [] }: { message: string | null; details?: string[] }) {
  if (!message) return null;
  return (
    <Alert role="alert" color="red" variant="light">
      {message}
      {details.length > 0 && (
        <List size="sm" mt={4}>
          {details.map((d) => (
            <List.Item key={d}>{d}</List.Item>
          ))}
        </List>
      )}
    </Alert>
  );
}

export function SuccessAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <Alert role="status" color="green" variant="light">
      {message}
    </Alert>
  );
}
