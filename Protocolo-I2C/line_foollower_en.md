[TOC]





# Hardware Register Technical Documentation



## Document Overview

This document details the configuration specifications for the hardware system, including device address, I2C communication protocol, and data format definitions. It is applicable to embedded software development, hardware debugging, and system integration.

---



## Device Address

The device I2C operates at a standard 100 kHz frequency.

Unique device address: <mark>0x28</mark>



## Functional Module Register Detailed Definitions

| Function Description          | Data Length (Bytes) | Value Range / Description                                    |
| :---------------------------- | :------------------ | :----------------------------------------------------------- |
| A single read returns 5 bytes | 5                   | Byte 0: Leftmost sensor data<br>Byte 1: Center sensor data<br>Byte 2: Rightmost sensor data<br>Byte 3: Reserved<br>Byte 4: Reserved |
