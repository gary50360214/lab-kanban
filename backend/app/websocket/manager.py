from fastapi import WebSocket


class ConnectionManager:
    """
    WebSocket connection lifecycle manager.

    Responsibilities:
    - Accept WebSocket connections
    - Track active connections
    - Remove disconnected connections
    - Broadcast JSON-safe messages

    Business logic should NOT be placed here.
    """

    def __init__(self):

        self.active_connections: list[WebSocket] = []


    async def connect(
        self,
        websocket: WebSocket
    ):
        """
        Accept and register a WebSocket connection.
        """

        await websocket.accept()

        self.active_connections.append(
            websocket
        )

        print(
            f"[WebSocket] Client connected. "
            f"Total connections: {len(self.active_connections)}",
            flush=True
        )


    def disconnect(
        self,
        websocket: WebSocket
    ):
        """
        Remove a WebSocket connection.
        """

        if websocket in self.active_connections:

            self.active_connections.remove(
                websocket
            )

            print(
                f"[WebSocket] Client disconnected. "
                f"Total connections: {len(self.active_connections)}",
                flush=True
            )


    async def broadcast(
        self,
        message: dict
    ):
        """
        Broadcast a JSON-safe message to all active connections.

        If a connection fails, remove it from the active list.
        """

        print(
            f"[WebSocket] Broadcasting: {message}",
            flush=True
        )

        print(
            f"[WebSocket] Active connections: "
            f"{len(self.active_connections)}",
            flush=True
        )

        disconnected = []

        # Use a copy so that disconnecting a connection
        # does not modify the list while iterating.
        for connection in list(
            self.active_connections
        ):

            try:

                await connection.send_json(
                    message
                )

                print(
                    "[WebSocket] Message sent successfully",
                    flush=True
                )

            except Exception as error:

                print(
                    f"[WebSocket] Send failed: {error}",
                    flush=True
                )

                disconnected.append(
                    connection
                )


        for connection in disconnected:

            self.disconnect(
                connection
            )


manager = ConnectionManager()
