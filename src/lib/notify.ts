// Notification helpers.
// Author: Hasif Ahmed (www.hasif.info)

import { notifications } from "@mantine/notifications";
import { errorMessage } from "./errors";

export function notifySuccess(message: string, title = "Done") {
  notifications.show({ color: "green", title, message });
}

export function notifyError(err: unknown, title = "Something went wrong") {
  notifications.show({ color: "red", title, message: errorMessage(err) });
}
