(function() {

  const imagesBaseUrl = document.documentElement.dataset.urlImages;

  function modulo(n, d) {
    return ((n % d) + d) % d;
  };

  function getYearMonthValues() {
    let yearMonths = [];
    let date = new Date('2012-06');
    let twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    while (date < twoMonthsAgo) {
      yearMonths.push(date.toISOString().substring(0, 7));
      date.setMonth(date.getMonth() + 1);
    }
    return yearMonths;
  }

  const data = {
    'all': {
      value: 'all'
    },
    'month': [
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december'
    ],
    'weekday': [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday'
    ],
    'year-month': (getYearMonthValues())
  };

  const slideshowContainer = document.querySelector('#location-slideshow');
  const imageContainer = slideshowContainer.querySelector('.image-container');
  const slideshowController = slideshowContainer.querySelector('.play-controls');

  const infoContainer = slideshowContainer.querySelector('.info');

  const playButton = slideshowController.querySelector('.play');
  const nextButton = slideshowController.querySelector('.next');
  const prevButton = slideshowController.querySelector('.prev');

  let state = {
    facet: 'all',
    index: null,
    intervalId: null
  }

  let imageCache = {};

  function getUrlFromState() {

    let facet = data[state.facet];

    if (!facet.value) {
      let selectedItem = facet[state.index];
      return `${imagesBaseUrl}/location-history/default-${selectedItem}.png`;
    } else {
      return `${imagesBaseUrl}/location-history/default-${facet.value}.png`;
    }
  }

  function getImageForState() {

    let facet = state.facet;
    let index = state.index;

    if (imageCache[facet] && imageCache[facet][index]) {
      return imageCache[facet][index];
    } else {
      let image = new Image();

      image.src = getUrlFromState();

      if (!imageCache[facet]) {
        imageCache[facet] = {};
      }

      imageCache[facet][index] = image;

      return image;

    }
  }

  function updateView() {

    let currentImage = imageContainer.querySelector('img');

    let image = getImageForState();

    if (currentImage) {
      imageContainer.replaceChild(image, currentImage);
    } else {
      imageContainer.appendChild(image);
    }

    if (!data[state.facet].value) {
      slideshowController.querySelectorAll('button').forEach(button => button.removeAttribute('disabled'));
      infoContainer.innerHTML = `${data[state.facet][state.index]}`;
    } else {
      slideshowController.querySelectorAll('button').forEach(button => button.setAttribute('disabled', null));
      infoContainer.innerHTML = "";
    }

    document.querySelectorAll('#location-slideshow .facets button').forEach(button => {
      button.classList.remove('button--selected');
    });

    document.querySelector('#location-facet-' + state.facet).classList.add('button--selected');

    if (state.intervalId !== null) {
      playButton.innerHTML = 'Pause';
    } else {
      playButton.innerHTML = 'Play';
    }
  }

  Object.keys(data).forEach(facet => {
    document.querySelector('#location-facet-' + facet).addEventListener('click', event => {
      clearInterval(state.intervalId);
      state.intervalId = null;

      state.facet = facet;
      if (!data[facet].value) {
        state.index = 0;
      } else {
        state.index = null;
      }

      updateView();

    });
  });

  playButton.addEventListener('click', event => {
    if (state.intervalId) {
      clearInterval(state.intervalId);
      state.intervalId = null;
      updateView();
    } else {
      state.intervalId = setInterval(() => {
        state.index = modulo(++state.index, data[state.facet].length);
        updateView();
      }, 1000);
      updateView();
    }
  });

  nextButton.addEventListener('click', event => {
    state.index = modulo(++state.index, data[state.facet].length);
    updateView();
  });

  prevButton.addEventListener('click', event => {
    state.index = modulo(--state.index, data[state.facet].length);
    updateView();
  });

  updateView();

  document.querySelector('#location-facet-all').classList.add('selected');


})();
