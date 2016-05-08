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
    if(file_exists("content/$action.html")) {
      return("content/$action.html");
    } elseif (file_exists("content/$action.php")) {
      return("content/$action.php");
    } else {
      return("error/404.html");
    }
  }

  $action = get_page_action();

  $path = get_page_path($action);

  $TPL;
  include ($path);
?>
