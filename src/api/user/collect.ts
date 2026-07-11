import request from '@/request'

export function addCollect(skuId: number) {
  return request(`/api/user/userCollect/auth/add/${skuId}`, 'POST')
}

export function deleteCollect(skuId: number) {
  return request(`/api/user/userCollect/auth/delete/${skuId}`, 'DELETE')
}

export function getCollectList() {
  return request('/api/user/userCollect/auth/findCollectList', 'GET')
}

export function isCollected(skuId: number) {
  return request(`/api/user/userCollect/auth/isCollected/${skuId}`, 'GET')
}