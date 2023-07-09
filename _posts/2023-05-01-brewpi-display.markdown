---
layout:  post
title:   E-ink brewpi viewer
date:    2023-05-01 10:46:15 +0200
updated: 2023-05-01 14:52:00 +0200
tags: brewing e-ink
---

Continuing on brewpi refrigerator project we have already created a [regulator]() & [website](), but I also want a way to view the current refrigerator state at a glance.

{% include image.html
  src="0001-brewpi.jpeg"
  alt="Jekyll's logo"
  caption="E-ink display displaying current brew status."
  fullwidth="true"
%}

The code is split into the e-ink renderer and a http server to easier update.

server:

```python
from flask import Flask, request, render_template, send_file, redirect, send_from_directory

from main import draw

app = Flask(__name__)

brew = {
    'name': 'Kinn Kveldsbris',
    'time': '11 days',
    'phase': 'Carbonating',
    'next-phase': 'Drink'
}

@app.route('/api/render', methods=['POST'])
def render():
    draw(brew)

    if request.headers.get('Content-Type') == 'application/json':
        return 'ok'
    else:
        return redirect('/')

@app.route('/_health')
def health():
    return 'ok'

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html', brew=brew)

@app.route('/', methods=['POST'])
def indexForm():
    brew['name'] = request.form['name'] or brew['name']
    brew['time'] = request.form['time'] or brew['time']
    brew['phase'] = request.form['phase'] or brew['phase']
    brew['next-phase'] = request.form['next-phase'] or brew['next-phase']

    return redirect('/')

if __name__ == '__main__':
    app.run(host='0.0.0.0')
```

<script src="https://gist.github.com/KevinMidboe/1d89a34370caf6755c74c76341d23dd9.js"></script>


template/index.html:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><title>Dynamic Label and Input Fields</title>
</head>
<body>
    <h3>Name: {{ brew['name'] }}</h3>
    <h5>Time: {{ brew['time'] }}</h5>
    <h5>Phase: {{ brew['phase'] }}</h5>
    <h5>Next phase: {{ brew['next-phase'] }}</h5>

    <form method="POST" action="/">
        <label for="field1">Beer name:</label>
        <input type="text" id="name" name="name"><br><br>

        <label for="field2">Time left:</label>
        <input type="text" id="time" name="time"><br><br>

        <label for="field3">Current Phase:</label>
        <input type="text" id="phase" name="phase"><br><br>

        <label for="field4">Next Phase:</label>
        <input type="text" id="next-phase" name="next-phase"><br><br>

        <input type="submit" value="Submit">
    </form>

    <form method="POST" action="/api/render">
        <input type="submit" value="Render">
    </form>
</body>
</html>
```

renderer:

```python
#!/usr/bin/python
# -*- coding:utf-8 -*-
import sys
import os
picdir = os.path.join(os.path.dirname(os.path.dirname(os.path.realpath(__file__))), 'brewDisplay/pic')
libdir = os.path.join(os.path.dirname(os.path.dirname(os.path.realpath(__file__))), 'brewDisplay/lib')
print(libdir)
if os.path.exists(libdir):
    sys.path.append(libdir)

import logging
from waveshare_epd import epd2in9bc
import time
from PIL import Image,ImageDraw,ImageFont
import traceback

logging.basicConfig(level=logging.DEBUG)

placeholderBrew = {
    'name': 'Kinn Kveldsbris',
    'time': '11 days',
    'phase': 'Carbonating',
    'next-phase': 'Drink'
}

def draw(brew=placeholderBrew):
    try:
        logging.info("epd2in9bc Demo")

        epd = epd2in9bc.EPD()
        logging.info("init and Clear")
        epd.init()
        epd.Clear()

        # Drawing on the image
        logging.info("Drawing")
        font70 = ImageFont.truetype(os.path.join(picdir, 'Font.ttc'), 70)
        font40 = ImageFont.truetype(os.path.join(picdir, 'Font.ttc'), 40)
        font24 = ImageFont.truetype(os.path.join(picdir, 'Font.ttc'), 24)
        font20 = ImageFont.truetype(os.path.join(picdir, 'Font.ttc'), 20)
        font18 = ImageFont.truetype(os.path.join(picdir, 'Font.ttc'), 18)
        font16 = ImageFont.truetype(os.path.join(picdir, 'Font.ttc'), 16)
        font14 = ImageFont.truetype(os.path.join(picdir, 'Font.ttc'), 14)
        font12 = ImageFont.truetype(os.path.join(picdir, 'Font.ttc'), 12)
        font8 = ImageFont.truetype(os.path.join(picdir, 'Font.ttc'), 8)

        # Drawing on the Horizontal image
        logging.info("1.Drawing on the Horizontal image...")
        HBlackimage = Image.new('1', (epd.height, epd.width), 255)  # 298*126
        HRYimage = Image.new('1', (epd.height, epd.width), 255)  # 298*126  ryimage: red or yellow image
        drawblack = ImageDraw.Draw(HBlackimage)
        drawry = ImageDraw.Draw(HRYimage)
        # drawblack.text((2, 0), 'Schleppe brew', font = font12, fill = 0)
        drawblack.text((2, 0), 'Beer: {}'.format(brew['name']), font = font14, fill = 0)
        drawblack.text((2, 16), "State: heating", font = font20, fill = 0)

        drawblack.text((190, 0), "Time left", font = font18, fill = 0)
        drawblack.text((190, 18), brew['time'], font = font12, fill = 0)

        drawblack.text((190, 34), "Phase", font = font18, fill = 0)
        drawblack.text((190, 52), brew['phase'], font = font12, fill = 0)
        drawblack.text((190, 66), "Next: {}".format(brew['next-phase']), font = font8, fill = 0)

        # ddrawblack.text((175, 54), "Time:", font = font16, fill = 0)
        # ddrawblack.text((175, 66), "11 days", font = font12, fill = 0)

        drawblack.text((2, 55), "Inside temp", font = font14, fill = 0)
        drawblack.text((2, 60), "4.3 C", font = font70, fill = 0)
        drawblack.arc((110, 70, 120, 80), 0, 360, fill = 0)

        drawblack.text((175, 79), "Outside temp", font = font14, fill = 0)
        drawblack.text((175, 89), "20.3 C", font = font40, fill = 0)
        epd.display(epd.getbuffer(HBlackimage), epd.getbuffer(HRYimage))

        logging.info("Goto Sleep...")
        epd.sleep()

    except IOError as e:
        logging.info(e)

    except KeyboardInterrupt:
        logging.info("ctrl + c:")
        epd2in9bc.epdconfig.module_exit()
        exit()

if __name__ == '__main__':
    draw()
```
