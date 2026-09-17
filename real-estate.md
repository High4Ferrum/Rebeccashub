---
layout: default
title: Real Estate
section: real-estate
permalink: /real-estate/
---

<section class="wrap page-header">
  <p class="eyebrow">Florida Real Estate</p>
  <h1>Homes, markets, and opportunities.</h1>
  <p class="intro">A place for my real-estate work, market observations, home-buying ideas, and investment thinking.</p>
</section>

<section class="wrap section card-grid">
  <article class="card">
    <p class="eyebrow">Buy</p>
    <h3>Finding the right home</h3>
    <p>Practical guidance and market information for navigating a Florida home purchase.</p>
  </article>
  <article class="card">
    <p class="eyebrow">Sell</p>
    <h3>Preparing to sell</h3>
    <p>Ideas for positioning a property, understanding the market, and making informed decisions.</p>
  </article>
  <article class="card">
    <p class="eyebrow">Invest</p>
    <h3>Real-estate opportunities</h3>
    <p>Market observations and analytical thinking around properties and investment opportunities.</p>
  </article>
</section>

<section class="wrap section" aria-labelledby="journal-heading">
  <h2 id="journal-heading">Real Estate Journal</h2>
  <div class="card-grid">
    {% for post in site.categories.real-estate %}
    <article class="card">
      <p class="eyebrow">Real Estate</p>
      <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
      <p><time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%B %-d, %Y" }}</time></p>
      <p>{{ post.excerpt | strip_html }}</p>
      <a class="button" href="{{ post.url | relative_url }}">Read the post</a>
    </article>
    {% endfor %}
  </div>
</section>
