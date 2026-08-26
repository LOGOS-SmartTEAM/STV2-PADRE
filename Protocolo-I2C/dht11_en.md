[TOC]





# Hardware Register Technical Documentation



## Document Overview

This document details the configuration specifications for the hardware system, including device address, I2C communication protocol, and data format definitions. It is applicable to embedded software development, hardware debugging, and system integration.

---



## Device Address

The device I2C operates at a standard 100 kHz frequency.

Unique device address: <mark>0x27</mark>



## Functional Module Register Detailed Definitions

| Function Description                                         | Data Length (Bytes) | Value Range / Description                                    |
| :----------------------------------------------------------- | :------------------ | :----------------------------------------------------------- |
| A single read returns 5 bytes containing temperature and humidity data | 5                   | Byte 0: Temperature integer part (unit: °C)<br>Byte 1: Temperature fractional part<br>Byte 2: Humidity integer part (unit: %RH)<br>Byte 3: Humidity fractional part<br>Byte 4: Reserved |

> **Note**:
>
> - Temperature values are in degrees Celsius (°C), and humidity values are in percentage relative humidity (%RH).
> - Both the integer and fractional parts are **unsigned integers**.
