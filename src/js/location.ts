const locationHistoryBaseUrl = document.documentElement.dataset.urlLocationHistory;

function modulo(n: number, d: number) {
  return ((n % d) + d) % d;
}

function getYearMonthValues(): FacetView {
  const yearMonths = [];
  const date = new Date("2012-06");
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

  while (date < twoMonthsAgo) {
    yearMonths.push(date.toISOString().substring(0, 7));
    date.setMonth(date.getMonth() + 1);
  }
  return new MultiView("year-month", yearMonths);
}

interface ImageDescriptor {
  name: string;
  url: string;
  cachePattern: string;
}

interface FacetView {
  getItems(): string | string[];
  getCurrentItem(): ImageDescriptor;
  seekItem(diff: number): ImageDescriptor;
  iterateNext(): void;
  iteratePrev(): void;
  setIndex(index: number): void;
  getName(): string;
}

class SingleView implements FacetView {
  #name: string;
  constructor(name: string) {
    this.#name = name;
  }
  getCurrentItem(): ImageDescriptor {
    return {
      name: this.#name,
      url: `${locationHistoryBaseUrl}/location-history/default-${this.#name}.png`,
      cachePattern: this.#name,
    };
  }

  seekItem(): ImageDescriptor {
    return this.getCurrentItem();
  }

  getItems(): string | string[] {
    return this.#name;
  }
  iterateNext(): void {
    /* no op */
  }
  iteratePrev(): void {
    /* no op */
  }
  setIndex(): void {
    /* no op */
  }
  getName(): string {
    return this.#name;
  }
}

class MultiView implements FacetView {
  #name: string;
  #index: number;
  #items: string[];
  constructor(name: string, items: string[]) {
    this.#name = name;
    this.#items = items;
    this.#index = 0;
  }

  getCurrentItem(): ImageDescriptor {
    return this.seekItem(0);
  }

  seekItem(diff: number): ImageDescriptor {
    const item = this.#items[modulo(this.#index + diff, this.#items.length)];
    return {
      name: item,
      url: `${locationHistoryBaseUrl}/location-history/default-${item}.png`,
      cachePattern: `${this.#name}-${item}`,
    };
  }

  getItems(): string | string[] {
    return this.#items;
  }
  iterateNext(): void {
    this.#index = modulo(this.#index + 1, this.#items.length);
  }
  iteratePrev(): void {
    this.#index = modulo(this.#index - 1, this.#items.length);
  }
  setIndex(index: number): void {
    this.#index = index;
  }
  getName(): string {
    return this.#name;
  }
}

const data: Record<string, FacetView> = {
  all: new SingleView("all"),
  month: new MultiView("month", [
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
  ]),
  weekday: new MultiView("weekday", [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ]),
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

const state: {
  facet: FacetView;
  intervalId: number | null;
} = {
  facet: data["all"],
  intervalId: null,
};

const imageCache: Record<string, HTMLImageElement> = {};

function cacheImagesForState() {
  for (const facet of Object.values(data)) {
    getImage(facet.getCurrentItem());
  }

  getImage(state.facet.seekItem(-1));
  getImage(state.facet.seekItem(1));
}

function getImage(descriptor: ImageDescriptor) {
  const { cachePattern } = descriptor;

  if (imageCache[cachePattern]) {
    return imageCache[cachePattern];
  } else {
    const image = buildImage(descriptor);

    imageCache[cachePattern] = image;

    return image;
  }
}

function buildImage(descriptor: ImageDescriptor) {
  const image = new Image();

  image.src = descriptor.url;

  return image;
}

function updateView() {
  const currentImage = imageContainer.querySelector("img");

  const image = getImage(state.facet.getCurrentItem());

  cacheImagesForState();

  if (currentImage) {
    imageContainer.replaceChild(image, currentImage);
  } else {
    imageContainer.appendChild(image);
  }

  const items = state.facet.getItems();
  console.log(items);
  const buttons = slideshowController.querySelectorAll("button");

  if (Array.isArray(items)) {
    buttons.forEach((button) => button.removeAttribute("disabled"));
    infoContainer.innerHTML = `${state.facet.getCurrentItem().name}`;
  } else {
    buttons.forEach((button) => button.setAttribute("disabled", ""));
    infoContainer.innerHTML = "";
  }

  const facetButtons = document.querySelectorAll(
    "#location-slideshow .facets button"
  );

  facetButtons.forEach((button) => {
    button.classList.remove("button--selected");
  });

  const locationFacet = <HTMLElement>(
    document.querySelector("#location-facet-" + state.facet.getName())
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
  locationFacetButton.addEventListener("click", () => {
    if (state.intervalId !== null) {
      clearInterval(state.intervalId);
    }
    state.intervalId = null;

    state.facet = data[facet];
    state.facet.setIndex(0);

    updateView();
  });
});

playButton.addEventListener("click", () => {
  const items = state.facet.getItems();
  if (!Array.isArray(items)) {
    throw new Error("Cannot play for a facet without items");
  }
  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = null;
    updateView();
  } else {
    state.intervalId = setInterval(() => {
      state.facet.iterateNext();
      updateView();
    }, 1000);
    updateView();
  }
});

nextButton.addEventListener("click", () => {
  const items = state.facet.getItems();
  if (!Array.isArray(items)) {
    throw new Error("Cannot play for a facet without items");
  }
  state.facet.iterateNext();
  updateView();
});

prevButton.addEventListener("click", () => {
  const items = state.facet.getItems();
  if (!Array.isArray(items)) {
    throw new Error("Cannot play for a facet without items");
  }
  state.facet.iteratePrev();
  updateView();
});

updateView();

const locationFacetAll = <HTMLElement>(
  document.querySelector("#location-facet-all")
);

locationFacetAll.classList.add("selected");
