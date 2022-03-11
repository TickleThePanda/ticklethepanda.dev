window.addEventListener("load", function () {
  function generateRandomCssPolygonForElement(randomBorderElement) {
    const safeZone = getComputedStyle(randomBorderElement).getPropertyValue(
      "--random-border--safe-padding"
    );
    const cornerStyle = getComputedStyle(randomBorderElement).getPropertyValue(
      "--random-border--corner-style"
    );

    /*
     * We're going to generate points around each of the corners.
     */
    const cornerGenerationPoints = [
      {
        x: "0%",
        y: "0%",
        d: {
          x: 1,
          y: 1,
        },
        d1: {
          x: 0,
          y: 1,
        },
        d2: {
          x: 1,
          y: 0,
        },
      },
      {
        x: "100%",
        y: "0%",
        d: {
          x: -1,
          y: 1,
        },
        d1: {
          x: -1,
          y: 0,
        },
        d2: {
          x: 0,
          y: 1,
        },
      },
      {
        x: "100%",
        y: "100%",
        d: {
          x: -1,
          y: -1,
        },
        d1: {
          x: 0,
          y: -1,
        },
        d2: {
          x: -1,
          y: 0,
        },
      },
      {
        x: "0%",
        y: "100%",
        d: {
          x: 1,
          y: -1,
        },
        d1: {
          x: 1,
          y: 0,
        },
        d2: {
          x: 0,
          y: -1,
        },
      },
    ];

    const allPoints = [];

    for (let corner of cornerGenerationPoints) {
      if (Math.random() > 0.6 && cornerStyle !== "single") {
        allPoints.push(`
          calc(${corner.x} + ${corner.d1.x} * ${safeZone} + ${
          Math.random() * corner.d.x
        } * ${safeZone})
          calc(${corner.y} + ${corner.d1.y} * ${safeZone} + ${
          Math.random() * corner.d.y
        } * ${safeZone})
        `);
        allPoints.push(`
          calc(${corner.x} + ${corner.d2.x} * ${safeZone} + ${
          Math.random() * corner.d.x
        } * ${safeZone})
          calc(${corner.y} + ${corner.d2.y} * ${safeZone} + ${
          Math.random() * corner.d.y
        } * ${safeZone})
        `);
      } else {
        const point = `
          calc(${corner.x} + ${Math.random() * corner.d.x} * ${safeZone})
          calc(${corner.y} + ${Math.random() * corner.d.y} * ${safeZone})
        `;
        allPoints.push(point);
        // add a second point to support animations
        allPoints.push(point);
      }
    }

    return `polygon(${allPoints.join(",")})`;
  }

  function generateRandomCardClipPath() {
    const randomBorderElements = Array.from(
      document.querySelectorAll(".js-random-border")
    ) as Array<HTMLElement>;

    for (let randomBorderElement of randomBorderElements) {
      const originalClipPath =
        generateRandomCssPolygonForElement(randomBorderElement);
      randomBorderElement.style.clipPath = originalClipPath;

      if (randomBorderElement.classList.contains("js-random-border-hover")) {
        let animation = undefined;

        randomBorderElement.addEventListener("mouseenter", function () {
          const animationTime =
            parseInt(
              getComputedStyle(randomBorderElement).getPropertyValue(
                "--random-border--animation-duration-ms"
              )
            ) || 0;

          const currentClipPath =
            getComputedStyle(randomBorderElement).getPropertyValue("clip-path");

          if (animation && animation.playState === "running") {
            animation.cancel();
          }

          const newClipPath =
            generateRandomCssPolygonForElement(randomBorderElement);
          randomBorderElement.style.clipPath = newClipPath;
          animation = randomBorderElement.animate(
            [
              {
                // from
                clipPath: currentClipPath,
              },
              {
                // to
                clipPath: newClipPath,
              },
            ],
            animationTime
          );
        });

        randomBorderElement.addEventListener("mouseleave", function () {
          const animationTime =
            parseInt(
              getComputedStyle(randomBorderElement).getPropertyValue(
                "--random-border--animation-duration-ms"
              )
            ) || 0;

          const currentClipPath =
            getComputedStyle(randomBorderElement).getPropertyValue("clip-path");

          if (animation && animation.playState === "running") {
            animation.cancel();
          }

          randomBorderElement.style.clipPath = originalClipPath;
          animation = randomBorderElement.animate(
            [
              {
                // from
                clipPath: currentClipPath,
              },
              {
                // to
                clipPath: originalClipPath,
              },
            ],
            animationTime
          );
        });
      }
    }
  }

  generateRandomCardClipPath();
});
