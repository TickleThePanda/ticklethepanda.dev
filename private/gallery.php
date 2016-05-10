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
    $nGalleries = count($galleries->{'galleries'});
    $count = 1;
    foreach($galleries->{'galleries'} as $gallery):
      ?>
      <div class="gallery-container">
        <?php
        $thumbs_path = $galleries->{'thumbsPath'}.$gallery->{'reference'}.'/';
        $full_path = $galleries->{'fullPath'}.$gallery->{'reference'}.'/';

        $images = $gallery->{'images'};
        ?>
        <div class="gallery-nav">
          <a href="#gallery=<?=$count - 1?>" class="prev<?= $count == 1 ? ' invisible' : ''?>">&lt;-- prev</a>&nbsp;
          <a href="#gallery=<?=$count + 1?>" class="next<?= $count == $nGalleries ? ' invisible' : ''?>">next --&gt;</a>
        </div>
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
    <?php
      $count++;
    endforeach;
  ?>
</p>
