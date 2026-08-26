[TOC]



# Hardware Register Technical Documentation

## Document Overview

This document details the register configuration specifications for each functional module in the hardware system, including register access rules, functional base address allocation, and specific register definitions. It is applicable to embedded software development, hardware debugging, and system integration.

------

## Register General Specifications

### Access Rules

- **Read/Write Characteristics**: All registers support read and write operations (writing to registers not designed as writable should be avoided, as it may cause system exceptions).
- **Address Composition**: The actual physical address = **functional base address** + **register offset address**.
- **Default Values**: Unless otherwise specified, registers have an initial power-on value of `0`.
- **Security Constraints**:
    - Reading from or writing to undefined register addresses is prohibited.
    - **Strictly adhere to the register's designed length for read/write operations**: Registers must be read from or written to **exactly** according to their defined byte length (for example, if a register is 3 bytes in size, the full 3 bytes must be read or written; **reading or writing only a partial byte (e.g., 1 or 2 bytes) is prohibited**), as this may cause data truncation, erroneous overwrites, or system exceptions.

### Data Format

- **Multi-byte Data**: Uses **big-endian (most significant byte first, least significant byte last)** ordering. For example, the 16-bit value `0x1234` is stored as: high byte `0x12` at the lower address, low byte `0x34` at the higher address.

---

## Device Address

The device I2C operates at a standard 100 kHz frequency.

Unique device address: <mark>0x23</mark>

------

## Functional Module Base Address Allocation

| Functional Module | Base Address (Hex) | Decimal Equivalent |
| ----------------- | ------------------ | ------------------ |
| System Management | `0x00`             | 0                  |
| Ultrasonic Module | `0x0A`             | 10                 |

> Note: Base addresses are logically grouped by functional module, with reasonable spacing reserved between adjacent modules for future expansion.

------

## Functional Module Register Detailed Definitions

### System Management Module (Base Address: `0x00`)

| Offset Address | Register Name | Function Description           | Data Length (Bytes) | Value Range / Description                                    |
| -------------- | ------------- | ------------------------------ | ------------------- | ------------------------------------------------------------ |
| 0x00           | Version Info  | Three-part version information | 3                   | e.g., version v1.0.1 is represented by three bytes: 1, 0, 1. |

### Ultrasonic Module (Base Address: `0x0A`)

| Offset Address | Register Name       | Function Description                | Data Length (Bytes) | Value Range / Description |
| -------------- | ------------------- | ----------------------------------- | ------------------- | ------------------------- |
| 0x00           | Ultrasonic Distance | Ultrasonic measured distance, in mm | 2                   | 0~65535                   |

> Note: To ensure the module has sufficient time to complete the measurement, the interval between two reads should be at least 20 ms.

------

## Important Notes

1. **Address Alignment**: Ensure that the calculated physical address does not exceed the hardware addressing range.
2. **Data Validation**: When writing multi-byte data, strictly follow the big-endian rule for byte concatenation.
3. **Functional Verification**: Before operating a new module for the first time, it is recommended to verify basic functionality through single-register read/write tests.
4. **Exception Handling**: If the device does not respond, first verify that the register address is correct and that the data length complies with the definitions.







---

## I2C Communication Technical Q&A

### Q1: Should register offset addresses be understood as byte-addressable? Is auto-increment of register addresses supported?

**A:** The register addressing scheme in this system is **not byte-addressable**. Each register address corresponds to a multi-byte data field.

- In I2C read/write operations, after sending the device address and selecting the target register, you must **continuously transmit the full number of bytes defined for that register** without issuing a Stop condition.
- Only after the complete data write or read operation is finished should you release the bus by sending a Stop condition.
- **Auto-increment of register addresses is not supported.** You must explicitly specify the target register for every read or write operation.
- **Writing across consecutive registers in a single transaction is prohibited.** For example, after writing four bytes to register `0x0A + 0x00`, you must send a Stop condition to terminate the transaction. You cannot continue sending data with the expectation that it will automatically write to `0x0A + 0x01`. A write to `0x0A + 0x01` requires a new I2C transaction.

---

### Q2: What are the standard formats for I2C write and read transactions?

**A:**

**Write Transaction Format:** `[Device Address] + [Register Physical Address] + [Complete Data]`

- After sending the device address, send the target register's physical address (base address + offset), followed by the full data bytes defined for that register.
- Issue a Stop condition after the complete data has been transmitted.

**Read Transaction Format:** You must first write the target register physical address, then initiate the read.

- Steps: Send `[Device Address] + [Register Physical Address]`, then issue a Stop or Repeated Start condition.
- Then send the device address with the read bit set, and continuously read the full number of bytes defined for that register.

**Important Constraints:**

- Each I2C transaction targets only **one** register.
- Auto-increment of addresses is not supported; you must explicitly specify the register physical address for every operation.
- The data length for read/write operations must strictly match the register definition. Partial reads or writes are not permitted.

---

### Q3: What are the byte order and encoding conventions for multi-byte values?

**A:**

- **Byte Order:** Big-endian (most significant byte first) is used uniformly.
- **Numeric Encoding:**
  - Unsigned numbers: Standard binary, concatenated byte by byte.
  - Signed numbers: Two's complement encoding.
- Please refer to the "Value Range / Description" column in the documentation for each register to determine whether it is unsigned or signed.

---

### Q4: Is the device I2C address fixed or configurable?

**A:** In the current version, the device I2C address is **fixed** and cannot be changed.

---

### Q5: How should read-only registers be handled at the I2C layer? Can they be written to?

**A:** In the current version, all registers are electrically writable. However, from a functional perspective, some registers are considered **read-only**.

- Writing to read-only registers will not cause hardware damage, but the operation has no practical effect and may lead to the following issues:
  - **Data is automatically restored:** For example, the Version Information register is maintained internally by the firmware. Even if you write to it, the value will be restored to its original value after a power cycle or internal update.
  - **Data is overwritten internally:** For example, some status registers are automatically updated by the hardware based on the actual operating status. Any externally written data will be immediately overwritten by the internal logic.

**Recommendation:** To maintain code correctness and compatibility, and to avoid potential issues in future versions, you should strictly avoid writing to registers that are marked as read-only. In your firmware implementation, it is recommended to perform only read operations on these registers.

---

### Q6: What are the requirements for read/write data length on registers?

**A:** You must strictly read from or write to registers **exactly** according to their defined byte length.

- For example, if a register is 3 bytes in size, the full 3 bytes must be read or written.
- **Reading or writing only a partial byte (e.g., 1 or 2 bytes) is prohibited**, as this may cause data truncation, erroneous overwrites, or system exceptions.





------

*Usage Note: Developers can directly locate functional module register addresses and parameter ranges using the tables above.*