<?php
#content/home.php
require_once($_SERVER['DOCUMENT_ROOT'].'/../private/page-template.php');
# trick to execute 1st time, but not 2nd so you don't have an inf loop
if (!isset($TPL)) {
    $TPL = new PageTemplate();
    $TPL->PageTitle = "home";
    $TPL->ContentBody = __FILE__;
    include $_SERVER['DOCUMENT_ROOT'].'/../private/page-layout.php';
    exit;
}
?>
<img id="my-face" src="/images/content/me.png">
<h3>Meet Panda</h3>
<p class="first-paragraph">Hi, my name is Thomas 'Panda' Attwood. TickleThePanda is a pseudonym that I use while working online. I studied Computer Science at Royal Holloway, Universty of London. I'm now working as a full stack web developer at STFC; the main technologies that I work with are Java (and JavaEE), C#, HTML5, CSS3, and JavaScript. I love writing software that presents data in unique and interesting ways and I also enjoy web design and photography.</p>
<h3>Experience</h3>
<div class="experiences">
  <div class="experience">
    <div class="role">Graduate Software Engineer</div>
    <div class="dates">August 2015 - Present</div>
    <div class="place">Science and Technology Facilities Council</div>
    <div class="description">Designing, developing, testing, maintaining, and providing support for web applications. Experience managing and supervising an individual.</div>
  </div>
  <div class="experience">
    <div class="role">BSc Computer Science (Hons) - First Class</div>
    <div class="dates">2012-2015</div>
    <div class="place">Royal Holloway, University of London</div>
  </div>
</div>

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


