import { useEffect } from "react";
import { View, Text, Button } from "react-native";
import * as Notifications from "expo-notifications";

export default function TestScreen() {
  useEffect(() => {
    const configureNotificationsAsync = async () => {
      const { granted } = await Notifications.requestPermissionsAsync();
      if (!granted) {
        console.warn("Notification permissions not granted");
        return;
      }

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    };

    configureNotificationsAsync();
  }, []);

  const sendNotification = async () => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification",
        body: "This is a test notification from the TestScreen.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5, // Trigger after 2 seconds
      }
    });
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
      }}
    >
      <Text>Test Notification</Text>
      <Button
        title="Send Notification"
        onPress={sendNotification}
      ></Button>
    </View>
  );
}