const imagesBaseUrl = document.documentElement.dataset.urlImages;

function modulo(n: number, d: number) {
  return ((n % d) + d) % d;
}

function getYearMonthValues() {
  let yearMonths = [];
  let date = new Date("2012-06");
  let twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

  while (date < twoMonthsAgo) {
    yearMonths.push(date.toISOString().substring(0, 7));
    date.setMonth(date.getMonth() + 1);
  }
  return yearMonths;
}

const data: Record<string, any> = {
  all: {
    value: "all",
  },
  month: [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ],
  weekday: [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ],
  "year-month": getYearMonthValues(),
};

const slideshowContainer = <HTMLElement>(
  document.querySelector("#location-slideshow")
);
const imageContainer = <HTMLElement>(
  slideshowContainer.querySelector(".image-container")
);
const slideshowController = <HTMLElement>(
  slideshowContainer.querySelector(".play-controls")
);

const infoContainer = <HTMLElement>slideshowContainer.querySelector(".info");

const playButton = <HTMLElement>slideshowController.querySelector(".play");
const nextButton = <HTMLElement>slideshowController.querySelector(".next");
const prevButton = <HTMLElement>slideshowController.querySelector(".prev");

let state: {
  facet: string;
  index: number;
  intervalId: number | null;
} = {
  facet: "all",
  index: 0,
  intervalId: null,
};

let imageCache: Record<string, any> = {};

function getImageForState() {
  let facetName = state.facet;
  let facetIndex = state.index;

  return getImage(facetName, facetIndex);
}

function cacheImagesForState() {
  for (let facet of Object.keys(data)) {
    getImage(facet, 0);
  }

  const currentFacet = state.facet;
  const currentIndex = state.index;

  if (!data[currentFacet].value) {
    const currentFacetLength = data[currentFacet].length;
    getImage(currentFacet, (currentIndex - 1) % currentFacetLength);
    getImage(currentFacet, (currentIndex + 1) % currentFacetLength);
  }
}

function getImage(facetName: string, facetIndex: number) {
  let facet = data[facetName];
  let item = facet[facetIndex];

  if (imageCache[facetName] && imageCache[facetName][facetIndex]) {
    return imageCache[facetName][facetIndex];
  } else {
    const image = buildImage(facet, item);

    if (!imageCache[facetName]) {
      imageCache[facetName] = {};
    }

    imageCache[facetName][facetIndex] = image;

    return image;
  }
}

function buildImage(facet: any, item: string) {
  const image = new Image();

  image.src = buildImageUrl(facet, item);

  return image;
}

function buildImageUrl(facet: any, item: string) {
  if (!facet.value) {
    return `${imagesBaseUrl}/location-history/default-${item}.png`;
  } else {
    return `${imagesBaseUrl}/location-history/default-${facet.value}.png`;
  }
}

function updateView() {
  let currentImage = imageContainer.querySelector("img");

  let image = getImageForState();

  cacheImagesForState();

  if (currentImage) {
    imageContainer.replaceChild(image, currentImage);
  } else {
    imageContainer.appendChild(image);
  }

  if (!data[state.facet].value) {
    slideshowController
      .querySelectorAll("button")
      .forEach((button) => button.removeAttribute("disabled"));
    infoContainer.innerHTML = `${data[state.facet][state.index]}`;
  } else {
    slideshowController
      .querySelectorAll("button")
      .forEach((button) => button.setAttribute("disabled", ""));
    infoContainer.innerHTML = "";
  }

  document
    .querySelectorAll("#location-slideshow .facets button")
    .forEach((button) => {
      button.classList.remove("button--selected");
    });

  const locationFacet = <HTMLElement>(
    document.querySelector("#location-facet-" + state.facet)
  );

  locationFacet.classList.add("button--selected");

  if (state.intervalId !== null) {
    playButton.innerHTML = "Pause";
  } else {
    playButton.innerHTML = "Play";
  }
}

Object.keys(data).forEach((facet) => {
  const locationFacetButton = <HTMLElement>(
    document.querySelector("#location-facet-" + facet)
  );
  locationFacetButton.addEventListener("click", (event) => {
    if (state.intervalId !== null) {
      clearInterval(state.intervalId);
    }
    state.intervalId = null;

    state.facet = facet;
    state.index = 0;

    updateView();
  });
});

playButton.addEventListener("click", (event) => {
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

nextButton.addEventListener("click", (event) => {
  state.index = modulo(++state.index, data[state.facet].length);
  updateView();
});

prevButton.addEventListener("click", (event) => {
  state.index = modulo(--state.index, data[state.facet].length);
  updateView();
});

updateView();

const locationFacetAll = <HTMLElement>(
  document.querySelector("#location-facet-all")
);

locationFacetAll.classList.add("selected");
