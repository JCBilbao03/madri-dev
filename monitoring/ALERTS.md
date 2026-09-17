# Firebase & Cloud Monitoring alerts

MadriBuild uses **Google Cloud Monitoring** (same project as Firebase: `madridev-119f7`) for operational alerts and **billing budgets** for cost guardrails.

## Automated setup (recommended)

Creates four metric alert policies and an email notification channel:

| Alert | What it catches | Default threshold |
|-------|-----------------|-------------------|
| Firestore write spike | Lead spam, demo write abuse | > 50 writes/sec for 5 min |
| Firestore rules denials | Rule probing, App Check blocks | > 20 DENY/sec for 5 min |
| Storage write spike | Inventory photo upload abuse | > 30 WriteObject/sec for 5 min |
| App Check invalid verdicts | Bot traffic, misconfigured keys | > 20 INVALID/sec for 5 min |

```bash
# Uses your Firebase CLI login email by default
npm run monitoring:setup-alerts

# Or send alerts to a team inbox
ALERT_EMAIL=jc@madridev.com npm run monitoring:setup-alerts
```

**Requires:** `npx firebase login` with permission to create Monitoring resources on the project.

Policy definitions live in `monitoring/alert-policies/`. Edit thresholds there, delete the policy in [Cloud Monitoring → Alerting](https://console.cloud.google.com/monitoring/alerting?project=madridev-119f7), then re-run the script.

---

## Billing budget alerts (manual — one-time)

Budget alerts do **not** pause services; they email you when spend crosses a percentage of your budget.

1. Open [Firebase → Usage and billing → Details & settings](https://console.firebase.google.com/project/madridev-119f7/usage/details)
2. Under **Budgets & alerts**, click **Create budget** (or edit an existing one)
3. Scope: project `madridev-119f7`, **All services** (or filter to Firestore + Storage)
4. Amount: start with a fixed test amount (e.g. **$25/month**) or **100% of last month’s spend**
5. Alert thresholds (suggested for production):
   - **50%** of actual spend
   - **100%** of actual spend
   - **150%** of forecasted spend
6. Confirm notification recipients (Billing Account Administrators receive emails by default)

For programmatic budget reactions (Slack, auto-disable billing), see [Advanced billing alerts](https://firebase.google.com/docs/projects/billing/advanced-billing-alerts-logic).

---

## Verify alerts are working

1. [Monitoring → Alerting](https://console.cloud.google.com/monitoring/alerting?project=madridev-119f7) — four policies named `MadriBuild — …`
2. [Monitoring → Notification channels](https://console.cloud.google.com/monitoring/alerting/notifications?project=madridev-119f7) — your email channel listed
3. Trigger a test (optional): temporarily lower a threshold in `monitoring/alert-policies/`, recreate the policy, generate traffic, then restore the threshold

---

## Dashboards (optional)

Useful pre-built views in Console:

- [Firestore usage](https://console.firebase.google.com/project/madridev-119f7/firestore/databases/-default-/usage)
- [Firestore Rules metrics](https://console.firebase.google.com/project/madridev-119f7/firestore/rules/metrics)
- [App Check metrics](https://console.firebase.google.com/project/madridev-119f7/appcheck/products)
- [Cloud Monitoring Metrics Explorer](https://console.cloud.google.com/monitoring/metrics-explorer?project=madridev-119f7)

---

## Tuning thresholds

After a week of normal traffic, open Metrics Explorer and compare your baseline to the alert thresholds in `monitoring/alert-policies/*.json`. Demo apps with low traffic may never trigger alerts — that is expected. Lower thresholds during security incidents; raise them if you get false positives after marketing campaigns or seed scripts.
