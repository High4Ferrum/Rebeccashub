---
layout: default
title: Photography
section: photography
permalink: /photography/
---

<section class="wrap page-header">
  <p class="eyebrow">Photography</p>
  <h1>Moments worth noticing.</h1>
  <p class="intro">An evolving visual diary. Replace these blocks with your own images whenever you are ready.</p>
</section>

<section class="wrap section">
  <div class="gallery-grid">
    {% for i in (1..12) %}
      <div class="gallery-placeholder">Photo {{ i }} · add image later</div>
    {% endfor %}
  </div>
</section>
