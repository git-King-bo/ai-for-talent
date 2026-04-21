import { http } from '../http'

export function getTalentList(params) {
  return http.get('/talent/list', { params })
}

export function createTalent(data) {
  return http.post('/talent/create', data)
}
