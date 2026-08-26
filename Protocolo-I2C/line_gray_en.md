## I. Device Address Configuration

`0x29`



------

## II. Core Functional Description

### 1. Training and Recognition Features

- **Automatic Threshold Recording**: Upon completion of color/grayscale/binary training, the system will automatically save the current threshold parameters to non-volatile memory; no manual storage is required.

- **Training Integrity Requirement**: During the training process, it is essential to ensure that all color channels (or corresponding ports) are effectively scanned. Failure to scan any channel will result in a significant degradation of recognition accuracy for that channel (potentially causing false positives or missed detections).

------

## III. Communication Protocol Specifications

### 1. Command Settings (Control Instructions)

The module's operating mode is controlled by writing single-byte commands (0x00–0x15). The specific definitions are as follows:

| Command ID (Decimal) |                    Functional Description                    |
| -------------------: | :----------------------------------------------------------: |
|                    0 |  Idle mode (no operation, sensor remains in standby state)   |
|                    1 | Color recognition mode (detects and outputs the current target color type) |
|                    2 | Grayscale recognition mode (detects and outputs the current target grayscale level) |
|                    3 | Binary recognition mode (detects and outputs the current target binarization state) |
|                    4 | Grayscale learning mode (enters grayscale threshold training state) |
|                    5 | Binary learning mode (enters binarization threshold training state) |
|                    6 | Clear all stored color learning data (restores default thresholds) |
|                    7 | Learn red threshold (trains threshold for the red channel individually) |
|                    8 | Learn green threshold (trains threshold for the green channel individually) |
|                    9 | Learn blue threshold (trains threshold for the blue channel individually) |
|                   10 | Learn yellow threshold (trains threshold for the yellow mixed color) |
|                   11 | Learn cyan threshold (trains threshold for the cyan mixed color) |
|                   12 | Learn purple threshold (trains threshold for the purple mixed color) |
|                   13 | <font color='red'>Reserved (function not yet available)</font> :sweat: |
|                   14 | <font color='red'>Reserved (function not yet available)</font> :sweat: |
|                   15 | Read raw photosensitive values (outputs analog values in the range 0–255) |

> **Critical Constraint**: A single communication transaction permits writing only **1 byte of command**; writing multiple bytes consecutively (e.g., inadvertently sending multiple commands) will cause the device to hang. The single-byte write rule must be strictly observed.

------

### 2. Read Specifications (Status Feedback)

When responding to a read request, the module must output data in a fixed format of a **4-byte data packet** for parsing. The specific structure is as follows:

| Byte Position |                        Data Content                        |                         Description                          |
| ------------: | :--------------------------------------------------------: | :----------------------------------------------------------: |
|     Bytes 1–3 | Detection values for each channel (3 independent channels) | Each byte corresponds to the recognition result of one input signal (refer to the "Color Recognition Read Values" table for specific meanings) |
|        Byte 4 |                     Module status flag                     | Indicates the current operating mode of the module (consistent with the IDs in "Command Settings", used to confirm successful mode switching) |

> **Mandatory Requirement**: All **4 bytes** must be read completely. Reading fewer than 4 bytes (e.g., only 3 bytes) may cause the device's internal state machine to malfunction, potentially leading to a hang or data anomalies.
>
> **Timing Note**: Due to the internal mode-switching processing time of the sensor, reading immediately after setting a new command may return residual data from the previous mode. It is recommended to insert an **appropriate delay (e.g., 50–100 ms)** after writing the command to ensure the module has completed the mode switch before performing the read operation.

------

### 3. Color Recognition Read Value Mapping Table

In color recognition mode (Command 1) or related learning modes, the values returned in Bytes 1–6 correspond to the color type for each channel. The specific identifiers are as follows:

|        Color Type | Return Identifier (Decimal) |
| ----------------: | :-------------------------: |
| No color detected |              0              |
|               Red |              1              |
|             Green |              2              |
|              Blue |              3              |
|            Yellow |              4              |
|              Cyan |              5              |
|            Purple |              6              |

> Note: The identifier values directly map to the sensor's classification results for the target color and can be used for subsequent logic decisions or display output.

------

## IV. Typical Application Constraints

1. **Write Safety**: Strictly limit each communication transaction to sending only 1 byte of command. Multi-byte writes (e.g., bulk sending of commands and parameters) must be split into multiple single-byte operations at the application layer.
2. **Read Integrity**: All status reads must be performed with a fixed length of 7 bytes; truncation or partial reads are prohibited.
3. **Timing Control**: After mode switching, a software delay (50–100 ms recommended) must be added to avoid data errors caused by sensor response latency.
4. **Training Validity**: When performing color/grayscale/binary learning, ensure that the ambient lighting is stable and the target color coverage is complete; otherwise, threshold training may be inaccurate.

------

*（This protocol is applicable for precise control and data interaction with multi-channel color sensors. Users are required to strictly adhere to the communication timing and data format requirements to ensure system stability and recognition accuracy.）*