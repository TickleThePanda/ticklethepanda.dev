<p>
  <?php
    if(!isset($image_location)) {
      echo "<p>Error: the gallery location has not been set.</p>";
	  exit;
    } else {
      $files = glob($_SERVER['DOCUMENT_ROOT'].$image_location.'*.{jpg,png,gif,JPG,PNG,GIF}', GLOB_BRACE);
    }
	$count_img = 0;
    foreach($files as $file) {
  ?>
      <dir class="image-holder">
		  <img class="image_thumb" id="<?php echo $image_location."full/".basename($file); ?>" src="<?php echo $image_location.basename($file); ?>">
      </dir>
  <?php
      $count_img = $count_img + 1;
    }
  ?>
</p>
