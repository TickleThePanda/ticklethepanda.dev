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
    console.log(galleryParameter);
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

  function loadGalleries() {
    return fetch(ENV.apiBaseUrl + '/gallery')
      .then(function(response) {
        return response.json()
      })
      .then(function(result) {
        let thumbsPath = result.thumbsPath;
        let fullPath = result.fullPath;

        let galleries = result.galleries.map((gallery, i) => {
          let navGenerator = () => {
            let nav = '';
            if(i !== 0) {
              nav += `<a href='#gallery=${ result.galleries[i - 1].reference }' class='prev'>&lt;-- prev</a>&nbsp;`
            }
            if(i !== result.galleries.length -1) {
              nav += `<a href='#gallery=${ result.galleries[i + 1].reference }' class='next'>next --&gt;</a>`
            }
            return nav;
          };
          let imagesGenerator = () => {
            return gallery.images.map((image) => {
              return `
                <a class='${ image.favourite ? 'favourite' : '' }'
                    href='${ENV.assetsBaseUrl}${fullPath}${gallery.reference}/${image.fileName}'>
                  <img src='${ENV.assetsBaseUrl}${ image.favourite ? fullPath : thumbsPath }${ gallery.reference }/${ image.fileName }'>
                </a>`;
            }).join('');
          }
          return `
            <div id='gallery-${gallery.reference}' class='gallery-container'>
              <div class='gallery-nav'>
                ${ navGenerator() }
              </div>
              <h2>${ gallery.name }</h2>
              <p>${ gallery.description }</p>
              <div class='gallery'>
                ${ imagesGenerator() }
              </div>
            </div>`;
        });

        let galleriesElement = document.getElementById('galleries');
        galleries.forEach((gallery) => {
          galleriesElement.innerHTML += gallery;
        });
      });
  }

  window.onhashchange = showSelectedGallery;
  loadGalleries().then(showSelectedGallery);
})();
