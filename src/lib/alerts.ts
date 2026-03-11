type AlertLevel = 'info' | 'warning' | 'critical'

interface Alert {
  level: AlertLevel
  title: string
  message: string
  metadata?: Record<string, unknown>
}

const LEVEL_EMOJI: Record<AlertLevel, string> = {
  info: 'ℹ️',
  warning: '⚠️',
  critical: '🚨',
}

/**
 * Send an alert. Always logs to console (captured by Vercel).
 * If SLACK_WEBHOOK_URL is set, also posts to Slack.
 */
export async function sendAlert(alert: Alert): Promise<void> {
  const prefix = `[ALERT:${alert.level.toUpperCase()}]`
  const logFn = alert.level === 'critical' ? console.error : alert.level === 'warning' ? console.warn : console.info
  logFn(`${prefix} ${alert.title}: ${alert.message}`, alert.metadata ?? '')

  const slackUrl = process.env.SLACK_WEBHOOK_URL
  if (slackUrl) {
    try {
      const text = `${LEVEL_EMOJI[alert.level]} *${alert.title}*\n${alert.message}${
        alert.metadata ? `\n\`\`\`${JSON.stringify(alert.metadata, null, 2)}\`\`\`` : ''
      }`
      await fetch(slackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
    } catch (err) {
      console.error('[ALERT] Failed to send Slack notification:', err)
    }
  }
}

export async function alertSyncFailure(
  functionId: string,
  error: Error,
  eventData?: Record<string, unknown>,
): Promise<void> {
  await sendAlert({
    level: 'critical',
    title: `Sync failed: ${functionId}`,
    message: `${error.message}\nAll retries exhausted.`,
    metadata: {
      functionId,
      errorName: error.name,
      stack: error.stack?.split('\n').slice(0, 3).join('\n'),
      ...eventData,
    },
  })
}

export async function alertHealthDegraded(
  checks: Record<string, { status: string; message?: string }>,
): Promise<void> {
  const failing = Object.entries(checks)
    .filter(([, v]) => v.status !== 'ok')
    .map(([k, v]) => `${k}: ${v.message || v.status}`)

  await sendAlert({
    level: 'critical',
    title: 'System health degraded',
    message: failing.join('\n'),
    metadata: checks,
  })
}

export async function alertFailedSyncBacklog(count: number): Promise<void> {
  await sendAlert({
    level: 'warning',
    title: 'Failed sync backlog',
    message: `${count} sync events are in failed/retry state.`,
    metadata: { failedCount: count },
  })
}
