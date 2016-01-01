<?php
#content/home.php
require_once($_SERVER['DOCUMENT_ROOT'].'/page-template.php');
# trick to execute 1st time, but not 2nd so you don't have an inf loop
if (!isset($TPL)) {
    $TPL = new PageTemplate();
    $TPL->PageTitle = "photography";
    $TPL->ContentBody = __FILE__;
    include $_SERVER['DOCUMENT_ROOT'].'/page-layout.php';
    exit;
}
?>
<h3>
  Wandering Kew Gardens
</h3>
<p class="first-paragraph">
  I visited Kew Gardens with my girlfriend in June, 2013. For most of it we did lounge around; however, when we did move about, it was a perfect day for taking photographs. These are my favourite photographs from that day.
</p>
<?php
  $image_location = "/images/photography/";
  include "gallery.php";
?>