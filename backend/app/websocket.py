import json
from datetime import date, datetime
from decimal import Decimal

from fastapi import WebSocket


class ConnectionManager:

    def __init__(self):

        self.active_connections: list[WebSocket] = []


    # =========================================================
    # Connect
    # =========================================================

    async def connect(
        self,
        websocket: WebSocket
    ):

        await websocket.accept()

        if websocket not in self.active_connections:

            self.active_connections.append(
                websocket
            )

        print(
            f"[WebSocket] Client connected. "
            f"Total connections: {len(self.active_connections)}",
            flush=True
        )


    # =========================================================
    # Disconnect
    # =========================================================

    def disconnect(
        self,
        websocket: WebSocket
    ):

        if websocket in self.active_connections:

            self.active_connections.remove(
                websocket
            )

            print(
                f"[WebSocket] Client disconnected. "
                f"Total connections: {len(self.active_connections)}",
                flush=True
            )


    # =========================================================
    # JSON Serialization
    # =========================================================

    @staticmethod
    def _json_default(value):

        if isinstance(
            value,
            datetime
        ):

            return value.isoformat()


        if isinstance(
            value,
            date
        ):

            return value.isoformat()


        if isinstance(
            value,
            Decimal
        ):

            return float(value)


        raise TypeError(
            f"Object of type "
            f"{type(value).__name__} "
            f"is not JSON serializable"
        )


    # =========================================================
    # Prepare JSON payload
    # =========================================================

    @classmethod
    def serialize(
        cls,
        message: dict
    ) -> str:

        return json.dumps(
            message,
            default=cls._json_default,
            ensure_ascii=False
        )


    # =========================================================
    # Broadcast
    # =========================================================

    async def broadcast(
        self,
        message: dict
    ):

        print(
            f"[WebSocket] Broadcasting: {message}",
            flush=True
        )

        connections = list(
            self.active_connections
        )

        print(
            f"[WebSocket] Active connections: "
            f"{len(connections)}",
            flush=True
        )


        if not connections:

            return


        # -----------------------------------------------------
        # Serialize ONCE before sending.
        # -----------------------------------------------------

        try:

            payload = self.serialize(
                message
            )

        except Exception as error:

            print(
                f"[WebSocket] Serialization failed: "
                f"{error}",
                flush=True
            )

            return


        # -----------------------------------------------------
        # Send to every client.
        # -----------------------------------------------------

        disconnected = []


        for connection in connections:

            try:

                await connection.send_text(
                    payload
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


        # -----------------------------------------------------
        # Remove dead connections.
        # -----------------------------------------------------

        for connection in disconnected:

            self.disconnect(
                connection
            )


manager = ConnectionManager()