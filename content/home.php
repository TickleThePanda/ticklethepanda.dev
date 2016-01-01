<?php
#content/home.php
require_once($_SERVER['DOCUMENT_ROOT'].'/page-template.php');
# trick to execute 1st time, but not 2nd so you don't have an inf loop
if (!isset($TPL)) {
    $TPL = new PageTemplate();
    $TPL->PageTitle = "home";
    $TPL->ContentBody = __FILE__;
    include $_SERVER['DOCUMENT_ROOT'].'/page-layout.php';
    exit;
}
?>
<p class="first-paragraph"></p>