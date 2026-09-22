---
layout: default
title: Contact
section: contact
permalink: /contact/
---

<link rel="stylesheet" href="{{ '/assets/css/contact.css' | relative_url }}?v={{ site.time | date: '%s' }}">

<section class="contact-section wrap" aria-labelledby="contact-heading">
  <div class="contact-intro">
    <p class="eyebrow">Contact · Rebecca Yener</p>
    <h1 id="contact-heading">Good things start with <em>a conversation.</em></h1>
    <p class="contact-lede">A new opportunity, an idea to explore, or just a hello. I’d love to hear what’s on your mind.</p>
    <div class="contact-topics" aria-label="Let’s talk about">
      <span>Professional opportunities</span>
      <span>Real estate</span>
      <span>Collaborations</span>
    </div>
    <div class="contact-direct">
      <p>Prefer email?</p>
      <a href="mailto:me@rebeccayener.com">me@rebeccayener.com <span aria-hidden="true">↗</span></a>
    </div>
  </div>

  <div class="contact-card">
    <div class="contact-card-heading">
      <p class="eyebrow">Say hello</p>
      <h2>Send me a note.</h2>
      <p>Tell me a little about yourself and what you have in mind.</p>
    </div>
    <form class="contact-form" action="https://formspree.io/f/mrpbqkwj" method="POST">
      <div class="contact-field-row">
        <div class="contact-field">
          <label for="contact-name">Your name <span aria-hidden="true">*</span></label>
          <input id="contact-name" name="name" type="text" autocomplete="name" placeholder="First and last name" required maxlength="120">
        </div>
        <div class="contact-field">
          <label for="contact-email">Email address <span aria-hidden="true">*</span></label>
          <input id="contact-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required maxlength="254">
        </div>
      </div>
      <div class="contact-field">
        <label for="contact-subject">Subject <span class="contact-optional">(optional)</span></label>
        <input id="contact-subject" name="subject" type="text" placeholder="What would you like to chat about?" maxlength="200">
      </div>
      <div class="contact-field">
        <label for="contact-message">Your message <span aria-hidden="true">*</span></label>
        <textarea id="contact-message" name="message" rows="6" placeholder="Hi Rebecca, …" required maxlength="10000"></textarea>
      </div>
      <div class="contact-form-footer">
        <p>* Required fields</p>
        <button type="submit">Send message <span aria-hidden="true">↗</span></button>
      </div>
    </form>
  </div>
</section>
