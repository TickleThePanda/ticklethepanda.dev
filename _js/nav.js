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
})();
