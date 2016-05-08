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
<h3>Meet Panda</h3>
<p class="first-paragraph">Hi, my name is Thomas 'Panda' Attwood. TickleThePanda is a pseudonym that I use while working online. I am currently studying Computer Science (BSc) at Royal Holloway, University of London. I love writing software that presents data in unique and interesting ways and I also enjoy web design and photography.</p>
<p><a class="github-link" href="https://github.com/TickleThePanda"><img src="images/social/github.png"></img>TickleThePanda on GitHub</a></p>
<p><a href="https://twitter.com/ticklethepanda" class="twitter-follow-button" data-show-count="false">Follow @ticklethepanda</a><script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script></p>
