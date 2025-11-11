import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          // Header title shown at the top of the screen.
          // Change this value to update the header text (currently "Menu").
          title: "Menu",
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="addMenu"
        options={{
          // Use the native header/title for the add screen (restored to previous behavior)
          title: 'Add to Menu',
          headerTitleAlign: 'center',
        }}
      />
    </Stack>
  );
}