import xmlrpc from 'xmlrpc'

const ODOO_URL = process.env.ODOO_URL || 'http://localhost:8069'
const ODOO_DB = process.env.ODOO_DB || ''
const ODOO_USERNAME = process.env.ODOO_USERNAME || ''
const ODOO_API_KEY = process.env.ODOO_API_KEY || ''

// Parse URL for XML-RPC clients
const url = new URL(ODOO_URL)
const isSecure = url.protocol === 'https:'
const port = url.port ? parseInt(url.port) : (isSecure ? 443 : 80)

const createClient = (path: string) => {
  const options = {
    host: url.hostname,
    port,
    path,
  }
  return isSecure ? xmlrpc.createSecureClient(options) : xmlrpc.createClient(options)
}

const commonClient = createClient('/xmlrpc/2/common')
const objectClient = createClient('/xmlrpc/2/object')

// Cache for UID
let cachedUid: number | null = null

/**
 * Authenticate with Odoo and get user ID
 */
export async function authenticate(): Promise<number> {
  if (cachedUid) {
    return cachedUid
  }

  return new Promise((resolve, reject) => {
    commonClient.methodCall('authenticate', [ODOO_DB, ODOO_USERNAME, ODOO_API_KEY, {}], (error: any, uid: any) => {
      if (error) {
        reject(new Error(`Odoo authentication failed: ${error?.message || error}`))
        return
      }
      if (!uid || uid === false) {
        reject(new Error('Odoo authentication failed: Invalid credentials'))
        return
      }
      cachedUid = uid as number
      resolve(uid as number)
    })
  })
}

/**
 * Execute a method on an Odoo model
 */
export async function execute<T>(
  model: string,
  method: string,
  args: unknown[] = [],
  kwargs: Record<string, unknown> = {}
): Promise<T> {
  const uid = await authenticate()

  return new Promise((resolve, reject) => {
    objectClient.methodCall(
      'execute_kw',
      [ODOO_DB, uid, ODOO_API_KEY, model, method, args, kwargs],
      (error: any, result: any) => {
        if (error) {
          reject(new Error(`Odoo execute failed: ${error?.message || error}`))
          return
        }
        resolve(result as T)
      }
    )
  })
}

/**
 * Search for records
 */
export async function search(
  model: string,
  domain: unknown[][] = [],
  options: { offset?: number; limit?: number; order?: string } = {}
): Promise<number[]> {
  return execute<number[]>(model, 'search', [domain], options)
}

/**
 * Read records by IDs
 */
export async function read<T>(
  model: string,
  ids: number[],
  fields?: string[]
): Promise<T[]> {
  const kwargs = fields ? { fields } : {}
  return execute<T[]>(model, 'read', [ids], kwargs)
}

/**
 * Search and read in one call
 */
export async function searchRead<T>(
  model: string,
  domain: unknown[][] = [],
  options: { fields?: string[]; offset?: number; limit?: number; order?: string } = {}
): Promise<T[]> {
  return execute<T[]>(model, 'search_read', [domain], options)
}

/**
 * Create a new record
 */
export async function create(
  model: string,
  values: Record<string, unknown>
): Promise<number> {
  return execute<number>(model, 'create', [values])
}

/**
 * Update existing records
 */
export async function write(
  model: string,
  ids: number[],
  values: Record<string, unknown>
): Promise<boolean> {
  return execute<boolean>(model, 'write', [ids, values])
}

/**
 * Delete records
 */
export async function unlink(
  model: string,
  ids: number[]
): Promise<boolean> {
  return execute<boolean>(model, 'unlink', [ids])
}

/**
 * Check Odoo connection health
 */
export async function checkHealth(): Promise<boolean> {
  try {
    await authenticate()
    return true
  } catch {
    return false
  }
}
