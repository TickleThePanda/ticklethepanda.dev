window.addEventListener('load', function initialiseNav() {

  Array.prototype.forEach.call(document.getElementsByClassName('nav-toggle'), function(toggleElement) {
      toggleElement.addEventListener('click', function(event) {
        Array.prototype.forEach.call(document.getElementsByClassName('sidebar__content'), function(navElement) {
          navElement.classList.toggle('sidebar__content--open-nav');
        });
      });
  });

  document.addEventListener('click', function handleNavClick(event) {
    let target = event.target || event.srcElement;

    if (hasClassInAncestry(target, 'nav-toggle')) {
      return;
    }

    Array.prototype.forEach.call(document.getElementsByClassName('sidebar__content'), function(navElement) {
      navElement.classList.remove('sidebar__content--open-nav');
    });

  });

  function hasClassInAncestry(element, className) {
    do {
      if (element.classList && element.classList.contains(className)) {
        return true;
      }
      element = element.parentNode;
    } while (element);

    return false;
  }
});

