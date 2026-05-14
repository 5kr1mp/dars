<script setup lang="ts">
    
</script>

<template>
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
</template>

<style scoped>
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
</style>