document.getElementById("nav-toggle").addEventListener("click", function(event) {
  var nav = document.getElementById("nav");
  if (nav.classList.contains("open-nav")) {
    nav.className = nav.className.replace(/\bopen-nav\b/,'');
  } else {
    nav.className = nav.className + "open-nav";
  }
});