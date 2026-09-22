---
layout: default
title: Side Hustle
section: side-hustle
permalink: /side-hustle/
---

<section class="wrap page-header">
  <p class="eyebrow">Side Hustle</p>
  <h1>Skills that connect people and ideas.</h1>
  <p class="intro">A place for the work I do outside the usual job title.</p>
</section>

<section class="wrap section card-grid">
  <article class="card">
    <p class="eyebrow">Business Support</p>
    <h3>Trade shows & business support</h3>
    <p>I help businesses connect with the community through hands-on event promotion and support for the organizations that bring people together.</p>
    <a class="button" href="#business-support">See my community work</a>
  </article>
  <article class="card">
    <p class="eyebrow">Education</p>
    <h3>Chinese language teaching</h3>
    <p>My journey from tutoring in Türkiye to teaching Chinese language and culture at the Chinese School of CAACF.</p>
    <a class="button" href="#chinese-teaching">Explore my teaching journey</a>
  </article>
  <article class="card">
    <p class="eyebrow">Digital</p>
    <h3>Web development & content</h3>
    <p>From my first HTML website in 1999 to airline web content and volunteering with OCA, I love finding new ways to solve problems on the web.</p>
    <a class="button" href="#web-development">Explore my web development story</a>
  </article>
</section>


<section class="wrap section" id="chinese-teaching" aria-labelledby="chinese-teaching-heading" style="scroll-margin-top: 100px;">
  <h2 id="chinese-teaching-heading">Chinese Teaching</h2>
  <div class="card-grid">
    {% assign teaching_posts = site.categories['chinese-teaching'] %}
    {% for post in teaching_posts %}
    <article class="card">
      <p class="eyebrow">Side Hustle · Chinese Teaching</p>
      <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
      <p><time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%B %-d, %Y" }}</time></p>
      <p>{{ post.excerpt | strip_html }}</p>
      <a class="button" href="{{ post.url | relative_url }}">Read the post</a>
    </article>
    {% endfor %}
  </div>
</section>

<section class="wrap section" id="business-support" aria-labelledby="business-support-heading" style="scroll-margin-top: 100px;">
  <h2 id="business-support-heading">Business Support</h2>
  <div class="card-grid">
    {% assign business_posts = site.categories['business-support'] %}
    {% for post in business_posts %}
    <article class="card">
      <p class="eyebrow">Side Hustle · Business Support</p>
      <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
      <p><time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%B %-d, %Y" }}</time></p>
      <p>{{ post.excerpt | strip_html }}</p>
      <a class="button" href="{{ post.url | relative_url }}">Read the post</a>
    </article>
    {% endfor %}
  </div>
</section>

<section class="wrap section" aria-labelledby="bakery-heading">
  <h2 id="bakery-heading">Bakery</h2>
  <div class="card-grid">
    {% for post in site.categories.bakery %}
    <article class="card">
      <p class="eyebrow">Side Hustle · Bakery</p>
      <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
      <p><time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%B %-d, %Y" }}</time></p>
      <p>{{ post.excerpt | strip_html }}</p>
      <a class="button" href="{{ post.url | relative_url }}">Read the post</a>
    </article>
    {% endfor %}
  </div>
</section>


<section class="wrap section" id="web-development" aria-labelledby="web-development-heading" style="scroll-margin-top: 100px;">
  <h2 id="web-development-heading">Web Development</h2>
  <div class="card-grid">
    {% assign web_posts = site.categories['web-development'] %}
    {% for post in web_posts %}
    <article class="card">
      <p class="eyebrow">Side Hustle · Web Development</p>
      <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
      <p><time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%B %-d, %Y" }}</time></p>
      <p>{{ post.excerpt | strip_html }}</p>
      <a class="button" href="{{ post.url | relative_url }}">Read the post</a>
    </article>
    {% endfor %}
  </div>
</section>
