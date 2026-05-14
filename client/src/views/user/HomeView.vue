<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AppButton from '../../components/common/AppButton.vue'
</script>

<template>
  <div class="home fade-up">
    <!-- Hero -->
    <section class="hero">
      <div class="container hero__inner">
        <div class="hero__copy">
          <span class="eyebrow">Confidential · Trusted · 24/7</span>
          <h1>You are not alone.<br />Help is one report away.</h1>
          <p class="lead">
            SafeReport connects victims and witnesses of domestic abuse with trained responders
            in your barangay. Reports are confidential, and you can submit one
            anonymously if you prefer.
          </p>
          <div class="hero__cta">
            <RouterLink to="/report">
              <AppButton variant="accent" size="lg">
                <template #icon-left>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4.5 8-11.5V5l-8-3-8 3v5.5C4 17.5 12 22 12 22z" />
                  </svg>
                </template>
                Report an Incident
              </AppButton>
            </RouterLink>
            <RouterLink to="/track">
              <AppButton variant="secondary" size="lg">Track Existing Report</AppButton>
            </RouterLink>
          </div>
          <div class="hero__assure">
            <span class="assure-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              End-to-end confidential
            </span>
            <span class="assure-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Anonymous option
            </span>
            <span class="assure-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Avg. response &lt; 30 min
            </span>
          </div>
        </div>

        <div class="hero__visual">
          <div class="status-card">
            <div class="row row--between">
              <div>
                <div class="muted small">Live response activity</div>
                <h3 class="card-title">Brgy. responders · today</h3>
              </div>
              <span class="live-dot"><span /></span>
            </div>
            <ul class="response-list">
              <li>
                <span class="bdg success">Resolved</span>
                <span class="muted">Brgy. San Isidro · 12 min ago</span>
              </li>
              <li>
                <span class="bdg warn">On the way</span>
                <span class="muted">Brgy. Maligaya · 4 min ago</span>
              </li>
              <li>
                <span class="bdg info">Dispatched</span>
                <span class="muted">Brgy. Bagong Silang · just now</span>
              </li>
            </ul>
            <div class="metric-row">
              <div>
                <div class="metric-value">128</div>
                <div class="muted small">Reports this month</div>
              </div>
              <div>
                <div class="metric-value">22 min</div>
                <div class="muted small">Avg. response</div>
              </div>
              <div>
                <div class="metric-value">94%</div>
                <div class="muted small">Resolved on-site</div>
              </div>
            </div>
          </div>
          <div class="hero__bg" aria-hidden="true"></div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="container section">
      <div class="section__head">
        <h2>How it works</h2>
        <p class="muted">A simple, supportive process designed with safety in mind.</p>
      </div>
      <div class="grid steps-grid">
        <article class="step-card">
          <div class="step-card__num">01</div>
          <h3>File a report</h3>
          <p>
            Share what happened. Provide as much detail as you're comfortable with — you
            can always add to it later.
          </p>
        </article>
        <article class="step-card">
          <div class="step-card__num">02</div>
          <h3>Responders are dispatched</h3>
          <p>
            Your barangay's trained responders, including PNP and DSWD, are notified
            instantly and prioritized by severity.
          </p>
        </article>
        <article class="step-card">
          <div class="step-card__num">03</div>
          <h3>Stay informed</h3>
          <p>
            Track your report's status securely with a private code. We will notify you
            of any updates from the responders.
          </p>
        </article>
      </div>
    </section>

    <!-- Help bar -->
    <section class="container">
      <div class="help-bar">
        <div class="help-bar__text">
          <h3 class="help-bar__heading">In immediate danger?</h3>
          <p class="help-bar__sub">
            Call <strong>911</strong> or <strong>1366</strong> (VAWC Hotline). You can
            also use the <strong>Quick Exit</strong> button to leave this page instantly.
          </p>
        </div>
        <div class="help-bar__actions">
          <a href="tel:911"><AppButton variant="accent" size="md">Call 911</AppButton></a>
          <a href="tel:1366"><AppButton variant="secondary" size="md">VAWC 1366</AppButton></a>
        </div>
      </div>
    </section>

    <!-- Trust -->
    <section class="container section">
      <div class="section__head">
        <h2>Designed with your safety first</h2>
        <p class="muted">SafeReport follows national VAWC and child-protection standards.</p>
      </div>
      <div class="grid trust-grid">
        <div class="card card--padded">
          <div class="trust__icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4.5 8-11.5V5l-8-3-8 3v5.5C4 17.5 12 22 12 22z" />
            </svg>
          </div>
          <h3>Confidentiality</h3>
          <p>
            Your report is encrypted and visible only to authorized responders in your
            barangay.
          </p>
        </div>
        <div class="card card--padded">
          <div class="trust__icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>
          </div>
          <h3>No retaliation</h3>
          <p>
            Reporting is protected under RA 9262 and RA 7610. We never share your
            identity with the alleged offender.
          </p>
        </div>
        <div class="card card--padded">
          <div class="trust__icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h3>Support afterward</h3>
          <p>
            Counseling, legal aid, and shelter referrals are included in every
            response, free of charge.
          </p>
        </div>
        <div class="card card--padded">
          <div class="trust__icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <h3>Local responders</h3>
          <p>
            Reports are routed to PNP-WCPD and your barangay's VAWC desk for the
            fastest possible response.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  padding-bottom: var(--space-12);
}

/* ─── Hero ─────────────────────────────────────────────── */
.hero {
  background:
    radial-gradient(900px 320px at 75% -5%, var(--color-primary-100), transparent 65%),
    radial-gradient(600px 280px at 0% 0%, #fbeaed, transparent 60%),
    var(--color-bg);
  padding: var(--space-12) 0 64px;
  border-bottom: 1px solid var(--color-border);
}

.hero__inner {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: var(--space-12);
  align-items: center;
}

.eyebrow {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--color-primary-700);
  background: var(--color-primary-100);
  padding: var(--space-1) var(--space-3);
  border-radius: 4px;
  margin-bottom: var(--space-4);
}

.hero h1 {
  font-size: 38px;
  line-height: 1.12;
  font-weight: 700;
  letter-spacing: -0.018em;
  margin-bottom: var(--space-4);
  color: var(--color-text);
}

.lead {
  font-size: 16px;
  line-height: 1.65;
  color: var(--color-text-muted);
  max-width: 520px;
  margin-bottom: var(--space-7, 28px);
}

.hero__cta {
  display: flex;
  gap: var(--space-2-5, 10px);
  flex-wrap: wrap;
  margin-bottom: var(--space-6);
}

.hero__cta a {
  text-decoration: none;
}

.hero__assure {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.assure-item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1-5, 6px);
  font-size: 13px;
  color: var(--color-text-muted);
}

.assure-item svg {
  flex-shrink: 0;
  opacity: 0.7;
}

/* ─── Status card ───────────────────────────────────────── */
.hero__visual {
  position: relative;
}

.status-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: var(--space-5) var(--space-6);
  box-shadow: var(--shadow-sm);
  position: relative;
  z-index: 2;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  margin-top: var(--space-1);
  color: var(--color-text);
}

.live-dot {
  position: relative;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-success);
  display: inline-block;
  flex-shrink: 0;
  margin-top: 2px;
}

.live-dot span {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid var(--color-success);
  opacity: 0.45;
  animation: pulse 1.8s ease-out infinite;
}

@keyframes pulse {
  to {
    transform: scale(1.7);
    opacity: 0;
  }
}

.response-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  border-top: 1px solid var(--color-border);
  margin-top: var(--space-4);
  padding-top: var(--space-3-5, 14px);
}

.response-list li {
  display: flex;
  align-items: center;
  gap: var(--space-2-5, 10px);
  font-size: 13px;
}

.bdg {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  padding: 2px var(--space-2);
  border-radius: 4px;
  letter-spacing: 0.01em;
}

.bdg.success {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.bdg.warn {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.bdg.info {
  background: var(--color-info-bg);
  color: var(--color-info);
}

.metric-row {
  margin-top: var(--space-4);
  padding-top: var(--space-3-5, 14px);
  border-top: 1px solid var(--color-border);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
}

.metric-value {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.2;
  margin-bottom: 2px;
}

.small {
  font-size: 12px;
  line-height: 1.4;
}

.hero__bg {
  position: absolute;
  inset: var(--space-7, 28px) calc(var(--space-8) * -1) calc(var(--space-6) * -1) var(--space-7, 28px);
  background: var(--color-primary-100);
  border-radius: 12px;
  z-index: 1;
  opacity: 0.6;
}

/* ─── Section wrapper ───────────────────────────────────── */
.section {
  padding: var(--space-12) 0 var(--space-2);
}

.section__head {
  text-align: center;
  max-width: 580px;
  margin: 0 auto var(--space-8);
}

.section__head h2 {
  margin-bottom: var(--space-2);
}

/* ─── Steps ─────────────────────────────────────────────── */
.steps-grid {
  grid-template-columns: repeat(3, 1fr);
}

.step-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: var(--space-6);
  position: relative;
  transition: box-shadow 0.15s ease;
}

.step-card:hover {
  box-shadow: var(--shadow-sm);
}

.step-card__num {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 12px;
  color: var(--color-primary-600);
  letter-spacing: 0.1em;
  margin-bottom: var(--space-2-5, 10px);
}

.step-card h3 {
  margin-bottom: var(--space-2);
}

.step-card p {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-muted);
  margin: 0;
}

/* ─── Help bar ──────────────────────────────────────────── */
.help-bar {
  margin: var(--space-10) 0 var(--space-2);
  background: linear-gradient(135deg, #b03248, #8e2237);
  border-radius: 10px;
  padding: var(--space-6) var(--space-7, 28px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-5);
  flex-wrap: wrap;
}

.help-bar__heading {
  color: #fff;
  margin: 0 0 var(--space-1);
  font-size: 16px;
  font-weight: 600;
}

.help-bar__sub {
  color: rgba(255, 255, 255, 0.82);
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.help-bar__actions {
  display: flex;
  gap: var(--space-2-5, 10px);
  flex-shrink: 0;
}

.help-bar__actions a {
  text-decoration: none;
}

/* ─── Trust cards ───────────────────────────────────────── */
.trust-grid {
  grid-template-columns: repeat(4, 1fr);
}

.trust__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--space-10);
  height: var(--space-10);
  background: var(--color-primary-100);
  border-radius: 8px;
  color: var(--color-primary-700);
  margin-bottom: var(--space-3-5, 14px);
}

.card--padded h3 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: var(--space-1-5, 6px);
}

.card--padded p {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-muted);
  margin: 0;
}

/* ─── Responsive ────────────────────────────────────────── */
@media (max-width: 960px) {
  .hero {
    padding: 40px 0 48px;
  }

  .hero__inner {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .hero h1 {
    font-size: 30px;
  }

  .steps-grid {
    grid-template-columns: 1fr;
  }

  .trust-grid {
    grid-template-columns: 1fr 1fr;
  }

  .help-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .section {
    padding: 40px 0 8px;
  }
}

@media (max-width: 560px) {
  .trust-grid {
    grid-template-columns: 1fr;
  }

  .hero__cta {
    flex-direction: column;
  }

  .metric-row {
    gap: 12px;
  }
}
</style>