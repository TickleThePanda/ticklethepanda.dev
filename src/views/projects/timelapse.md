---
title: Timelapse
description: A Raspberry PI timelapse camera
permalink: /timelapse/

created: 2021-04-03
---

Recently, I've been pruning a very leggy jade plant. Hiding it in shade
hasn't been good for it. I'm excited as the pruning is leading to new branches
and leaves. I wanted to see its progress after pruning in the form of a
timelapse.

I've written this as a reminder of the journey to build this and the mistakes
I made along the way! While the code for this is [open source], it's not
accessible to the public for privacy.

To make a timelapse, I needed as a camera that could take photos on a timer.
There were a couple of options here and I favoured two: use an existing camera
and trigger it remotely, or build a Raspberry PI timelapse. I initially looked
to borrow my partner's digital camera but it couldn't be triggered from another
device or be charged without removing the battery.

So, Raspberry Pi it was then! I got a [Raspberry Pi 4] and a [Raspberry Pi
Camera Module]. My plan at this point: build a web application that will control
when the photos will be taken and store them. I also wanted to deploy to the
Raspberry Pi within a Docker image as part of a my home Kubernetes "cluster" (a
manager node and this new Raspberry Pi).

### An example

<div class="responsive-iframe-container">
  <iframe class="responsive-iframe" src="https://www.youtube.com/embed/gqKUhgiDJz4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

### Initial setup

The first step, at this point, was to get the camera working with the
Raspberry Pi. It took a few attempts to get it working, including using
the wrong port for the camera, not realising there were two ports on
the Pi! It took a while but the camera eventually worked, tested using
the `raspistill` command.

### A basic web application

Initially, I considered building separate components (camera, timer, video
composer). However, I decided against this as it would be more difficult to
control the configuration across multiple applications. Instead, I
decided to build single application that would handle most of this
functionality, except the video composer to limit the processing on the Pi.

I chose Go for writing the application as I had found the library
[raspicam].

I implemented this in a few broad steps:

1. Test the `raspicam` to get images, choosing the right file format. I
   settled on PNG for lossless compression.
2. Design the timelapse config model, manually setting the config.
3. Build an endpoint to list the current images.

This gave a basic application to start generating timelapses. However, I
wasn't very happy with the product at this stage, there were a few
problems with it:

- It was difficult to work out where the camera was pointing and how
  it was focussed.
- The style of the pages wasn't great.
- It was difficult to reset the timelapse.
- The lighting wasn't always uniform.

Now, fixing these things wasn't particularly difficult to implement so
I'll skip to the hard parts.

### Race conditions

Hard part number one.

Race conditions.

I noticed that after a little while the software would no longer be able
to get photos from the camera. I narrowed this down to the `raspistill`
freezing if more than one instance ran at once. The only way to fix this
was to restart the Pi. Not great for a web service. I initially tried
[using mutexes] to prevent the camera from being used at once but, in the
end, it was clearer to [use channels].

The other race conditions that I needed to solve was [reading and creating
images at the same time].

This didn't solve every single problem, unfortunately, so, in the end,
there's a cron script to check if the application can take timelapse
images still and, if not, it will restart the Pi. A bit hacky!

### Containers and orchestration

As part of this project, I wanted to build more experience with
Kubernetes and Docker.

This came with some hard problems:

- Getting the `raspistill` binary
- Finding the other required libraries
- Building without mtrace and execinfo
- Mounting the devices
- Running on the right device

This was solvable but it did take [significant work] that isn't quite
captured by this commit!

Once this was done, it started to get frustrating waiting to rebuild the
image every time I wanted to deploy it. I solved this in a few ways:

- [GitHub action caching](https://github.com/TickleThePanda/home/commit/dbd96b54b2682a9c891d46998ee0052372734110)
- Limit [make target and parallelise](https://github.com/TickleThePanda/home/commit/a4ef4b5fb1fca87adc60a2d8d6b968ddc6daaf06#diff-c651ffdc6f504d3529bc35822c425266e116c9bd24eddcd32786cadd6b7d4097R28)

### Actually making the videos

Now I've got this far, I need to actually make the video. I [wrote a script]
to pull all of the files together and then turn them into an image.

A quick overview of this:

1. Fetch the images from the Raspberry Pi, using `rsync`.
2. For each image, do some colour correction and image cleanup.
3. Use `mencoder` to stitch them together into a video.
4. Use `ffmpeg` to compress the video into something usable.

[open source]: https://github.com/TickleThePanda/home/tree/main/rpi-timelapse
[raspberry pi 4]: https://thepihut.com/products/raspberry-pi-4-model-b
[raspberry pi camera module]: https://thepihut.com/products/raspberry-pi-camera-module
[raspicam]: https://github.com/dhowden/raspicam
[using mutexes]: https://github.com/TickleThePanda/home/commit/acbb42a1e29b7a2d21f0654e3d495d5c4defbd40#diff-fa6e2072fed12f56f8f479493c7694d8c2a3caf029d42e21382e924ca0967081R17
[use channels]: https://github.com/TickleThePanda/home/commit/c43c2d392699a5c0764673b16741dbb1d2f0249b
[reading and creating images at the same time]: https://github.com/TickleThePanda/home/commit/b61e0410207cf5aac9cad881516a0b9967289112
[significant work]: https://github.com/TickleThePanda/home/commit/274e2bf74880c93411df2d45b0a59cd7707b3d3d
[wrote a script]: https://github.com/TickleThePanda/home/blob/main/rpi-timelapse/images-to-video
