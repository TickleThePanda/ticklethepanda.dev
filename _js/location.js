(function() {

  function modulo(n, d) {
    return ((n % d) + d) % d;
  };
  const baseUrl = ENV.apiBaseUrl + '/location?img&sum';

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
    'all': {},
    'month': {
      param: 'month',
      items: [
        'JANUARY',
        'FEBRUARY',
        'MARCH',
        'APRIL',
        'MAY',
        'JUNE',
        'JULY',
        'AUGUST',
        'SEPTEMBER',
        'OCTOBER',
        'NOVEMBER',
        'DECEMBER'
      ]
    },
    'weekday': {
      param: 'weekday',
      items: [
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY',
        'SUNDAY'
      ]
    },
    'year-month': {
      param: 'yearMonth',
      items: (getYearMonthValues())
    }
  };

  const slideshowContainer = document.querySelector('#location-slideshow');
  const imageContainer = slideshowContainer.querySelector('.image-container');
  const slideshowController = slideshowContainer.querySelector('.controller');

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

    let param = facet.param;

    if (param) {
      let selectedItem = facet.items[state.index];
      return `${baseUrl}&${param}=${selectedItem}`;
    } else {
      return `${baseUrl}`;
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
    console.log('state', state);

    let currentImage = imageContainer.querySelector('img');

    let image = getImageForState();
  
    if (currentImage) {
      imageContainer.replaceChild(image, currentImage);
    } else {
      imageContainer.appendChild(image);
    }

    if (data[state.facet].param) {
      slideshowController.querySelectorAll('button').forEach(button => button.removeAttribute('disabled'));
    } else {
      slideshowController.querySelectorAll('button').forEach(button => button.setAttribute('disabled', null));
    }
  }

  Object.keys(data).forEach(facet => {
    document.querySelector('#location-facet-' + facet).addEventListener('click', event => {
      clearInterval(state.intervalId);

      state.facet = facet;
      if (data[facet].param) {
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
    } else {
      state.intervalId = setInterval(() => {
        state.index = modulo(++state.index, data[state.facet].items.length);
        updateView();
      }, 1000);
    }
  });

  nextButton.addEventListener('click', event => {
    state.index = modulo(++state.index, data[state.facet].items.length);
    updateView();
  });

  prevButton.addEventListener('click', event => {
    state.index = modulo(--state.index, data[state.facet].items.length);
    updateView();
  });

  updateView();

  document.querySelector('#location-facet-all').setAttribute('checked', null);


})();
