<?php
#content/health.php
require_once($_SERVER['DOCUMENT_ROOT'].'/page-template.php');
# trick to execute 1st time, but not 2nd so you don't have an inf loop
if (!isset($TPL)) {
    $TPL = new PageTemplate();
    $TPL->PageTitle = "health";
    $TPL->ContentBody = __FILE__;
    include $_SERVER['DOCUMENT_ROOT'].'/page-layout.php';
    exit;
}
?>
<p>
<h3>weight</h3>
<p><a href="/images/data/weight-plot.png"><img src="/images/data/weight-plot.png" class="health-info"></a></p>

<h3>activity</h3>
<p><a href="/images/data/fitbit-day-plot.png"><img src="/images/data/fitbit-day-plot.png" class="health-info"></a></p>
<p><a href="/images/data/fitbit-dow-plot.png"><img src="/images/data/fitbit-dow-plot.png" class="health-info"></a></p>
<p><a href="/images/data/fitbit-months-plot.png"><img src="/images/data/fitbit-months-plot.png" class="health-info"></a></p>

<h3>misc</h3>
<div class="stats_box">
  <h4>days since takeout</h4>
  <br>
  <p class="stats_box_count"> <?php include $_SERVER['DOCUMENT_ROOT'].'/data/health/takeout'; ?> </p>
</div>
