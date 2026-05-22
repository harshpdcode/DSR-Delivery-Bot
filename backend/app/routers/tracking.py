"""
DSR Delivery Bot â€” WebSocket Tracking Router
Real-time robot tracking via WebSocket connections.
"""

import json
from typing import Dict, Set

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session
from app.models.delivery import Delivery
from app.models.robot import Robot

router = APIRouter(tags=["Tracking WebSocket"])

# â”€â”€ Connection Manager â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

class TrackingConnectionManager:
    """Manages WebSocket connections for live delivery tracking."""

    def __init__(self):
        self.active_connections: Dict[int, Set[WebSocket]] = {}

    async def connect(self, delivery_id: int, websocket: WebSocket):
        await websocket.accept()
        if delivery_id not in self.active_connections:
            self.active_connections[delivery_id] = set()
        self.active_connections[delivery_id].add(websocket)

    def disconnect(self, delivery_id: int, websocket: WebSocket):
        if delivery_id in self.active_connections:
            self.active_connections[delivery_id].discard(websocket)
            if not self.active_connections[delivery_id]:
                del self.active_connections[delivery_id]

    async def broadcast(self, delivery_id: int, data: dict):
        """Send tracking update to all clients watching a delivery."""
        if delivery_id in self.active_connections:
            message = json.dumps(data)
            dead = set()
            for ws in self.active_connections[delivery_id]:
                try:
                    await ws.send_text(message)
                except Exception:
                    dead.add(ws)
            for ws in dead:
                self.active_connections[delivery_id].discard(ws)


manager = TrackingConnectionManager()


@router.websocket("/ws/tracking/{delivery_id}")
async def tracking_websocket(
    websocket: WebSocket,
    delivery_id: int,
):
    """WebSocket endpoint for real-time delivery tracking."""
    await manager.connect(delivery_id, websocket)

    try:
        # Send initial delivery state
        async with async_session() as db:
            result = await db.execute(
                select(Delivery).where(Delivery.id == delivery_id)
            )
            delivery = result.scalar_one_or_none()
            if delivery:
                robot_result = await db.execute(
                    select(Robot).where(Robot.id == delivery.robot_id)
                )
                robot = robot_result.scalar_one_or_none()

                initial_data = {
                    "type": "initial",
                    "delivery_id": delivery.id,
                    "tracking_code": delivery.tracking_code,
                    "status": delivery.status.value,
                    "destination": delivery.destination_block.value if hasattr(delivery.destination_block, 'value') else str(delivery.destination_block),
                    "robot": {
                        "id": robot.id if robot else None,
                        "name": robot.name if robot else None,
                        "lat": robot.location_lat if robot else None,
                        "lng": robot.location_lng if robot else None,
                        "battery": robot.battery_level if robot else None,
                        "speed": robot.speed if robot else None,
                        "heading": robot.heading if robot else None,
                    },
                }
                await websocket.send_text(json.dumps(initial_data))

        # Listen for client messages (ping/pong, commands)
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)

            if msg.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))

    except WebSocketDisconnect:
        manager.disconnect(delivery_id, websocket)
    except Exception:
        manager.disconnect(delivery_id, websocket)


# â”€â”€ Notification WebSocket â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

class NotificationConnectionManager:
    """Manages WebSocket connections for user notifications."""

    def __init__(self):
        self.connections: Dict[int, Set[WebSocket]] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.connections:
            self.connections[user_id] = set()
        self.connections[user_id].add(websocket)

    def disconnect(self, user_id: int, websocket: WebSocket):
        if user_id in self.connections:
            self.connections[user_id].discard(websocket)

    async def send_notification(self, user_id: int, data: dict):
        if user_id in self.connections:
            message = json.dumps(data)
            for ws in self.connections[user_id]:
                try:
                    await ws.send_text(message)
                except Exception:
                    pass


notification_manager = NotificationConnectionManager()


@router.websocket("/ws/notifications/{user_id}")
async def notification_websocket(
    websocket: WebSocket,
    user_id: int,
):
    """WebSocket endpoint for real-time user notifications."""
    await notification_manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            if msg.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        notification_manager.disconnect(user_id, websocket)
    except Exception:
        notification_manager.disconnect(user_id, websocket)
