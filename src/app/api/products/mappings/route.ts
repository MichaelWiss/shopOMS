import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/session'
import { getProductMappings } from '@/lib/supabase/product-mappings'

const QuerySchema = z.object({
  sku: z.string().optional(),
  status: z.enum(['mapped', 'missing_odoo', 'missing_sku', 'error', 'pending']).optional(),
  missing_only: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

export async function GET(req: NextRequest): Promise<NextResponse> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value
  if (!token || !(await validateSession(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = QuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { sku, status, missing_only, limit, offset } = parsed.data
  const mappings = await getProductMappings({ sku, status, missingOnly: missing_only, limit, offset })

  return NextResponse.json({ mappings, total: mappings.length, limit, offset })
}
