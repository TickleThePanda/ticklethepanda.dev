window.addEventListener('load', generateRandomCardClipPath);

function generateRandomCardClipPath() {
  const cards = document.querySelectorAll('.card');

  for (let card of cards) {

    const safeZone = getComputedStyle(card).getPropertyValue('--random-border--safe-padding');

    /*
     * We're going to generate points around each of the corners.
     */
    const cornerGenerationPoints = [
      {
        x: "0%",
        y: "0%",
        d: {
          x: 1,
          y: 1
        },
        d1: {
          x: 0,
          y: 1
        },
        d2: {
          x: 1,
          y: 0
        }
      },
      {
        x: "100%",
        y: "0%",
        d: {
          x: -1,
          y: 1
        },
        d1: {
          x: -1,
          y: 0
        },
        d2: {
          x: 0,
          y: 1
        }
      },
      {
        x: "100%",
        y: "100%",
        d: {
          x: -1,
          y: -1
        },
        d1: {
          x: 0,
          y: -1
        },
        d2: {
          x: -1,
          y: 0
        }
      },
      {
        x: "0%",
        y: "100%",
        d: {
          x: 1,
          y: -1
        },
        d1: {
          x: 1,
          y: 0
        },
        d2: {
          x: 0,
          y: -1
        }
      },
    ]

    const allPoints = [];

    for (let corner of cornerGenerationPoints) {

      if (Math.random() > 0.6) {

        allPoints.push(`
          calc(${corner.x} + ${corner.d1.x} * ${safeZone} + ${Math.random() * corner.d.x} * ${safeZone})
          calc(${corner.y} + ${corner.d1.y} * ${safeZone} + ${Math.random() * corner.d.y} * ${safeZone})
        `);
        allPoints.push(`
          calc(${corner.x} + ${corner.d2.x} * ${safeZone} + ${Math.random() * corner.d.x} * ${safeZone})
          calc(${corner.y} + ${corner.d2.y} * ${safeZone} + ${Math.random() * corner.d.y} * ${safeZone})
        `);
      } else {
        allPoints.push(`
          calc(${corner.x} + ${Math.random() * corner.d.x} * ${safeZone})
          calc(${corner.y} + ${Math.random() * corner.d.y} * ${safeZone})
        `)
      }

    }

    console.log(allPoints);

    const clipPathValue = `polygon(${allPoints.join(',')})`;

    console.log(clipPathValue);

    card.style.clipPath = clipPathValue;

    console.log(card.style);

  }
}