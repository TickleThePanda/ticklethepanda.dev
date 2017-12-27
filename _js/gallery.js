(function() {
  function getHashParameters() {
    var hashKeyValues = location.hash.substring(1).split('&');
    var parameters = {};
    hashKeyValues.map(function(kvPair) {
      var pair = kvPair.split('=');
      var key = pair[0];
      var value = pair[1];
      return { key: key,
          value: value };
    }).forEach(function(pair) {
      parameters[pair.key] = pair.value;
    });
    return parameters;
  }

  function showSelectedGallery(e) {
    let parameters = getHashParameters();

    let galleryParameter = parameters['gallery'];
    if (galleryParameter) {
      let galleries = document.getElementsByClassName('gallery-container');
      if(galleries.length > 0) {
        Array.prototype.forEach.call(galleries, function(element) {
          element.style.display = 'none';
        });

        let selectedGallery = document.getElementById('gallery-' + galleryParameter);
        if (selectedGallery) {
          selectedGallery.style.display = 'block';
        } else {
          galleries[0].style.display = 'block';
        }
      }

    }
  }

  window.addEventListener('hashchange', showSelectedGallery);
  window.addEventListener('load', showSelectedGallery);
})();
