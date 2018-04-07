(function() {

  Array.prototype.forEach.call(document.getElementsByClassName('nav-toggle'), function(toggleElement) {
      toggleElement.addEventListener('click', function(event) {
        Array.prototype.forEach.call(document.getElementsByClassName('sidebar-content'), function(navElement) {
          navElement.classList.toggle('open-nav');
        });
      });
  });

  document.addEventListener('click', function(event) {
    let target = event.target || event.srcElement;

    if (hasClassInAncestry(target, 'nav-toggle')) {
      return;
    }

    Array.prototype.forEach.call(document.getElementsByClassName('sidebar-content'), function(navElement) {
      navElement.classList.remove('open-nav');
    });

  });

  function hasClassInAncestry(element, className) {
    do {
      if (element.classList.contains(className)) {
        return true;
      }
      element = element.parentNode;
    } while (element);

    return false;
  }
})();

