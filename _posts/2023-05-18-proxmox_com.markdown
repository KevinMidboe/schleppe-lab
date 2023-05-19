---
layout: post
title:  "Remove Proxmox Server Access over SERIAL! Cheaper Alternative to IPMI or KVMs"
date:   2023-05-18 10:46:15 +0200
updated: 2023-05-19 14:52:00 +0200
tags: virtualization networking
excerpt: I’ve gone from “no backups” to “raid is a backup” to “two zfs pools in one box”, and decided it’s finally time for a proper backup solution. So, I settled on Proxmox Backup Server! And today, I rebuild my HP Microserver Gen8 with 4x10T refurbished SAS drives, a new SAS controller card, and more! With this backup solution, I’m feeling a lot better about my data migration to Ceph. Contents Video SAS Drive Formatting ZFS Pool Setup Next Steps Video SAS Drive Formatting Since these drives were refurbished they were formerly formatted for a hardware RAID controller and were giving me lots of protection errors in dmesg - specifically blk_update_request protection error (and failing to read, but not write).
---
I have a rack-mounted KVM now, and it’s great, but I’m working on building out a new Proxmox cluster which might not have a graphics output at all on some of the nodes. So, I need a new remote access solution for them.

The new nodes I’m planning on building will all be based on used consumer hardware, so I’m limited by what would be available on normal mATX boards. This doesn’t include IPMI, and if I go with AMD-based CPUs, doesn’t include an iGPU either. So I either need to get cheap GPUs to add to the second PCIe slot (which I then can’t use for things like HBAs), or at least put a GPU in for troubleshooting. However, adding a GPU often moves PCIe devices, leading to issues where the network card on enp4 is now enp5 when the GPU is attahed, for example. So trouleshooting for real would be a nightmare with this approach.

But! There is an alternative. Despite being ancient, many boards still have a COM header connected to the chipset, which provides a basic serial port header (‘COM1’ in Windows) and is completely usable. So, my goal is to connect this COM header to a female RJ45 port on the back of the computer, so I can plug in a ‘Cisco-style’ terminal cable. These sorts of cables (RJ45 serial to USB) are readily available cheaply on the internet, and I can open a terminal emulator on my laptop to diagnose the worst issues that lock up the system.

Since some systems are rumored to not POST without a graphics card, I’m testing this approach today.

# Contents

- [Video](#video)
- [Building the Cable](#building-the-cable)
- [Proxmox Setup](#proxmox-setup)
- [Parts](#parts)

# Video

# Building the cable

The Cisco/Juniper style RJ45 pinout is fairly simple if we exclude all of the flow control lines, so we just need 3 wires. I bought a pack of 2x5 IDC headers and a panel mount female RJ45 extension cable (which can be mounted in the case), cut the male end off, and crimped the resulting wires directly in the IDC header. Then I used a cheap USB to RJ45 serial cable and all worked great.

Here’s the pinout drawing for reference:

# Proxmox Setup

Setup is really two steps - enabling kernel console via serial, and enabling a tty on that serial port. One of these requires editing the kernel `cmdline` (Which can vary a bit - see Proxmox’s docs for more info), and the other requires using systemd.

First, we need to add a new `console` argument to the kernel cmdline. Default for this is `tty0`, and we can add multiple arguments, so we should make sure both are specified. On my system I am using systemd-boot, so I edit the file `/etc/kernel/cmdline` and add:

```bash
console=tty0 console=ttyS0,115200n8
```

(ttyS0 should be ‘COM1’ in Windows, and should be the COM port on the motherboard. You can also use USB Serial here if you need to, or any other serial ports you have available)

Now, we just need to enable getty on our serial port so we have a proper login terminal:

```
systemctl enable serial-getty@ttyS0.service
```

And reboot, watching boot messages on the console happily


![image tooltip here](/assets/images/0001-proxmox.jpg)
*cluster viewed from here*

{% include image.html
  src="0001-proxmox.png"
  alt="Jekyll's logo"
  caption="This is Jekyll's logo, featuring Dr. Jekyll's serum!"
%}

I get that these push clippy things are on the low end because they’re cheap and not really ideal for proper cooler pressure, but god damn why can’t all cooler installations be this easy? Some of the shit I’ve had to install in my past have been too damn complicated for no obvious reason. Although, after putting this thing on the board, there was very obvious warping happening on the board, so, pointless rant by me, clearly.

I really don’t mind warping as much as a lot of people seem to, I’ve used a lot of warped PCBs in my day and they’re pretty solid bits of kit. Once I installed the board in the case the motherboard screws seemed to ‘bed it back’ as it were, so the board was straight.

{% include image.html
  src="0002-proxmox.png"
  alt="Jekyll's logo"
  caption="This is Jekyll's logo, featuring Dr. Jekyll's serum!"
  fullwidth="true"
%}

{% include image.html
  src="0003-proxmox.png"
  alt="Jekyll's logo"
  caption="This is Jekyll's logo, featuring Dr. Jekyll's serum!"
  fullwidth="true"
%}

Of course, since Proxmox is Debian (with Ubuntu kernels), this should work on any of your other systems also Debian-based, as long as you are aware of the right place for the cmdline config (GRUB or Systemdboot).

# Parts

Some links to products may be affiliate links, which may earn a commission for me.

- [Female 2x5 IDC Connector (50 pack)](https://google.com)
- [RJ45 Panel Mount Female Extension](https://google.com)
- [RJ45 Console Cable to USB-A](https://google.com)
- [RJ45 Console Cable to USB-C](https://google.com)

