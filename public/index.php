<?php

  require '../private/vendor/autoload.php';

  function get_page_action() {
    if(!empty($_GET['action'])) {
      $action = $_GET['action'];
      $action = basename($action);
    } else {
      $action = "home";
    }
    return $action;
  }

  function get_page_path($action) {
    $content_dir = $_SERVER['DOCUMENT_ROOT'].'/../private/content/';

    $page_path = $content_dir."/$action.php";

    if (file_exists($page_path)) {
      return($page_path);
    } else {
      return("error/404.html");
    }
  }

  $action = get_page_action();

  $path = get_page_path($action);

  $TPL;
  include ($path);
?>
