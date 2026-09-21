---
layout: default
title: Things I Like
section: things
permalink: /things-i-like/
---

<section class="wrap page-header">
  <p class="eyebrow">Things I Like</p>
  <h1>The fun stuff.</h1>
  <p class="intro">Books, movies, travel, food, technology, ideas, and the little discoveries that make life more interesting.</p>
</section>

<section class="wrap section card-grid">
  <article class="card">
    <p class="eyebrow">Travel</p>
    <h3><a href="#travel">Places worth exploring</a></h3>
    <p>Trips, destinations, photography, and the experiences that stay with me.</p>
  </article>
  <article class="card">
    <p class="eyebrow">Culture</p>
    <h3>Books, movies & stories</h3>
    <p>Things I watch, read, and think are worth talking about.</p>
  </article>
  <article class="card">
    <p class="eyebrow">Curiosity</p>
    <h3>Everything else</h3>
    <p>Technology, food, ideas, products, and whatever interesting side quest comes next.</p>
  </article>
</section>

<section class="wrap section" id="travel" aria-labelledby="travel-heading">
  <h2 id="travel-heading">Travel</h2>
  <div class="card-grid">
    {% for post in site.categories.things-i-like %}
    {% if post.tags contains 'Travel' %}
    <article class="card">
      <p class="eyebrow">Things I Like · Travel</p>
      <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
      <p><time datetime="{{ post.date | date: '%Y-%m-%d' }}">{{ post.date | date: '%B %-d, %Y' }}</time></p>
      <p>{{ post.excerpt | strip_html }}</p>
      <a class="button" href="{{ post.url | relative_url }}">Read the travel story</a>
    </article>
    {% endif %}
    {% endfor %}
  </div>
</section>

<section class="wrap section" aria-labelledby="recipe-heading">
  <h2 id="recipe-heading">Recipe</h2>
  <div class="card-grid">
    {% for post in site.categories.things-i-like %}
    {% if post.tags contains 'Recipe' %}
    <article class="card">
      <p class="eyebrow">Things I Like · Recipe</p>
      <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
      <p>{{ post.excerpt | strip_html }}</p>
      <a class="button" href="{{ post.url | relative_url }}">Read the recipe</a>
    </article>
    {% endif %}
    {% endfor %}
  </div>
</section>
