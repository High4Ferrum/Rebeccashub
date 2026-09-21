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
    <p>Placeholder for Chinese-as-a-second-language teaching experience, lessons, and resources.</p>
  </article>
  <article class="card">
    <p class="eyebrow">Digital</p>
    <h3>Web development & content</h3>
    <p>Placeholder for Orlando Chinese Association website work and content-management experience.</p>
  </article>
</section>

<section class="wrap section business-story" id="business-support" aria-labelledby="business-support-heading">
  <p class="eyebrow">Side Hustle · Business Support</p>
  <h2 id="business-support-heading">Connecting businesses, OCA, and the community</h2>
  <div class="business-copy">
    <p>Being part of the Orlando Chinese Association (OCA) has shown me how much goes into bringing a community together. Businesses need visibility, associations need funding, and families benefit from more opportunities to connect. I want to help bridge all three.</p>
    <p>When LingoAce sponsored a vendor booth at an OCA event and needed someone there to help with promotion, I stepped in. I helped at the booth, shared information, and connected with the families who stopped by.</p>
    <p>Supporting the businesses that support OCA matters to me. Helping sponsors reach the community gives those relationships a chance to grow, while their support helps OCA make more community events possible.</p>
  </div>
  <div class="business-photos">
    <figure>
      <img src="{{ '/assets/images/oca-business-support/promotion.jpeg' | relative_url }}" alt="Rebecca helping visitors at the outdoor promotional booth beneath a white canopy." width="1200" height="1600" loading="lazy">
      <figcaption>Helping with promotion and welcoming families to the booth.</figcaption>
    </figure>
    <figure>
      <img src="{{ '/assets/images/oca-business-support/families.jpeg' | relative_url }}" alt="Families gathered around the promotional table at the OCA outdoor event." width="1200" height="1600" loading="lazy">
      <figcaption>Connecting a community sponsor with the families it hopes to reach.</figcaption>
    </figure>
  </div>
  <div class="business-behind-scenes">
    <figure>
      <img src="{{ '/assets/images/oca-business-support/setup.jpeg' | relative_url }}" alt="A red wagon loaded with equipment for the outdoor event setup." width="768" height="1024" loading="lazy">
      <figcaption>Before the conversations: getting the equipment to the spot.</figcaption>
    </figure>
    <div class="business-copy">
      <h3>The work behind the booth</h3>
      <p>Outdoor events are tiring! Before I could talk with anyone, I had to haul the table, tent, and supplies to the spot and get everything set up. There is a lot of physical work behind a welcoming booth.</p>
      <p>For me, business support means showing up and doing that work, too. The effort is part of helping a sponsor connect with people and helping a community event come together.</p>
    </div>
  </div>
  <figure class="business-team">
    <img src="{{ '/assets/images/oca-business-support/leadership.jpeg' | relative_url }}" alt="The Orlando Chinese Association leadership team gathered for a group photo at the outdoor event." width="1024" height="828" loading="lazy">
    <figcaption>The Orlando Chinese Association leadership team.</figcaption>
  </figure>
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
