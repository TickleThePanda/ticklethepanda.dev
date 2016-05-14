<?php
#content/home.php
require_once($_SERVER['DOCUMENT_ROOT'].'/../private/page-template.php');
# trick to execute 1st time, but not 2nd so you don't have an inf loop
if (!isset($TPL)) {
    $TPL = new PageTemplate();
    $TPL->PageTitle = "error 404";
    $TPL->ContentBody = __FILE__;
    include $_SERVER['DOCUMENT_ROOT'].'/../private/page-layout.php';
    exit;
}
?>

<p>Error: 404. The page you were looking for does not exist.</p>
