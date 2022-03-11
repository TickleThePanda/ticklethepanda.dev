function registerDomLoadedEvent(cb: () => void) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", cb);
  } else {
    cb();
  }
}

registerDomLoadedEvent(makeGalleryLinksPushState);
registerDomLoadedEvent(showSelectedGallery);

window.addEventListener("popstate", showSelectedGallery);

function getSelectedGalleryId() {
  let params = new URLSearchParams(document.location.search.substring(1));
  return "gallery-" + params.get("gallery");
}

function showSelectedGallery() {
  let selectedGalleryId = getSelectedGalleryId();

  let galleryElements = document.querySelectorAll(".gallery");
  let galleryElementIds = Array.from(galleryElements).map((el) => el.id);

  galleryElements.forEach((el) => {
    el.classList.remove("selected");
  });

  if (selectedGalleryId && galleryElementIds.includes(selectedGalleryId)) {
    let selectedGalleryElement = <HTMLElement>(
      document.getElementById(selectedGalleryId)
    );

    selectedGalleryElement.classList.add("selected");
  } else {
    galleryElements[0].classList.add("selected");
  }
}

function makeGalleryLinksPushState() {
  let galleryNavLinkElements = Array.from(
    document.querySelectorAll(".gallery nav a")
  ) as Array<HTMLLinkElement>;

  for (const el of galleryNavLinkElements) {
    el.addEventListener(
      "click",
      (e) => {
        e.preventDefault();
        window.history.pushState(null, "", el.href);
        showSelectedGallery();
      },
      true
    );
  }
}
