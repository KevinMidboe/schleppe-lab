---
layout: post
title:  "Proxmox backup and recovery"
date:   2023-07-09 15:46:15 +0200
updated: 2023-07-09 15:52:00 +0200
tags: proxmox backup virtualization storage zfs
excerpt: Proxmox setup example of redundant failover ethernet 1 gbps and primary connection over 10 gbps sfp+. Routing is done through a microtik 10 gbps 4 port switch and each server has a Mellanox ConnectX-3 sfp+ pcie card. 
---

- Creating from scratch vs adopting array
- Config
- Encryption
  - Yubikey encryption
- Namespace
- Cloning or recovering vm
  - From another host
