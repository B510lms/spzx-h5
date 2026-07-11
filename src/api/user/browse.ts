import request from '@/request'

export function addBrowseHistory(skuId: number) {
  return request(`/api/user/userBrowseHistory/auth/add/${skuId}`, 'POST')
}

export function deleteBrowseHistory(skuId: number) {
  return request(`/api/user/userBrowseHistory/auth/delete/${skuId}`, 'DELETE')
}

export function deleteAllBrowseHistory() {
  return request('/api/user/userBrowseHistory/auth/deleteAll', 'DELETE')
}

export function getBrowseHistoryList() {
  return request('/api/user/userBrowseHistory/auth/findBrowseHistoryList', 'GET')
}