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
<p class="first-paragraph">Since around 2012 I've had a phone that keeps track of my location whenever it's on, using Google's Location History. When I first started writing this software, I wanted to see where I had visited in the UK and where I most frequently was. I decided that the best way to represent this was to use a heat-map.</p>
<p>To see the code for how I created these gifs, visit <a href="https://github.com/TickleThePanda/location-history">the GitHub repository</a>.
<h3 name="examples">Examples</h3>
<h4>Cumulative Location History</h4>
<p>The GIF below shows the cumulative location history over time.</p>
<img src="/images/location/cumulative.gif" alt="location gif"/>
<h4>Monthly Location History</h4>
<p>The GIF below shows the montly location history</p>
<img src="/images/location/monthly.gif" alt="location gif"/>
