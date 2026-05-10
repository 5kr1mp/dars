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
          <h1>You are not alone. <br />Help is one report away.</h1>
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
                    stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
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
            <span>🔒 End-to-end confidential</span>
            <span>👤 Anonymous option</span>
            <span>⏱️ Avg. response &lt; 30 min</span>
          </div>
        </div>

        <div class="hero__visual">
          <div class="status-card">
            <div class="row row--between">
              <div>
                <div class="muted small">Live response activity</div>
                <h3 style="margin-top: 4px">Brgy. responders · today</h3>
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
        <div>
          <h3 style="color: #fff; margin: 0">In immediate danger?</h3>
          <p style="color: rgba(255,255,255,0.86); margin: 4px 0 0">
            Call <strong>911</strong> or <strong>1366</strong> (VAWC Hotline). You can
            also use the <strong>Quick Exit</strong> button to leave this page instantly.
          </p>
        </div>
        <div class="row" style="gap: 10px">
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
          <div class="trust__icon">🛡️</div>
          <h3>Confidentiality</h3>
          <p>
            Your report is encrypted and visible only to authorized responders in your
            barangay.
          </p>
        </div>
        <div class="card card--padded">
          <div class="trust__icon">🕊️</div>
          <h3>No retaliation</h3>
          <p>
            Reporting is protected under RA 9262 and RA 7610. We never share your
            identity with the alleged offender.
          </p>
        </div>
        <div class="card card--padded">
          <div class="trust__icon">🤝</div>
          <h3>Support afterward</h3>
          <p>
            Counseling, legal aid, and shelter referrals are included in every
            response, free of charge.
          </p>
        </div>
        <div class="card card--padded">
          <div class="trust__icon">📍</div>
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
  padding-bottom: 40px;
}

/* Hero */
.hero {
  background:
    radial-gradient(1200px 400px at 80% -10%, var(--color-primary-100), transparent 60%),
    radial-gradient(900px 360px at 0% 0%, #fbecef, transparent 60%),
    var(--color-bg);
  padding: 64px 0 80px;
  border-bottom: 1px solid var(--color-border);
}
.hero__inner {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 48px;
  align-items: center;
}
.eyebrow {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-primary-700);
  background: var(--color-primary-100);
  padding: 5px 12px;
  border-radius: var(--radius-full);
  margin-bottom: 18px;
}
.hero h1 {
  font-size: 46px;
  line-height: 1.05;
  font-weight: 800;
  letter-spacing: -0.025em;
  margin-bottom: 18px;
}
.lead {
  font-size: 17px;
  line-height: 1.6;
  color: var(--color-text-muted);
  max-width: 540px;
  margin-bottom: 28px;
}
.hero__cta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 26px;
}
.hero__cta a { text-decoration: none; }
.hero__assure {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  font-size: 13px;
  color: var(--color-text-muted);
}

/* Right card */
.hero__visual { position: relative; }
.status-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 22px;
  box-shadow: var(--shadow-md);
  position: relative;
  z-index: 2;
}
.live-dot {
  position: relative;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-success);
  display: inline-block;
}
.live-dot span {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid var(--color-success);
  opacity: 0.5;
  animation: pulse 1.6s ease-out infinite;
}
@keyframes pulse {
  to { transform: scale(1.6); opacity: 0; }
}
.response-list {
  list-style: none;
  padding: 0;
  margin: 18px 0 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-top: 1px solid var(--color-border);
  padding-top: 14px;
}
.response-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}
.bdg {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: var(--radius-full);
}
.bdg.success { background: var(--color-success-bg); color: var(--color-success); }
.bdg.warn { background: var(--color-warning-bg); color: var(--color-warning); }
.bdg.info { background: var(--color-info-bg); color: var(--color-info); }
.metric-row {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.metric-value {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
}
.small { font-size: 12px; }
.hero__bg {
  position: absolute;
  inset: 30px -40px -30px 30px;
  background: linear-gradient(135deg, var(--color-primary-200), transparent);
  border-radius: var(--radius-xl);
  z-index: 1;
}

.section { padding: 64px 0 12px; }
.section__head { text-align: center; max-width: 640px; margin: 0 auto 32px; }

.steps-grid { grid-template-columns: repeat(3, 1fr); }
.step-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 26px;
  position: relative;
  transition: transform 0.15s, box-shadow 0.15s;
}
.step-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.step-card__num {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 13px;
  color: var(--color-primary-600);
  letter-spacing: 0.1em;
  margin-bottom: 10px;
}

.help-bar {
  margin: 50px 0 12px;
  background: linear-gradient(135deg, #b83549, #93253a);
  border-radius: var(--radius-xl);
  padding: 26px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  color: #fff;
  flex-wrap: wrap;
}

.trust-grid { grid-template-columns: repeat(4, 1fr); }
.trust__icon { font-size: 26px; margin-bottom: 6px; }

@media (max-width: 960px) {
  .hero__inner { grid-template-columns: 1fr; }
  .hero h1 { font-size: 36px; }
  .steps-grid { grid-template-columns: 1fr; }
  .trust-grid { grid-template-columns: 1fr 1fr; }
}
</style>
