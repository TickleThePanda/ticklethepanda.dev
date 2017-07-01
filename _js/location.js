(function() {
  function modulo(n, d) {
    return ((n % d) + d) % d;
  };
  const baseUrl = "https://api.ticklethepanda.co.uk/location?img&sum";

  const data = [
    {
      param: "month",
      id: "location-by-month",
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
    },
    {
      param: "weekday",
      id: "location-by-weekday",
      items: [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY"
      ]
    },
    {
      param: "yearMonth",
      id: "location-by-year-month",
      items: (() => {
        let yearMonths = [];
        let date = new Date("2012-06");
        let twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
        
        while (date < twoMonthsAgo) {
          yearMonths.push(date.toISOString().substring(0, 7));
          date.setMonth(date.getMonth() + 1);
        }
        return yearMonths;
      })()
    }
  ];

  function registerAnimationControllerEvents(descriptor) {
    const container = document.getElementById(descriptor.id);
    const controller = container.getElementsByClassName("controller")[0];
    const prevController = controller.getElementsByClassName("prev")[0];
    const playController = controller.getElementsByClassName("play")[0];
    const nextController = controller.getElementsByClassName("next")[0];
    const info = container.getElementsByClassName("info")[0];
    const imageContainer = container.getElementsByClassName("image-container")[0];

    const items = descriptor.items;
    const length = items.length;
    const images = (function () {
      let loadedImages = [];
      let limit = 0;
      
      function loadImage(index) {
        loadedImages[index] = new Image();
        loadedImages[index].classList.add("selected-location");
        loadedImages[index].onload = loadNext(index);
        loadedImages[index].src = `${baseUrl}&${descriptor.param}=${items[index]}`;
      }

      function loadNext(index) { 
        return function() {
          if (index >= limit
              || index + 1 >= length) {
            return;
          } else if(loadedImages[index + 1] !== undefined) {
            loadNext(index + 1)();
          } else {
            loadImage(index + 1);
          }
        }
      }

      return {
        getImage: function(index) {
          limit = index + 3;
          if(loadedImages[index] == null) {
            loadImage(index);
          } else {
            loadNext(index)();
          }
          return loadedImages[index];
        }
      }
    })();

    let currentImage;
    let index = 0;
    let intervalId;
    
    function update() {
      index = modulo(index, length);
      let newImage = images.getImage(index);
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
  
  data.forEach(i => registerAnimationControllerEvents(i));

})();
