# Servo Motor Communication Protocol Specification

## I. Protocol Overview

### Device Addresses

| I²C Address | Device Indication                                      |
| ----------- | ------------------------------------------------------ |
| 0x50        | General-purpose address, available in all motor states |
| 0x51        | When indicator LED is red                              |
| 0x52        | When indicator LED is green                            |
| 0x53        | When indicator LED is blue                             |
| 0x54        | When indicator LED is yellow                           |

### Control Commands

| Command | Mode                                                 | Status Return | Mode                                                 |
| ------- | ---------------------------------------------------- | ------------- | ---------------------------------------------------- |
| 0x00    | Disabled                                             | 0x00          | Disabled                                             |
| 0x01    | Constant Speed (Electromagnetic Braking)             | 0x01          | Constant Speed (Electromagnetic Braking)             |
| 0x02    | Constant Speed Timed (Electromagnetic Braking)       | 0x02          | Constant Speed Timed (Electromagnetic Braking)       |
| 0x03    | Constant Speed Positioning (Electromagnetic Braking) | 0x03          | Constant Speed Positioning (Electromagnetic Braking) |
| 0x04    | Relative Displacement (Electromagnetic Braking)      | 0x04          | Relative Displacement (Electromagnetic Braking)      |
| 0x05    | Constant Power                                       | 0x05          | Constant Power                                       |
| 0x11    | Constant Speed (Coasting)                            | 0x06          | Constant Speed (Coasting)                            |
| 0x12    | Constant Speed Timed (Coasting)                      | 0x07          | Constant Speed Timed (Coasting)                      |
| 0x13    | Constant Speed Positioning (Coasting)                | 0x08          | Constant Speed Positioning (Coasting)                |
| 0x14    | Relative Displacement (Coasting)                     | 0x09          | Relative Displacement (Coasting)                     |
| 0x70    | Set Current Position                                 | 0x0A          | Stall Protection Stop                                |
| 0x79    | Custom ID                                            | 0x0B          | Motion Complete Stop                                 |
|         |                                                      | 0x0C          | External Load / Excessive Resistance                 |

### Command Format (Transmitted to Motor)

| Data1   | Data2                   | Data3                               | Data4                             |
| ------- | ----------------------- | ----------------------------------- | --------------------------------- |
| Command | Speed / Power / Address | Position High Byte / Time High Byte | Position Low Byte / Time Low Byte |
|         |                         | Time >> 8                           | Time & 0xFF                       |
|         |                         | (Location) >> 8                     | (Location) & 0xFF                 |

### Data Format (Returned from Motor)

| Data1          | Data2              | Data3             | Data4           | Data5          | Data6 |
| -------------- | ------------------ | ----------------- | --------------- | -------------- | ----- |
| Speed Low Byte | Position High Byte | Position Low Byte | Power High Byte | Power Low Byte | Mode  |

### Data Ranges

| Parameter     | Data Type | Range           |
| ------------- | --------- | --------------- |
| Speed / Power | int8      | (-50, 50)       |
| Time          | uint16    | (0, 65535)      |
| Position      | int16     | (-32400, 32400) |
| Address       | uint8     | (0, 127)        |

---

## II. Protocol Description

### 1. General-Purpose Address and Secondary Address

The servo motor is an I²C slave device that supports multiple addresses and can be configured with two 7-bit addresses simultaneously: a general-purpose address and a secondary address.

- **General-Purpose Address**: `0x50`  
  This address is always available for communication and cannot be modified.

- **Secondary Address**:  
  The secondary address can be switched via a button on the servo motor or via command. Different addresses correspond to different indicator LED colors:

| Secondary Address | Indicator Color |
| ----------------- | --------------- |
| 0x51              | Red             |
| 0x52              | Green           |
| 0x53              | Blue            |
| 0x54              | Yellow          |
| Custom Address    | White           |

> When the address is modified using the "Custom ID" command, the indicator LED will turn white.

---

### 2. Operating Modes

The servo motor supports the following five operating modes:

#### (1) Constant Speed Rotation

The motor rotates continuously at a set speed.

- **Command Example**: `[0x01, 50, 0, 0]`
- **Description**: The motor will run continuously at 50°/s.

#### (2) Constant Speed Timed

The motor runs at a set speed for a specified duration and then stops automatically. Timing precision is 0.1s.  
The time parameter must be split into two 8-bit data bytes.

- **Command Example**: `[0x02, 50, 0, 100]`
- **Description**: The motor will run at 50°/s for 10s before stopping (100 × 0.1s = 10.0s).

#### (3) Constant Speed Positioning

The motor runs at a set speed to a specified angle. The direction of rotation is determined by the current angle.  
The angle parameter must be split into two 8-bit data bytes.

- **Command Example** (when current motor position is 100°): `[0x03, 50, 0, 30]`
- **Description**: The motor will rotate counterclockwise (reverse) at 50°/s to 30°.

#### (4) Relative Displacement

The motor rotates by a specified angle at a set speed, independent of its current position.

- **Command Example**: `[0x04, 50, 0, 30]`
- **Description**: The motor will rotate forward by 30° at 50°/s and then stop.

#### (5) Constant Power

The motor runs continuously at a set power level.  
The power input range is 0–50, corresponding to an actual output power of 0%–100%.

- **Command Example**: `[0x05, 50, 0, 0]`
- **Description**: The motor will run continuously at 100% power (a power value of 50 corresponds to 100%).

---

### 3. Electromagnetic Braking and Coasting

In the "Constant Speed Rotation," "Constant Speed Timed," "Constant Speed Positioning," and "Relative Displacement" modes, the motor supports the following two stopping methods:

#### (1) Electromagnetic Braking

Upon task completion or receipt of a stop command, the motor generates a holding torque to maintain its current position.

- **Command Example**: `[0x03, 50, 0, 30]`
- **Effect**: In Constant Speed Positioning mode, the motor will lock at 30° after reaching the target. External force can hardly change its position, providing excellent stability.

#### (2) Coasting

Upon task completion, the motor enters a disabled state and continues moving by inertia.

- **Command Example**: `[0x03, 50, 0, 30]`
- **Effect**: In Constant Speed Positioning mode, the motor will not stop immediately after reaching 30° but will continue to coast. The final stopping position may deviate from the target angle. External force can also change the motor position freely.

---

### 4. Set Current Position

The servo motor supports setting a custom current position.

| Function             | Command Example    | Description                          |
| -------------------- | ------------------ | ------------------------------------ |
| Set Current Position | `[0x70, 0, 0, 30]` | The current angle will be set to 30° |
| Clear Position Data  | `[0x70, 0, 0, 0]`  | Reset current position to zero       |

---

### 5. Data Return

The servo motor's internal data is updated in real time. The host can read the following information at any time:

| Data Item | Data Length | Description                                                  |
| --------- | ----------- | ------------------------------------------------------------ |
| Speed     | 8 bits      | Current real-time rotational speed                           |
| Position  | 16 bits     | Current absolute angular position                            |
| Power     | 16 bits     | Current real-time output power                               |
| Mode      | 8 bits      | Current operating mode (see status return values in the "Control Commands" table) |

> **Total Return Data Length**: 6 bytes in total (Speed 8-bit + Position 16-bit + Power 16-bit + Mode 8-bit = 48 bits = 6 bytes).

---

### 6. Custom ID

The servo motor supports user-defined secondary addresses.

- **Command Example**: `[0x79, 0x30, 0, 0]`
- **Description**: The secondary address will be changed to `0x30`. After modification, communication with the slave is only possible via `0x50` and the new address `0x30`.

> **Restoring the Default Address**: This can be done by long-pressing the switch button or by resending the address modification command.

---

