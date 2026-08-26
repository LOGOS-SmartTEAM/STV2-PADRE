[TOC]





# Hardware Register Technical Documentation



## Document Overview

This document details the configuration specifications for the hardware system, including device address, I2C communication protocol, and data format definitions. It is applicable to embedded software development, hardware debugging, and system integration.

---



## Device Address

The device I2C operates at a standard 100 kHz frequency.

Unique device address: <mark>0x61</mark>



## Functional Module Register Detailed Definitions

| Function Description          | Data Length (Bytes) | Value Range / Description                                    |
| :---------------------------- | :------------------ | :----------------------------------------------------------- |
| A single read returns 4 bytes | 4                   | Byte 0: Reserved<br>Byte 1: X-axis data<br>Byte 2: Y-axis data<br>Byte 3: Reserved |

> The data range is -100 to 100, stored in two's complement format.
>
> If the joystick's physical deflection direction is opposite to the numerical values (for example, pushing left makes the value increase positively instead of decrease negatively), just multiply the current axis input signal by -1 to invert the polarity.
