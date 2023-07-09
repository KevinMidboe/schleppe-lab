---
layout: post
title:  "Proxmox 10 gbps networking"
date:   2023-07-03 10:46:15 +0200
updated: 2023-07-03 14:52:00 +0200
tags: proxmox 10gbps virtualization networking
excerpt: Proxmox setup example of redundant failover ethernet 1 gbps and primary connection over 10 gbps sfp+. Routing is done through a microtik 10 gbps 4 port switch and each server has a Mellanox ConnectX-3 sfp+ pcie card. 
---

Setting up networking in proxmox. 

# Hardware

Current configuration:
- Single port Mellanox MT27500 Family ConnectX-3
- Mikrotik CRS305-1G-4S+IN switch
- DAC (Direct-attach-cable)

Useful marketplace for all network related check out fs.com.

{% include image.html
  src="2023-07-09/CRS305-1.png"
  alt="Mikrotik CRS305-1G-4S+IN switch"
%}

Mellanox ConnectX-3 10 gbps network card
<div style="margin: 0 auto; width: 50%">
{% include image.html
  src="2023-07-09/mellanox_connectx-3_MT27500-1.png"
  alt="Mellanox ConnectX-3 10gbps pcie network card"
%}
</div>

The cheapest and easiest 10 gbps cards to get at the time are Mellanox ConnectX v3-5 cards. I use single port ConnectX-3 MT27500 Family cards. 

General setup: 2 x 1gbps ethernet and 1 x 10 gpbs sfp+
Network card: 
```bash
~ lshw -c network
  *-network
       description: Ethernet interface
       product: MT27500 Family [ConnectX-3]
       vendor: Mellanox Technologies
       physical id: 0
       bus info: pci@0000:03:00.0
       logical name: ens3
       version: 00
       size: 10Gbit/s
       width: 64 bits
       clock: 33MHz
       capabilities: pciexpress ethernet physical fibre
  *-network:0
       description: Ethernet interface
       product: I350 Gigabit Network Connection
       vendor: Intel Corporation
       physical id: 0
       bus info: pci@0000:04:00.0
       logical name: enp4s0f0
       version: 01
       size: 1Gbit/s
       capacity: 1Gbit/s
       width: 32 bits
       clock: 33MHz
       capabilities: ethernet physical tp 10bt 10bt-fd 100bt 100bt-fd 1000bt-fd
  *-network:1
       description: Ethernet interface
       product: I350 Gigabit Network Connection
       vendor: Intel Corporation
       physical id: 0.1
       bus info: pci@0000:04:00.1
       logical name: enp4s0f1
       version: 01
       size: 1Gbit/s
       capacity: 1Gbit/s
       width: 32 bits
       clock: 33MHz
       capabilities: ethernet physical tp 10bt 10bt-fd 100bt 100bt-fd 1000bt-fd
```


With the two redundant ethernet connection create a failover bond.  

Interfaces:
 - ethernet 1: eno1
 - ethernet 2: eno2
 - sfp+ over pcie: enp21s0

```
cat /etc/network/interfaces

...
auto lo
iface lo inet loopback

auto eno1
iface eno1 inet manual
	mtu 1500

auto eno2
iface eno2 inet manual
	mtu 1500

auto enp21s0
iface enp21s0 inet manual
	mtu 9000

auto bond0
iface bond0 inet manual
	bond-slaves eno1 eno2
	bond-miimon 100
	bond-mode active-backup
	bond-primary eno1
#redundant 1G

auto bond1
iface bond1 inet manual
	bond-slaves bond0 enp21s0
	bond-miimon 100
	bond-mode active-backup
	bond-primary enp21s0
#10G failover to dual 1G

auto vmbr0
iface vmbr0 inet static
	address 10.0.0.80/24
	gateway 10.0.0.1
	bridge-ports bond1
	bridge-stp off
	bridge-fd 0
	bridge-vlan-aware yes
	bridge-vids 2-4094
	mtu 9000
```

- quick summary of state
- TOC
- images of hardware
- explanation of goal
- config
- hardware list
- notes
