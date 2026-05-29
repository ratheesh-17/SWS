import asyncio
from typing import Any


class NotificationBus:
    """In-process pub/sub for SSE delivery."""

    def __init__(self):
        self._subscribers: list[asyncio.Queue] = []

    def subscribe(self, queue: asyncio.Queue) -> None:
        self._subscribers.append(queue)

    def unsubscribe(self, queue: asyncio.Queue) -> None:
        self._subscribers.remove(queue)

    def publish(self, data: Any) -> None:
        for queue in list(self._subscribers):
            try:
                queue.put_nowait(data)
            except asyncio.QueueFull:
                pass


notification_bus = NotificationBus()
