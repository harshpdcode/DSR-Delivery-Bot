"""
DSR Go Ã¢â‚¬â€ MQTT Service
Handles robot telemetry ingestion from the MQTT broker.
"""

import json
import threading
from typing import Callable, Optional

import paho.mqtt.client as mqtt
from loguru import logger

from app.core.config import get_settings

settings = get_settings()


class MQTTService:
    """MQTT client for receiving robot telemetry and sending commands."""

    def __init__(self):
        self.client = mqtt.Client(
            client_id="dsr_go-backend",
            callback_api_version=mqtt.CallbackAPIVersion.VERSION2,
        )
        self._on_telemetry: Optional[Callable] = None
        self._on_status: Optional[Callable] = None
        self._connected = False

    def setup(
        self,
        on_telemetry: Optional[Callable] = None,
        on_status: Optional[Callable] = None,
    ):
        """Configure MQTT callbacks and connect."""
        self._on_telemetry = on_telemetry
        self._on_status = on_status

        if settings.MQTT_USERNAME:
            self.client.username_pw_set(settings.MQTT_USERNAME, settings.MQTT_PASSWORD)

        self.client.on_connect = self._on_connect
        self.client.on_message = self._on_message
        self.client.on_disconnect = self._on_disconnect

        try:
            self.client.connect(
                settings.MQTT_BROKER_HOST,
                settings.MQTT_BROKER_PORT,
                keepalive=60,
            )
            self.client.loop_start()
            logger.info(
                f"Ã°Å¸â€œÂ¡ MQTT connecting to {settings.MQTT_BROKER_HOST}:{settings.MQTT_BROKER_PORT}"
            )
        except Exception as e:
            logger.warning(f"Ã¢Å¡Â Ã¯Â¸Â MQTT connection failed: {e}")

    def _on_connect(self, client, userdata, flags, rc, properties=None):
        if rc == 0:
            self._connected = True
            logger.info("Ã¢Å“â€¦ MQTT connected")
            client.subscribe(settings.MQTT_TOPIC_TELEMETRY)
            client.subscribe(settings.MQTT_TOPIC_STATUS)
        else:
            logger.error(f"Ã¢ÂÅ’ MQTT connection failed with code: {rc}")

    def _on_disconnect(self, client, userdata, flags, rc, properties=None):
        self._connected = False
        logger.warning(f"Ã¢Å¡Â Ã¯Â¸Â MQTT disconnected (rc={rc})")

    def _on_message(self, client, userdata, msg):
        try:
            payload = json.loads(msg.payload.decode())
            topic = msg.topic

            if "telemetry" in topic and self._on_telemetry:
                self._on_telemetry(topic, payload)
            elif "status" in topic and self._on_status:
                self._on_status(topic, payload)

        except json.JSONDecodeError:
            logger.warning(f"Invalid JSON on topic {msg.topic}")
        except Exception as e:
            logger.error(f"MQTT message handler error: {e}")

    def publish_command(self, robot_id: int, command: dict):
        """Send a command to a specific robot."""
        topic = f"dsr_go/robots/{robot_id}/command"
        payload = json.dumps(command)
        self.client.publish(topic, payload, qos=1)
        logger.info(f"Ã°Å¸â€œÂ¤ Command sent to robot {robot_id}: {command.get('action')}")

    def stop(self):
        """Stop the MQTT client."""
        self.client.loop_stop()
        self.client.disconnect()
        logger.info("Ã°Å¸â€ºâ€˜ MQTT client stopped")


# Singleton
mqtt_service = MQTTService()
