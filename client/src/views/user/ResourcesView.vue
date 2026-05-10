<script setup lang="ts">
const hotlines = [
  { name: '911 — National Emergency', phone: '911', desc: 'Police, fire, medical' },
  { name: 'VAWC Hotline', phone: '1366', desc: 'Violence Against Women & Children' },
  { name: 'DSWD Hotline', phone: '1343', desc: 'Social welfare assistance' },
  { name: 'PNP Women & Children', phone: '177', desc: 'Specialized police response' },
  { name: 'In Touch Crisis Line', phone: '(02) 8893-7603', desc: '24/7 crisis counseling' },
]

const resources = [
  {
    title: 'Recognizing the signs',
    body: 'Abuse is not always physical. Patterns of intimidation, control, isolation, and humiliation are also forms of abuse and are protected under RA 9262.',
    icon: '🔍',
  },
  {
    title: 'Building a safety plan',
    body: 'Identify a trusted contact, prepare an emergency bag (IDs, medication, cash, keys), and memorize at least one safe location near you.',
    icon: '🧭',
  },
  {
    title: 'Documenting incidents',
    body: 'Keep a record of dates, what happened, and any witnesses. Photos of injuries, screenshots of threats, and medical records strengthen your case.',
    icon: '📓',
  },
  {
    title: 'Free legal support',
    body: 'The Public Attorney\'s Office (PAO), IBP Legal Aid, and DSWD all provide free legal representation for VAWC cases.',
    icon: '⚖️',
  },
  {
    title: 'Shelter & temporary housing',
    body: 'Haven for Women, DSWD crisis intervention centers, and accredited NGOs provide safe shelter at no cost.',
    icon: '🏠',
  },
  {
    title: 'Counseling & healing',
    body: 'Trauma-informed counseling is available through DSWD, the Philippine Mental Health Association, and accredited barangay VAWC desks.',
    icon: '💬',
  },
]
</script>

<template>
  <div class="container resources fade-up">
    <div class="page-head">
      <h1>Resources & support</h1>
      <p class="muted">
        You don't have to go through this alone. These resources can help — whether or
        not you decide to file a report.
      </p>
    </div>

    <section class="section">
      <h2>Hotlines</h2>
      <div class="grid hotline-grid">
        <a v-for="h in hotlines" :key="h.phone" :href="`tel:${h.phone}`" class="hotline-card card">
          <div class="hotline-card__phone">{{ h.phone }}</div>
          <div class="hotline-card__name">{{ h.name }}</div>
          <div class="muted small">{{ h.desc }}</div>
        </a>
      </div>
    </section>

    <section class="section">
      <h2>Practical guides</h2>
      <div class="grid resources-grid">
        <article v-for="r in resources" :key="r.title" class="card card--padded res-card">
          <div class="res-card__icon">{{ r.icon }}</div>
          <h3>{{ r.title }}</h3>
          <p class="muted">{{ r.body }}</p>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="legal card card--padded">
        <h2 style="margin-bottom: 6px">Your rights under the law</h2>
        <p class="muted" style="margin-bottom: 18px">
          Philippine law protects victims of domestic abuse. Knowing your rights is the
          first step toward safety.
        </p>
        <div class="grid law-grid">
          <div>
            <strong>RA 9262 — Anti-VAWC Act</strong>
            <p class="muted small">
              Protects women and their children from physical, sexual, psychological, and
              economic abuse.
            </p>
          </div>
          <div>
            <strong>RA 7610 — Child Protection</strong>
            <p class="muted small">
              Safeguards children from abuse, exploitation, and discrimination.
            </p>
          </div>
          <div>
            <strong>RA 11313 — Safe Spaces Act</strong>
            <p class="muted small">
              Penalizes gender-based street, public, and online sexual harassment.
            </p>
          </div>
          <div>
            <strong>Protection Orders</strong>
            <p class="muted small">
              Barangay (BPO), Temporary (TPO), and Permanent (PPO) protection orders are
              available within 24 hours.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.resources { padding: 36px 0 60px; }
.page-head { text-align: center; max-width: 640px; margin: 0 auto 28px; }
.section { margin-top: 36px; }

.hotline-grid {
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}
.hotline-card {
  padding: 20px;
  text-decoration: none;
  color: var(--color-text);
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
  border-color: var(--color-border);
}
.hotline-card:hover {
  text-decoration: none;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-accent-300);
}
.hotline-card__phone {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 800;
  color: var(--color-accent-600);
  letter-spacing: -0.01em;
}
.hotline-card__name {
  font-weight: 600;
  margin: 4px 0 2px;
}

.resources-grid {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}
.res-card { transition: transform 0.15s; }
.res-card:hover { transform: translateY(-2px); }
.res-card__icon { font-size: 28px; }

.law-grid {
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 18px;
}
.law-grid p { margin-top: 4px; }
.legal {
  background: linear-gradient(180deg, var(--color-primary-50), var(--color-surface));
  border-color: var(--color-primary-200);
}
</style>
