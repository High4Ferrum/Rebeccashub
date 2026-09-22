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
    <p class="eyebrow">SignOnline</p>
    <h3>Meet my SignOnline app</h3>
    <p>Explore SignOnline, my app, and get in touch to learn more about it.</p>
    <a class="button" href="{{ '/contact/' | relative_url }}">Ask about SignOnline</a>
  </article>
  <article class="card">
    <p class="eyebrow">Investment</p>
    <h3>Experience worth sharing</h3>
    <p>I share my real estate investment experience, strategies, and lessons learned along the way.</p>
    <a class="button" href="#journal-heading">Read my real estate journal</a>
  </article>
  <article class="card">
    <p class="eyebrow">Helping Clients</p>
    <h3>Your Florida real estate partner</h3>
    <p>I’ve been a licensed Florida real estate agent since 2017 and have been actively helping clients with their real estate needs.</p>
    <a class="button" href="{{ '/contact/' | relative_url }}">Let’s connect</a>
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
