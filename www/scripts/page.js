var parent_width;
var MIN_PAGE_WIDTH = 900;
var MIN_CONTENT_WIDTH = 700;
var SPEED_MODIFIER = 100;
var NORMAL_TITLE_WIDTH = 40;

$prev_scroll_top = 0;

$( document ).ready(function() {
  resize_main_content()
  resize_sidebar();
  resize_content_scrollbox();
  resize_content();
  place_subtitle();
  place_content();
  $( "#content-scroll-wrapper" ).scroll(animate_subtitle);
});

$( window ).resize(function() {
  resize_main_content()
  resize_sidebar();
  resize_content_scrollbox();
  resize_content();
  place_subtitle();
  place_content();
});

function animate_subtitle() {
  animate_subtitle_text();
  animate_subtitle_dir();
};

function animate_subtitle_text() {
  $scroll_dist = $('#sidebar').outerWidth() - $( "#content-scroll-wrapper" ).scrollTop() * 3 + 40;
  $subtitle_move_speed = (NORMAL_TITLE_WIDTH * SPEED_MODIFIER) / $('#subtitle').outerWidth();
  $min_dist = $('#sidebar').outerWidth() - $('#subtitle').outerWidth();
  if($scroll_dist < $min_dist)
    $scroll_dist = $min_dist;
  $('#subtitle').stop(true, false).animate({'left': $scroll_dist}, $subtitle_move_speed);
};

function animate_subtitle_dir() {
  $current_scroll_top = $("#content-scroll-wrapper").scrollTop();
  $scroll_dist = $('#sidebar').outerWidth() - $current_scroll_top * 3 + 40 - $('#subtitle-dir').width();
  $subtitle_move_speed = 0;
  console.log($prev_scroll_top > $current_scroll_top);
  $subtitle_move_speed = (NORMAL_TITLE_WIDTH * SPEED_MODIFIER) / $('#subtitle').outerWidth();
  $min_dist = $('#sidebar').outerWidth() - $('#subtitle').outerWidth();

  if($scroll_dist < $min_dist) {
    $scroll_dist = $min_dist;
  }

  $('#subtitle-dir').stop(true, false).animate({'left': $scroll_dist}, $subtitle_move_speed);
  $prev_scroll_top = $current_scroll_top;
};

function place_subtitle() {
  place_subtitle_text();
  place_subtitle_dir();
};

function place_subtitle_text() {
  $sidebar_width = $('#sidebar').outerWidth() + 40;
  $('#subtitle').css('left', $sidebar_width);
};

function place_subtitle_dir() {
  $sidebar_width = $('#sidebar').outerWidth() + 40 - $('#subtitle-dir').width();
  $('#subtitle-dir').css('left', $sidebar_width);
};

function place_content() {
  $subtitle_height = $('#subtitle').outerHeight();
  $('#content').css('top', $subtitle_height);
};

function resize_main_content() {
  $('#main-container').outerWidth($( window ).width());
  if($('#main-container').outerWidth() < MIN_PAGE_WIDTH)
    $('#main-container').width(MIN_PAGE_WIDTH);
};

function resize_sidebar() {
  var sidebar_v_padding = $('#sidebar').outerHeight() - $('#sidebar').height();
  var height = $('#main-container').height() - $('#header').outerHeight() - sidebar_v_padding;
  $('#sidebar').height(height);
};

function resize_content_scrollbox() {
  var height = $('#main-container').outerHeight();
  $('#content-scroll-wrapper').height(height);

  var width = $('#main-container').outerWidth() - $('#sidebar').outerWidth();
  parent_width = width;
  $('#content-scroll-wrapper').width(width);
};

function resize_content() {
  var content_padding = $('#content').innerWidth() - $('#content').width();

  $('#content').width(parent_width - content_padding);

  if( $('#content').width() > MIN_CONTENT_WIDTH) {
    $('#content').width(MIN_CONTENT_WIDTH);
  }
};
