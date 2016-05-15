<?php
#content/home.php
require_once($_SERVER['DOCUMENT_ROOT'].'/../private/page-template.php');
# trick to execute 1st time, but not 2nd so you don't have an inf loop
if (!isset($TPL)) {
    $TPL = new PageTemplate();
    $TPL->PageTitle = "location map";
    $TPL->ContentBody = __FILE__;
    include $_SERVER['DOCUMENT_ROOT'].'/../private/page-layout.php';
    exit;
}
?>

<p class="first-paragraph">Since around 2012 I've had a phone that keeps track of my location whenever it's on, using Google's Location History.</p>
<p>This GIF below shows my location history at every month since I've been tracking my location.</p>
<img src="/images/location/locations.gif" alt="location gif"/>
<p>To see the code for how I created this: visit <a href="https://github.com/TickleThePanda/location-history">the GitHub repository</a>.
