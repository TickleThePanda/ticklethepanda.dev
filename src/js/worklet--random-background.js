class RandomBorder {

  static get inputProperties() {
    return [
      '--random-border--background-color',
      '--random-border--safe-padding'
    ];
  }

  paint(ctx, geom, properties) {

    const safeZone = properties.get('--random-border--safe-padding').value;
    const color = properties.get('--random-border--background-color');

    ctx.fillStyle = color;

    const width = geom.width;
    const height = geom.height;

    /*
     * We're going to generate points around each of the corners.
     */
    const cornerGenerationPoints = [
      {
        x: safeZone / 2,
        y: safeZone / 2,
        d1: {
          x: 0,
          y: safeZone
        },
        d2: {
          x: safeZone,
          y: 0
        }
      },
      {
        x: width - safeZone / 2,
        y: safeZone / 2,
        d1: {
          x: -safeZone,
          y: 0
        },
        d2: {
          x: 0,
          y: safeZone
        }
      },
      {
        x: width - safeZone / 2,
        y: height - safeZone / 2,
        d1: {
          x: 0,
          y: -safeZone
        },
        d2: {
          x: -safeZone,
          y: 0
        }
      },
      {
        x: safeZone / 2,
        y: height - safeZone / 2,
        d1: {
          x: safeZone,
          y: 0
        },
        d2: {
          x: 0,
          y: -safeZone
        }
      },
    ]

    const allPoints = [];

    for (let corner of cornerGenerationPoints) {
      const pointsInThisCorner = [];

      const safeRandom = () => Math.random() * safeZone - safeZone / 2;

      if (Math.random() > 0.6) {
        allPoints.push({
          x: corner.x + corner.d1.x + safeRandom(),
          y: corner.y + corner.d1.y + safeRandom(),
        });
        allPoints.push({
          x: corner.x + corner.d2.x + safeRandom(),
          y: corner.y + corner.d2.y + safeRandom(),
        });
      } else {
        allPoints.push({
          x: corner.x + safeRandom(),
          y: corner.y + safeRandom()
        })
      }


      for (let point of pointsInThisCorner) {
        allPoints.push(point);
      }

    }

    ctx.moveTo(allPoints[0].x, allPoints[0].y);

    for (let point of allPoints.slice(1, allPoints.length)) {
      ctx.lineTo(point.x, point.y);
    }

    ctx.closePath();
    ctx.fill();


  }
}

registerPaint('randomBorder', RandomBorder);