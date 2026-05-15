<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppButton from '../../components/common/AppButton.vue'
import StepIndicator from '../../components/common/StepIndicator.vue'
import LocationPicker from '../../components/common/LocationPicker.vue'
import { api } from '../../services/api'

/**
 * Form fields here mirror the database schema (see docs/db.md):
 *  - victim:    first_name, last_name, contact_number, email, barangay_id, address
 *  - offender:  first_name, sex, barangay_id
 *  - abuse_type: abuse_name (FK)
 *  - report:    abuse_name, latitude, longitude, description, severity (via abuse_type)
 */

interface Barangay {
  barangay_id?: number
  id?: number
  barangay_name: string
  latitude: number | null
  longitude: number | null
}

interface AbuseType {
  abuse_name: string
  abuse_description?: string
  severity: number
  law_reference: string
}

const barangays = ref<Barangay[]>([])
const abuseTypes = ref<AbuseType[]>([])
const loadingData = ref(false)
const dataError = ref('')

const step = ref(0)
const submitted = ref(false)
const submitting = ref(false)
const submitError = ref('')
const reportCode = ref('')

const steps = [
  { title: 'Your safety', description: 'A few quick checks' },
  { title: 'Incident', description: 'What happened & where' },
  { title: 'About you', description: 'Victim contact info' },
  { title: 'Offender', description: 'Optional details' },
  { title: 'Review', description: 'Confirm and submit' },
]

const form = ref({
  // Privacy
  anonymous: false,
  reporterRole: 'victim' as 'victim' | 'witness' | 'other',

  // report.abuse_name (FK to abuse_type)
  abuse_name: '',

  // free-text severity override is not in schema; severity comes from abuse_type
  // We allow user to optionally describe urgency
  urgency: 'now' as 'now' | 'today' | 'past',

  incident_date: '',
  incident_time: '',
  description: '',

  // report.barangay_id — barangay where the incident occurred (separate from victim's residence)
  incident_barangay_id: null as number | null,

  // report.latitude, report.longitude
  location: null as { lat: number; lng: number } | null,

  // victim.*
  victim_first_name: '',
  victim_middle_name: '',
  victim_last_name: '',
  victim_contact_number: '',
  victim_email: '',
  victim_barangay_id: null as number | null,
  victim_address: '',

  // offender.*
  offender_first_name: '',
  offender_middle_name: '',
  offender_last_name: '',
  offender_sex: '' as '' | 'male' | 'female' | 'other',
  offender_barangay_id: null as number | null,
  offender_relationship: '', // metadata, lives in description on submit

  consent: false,
})

const selectedAbuse = computed(() =>
  abuseTypes.value.find((t) => t.abuse_name === form.value.abuse_name) ?? null,
)

// City center of Tagum (Magugpo Poblacion) — used when no barangay is selected yet.
const TAGUM_CENTER: [number, number] = [7.4475, 125.8073]

const incidentBarangay = computed(() =>
  barangays.value.find((b) => bId(b) === form.value.incident_barangay_id) ?? null,
)

// Re-centers the map on the chosen barangay so the user can drop a precise pin within it.
const mapCenter = computed<[number, number]>(() => {
  const b = incidentBarangay.value
  if (b && b.latitude != null && b.longitude != null) {
    return [Number(b.latitude), Number(b.longitude)]
  }
  return TAGUM_CENTER
})

const severityLabel = computed(() => {
  const s = selectedAbuse.value?.severity ?? 0
  if (s <= 3) return 'Low'
  if (s <= 6) return 'Moderate'
  if (s <= 8) return 'High'
  return 'Critical'
})

function next() {
  if (step.value < steps.length - 1) step.value++
}
function back() {
  if (step.value > 0) step.value--
}

function bId(b: Barangay): number {
  return (b.barangay_id ?? b.id ?? 0) as number
}

function selectedBarangay(id: number | null) {
  return barangays.value.find((b) => bId(b) === id)?.barangay_name ?? '—'
}

async function loadFormData() {
  loadingData.value = true
  dataError.value = ''
  try {
    const [bRows, aRows] = await Promise.all([
      api.get<Barangay[]>('/barangay'),
      api.get<AbuseType[]>('/abuse-type'),
    ])
    barangays.value = bRows ?? []
    abuseTypes.value = aRows ?? []
  } catch (err: any) {
    dataError.value = err.message || 'Could not reach the server. Please try again.'
  } finally {
    loadingData.value = false
  }
}

onMounted(loadFormData)

const SEX_MAP: Record<'male' | 'female' | 'other', 'Male' | 'Female' | 'Other'> = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
}

async function submit() {
  if (submitting.value) return
  submitError.value = ''

  // Client-side guardrails the server also enforces
  if (!form.value.abuse_name) {
    submitError.value = 'Please choose an abuse type.'
    return
  }
  if (form.value.incident_barangay_id == null) {
    submitError.value = 'Please select the barangay where the incident happened.'
    return
  }
  if (form.value.victim_barangay_id == null) {
    submitError.value = 'Please select your barangay.'
    return
  }
  if (!form.value.location) {
    submitError.value = 'Please drop a pin on the incident location.'
    return
  }
  if (!form.value.victim_contact_number && !form.value.victim_email) {
    submitError.value =
      'Please provide at least a phone number or email so responders can reach you.'
    return
  }

  submitting.value = true
  try {
    // 1) Create victim. Anonymous reports still need a row; use placeholders.
    const victimPayload = {
      first_name:
        form.value.victim_first_name.trim() ||
        (form.value.anonymous ? 'Anonymous' : ''),
      middle_name: form.value.victim_middle_name.trim() || null,
      last_name:
        form.value.victim_last_name.trim() ||
        (form.value.anonymous ? 'Reporter' : ''),
      contact_number: form.value.victim_contact_number.trim() || null,
      email: form.value.victim_email.trim() || null,
      barangay_id: form.value.victim_barangay_id,
      address: form.value.victim_address.trim() || null,
    }
    const victim = await api.post<{ id: number }>('/victim', victimPayload)

    // 2) Optional offender. Only created when the reporter shared something.
    let offender_id: number | null = null
    const hasOffenderData =
      form.value.offender_first_name.trim() ||
      form.value.offender_last_name.trim() ||
      form.value.offender_sex ||
      form.value.offender_barangay_id != null
    if (hasOffenderData) {
      const offenderPayload = {
        first_name: form.value.offender_first_name.trim() || 'Unknown',
        middle_name: form.value.offender_middle_name.trim() || null,
        // schema requires last_name NOT NULL — fall back to placeholder if blank
        last_name: form.value.offender_last_name.trim() || 'Unknown',
        sex: form.value.offender_sex ? SEX_MAP[form.value.offender_sex] : null,
        barangay_id: form.value.offender_barangay_id,
      }
      const offender = await api.post<{ id: number }>('/offender', offenderPayload)
      offender_id = offender.id
    }

    // 3) Bundle non-schema metadata into the description.
    const metaLines: string[] = []
    if (form.value.description.trim()) metaLines.push(form.value.description.trim())
    if (form.value.incident_date || form.value.incident_time) {
      metaLines.push(
        `Incident time: ${form.value.incident_date || 'unspecified'} ${form.value.incident_time || ''}`.trim(),
      )
    }
    if (form.value.offender_relationship) {
      metaLines.push(`Relationship to victim: ${form.value.offender_relationship}`)
    }
    metaLines.push(`Reporter: ${form.value.reporterRole}; Urgency: ${form.value.urgency}`)
    if (form.value.anonymous) metaLines.push('Reporter requested anonymity.')

    // 4) Create report.
    const reportPayload = {
      victim_id: victim.id,
      offender_id: offender_id ?? undefined,
      abuse_name: form.value.abuse_name,
      barangay_id: form.value.incident_barangay_id,
      latitude: form.value.location.lat,
      longitude: form.value.location.lng,
      report_description: metaLines.join('\n\n'),
    }
    const report = await api.post<{ report_id: string }>('/reports', reportPayload)

    reportCode.value = report.report_id
    submitted.value = true
  } catch (err: any) {
    submitError.value =
      err.message || 'Something went wrong while submitting your report. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="container report-page fade-up">
    <div v-if="!submitted">
      <div class="page-head">
        <h1>File a confidential report</h1>
        <p class="muted">
          You don't have to provide everything at once. Skip what you're unsure about —
          our responders will help.
        </p>
      </div>

      <div class="steps-wrap">
        <StepIndicator :steps="steps" :current="step" />
      </div>

      <div v-if="loadingData" class="muted" style="text-align:center; padding: var(--space-3)">
        Loading form…
      </div>
      <div v-else-if="dataError" class="alert alert--accent" style="margin-bottom: var(--space-4)">
        <strong>Couldn't load form data.</strong>
        <p>{{ dataError }}</p>
        <button class="retry-btn" @click="loadFormData">Retry</button>
      </div>

      <div class="grid layout">
        <!-- Form -->
        <div class="card card--padded form-area">
          <!-- Step 0: Safety -->
          <div v-if="step === 0" class="col">
            <div class="alert alert--accent">
              <strong>Are you safe right now?</strong>
              <p>
                If you are in immediate danger, call <a href="tel:911">911</a> or use
                the <strong>Quick Exit</strong> button at the top of the page.
              </p>
            </div>

            <label class="toggle-card">
              <input type="checkbox" v-model="form.anonymous" />
              <div>
                <strong>Submit anonymously</strong>
                <p class="muted small">
                  We won't ask for your name or contact info. You can still get a
                  tracking code.
                </p>
              </div>
            </label>

            <div class="field">
              <label>Are you the victim or a witness?</label>
              <div class="chip-row">
                <label class="chip">
                  <input type="radio" v-model="form.reporterRole" value="victim" />
                  <span>I am the victim</span>
                </label>
                <label class="chip">
                  <input type="radio" v-model="form.reporterRole" value="witness" />
                  <span>I am a witness / family</span>
                </label>
                <label class="chip">
                  <input type="radio" v-model="form.reporterRole" value="other" />
                  <span>Other</span>
                </label>
              </div>
            </div>

            <div class="field">
              <label>When did this happen?</label>
              <div class="chip-row">
                <label class="chip">
                  <input type="radio" v-model="form.urgency" value="now" />
                  <span>Happening now</span>
                </label>
                <label class="chip">
                  <input type="radio" v-model="form.urgency" value="today" />
                  <span>Today / recent</span>
                </label>
                <label class="chip">
                  <input type="radio" v-model="form.urgency" value="past" />
                  <span>In the past</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Step 1: Incident -->
          <div v-if="step === 1" class="col">
            <div class="field">
              <label>Type of abuse <span class="req">*</span></label>
              <div class="abuse-grid">
                <label
                  v-for="t in abuseTypes"
                  :key="t.abuse_name"
                  class="abuse-card"
                  :class="{ active: form.abuse_name === t.abuse_name }"
                >
                  <input type="radio" :value="t.abuse_name" v-model="form.abuse_name" />
                  <strong>{{ t.abuse_name }}</strong>
                  <span class="muted small">{{ t.abuse_description }}</span>
                  <span class="law">{{ t.law_reference }}</span>
                </label>
              </div>
            </div>

            <div v-if="selectedAbuse" class="severity-info">
              <span class="muted small">Default severity for {{ selectedAbuse.abuse_name }}</span>
              <strong>{{ severityLabel }} ({{ selectedAbuse.severity }}/10)</strong>
              <span class="muted small">
                Operators may adjust based on your description.
              </span>
            </div>

            <div class="grid two-col">
              <div class="field">
                <label>Date of incident</label>
                <input type="date" v-model="form.incident_date" />
              </div>
              <div class="field">
                <label>Approximate time</label>
                <input type="time" v-model="form.incident_time" />
              </div>
            </div>

            <div class="field">
              <label>Barangay where it happened <span class="req">*</span></label>
              <select v-model.number="form.incident_barangay_id">
                <option :value="null">Select the incident barangay</option>
                <option v-for="b in barangays" :key="bId(b)" :value="bId(b)">
                  {{ b.barangay_name }}
                </option>
              </select>
            </div>

            <div class="field">
              <label>Incident location <span class="hint">(tap map to drop a pin)</span></label>
              <LocationPicker
                v-model="form.location"
                :center="mapCenter"
                :zoom="incidentBarangay ? 16 : 13"
                :height="'280px'"
              />
            </div>

            <div class="field">
              <label>Tell us what happened</label>
              <textarea
                v-model="form.description"
                placeholder="Describe in your own words. Include anything you remember — what was said, what was done, who else was there."
              />
              <span class="hint">Your words will only be read by authorized responders.</span>
            </div>
          </div>

          <!-- Step 2: About you (victim) -->
          <div v-if="step === 2" class="col">
            <div v-if="form.anonymous" class="alert alert--info">
              You chose to remain anonymous. You can skip these fields, or share a
              contact method so responders can reach you safely.
            </div>

            <div class="grid two-col">
              <div class="field">
                <label>First name {{ form.anonymous ? '(optional)' : '*' }}</label>
                <input v-model="form.victim_first_name" maxlength="20" />
              </div>
              <div class="field">
                <label>Last name {{ form.anonymous ? '(optional)' : '*' }}</label>
                <input v-model="form.victim_last_name" maxlength="15" />
              </div>
            </div>
            <div class="field">
              <label>Middle name <span class="hint">(optional)</span></label>
              <input v-model="form.victim_middle_name" maxlength="15" />
            </div>
            <div class="grid two-col">
              <div class="field">
                <label>Phone number</label>
                <input
                  v-model="form.victim_contact_number"
                  placeholder="+63 9XX XXX XXXX"
                  maxlength="20"
                />
                <span class="hint">Required if email is not provided.</span>
              </div>
              <div class="field">
                <label>Email address</label>
                <input
                  v-model="form.victim_email"
                  type="email"
                  placeholder="you@example.com"
                  maxlength="60"
                />
              </div>
            </div>
            <div class="field">
              <label>Barangay (residence) <span class="req">*</span></label>
              <select v-model.number="form.victim_barangay_id">
                <option :value="null">Select your barangay</option>
                <option v-for="b in barangays" :key="bId(b)" :value="bId(b)">
                  {{ b.barangay_name }}
                </option>
              </select>
            </div>
            <div class="field">
              <label>Detailed address <span class="hint">(optional)</span></label>
              <input
                v-model="form.victim_address"
                placeholder="e.g. 23 Mabini St., near covered court"
                maxlength="255"
              />
            </div>

            <div class="alert alert--neutral">
              <strong>Privacy guarantee.</strong>
              Your contact info is shared only with the responder assigned to your case
              and is never disclosed to the offender.
            </div>
          </div>

          <!-- Step 3: Offender -->
          <div v-if="step === 3" class="col">
            <p class="muted">
              Sharing details about the offender helps responders prepare safely. Skip
              anything you're not sure about.
            </p>

            <div class="grid two-col">
              <div class="field">
                <label>First name <span class="hint">(if known)</span></label>
                <input v-model="form.offender_first_name" maxlength="20" />
              </div>
              <div class="field">
                <label>Last name <span class="hint">(if known)</span></label>
                <input v-model="form.offender_last_name" maxlength="15" />
              </div>
            </div>
            <div class="grid two-col">
              <div class="field">
                <label>Middle name <span class="hint">(optional)</span></label>
                <input v-model="form.offender_middle_name" maxlength="15" />
              </div>
              <div class="field">
                <label>Sex</label>
                <div class="chip-row">
                  <label class="chip">
                    <input type="radio" v-model="form.offender_sex" value="male" />
                    <span>Male</span>
                  </label>
                  <label class="chip">
                    <input type="radio" v-model="form.offender_sex" value="female" />
                    <span>Female</span>
                  </label>
                  <label class="chip">
                    <input type="radio" v-model="form.offender_sex" value="other" />
                    <span>Other</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="field">
              <label>Barangay (residence)</label>
              <select v-model.number="form.offender_barangay_id">
                <option :value="null">Unknown / Not applicable</option>
                <option v-for="b in barangays" :key="bId(b)" :value="bId(b)">
                  {{ b.barangay_name }}
                </option>
              </select>
            </div>

            <div class="field">
              <label>Relationship to victim</label>
              <select v-model="form.offender_relationship">
                <option value="">Select</option>
                <option>Spouse / partner</option>
                <option>Parent</option>
                <option>Sibling</option>
                <option>Other relative</option>
                <option>Acquaintance</option>
                <option>Stranger</option>
              </select>
              <span class="hint">
                Relationship is included with your description so operators can route
                the case to the correct desk.
              </span>
            </div>
          </div>

          <!-- Step 4: Review -->
          <div v-if="step === 4" class="col">
            <div class="review">
              <h3>Review your report</h3>

              <section>
                <h4>Privacy</h4>
                <dl>
                  <dt>Anonymous</dt><dd>{{ form.anonymous ? 'Yes' : 'No' }}</dd>
                  <dt>Reporter</dt><dd>{{ form.reporterRole }}</dd>
                  <dt>Urgency</dt><dd>{{ form.urgency }}</dd>
                </dl>
              </section>

              <section>
                <h4>Incident</h4>
                <dl>
                  <dt>Type</dt><dd>{{ form.abuse_name || '—' }}</dd>
                  <dt>Severity</dt><dd>{{ severityLabel }} ({{ selectedAbuse?.severity ?? '—' }}/10)</dd>
                  <dt>When</dt><dd>{{ form.incident_date || '—' }} {{ form.incident_time }}</dd>
                  <dt>Barangay</dt><dd>{{ selectedBarangay(form.incident_barangay_id) }}</dd>
                  <dt>Location</dt>
                  <dd>
                    <span v-if="form.location">
                      {{ form.location.lat.toFixed(5) }}, {{ form.location.lng.toFixed(5) }}
                    </span>
                    <span v-else class="muted">Not specified</span>
                  </dd>
                  <dt>Description</dt><dd>{{ form.description || '—' }}</dd>
                </dl>
              </section>

              <section>
                <h4>Victim</h4>
                <dl>
                  <dt>Name</dt>
                  <dd>
                    {{ form.victim_first_name || '—' }}
                    {{ form.victim_middle_name }}
                    {{ form.victim_last_name }}
                  </dd>
                  <dt>Contact</dt><dd>{{ form.victim_contact_number || form.victim_email || '—' }}</dd>
                  <dt>Barangay</dt><dd>{{ selectedBarangay(form.victim_barangay_id) }}</dd>
                  <dt>Address</dt><dd>{{ form.victim_address || '—' }}</dd>
                </dl>
              </section>

              <section>
                <h4>Offender</h4>
                <dl>
                  <dt>Name</dt>
                  <dd>
                    {{ form.offender_first_name || '—' }}
                    {{ form.offender_middle_name }}
                    {{ form.offender_last_name }}
                  </dd>
                  <dt>Sex</dt><dd>{{ form.offender_sex || '—' }}</dd>
                  <dt>Barangay</dt><dd>{{ selectedBarangay(form.offender_barangay_id) }}</dd>
                  <dt>Relationship</dt><dd>{{ form.offender_relationship || '—' }}</dd>
                </dl>
              </section>
            </div>

            <label class="toggle-card">
              <input type="checkbox" v-model="form.consent" />
              <div>
                <strong>I understand and consent</strong>
                <p class="muted small">
                  I confirm this report is true to the best of my knowledge, and I
                  consent to authorized responders contacting me regarding this incident.
                </p>
              </div>
            </label>
          </div>

          <div v-if="submitError" class="alert alert--accent" style="margin-top: var(--space-4)">
            <strong>We couldn't submit your report.</strong>
            <p>{{ submitError }}</p>
          </div>

          <!-- Footer nav -->
          <div class="form-nav">
            <AppButton variant="ghost" @click="back" :disabled="step === 0 || submitting">Back</AppButton>
            <AppButton
              v-if="step < steps.length - 1"
              variant="primary"
              @click="next"
            >
              Continue
            </AppButton>
            <AppButton
              v-else
              variant="accent"
              :disabled="!form.consent || !form.abuse_name || submitting"
              @click="submit"
            >
              {{ submitting ? 'Submitting…' : 'Submit report' }}
            </AppButton>
          </div>
        </div>

        <!-- Side help -->
        <aside class="side">
          <div class="card card--padded">
            <h3>Need help filling this out?</h3>
            <p class="muted">
              Call the VAWC hotline <strong>1366</strong> — a trained responder can guide
              you through the form, or take your report by phone.
            </p>
            <a href="tel:1366"><AppButton variant="secondary" block>Call 1366</AppButton></a>
          </div>

          <div class="card card--padded tips">
            <h3>What to include</h3>
            <ul>
              <li>Date, time, and place</li>
              <li>What happened, in your own words</li>
              <li>Witnesses, if any</li>
              <li>Any injuries or medical care</li>
              <li>Previous incidents, if relevant</li>
            </ul>
          </div>

          <div class="card card--padded warn-card">
            <strong>Your safety</strong>
            <p class="muted">
              Use the <strong>Quick Exit</strong> button anytime. We won't save partial
              data unless you submit.
            </p>
          </div>
        </aside>
      </div>
    </div>

    <!-- Confirmation -->
    <div v-else class="confirm fade-up">
      <div class="card card--padded confirm-card">
        <div class="confirm__icon">
          <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1>Your report has been received.</h1>
        <p class="muted" style="font-size: 16px">
          Thank you for trusting SafeReport. Responders in your barangay have been
          notified and will respond as quickly as possible.
        </p>
        <div class="code-block">
          <span class="muted small">Your tracking code</span>
          <strong>{{ reportCode }}</strong>
        </div>
        <p class="muted small">
          Save this code. Use it on the <strong>Track</strong> page to check your case
          status. We won't share it with anyone except you.
        </p>
        <div class="row" style="gap: 10px; margin-top: 16px; flex-wrap: wrap">
          <router-link to="/track">
            <AppButton variant="primary">Track this report</AppButton>
          </router-link>
          <router-link to="/resources">
            <AppButton variant="secondary">View support resources</AppButton>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.report-page { padding: var(--space-8) 0 60px; }
.page-head { text-align: center; max-width: 600px; margin: 0 auto var(--space-7, 28px); }
.steps-wrap { margin-bottom: var(--space-6); }

.layout { grid-template-columns: 1fr 320px; align-items: start; }

.form-area { padding: var(--space-7, 28px) var(--space-7-5, 30px); }
.col { gap: var(--space-5); }
.req { color: var(--color-accent-600); }

.alert {
  border-radius: var(--radius-md);
  padding: var(--space-3-5, 14px) var(--space-4);
  font-size: 14px;
  border: 1px solid;
}
.alert p { margin: var(--space-1) 0 0; }
.alert--accent {
  background: var(--color-accent-50);
  border-color: var(--color-accent-100);
  color: var(--color-accent-700);
}
.alert--info {
  background: var(--color-info-bg);
  border-color: #cfdcef;
  color: var(--color-info);
}
.alert--neutral {
  background: var(--color-surface-alt);
  border-color: var(--color-border);
  color: var(--color-text-muted);
}

.toggle-card {
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
  padding: var(--space-3-5, 14px) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  background: var(--color-surface-alt);
  transition: border-color 0.15s;
}
.toggle-card:hover { border-color: var(--color-primary-300); }
.toggle-card input { margin-top: var(--space-1); }
.toggle-card p { margin: var(--space-1) 0 0; }

.chip-row { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.chip {
  display: inline-flex;
  align-items: center;
  padding: var(--space-2-25, 9px) var(--space-3-5, 14px);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  background: var(--color-surface);
  transition: all 0.12s;
}
.chip input { display: none; }
.chip:has(input:checked) {
  background: var(--color-primary-50);
  border-color: var(--color-primary-500);
  color: var(--color-primary-700);
}

.abuse-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-2-5, 10px);
}
.abuse-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-3-5, 14px);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  cursor: pointer;
  background: var(--color-surface);
  transition: all 0.12s;
}
.abuse-card input { display: none; }
.abuse-card.active {
  border-color: var(--color-primary-500);
  background: var(--color-primary-50);
}
.abuse-card .law {
  margin-top: var(--space-1);
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-soft);
  letter-spacing: 0.04em;
}

.severity-info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-3-5, 14px);
  background: var(--color-primary-50);
  border: 1px dashed var(--color-primary-300);
  border-radius: var(--radius-md);
  color: var(--color-primary-700);
  font-size: 13px;
}
.severity-info strong { font-size: 14px; }

.two-col { grid-template-columns: 1fr 1fr; }

.review { display: flex; flex-direction: column; gap: var(--space-4-5, 18px); }
.review h3 { margin-bottom: var(--space-1); }
.review h4 {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-soft);
  margin: var(--space-2) 0 var(--space-1-5, 6px);
}
.review section {
  padding: var(--space-3-5, 14px) 0;
  border-top: 1px solid var(--color-border);
}
.review section:first-of-type { border-top: none; padding-top: 0; }
.review dl {
  display: grid;
  grid-template-columns: 140px 1fr;
  row-gap: var(--space-2-5, 10px);
  column-gap: var(--space-4);
  margin: 0;
  font-size: 14px;
}
.review dt { color: var(--color-text-soft); font-weight: 600; }
.review dd { margin: 0; color: var(--color-text); word-break: break-word; }

.form-nav {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-6);
  padding-top: var(--space-4-5, 18px);
  border-top: 1px solid var(--color-border);
  gap: var(--space-2);
}

/* Sidebar */
.side { display: flex; flex-direction: column; gap: var(--space-3-5, 14px); position: sticky; top: 96px; }
.tips ul {
  padding-left: var(--space-4-5, 18px);
  margin: 0;
  line-height: 1.8;
  color: var(--color-text-muted);
  font-size: 14px;
}
.warn-card { background: var(--color-accent-50); border-color: var(--color-accent-100); }
.warn-card strong { color: var(--color-accent-700); }

.retry-btn {
  margin-top: var(--space-2);
  background: none;
  border: none;
  color: var(--color-accent-700);
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  padding: 0;
  text-decoration: underline;
}

/* Confirmation */
.confirm { padding: var(--space-12) 0; display: flex; justify-content: center; }
.confirm-card { max-width: 580px; text-align: center; padding: var(--space-11, 44px) var(--space-9, 36px); }
.confirm__icon {
  width: 78px;
  height: 78px;
  margin: 0 auto var(--space-4-5, 18px);
  background: var(--color-success-bg);
  color: var(--color-success);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.code-block {
  margin: var(--space-4) 0 var(--space-1-5, 6px);
  padding: var(--space-3-5, 14px) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-primary-50);
  border: 1px dashed var(--color-primary-300);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.code-block strong {
  font-family: var(--font-display);
  font-size: 22px;
  letter-spacing: 0.05em;
  color: var(--color-primary-700);
}

@media (max-width: 900px) {
  .layout { grid-template-columns: 1fr; }
  .side { position: static; }
  .form-area { padding: 22px 18px; }
  .two-col { grid-template-columns: 1fr; }
  .review dl { grid-template-columns: 110px 1fr; }
}
@media (max-width: 540px) {
  .form-nav { flex-direction: column-reverse; }
  .form-nav :deep(.btn) { width: 100%; }
  .review dl { grid-template-columns: 1fr; row-gap: 4px; }
  .review dt { color: var(--color-text-soft); margin-top: 6px; }
}
</style>
