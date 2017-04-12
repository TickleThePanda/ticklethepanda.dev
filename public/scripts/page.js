(function() {
  function getNav() {
    return document.getElementById("sidebar-content");
  }

  function closeNav(nav) {
    nav.className = nav.className.replace(/\bopen-nav\b/,'');
  };

  document.getElementById("nav-toggle")
      .addEventListener("click", function(event) {
    var nav = getNav();
    if (nav.classList.contains("open-nav")) {
      closeNav(nav);
    } else {
      nav.className = nav.className + "open-nav";
    }
  });

  document.addEventListener("click", function(event) {
    let target = event.target || event.srcElement;

    let navToggle = document.getElementById("nav-toggle");

    if (!navToggle.isSameNode(target) 
        && !navToggle.contains(target)) {
      closeNav(getNav());
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
      galleryParameter = Math.max(Math.min(galleryParameter, nGalleries - 1),0);
    } else {
      galleryParameter = 0;
    }

    var galleryIndex = galleryParameter;

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
