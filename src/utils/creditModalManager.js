import { store } from '@/redux/store/store.js'
import {
  openCreditModal,
  closeCreditModal,
} from '@/redux/app/creditModalSlice.js'

let resolveModal = null

export const confirmCreditUsage = ({ featureKey, subFeature = null }) => {
  return new Promise((resolve) => {
    resolveModal = resolve
    store.dispatch(openCreditModal({ featureKey, subFeature }))
  })
}

export const handleModalConfirm = () => {
  if (resolveModal) resolveModal(true)
  store.dispatch(closeCreditModal())
  resolveModal = null
}

export const handleModalCancel = () => {
  if (resolveModal) resolveModal(false)
  store.dispatch(closeCreditModal())
  resolveModal = null
}
