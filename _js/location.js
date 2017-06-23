(function() {

  const baseUrl = "https://api.ticklethepanda.co.uk/location?img&sum";

  const months = {
    param: "month",
    items: [
      "JANUARY",
      "FEBRUARY",
      "MARCH",
      "APRIL",
      "MAY",
      "JUNE",
      "JULY",
      "AUGUST",
      "SEPTEMBER",
      "OCTOBER",
      "NOVEMBER",
      "DECEMBER"
    ]
  };

  const weekdays = {
    param: "weekday",
    items: [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY"
    ]
  };

  function registerAnimationControllerEvents(container, descriptor) {
    const controller = container.getElementsByClassName("controller")[0];
    const prevController = controller.getElementsByClassName("prev")[0];
    const playController = controller.getElementsByClassName("play")[0];
    const nextController = controller.getElementsByClassName("next")[0];
    const info = container.getElementsByClassName("info")[0];
    const imageContainer = container.getElementsByClassName("image-container")[0];

    const items = descriptor.items;
    const length = items.length;
    const images = items.map(item => {
      let image = new Image();
      image.classList.add("selected-location");
      image.src = `${baseUrl}&${descriptor.param}=${item}`;
      return image;
    });

    let currentImage;
    let index = 0;
    let intervalId;
    
    function update() {
      index = ((index % length) + length) % length;
      let newImage = images[index];
      if (imageContainer.getElementsByClassName("selected-location").length > 0) {
        imageContainer.replaceChild(newImage, currentImage);
      } else {
        imageContainer.appendChild(newImage);
      }
      currentImage = newImage;
      info.textContent = items[index];
    }

    nextController.addEventListener("click", e => {
      index++;
      update();
    });

    prevController.addEventListener("click", e => {
      index--;
      update();
    });

    playController.addEventListener("click", e => {
      if (!intervalId) {
        intervalId = setInterval(() => {
          index++;
          update();
        }, 1000);
        playController.textContent = "stop";
      } else {
        clearInterval(intervalId);
        intervalId = null;
        playController.textContent = "play";
      }
    });

    update();
  }

  let monthsElement = document.getElementById("location-by-month");
  let weekdaysElement = document.getElementById("location-by-weekday");

  registerAnimationControllerEvents(monthsElement, months);
  registerAnimationControllerEvents(weekdaysElement, weekdays);

})();
