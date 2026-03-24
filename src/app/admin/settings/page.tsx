import { CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'

type EnvRow = {
  name: string
  value: string
  set: boolean
}

function isSet(value: string | undefined): boolean {
  return Boolean(value && value.trim().length > 0)
}

function maskValue(value: string | undefined): string {
  if (!value) return 'Not set'
  if (value.length <= 8) return '••••••••'
  return `${value.slice(0, 4)}••••${value.slice(-4)}`
}

function parseProjectFromSupabaseUrl(url: string | undefined): string {
  if (!url) return 'Not configured'

  try {
    return new URL(url).host.split('.')[0] ?? 'Not configured'
  } catch {
    return 'Not configured'
  }
}

export default function SettingsPage() {
  const envRows: EnvRow[] = [
    { name: 'SHOPIFY_STORE_DOMAIN', value: maskValue(process.env.SHOPIFY_STORE_DOMAIN), set: isSet(process.env.SHOPIFY_STORE_DOMAIN) },
    { name: 'SHOPIFY_STOREFRONT_ACCESS_TOKEN', value: maskValue(process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN), set: isSet(process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN) },
    { name: 'SHOPIFY_CLIENT_ID', value: maskValue(process.env.SHOPIFY_CLIENT_ID), set: isSet(process.env.SHOPIFY_CLIENT_ID) },
    { name: 'SHOPIFY_CLIENT_SECRET', value: maskValue(process.env.SHOPIFY_CLIENT_SECRET), set: isSet(process.env.SHOPIFY_CLIENT_SECRET) },
    { name: 'ODOO_URL', value: maskValue(process.env.ODOO_URL), set: isSet(process.env.ODOO_URL) },
    { name: 'ODOO_DB', value: maskValue(process.env.ODOO_DB), set: isSet(process.env.ODOO_DB) },
    { name: 'ODOO_USERNAME', value: maskValue(process.env.ODOO_USERNAME), set: isSet(process.env.ODOO_USERNAME) },
    { name: 'ODOO_API_KEY', value: maskValue(process.env.ODOO_API_KEY), set: isSet(process.env.ODOO_API_KEY) },
    { name: 'NEXT_PUBLIC_SUPABASE_URL', value: maskValue(process.env.NEXT_PUBLIC_SUPABASE_URL), set: isSet(process.env.NEXT_PUBLIC_SUPABASE_URL) },
    { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: maskValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY), set: isSet(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', value: maskValue(process.env.SUPABASE_SERVICE_ROLE_KEY), set: isSet(process.env.SUPABASE_SERVICE_ROLE_KEY) },
    { name: 'INNGEST_EVENT_KEY', value: maskValue(process.env.INNGEST_EVENT_KEY), set: isSet(process.env.INNGEST_EVENT_KEY) },
    { name: 'INNGEST_SIGNING_KEY', value: maskValue(process.env.INNGEST_SIGNING_KEY), set: isSet(process.env.INNGEST_SIGNING_KEY) },
    { name: 'ADMIN_API_KEY', value: maskValue(process.env.ADMIN_API_KEY), set: isSet(process.env.ADMIN_API_KEY) },
  ]

  const connections = {
    shopify: {
      name: 'Shopify',
      description: 'Storefront and Admin API',
      status: isSet(process.env.SHOPIFY_STORE_DOMAIN) && isSet(process.env.SHOPIFY_CLIENT_SECRET) ? 'connected' : 'disconnected',
      lastChecked: 'Runtime config',
      config: {
        store: process.env.SHOPIFY_STORE_DOMAIN ?? 'Not configured',
        apiVersion: process.env.SHOPIFY_API_VERSION ?? 'Not configured',
        webhooks: ['orders/create', 'orders/cancelled', 'inventory_levels/update'],
      },
    },
    odoo: {
      name: 'Odoo',
      description: 'ERP Order Management',
      status: isSet(process.env.ODOO_URL) && isSet(process.env.ODOO_DB) ? 'connected' : 'disconnected',
      lastChecked: 'Runtime config',
      config: {
        url: process.env.ODOO_URL ?? 'Not configured',
        database: process.env.ODOO_DB ?? 'Not configured',
        username: process.env.ODOO_USERNAME ? maskValue(process.env.ODOO_USERNAME) : 'Not configured',
      },
    },
    supabase: {
      name: 'Supabase',
      description: 'Sync Event Logging',
      status: isSet(process.env.NEXT_PUBLIC_SUPABASE_URL) && isSet(process.env.SUPABASE_SERVICE_ROLE_KEY) ? 'connected' : 'disconnected',
      lastChecked: 'Runtime config',
      config: {
        project: parseProjectFromSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
        tables: ['sync_events', 'order_mappings'],
      },
    },
    inngest: {
      name: 'Inngest',
      description: 'Serverless Job Queue',
      status: isSet(process.env.INNGEST_EVENT_KEY) && isSet(process.env.INNGEST_SIGNING_KEY) ? 'connected' : 'disconnected',
      lastChecked: 'Runtime config',
      config: {
        functions: ['order-sync', 'inventory-sync', 'fulfillment-sync'],
        mode: 'cloud',
      },
    },
  }

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-medium text-[#1a1a1a]">Settings</h1>
      </div>

      {/* API Connections */}
      <div className="mb-8">
        <h2 className="text-[14px] font-medium text-[#1a1a1a] mb-4">API Connections</h2>
        <div className="space-y-4">
          {Object.entries(connections).map(([key, conn]) => (
            <div key={key} className="bg-white rounded-lg border border-[#E5E5E5] p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    key === 'shopify' ? 'bg-[#95BF47]/10' :
                    key === 'odoo' ? 'bg-[#714B67]/10' :
                    key === 'supabase' ? 'bg-[#3ECF8E]/10' :
                    'bg-[#6366F1]/10'
                  }`}>
                    <span className={`text-[14px] font-bold ${
                      key === 'shopify' ? 'text-[#95BF47]' :
                      key === 'odoo' ? 'text-[#714B67]' :
                      key === 'supabase' ? 'text-[#3ECF8E]' :
                      'text-[#6366F1]'
                    }`}>
                      {conn.name[0]}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[14px] font-medium text-[#1a1a1a]">{conn.name}</h3>
                      {conn.status === 'connected' ? (
                        <span className="flex items-center gap-1 text-[11px] text-[#10B981]">
                          <CheckCircle className="h-3 w-3" />
                          Connected
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] text-[#EF4444]">
                          <AlertTriangle className="h-3 w-3" />
                          Disconnected
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-[#666] mt-0.5">{conn.description}</p>
                    <p className="text-[11px] text-[#999] mt-1">Last checked: {conn.lastChecked}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 border border-[#E5E5E5] rounded hover:bg-[#FAFAFA] transition-colors">
                    <RefreshCw className="h-4 w-4 text-[#666]" />
                  </button>
                  <button className="px-3 py-2 text-[12px] border border-[#E5E5E5] rounded hover:bg-[#FAFAFA] transition-colors">
                    Configure
                  </button>
                </div>
              </div>
              
              {/* Connection Details */}
              <div className="mt-4 pt-4 border-t border-[#E5E5E5]">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-[12px]">
                  {Object.entries(conn.config).map(([configKey, configValue]) => (
                    <div key={configKey}>
                      <p className="text-[#999] capitalize">{configKey.replace(/_/g, ' ')}</p>
                      <p className="text-[#1a1a1a] mt-0.5 font-mono text-[11px]">
                        {Array.isArray(configValue) ? configValue.length + ' items' : configValue}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Environment Variables */}
      <div className="mb-8">
        <h2 className="text-[14px] font-medium text-[#1a1a1a] mb-4">Environment Variables</h2>
        <div className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA]">
                <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Variable</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Value</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {envRows.map((env) => (
                <tr key={env.name} className="hover:bg-[#FAFAFA]">
                  <td className="px-4 py-3 text-[12px] font-mono text-[#1a1a1a]">{env.name}</td>
                  <td className="px-4 py-3 text-[12px] font-mono text-[#666]">{env.value}</td>
                  <td className="px-4 py-3">
                    {env.set ? (
                      <span className="text-[11px] text-[#10B981] flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Set
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#EF4444] flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Missing
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Webhooks */}
      <div className="mb-8">
        <h2 className="text-[14px] font-medium text-[#1a1a1a] mb-4">Shopify Webhooks</h2>
        <div className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA]">
                <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Topic</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Endpoint</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-[#666] uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {[
                { topic: 'orders/create', endpoint: '/api/webhooks/orders/create', active: true },
                { topic: 'orders/cancelled', endpoint: '/api/webhooks/orders/cancelled', active: true },
                { topic: 'inventory_levels/update', endpoint: '/api/webhooks/inventory/update', active: true },
              ].map((webhook) => (
                <tr key={webhook.topic} className="hover:bg-[#FAFAFA]">
                  <td className="px-4 py-3 text-[12px] font-mono text-[#1a1a1a]">{webhook.topic}</td>
                  <td className="px-4 py-3 text-[12px] font-mono text-[#666]">{webhook.endpoint}</td>
                  <td className="px-4 py-3">
                    {webhook.active ? (
                      <span className="text-[11px] px-2 py-0.5 bg-[#D1FAE5] text-[#065F46] rounded">active</span>
                    ) : (
                      <span className="text-[11px] px-2 py-0.5 bg-[#F3F4F6] text-[#4B5563] rounded">inactive</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sync Settings */}
      <div>
        <h2 className="text-[14px] font-medium text-[#1a1a1a] mb-4">Sync Settings</h2>
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-[#1a1a1a]">Auto-sync orders</p>
              <p className="text-[12px] text-[#666]">Automatically sync new Shopify orders to Odoo</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-[#E5E5E5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a1a1a]"></div>
            </label>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5]">
            <div>
              <p className="text-[13px] text-[#1a1a1a]">Inventory sync interval</p>
              <p className="text-[12px] text-[#666]">How often to sync inventory levels from Odoo to Shopify</p>
            </div>
            <select className="border border-[#E5E5E5] rounded px-3 py-2 text-[13px] bg-white">
              <option>Every 5 minutes</option>
              <option>Every 15 minutes</option>
              <option>Every hour</option>
              <option>Manual only</option>
            </select>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5]">
            <div>
              <p className="text-[13px] text-[#1a1a1a]">Retry failed syncs</p>
              <p className="text-[12px] text-[#666]">Automatically retry failed sync operations</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-[#E5E5E5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a1a1a]"></div>
            </label>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5]">
            <div>
              <p className="text-[13px] text-[#1a1a1a]">Log retention</p>
              <p className="text-[12px] text-[#666]">How long to keep sync event logs</p>
            </div>
            <select className="border border-[#E5E5E5] rounded px-3 py-2 text-[13px] bg-white">
              <option>7 days</option>
              <option>30 days</option>
              <option>90 days</option>
              <option>1 year</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
