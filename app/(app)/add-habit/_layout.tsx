import { Stack } from 'expo-router';

export default function AddHabitLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="goal-choosing"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
