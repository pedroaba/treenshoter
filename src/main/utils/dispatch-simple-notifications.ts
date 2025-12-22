import { Notification } from 'electron'

type NotificationOptions = {
  title: string
  body: string
}

export class NotificationDispatcher {
  static dispatch({ title, body }: NotificationOptions) {
    const notification = new Notification({
      title,
      body,
    })

    notification.show()
  }
}
