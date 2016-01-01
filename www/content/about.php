<?php
#content/home.php
require_once($_SERVER['DOCUMENT_ROOT'].'/page-template.php');
# trick to execute 1st time, but not 2nd so you don't have an inf loop
if (!isset($TPL)) {
    $TPL = new PageTemplate();
    $TPL->PageTitle = "about";
    $TPL->ContentBody = __FILE__;
    include $_SERVER['DOCUMENT_ROOT'].'/page-layout.php';
    exit;
}
?>
<h3>Meet Panda</h3>
<p class="first-paragraph">Hi, my name is Thomas 'Panda' Attwood. TickleThePanda is a pseudonym that I use while working online. I am currently studying Computer Science (BSc) at Royal Holloway, University of London. I love writing software that presents data in unique and interesting ways and I also enjoy web design and photography.</p>