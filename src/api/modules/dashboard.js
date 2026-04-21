import { http } from '../http'

export function getDashboardSummary(params) {
  return http.get('/dashboard/summary', { params })
}
