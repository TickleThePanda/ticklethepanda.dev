<?php require_once('page-template.php');?>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=0.8">
    <link href="default.css" rel="stylesheet" type="text/css">
    <title><?php if(isset($TPL->PageTitle)) { echo $TPL->PageTitle; } ?> - ticklethepanda</title>
  </head>
  <body>
    <div id="infobar">
      <div id="header">
        <a id="title" href="https://www.ticklethepanda.co.uk/">
          ticklethepanda
        </a>
        <svg
          id="nav-toggle"
          xmlns="http://www.w3.org/2000/svg" version="1.1"
          viewBox="0 0 9 7" preserveAspectRatio="xMidYMid slice">
          <path
              class="animated-line"
              style="fill:none;fill-rule:evenodd;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
              d="m 1.5,2 6,0"/>
          <path
              class="animated-line"
              style="fill:none;fill-rule:evenodd;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
              d="m 1.5,4 6,0"/>
          <path
              class="animated-line"
              style="fill:none;fill-rule:evenodd;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
              d="m 1.5,6 6,0"/>
        </svg>
      </div>
      <div id="nav">
        <div class="sidebar-title">info</div>
        <div class="sidebar-line"></div>
        <div class="sidebar-link"><a href="?action=home">home</a></div>
        <div class="sidebar-link"><a href="?action=about">about</a></div>
        <div class="sidebar-title">projects</div>
        <div class="sidebar-line"></div>
        <div class="sidebar-link"><a href="?action=messages">messages book</a></div>
        <div class="sidebar-link"><a href="?action=location">location map</a></div>
        <div class="sidebar-link"><a href="?action=health">health tracking</a></div>
        <div class="sidebar-link"><a href="?action=photography">photography</a></div>
        <div class="sidebar-line no-title"></div>
        <div id="biog">
          <br>
          hey, i'm <span class="v-bold">panda</span>!<br><br>
          i'm a <span class="v-bold">geek</span> who studied<br>
          <span class="v-bold">computer science</span><br><br>
          i work as a <span class="v-bold">software<br>engineer</span> at stfc<br><br>
          i love playing<br>
          with <span class="v-bold">data</span> and<br>
          presenting it in<br>
          different ways<br><br>
          i've created this<br>
          space to show my<br>
          recent <span class="v-bold">projects</span><br><br>
        </div>
      </div>
    </div>
    <div id="content-wrapper">
      <div id="content-scroll-wrap">
        <div id="subtitle">
            &gt;&nbsp;<?php if(isset($TPL->PageTitle)) { echo $TPL->PageTitle; } ?>
        </div>
        <div id="content">
          <?php if(isset($TPL->ContentBody)) { include $TPL->ContentBody; } ?>
        </div>
      </div>
    </div>
    <script src="scripts/page.js"></script>
    <script>
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

      ga('create', 'UA-51822811-1', 'ticklethepanda.co.uk');
      ga('send', 'pageview');
    </script>
  </body>
</html>
