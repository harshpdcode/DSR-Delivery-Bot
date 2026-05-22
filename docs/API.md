# DSR Delivery Bot â€” API Reference Documentation

This document contains a comprehensive description of the API endpoints, schemas, WebSockets, and MQTT topics exposed by the **DSR Delivery Bot (Smart Autonomous Campus Delivery Robot Platform)** backend.

All REST endpoints (except WebSockets) are prefixed with `/api/v1` in production.

---

## ðŸ” 1. Authentication Router (`/api/v1/auth`)

These endpoints govern user registration, session establishment, and profile retrieval.

### POST `/register`
Creates a new user profile in the database.
*   **Request Body**:
    ```json
    {
      "email": "user@silveroakuni.ac.in",
      "password": "strongpassword123",
      "full_name": "Harsh Patel",
      "phone": "+919876543210"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "email": "user@silveroakuni.ac.in",
      "full_name": "Harsh Patel",
      "phone": "+919876543210",
      "role": "user",
      "avatar_url": null,
      "is_active": true,
      "is_verified": false,
      "created_at": "2026-05-22T13:56:00Z"
    }
    ```

### POST `/login`
Exchanges user credentials for an Access Token (JWT) and a Refresh Token.
*   **Request Body** (Form Data):
    *   `username`: `user@silveroakuni.ac.in`
    *   `password`: `strongpassword123`
*   **Response (200 OK)**:
    ```json
    {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "token_type": "bearer"
    }
    ```

### POST `/refresh`
Obtains a new access token using a valid refresh token.
*   **Request Body**:
    ```json
    {
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "token_type": "bearer"
    }
    ```

### GET `/me`
Retrieves details of the currently authenticated user session.
*   **Headers**: `Authorization: Bearer <access_token>`
*   **Response (200 OK)**:
    ```json
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "email": "user@silveroakuni.ac.in",
      "full_name": "Harsh Patel",
      "phone": "+919876543210",
      "role": "user",
      "avatar_url": null,
      "is_active": true,
      "is_verified": false,
      "created_at": "2026-05-22T13:56:00Z"
    }
    ```

---

## ðŸ¤– 2. Robot Management Router (`/api/v1/robots`)

Allows operators, administrators, and general users to search, inspect, and modify robot status and sensor telemetry.

### GET `/`
Lists all delivery robots on the campus.
*   **Query Parameters**:
    *   `status_filter` (Optional): Filter by `idle`, `en_route`, `delivering`, `charging`, `maintenance`, `offline`.
*   **Response (200 OK)**:
    ```json
    [
      {
        "id": "a671bd41-11d2-43cf-ac5c-9c7163c482cc",
        "name": "Robo-Express A1",
        "serial_number": "SOU-DSR-001",
        "status": "idle",
        "battery_level": 92.5,
        "location_lat": 23.0768,
        "location_lng": 72.5350,
        "heading": 180.0,
        "speed": 0.0,
        "firmware_version": "1.2.4",
        "payload_capacity_kg": 15.0,
        "model_type": "DSR-v2-Cargo",
        "last_maintenance": "2026-05-10T08:00:00Z"
      }
    ]
    ```

### GET `/{robot_id}`
Returns granular info for a single robot unit.
*   **Response (200 OK)**:
    ```json
    {
      "id": "a671bd41-11d2-43cf-ac5c-9c7163c482cc",
      "name": "Robo-Express A1",
      "serial_number": "SOU-DSR-001",
      "status": "idle",
      "battery_level": 92.5,
      "location_lat": 23.0768,
      "location_lng": 72.5350,
      "heading": 180.0,
      "speed": 0.0,
      "firmware_version": "1.2.4",
      "payload_capacity_kg": 15.0,
      "model_type": "DSR-v2-Cargo",
      "last_maintenance": "2026-05-10T08:00:00Z"
    }
    ```

### PUT `/{robot_id}/status`
Overwrites the current status of the robot (Operator or Maintenance role required).
*   **Request Body**:
    ```json
    {
      "status": "maintenance",
      "error_message": "Lidar recalibration required"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "id": "a671bd41-11d2-43cf-ac5c-9c7163c482cc",
      "status": "maintenance",
      "error_message": "Lidar recalibration required"
    }
    ```

### GET `/{robot_id}/health`
Fetches a list of physical sensor health values (Lidar, GPS, Cameras, IMU, Battery Temp).
*   **Response (200 OK)**:
    ```json
    [
      {
        "sensor_name": "Lidar System",
        "status": "healthy",
        "value": 98.4,
        "unit": "% accuracy",
        "message": "Full field clear",
        "recorded_at": "2026-05-22T13:45:00Z"
      },
      {
        "sensor_name": "Battery Temperature",
        "status": "healthy",
        "value": 34.2,
        "unit": "Â°C",
        "message": "Optimal operating temperature",
        "recorded_at": "2026-05-22T13:45:00Z"
      }
    ]
    ```

### GET `/{robot_id}/telemetry`
Returns historical coordinate logging for path mapping.
*   **Query Parameters**:
    *   `limit` (Optional): Default 100, maximum 500.
*   **Response (200 OK)**:
    ```json
    [
      {
        "latitude": 23.0768,
        "longitude": 72.5350,
        "speed": 1.2,
        "heading": 90.0,
        "battery_level": 88.5,
        "timestamp": "2026-05-22T13:54:10Z"
      }
    ]
    ```

---

## ðŸ“¦ 3. Deliveries Router (`/api/v1/deliveries`)

Directs all actions relating to creating and tracking robot payload delivery missions.

### POST `/`
Creates a new campus delivery mission.
*   **Request Body**:
    ```json
    {
      "robot_id": "a671bd41-11d2-43cf-ac5c-9c7163c482cc",
      "receiver_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "receiver_name": "Dr. Amit Vyas",
      "receiver_phone": "+919988776655",
      "origin_block": "A Block",
      "destination_block": "C Block",
      "package_description": "Mid-term exam papers",
      "package_weight_kg": 2.4,
      "priority": 1
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "id": "eb38128c-bf87-4d92-bb89-7cfc1d9b3dcd",
      "tracking_code": "SOU-DLV-837482",
      "robot_id": "a671bd41-11d2-43cf-ac5c-9c7163c482cc",
      "sender_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "receiver_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "receiver_name": "Dr. Amit Vyas",
      "receiver_phone": "+919988776655",
      "origin_block": "A Block",
      "destination_block": "C Block",
      "status": "pending",
      "package_description": "Mid-term exam papers",
      "package_weight_kg": 2.4,
      "priority": 1,
      "estimated_arrival": "2026-05-22T14:15:00Z"
    }
    ```

### GET `/`
Lists all deliveries in which the authenticated user is either the `sender` or the `receiver`.
*   **Response (200 OK)**:
    ```json
    [
      {
        "id": "eb38128c-bf87-4d92-bb89-7cfc1d9b3dcd",
        "tracking_code": "SOU-DLV-837482",
        "origin_block": "A Block",
        "destination_block": "C Block",
        "status": "pending",
        "package_description": "Mid-term exam papers",
        "created_at": "2026-05-22T13:56:00Z"
      }
    ]
    ```

### GET `/{id}`
Retrieves details of a single delivery.
*   **Response (200 OK)**:
    ```json
    {
      "id": "eb38128c-bf87-4d92-bb89-7cfc1d9b3dcd",
      "tracking_code": "SOU-DLV-837482",
      "robot_id": "a671bd41-11d2-43cf-ac5c-9c7163c482cc",
      "sender_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "receiver_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "receiver_name": "Dr. Amit Vyas",
      "receiver_phone": "+919988776655",
      "origin_block": "A Block",
      "destination_block": "C Block",
      "status": "pending",
      "package_description": "Mid-term exam papers",
      "package_weight_kg": 2.4,
      "priority": 1,
      "estimated_arrival": "2026-05-22T14:15:00Z",
      "created_at": "2026-05-22T13:56:00Z"
    }
    ```

### POST `/{id}/start`
Initiates the transit path for the robot (Operator role required).
*   **Response (200 OK)**:
    ```json
    {
      "id": "eb38128c-bf87-4d92-bb89-7cfc1d9b3dcd",
      "status": "en_route"
    }
    ```

### POST `/{id}/complete`
Manually completes the delivery (Operator role required, overrides OTP).
*   **Response (200 OK)**:
    ```json
    {
      "id": "eb38128c-bf87-4d92-bb89-7cfc1d9b3dcd",
      "status": "completed",
      "completed_at": "2026-05-22T14:10:00Z"
    }
    ```

---

## ðŸ”‘ 4. One-Time Password (OTP) Router (`/api/v1/otp`)

Secures physical payload compartment unlocking.

### POST `/generate`
Generates a new 6-digit OTP for a delivery.
*   **Request Body**:
    ```json
    {
      "delivery_id": "eb38128c-bf87-4d92-bb89-7cfc1d9b3dcd"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "OTP generated and sent to receiver",
      "dev_otp": "610293" 
    }
    ```
    > [!NOTE]
    > In development mode (`APP_ENV=development`), the response contains the plaintext `"dev_otp"` key for easy verification without an SMS gateway.

### POST `/verify`
Verifies the provided 6-digit OTP and unlocks the compartment.
*   **Request Body**:
    ```json
    {
      "delivery_id": "eb38128c-bf87-4d92-bb89-7cfc1d9b3dcd",
      "otp": "610293"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "OTP verified successfully. Compartment unlocked."
    }
    ```

---

## ðŸ“Š 5. Analytics Router (`/api/v1/analytics`)

Exposes metrics for fleet performance, trends, and campus heatmap statistics.

### GET `/overview`
Returns global overview counts.
*   **Response (200 OK)**:
    ```json
    {
      "total_deliveries": 328,
      "completed_deliveries": 312,
      "cancelled_deliveries": 16,
      "success_rate": 95.12,
      "average_delivery_time_mins": 14.2,
      "total_distance_km": 184.6
    }
    ```

### GET `/deliveries`
Returns delivery mission volume grouped by day.
*   **Query Parameters**:
    *   `days` (Optional): Count history range (Default: 7).
*   **Response (200 OK)**:
    ```json
    [
      { "date": "2026-05-16", "completed": 42, "cancelled": 2 },
      { "date": "2026-05-17", "completed": 45, "cancelled": 1 }
    ]
    ```

### GET `/robots`
Returns high-level metric summaries for each active robot unit.
*   **Response (200 OK)**:
    ```json
    [
      {
        "robot_name": "Robo-Express A1",
        "total_trips": 112,
        "total_distance_km": 68.4,
        "energy_consumed_kwh": 34.2
      }
    ]
    ```

### GET `/heatmap`
Returns the destination block distribution of completed deliveries.
*   **Response (200 OK)**:
    ```json
    [
      { "block": "A Block", "count": 128 },
      { "block": "B Block", "count": 64 },
      { "block": "C Block", "count": 92 },
      { "block": "D Block", "count": 31 },
      { "block": "E Block", "count": 13 }
    ]
    ```

---

## ðŸ“¡ 6. Live WebSockets & MQTT Topics

### WebSockets
*   **`/ws/tracking/{delivery_id}`**: Broadcasts telemetry coordinates during robot transit.
    *   **Payload broadcast format**:
        ```json
        {
          "latitude": 23.0768,
          "longitude": 72.5350,
          "speed": 1.2,
          "heading": 90.0,
          "battery_level": 88.5,
          "status": "en_route"
        }
        ```
*   **`/ws/notifications/{user_id}`**: Delivers server-push alerts (e.g. "Robot has arrived at Block C").

### MQTT Topics
*   **`robot/+/telemetry`**: Subscription/Publish channel for real-world robot telemetry updates.
*   **`robot/+/commands`**: Instruction channel for server-directed actions (e.g., locking/unlocking the hatch).
