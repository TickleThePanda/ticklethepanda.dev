<p>
  <?php

    use GuzzleHttp\Client;
    $client = new Client([
        // Base URI is used with relative requests
        'base_uri' => 'http://localhost:8080/',
        // You can set any number of default request options.
        'timeout'  => 2.0,
    ]);
    $response = $client->request('GET', 'gallery');

    $gallery = json_decode($response->getBody());

    $thumbs_path = $gallery->{'thumbsPath'}.$gallery->{'galleries'}[0]->{'reference'}.'/';
    $full_path = $gallery->{'fullPath'}.$gallery->{'galleries'}[0]->{'reference'}.'/';

    $images = $gallery->{'galleries'}[0]->{'images'};

  ?>
  <h3><?php echo $gallery->{'galleries'}[0]->{'name'}; ?></h3>
  <?php
    echo $gallery->{'galleries'}[0]->{'description'};
  ?>
  <div class="gallery">
    <?php
      foreach($images as $image) {
    ?>
      <div class="image-holder">
        <a href="<?php echo $full_path.$image->{'fileName'}; ?>">
          <img class="image_thumb" src="<?php echo $thumbs_path.$image->{'fileName'}; ?>">
        </a>
      </div>
    <?php
      }
    ?>
  </div>
</p>
