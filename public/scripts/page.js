(function() {
  document.getElementById("nav-toggle").addEventListener("click", function(event) {
    var nav = document.getElementById("nav");
    if (nav.classList.contains("open-nav")) {
      nav.className = nav.className.replace(/\bopen-nav\b/,'');
    } else {
      nav.className = nav.className + "open-nav";
    }
  });

  var getHashParameters = function getHashParameters() {
    var hashKeyValues = location.hash.substring(1).split("&");
    var parameters = {};
    hashKeyValues.map(function(kvPair) {
      console.log(kvPair);
      var pair = kvPair.split("=");
      console.log(pair);
      var key = pair[0];
      var value = pair[1];
      return { key: key,
          value: value };
    }).forEach(function(pair) {
      parameters[pair.key] = pair.value;
    });
    return parameters;
  }

  var showSelectedGallery = function showSelectedGallery(e) {
    var parameters = getHashParameters();

    var galleryParameter = parameters["gallery"];

    var galleries = document.getElementsByClassName("gallery-container");
    var nGalleries = galleries.length;


    if(galleryParameter != undefined) {
      galleryParameter = Math.max(Math.min(galleryParameter, nGalleries),1);
    } else {
      galleryParameter = 1;
    }

    var galleryIndex = galleryParameter - 1;

    if(nGalleries > 0) {
      Array.prototype.forEach.call(galleries, function(element) {
        element.style.display = "none";
      });
      galleries[galleryIndex].style.display = "block";
    }
  }

  window.onhashchange = showSelectedGallery;
  showSelectedGallery();
})();
