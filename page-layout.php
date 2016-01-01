<?php require_once('page-template.php');?>
<html>
  <head>
    <link href="default.css" rel="stylesheet" type="text/css">
    <script src="scripts/jquery-1.11.1.js"></script>
    <script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-51822811-1', 'ticklethepanda.co.uk');
  ga('send', 'pageview');

    </script>
    <title><?php if(isset($TPL->PageTitle)) { echo $TPL->PageTitle; } ?> - ticklethepanda</title>
  </head>
  <body>
    <div id="main-container">
      <div id="sidebar-wrapper">
        <div id="header">
          <div id="header-center">
            <div id="title">
              ticklethepanda
            </div>
          </div>
        </div>
        <div id="sidebar">
          <p class="sidebar-title">info</p>
          <div class="sidebar-line"></div>
          <p><a class="sidebar-link" href="?action=home">home</a></p>
          <p><a class="sidebar-link" href="?action=about">about</a></p>
          <p class="sidebar-title">projects</p>
          <div class="sidebar-line"></div>
          <p><a class="sidebar-link" href="?action=messages">messages book</a></p>
          <p><a class="sidebar-link" href="?action=location">location map</a></p>
          <p><a class="sidebar-link" href="?action=health">health tracking</a></p>
          <p><a class="sidebar-link" href="?action=photography">photography</a></p>
          <br>
          <div class="sidebar-line"></div>
          <p id="biog">
            <br>
            hey, i'm <span class="v-bold">panda</span>!<br><br>
            i'm a <span class="v-bold">geek</span> studying<br>
            <span class="v-bold">computer science</span><br><br>
            i love playing<br>
            with <span class="v-bold">data</span> and<br>
            presenting it in<br>
            different ways<br><br>
            i've created this<br>
            space to show my<br>
            recent <span class="v-bold">projects</span><br><br>
          </p>
        </div>
      </div>
      <div id="content-wrapper">
        <div id="content-scroll-wrapper">
           <div id="subtitle">
             &gt;&nbsp;<?php if(isset($TPL->PageTitle)) { echo $TPL->PageTitle; } ?>
          </div>
          <div id="content">
            <?php if(isset($TPL->ContentBody)) { include $TPL->ContentBody; } ?>
          </div>
        </div>
      </div>
    </div>
	<div id="overlay-div">

	</div>
  </body>
</html>
