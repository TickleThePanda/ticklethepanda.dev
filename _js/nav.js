(function() {

  Array.prototype.forEach.call(document.getElementsByClassName("nav-toggle"), function(toggleElement) {
      toggleElement.addEventListener("click", function(event) {
        Array.prototype.forEach.call(document.getElementsByClassName("sidebar-content"), function(navElement) {
          navElement.classList.add("open-nav");
        });
      });
  });

  document.addEventListener("click", function(event) {
    let target = event.target || event.srcElement;

    if (target.classList.contains("nav-toggle")) {
      return;
    }

    Array.prototype.forEach.call(document.getElementsByClassName("sidebar-content"), function(navElement) {
      navElement.classList.remove("open-nav");
    });

  });
})();
