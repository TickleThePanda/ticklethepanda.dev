<?php
#content/home.php
require_once($_SERVER['DOCUMENT_ROOT'].'/../private/page-template.php');
# trick to execute 1st time, but not 2nd so you don't have an inf loop
if (!isset($TPL)) {
    $TPL = new PageTemplate();
    $TPL->PageTitle = "about";
    $TPL->ContentBody = __FILE__;
    include $_SERVER['DOCUMENT_ROOT'].'/../private/page-layout.php';
    exit;
}
?>
<img id="my-face" src="/images/content/me.png">
<h3>Meet Panda</h3>
<p class="first-paragraph">Hi, my name is Thomas 'Panda' Attwood. TickleThePanda is a pseudonym that I use while working online. I studied Computer Science at Royal Holloway, Universty of London. I'm now working as a full stack web developer at STFC; the main technologies that I work with are Java (and JavaEE), C#, HTML5, CSS3, and JavaScript. I love writing software that presents data in unique and interesting ways and I also enjoy web design and photography.</p>
<div id="social-media-widget">
  <div class="social-media-link">
    <a href='https://twitter.com/ticklethepanda'>
      <img src='/images/social/twitter.png'>
    </a>
  </div>
  <div class="social-media-link">
    <a href='https://github.com/ticklethepanda'>
      <img src='/images/social/github.png'>
    </a>
  </div>
  <div class="social-media-link">
    <a href='https://facebook.com/1320190799'>
      <img src='/images/social/facebook.png'>
    </a>
  </div>
</div>

