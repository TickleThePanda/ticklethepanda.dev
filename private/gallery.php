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

    $galleries = json_decode($response->getBody());

  ?>

  <?php
    $count = 1;
    foreach($galleries->{'galleries'} as $gallery):
      ?>
      <div id="gallery<?=$count?>" class="gallery-container">
        <?php
        $thumbs_path = $galleries->{'thumbsPath'}.$gallery->{'reference'}.'/';
        $full_path = $galleries->{'fullPath'}.$gallery->{'reference'}.'/';

        $images = $gallery->{'images'};
        ?>

        <h3><?=$gallery->{'name'}?></h3>
        <?= $gallery->{'description'} ?>

        <div class="gallery">
          <?php foreach($images as $image): ?>
            <div class="image-holder">
              <a href="<?= $full_path.$image->{'fileName'} ?>">
                <img class="image_thumb" src="<?= $thumbs_path.$image->{'fileName'} ?>">
              </a>
            </div>
          <?php endforeach; ?>
        </div>
      </div>
    <?php endforeach;
  ?>
</p>
