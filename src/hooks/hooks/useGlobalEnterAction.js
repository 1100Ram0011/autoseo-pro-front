import { useEffect } from 'react'

const ACTIONABLE_INPUT_TYPES = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'hidden',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
])

const isVisible = (element) => {
  if (!element || !(element instanceof HTMLElement)) return false

  const style = window.getComputedStyle(element)
  if (style.display === 'none' || style.visibility === 'hidden') return false

  return element.getClientRects().length > 0
}

const isEnabled = (element) => {
  if (!element || !(element instanceof HTMLElement)) return false

  if ('disabled' in element && element.disabled) return false
  if (element.getAttribute('aria-disabled') === 'true') return false

  return true
}

const isEditableTarget = (element) => {
  if (!element || !(element instanceof HTMLElement)) return false
  if (element.isContentEditable) return true

  const tagName = element.tagName.toLowerCase()
  if (tagName === 'textarea' || tagName === 'select') return true
  if (tagName !== 'input') return false

  const type = (element.getAttribute('type') || 'text').toLowerCase()
  return !ACTIONABLE_INPUT_TYPES.has(type)
}

const isNativeActionTarget = (element) =>
  Boolean(element?.closest('button, a[href], summary, [role="button"]'))

const getActionCandidates = (root) => {
  if (!root) return []

  return Array.from(
    root.querySelectorAll(
      [
        '[data-enter-click="true"]',
        'button[type="submit"]',
        'input[type="submit"]',
        'button',
        '[role="button"]',
      ].join(', ')
    )
  ).filter(
    (element) =>
      isVisible(element) &&
      isEnabled(element) &&
      !element.matches('[data-disable-global-enter="true"]')
  )
}

const getActionScope = (activeElement) => {
  const modalRoot = document.querySelector(
    '[role="dialog"][aria-modal="true"], [role="dialog"][open], [aria-modal="true"]'
  )
  if (modalRoot) return modalRoot

  return (
    activeElement?.closest('form, main, section, [data-enter-scope="true"]') || document
  )
}

const triggerDefaultAction = (activeElement) => {
  const form = activeElement?.closest('form')
  if (form) {
    if (typeof form.requestSubmit === 'function') {
      form.requestSubmit()
      return true
    }

    form.dispatchEvent(
      new Event('submit', {
        bubbles: true,
        cancelable: true,
      })
    )
    return true
  }

  const scope = getActionScope(activeElement)
  const candidates = getActionCandidates(scope)
  if (!candidates.length) return false

  const preferredCandidate = candidates.find((element) => {
    if (element.matches('[data-enter-click="true"]')) return true
    return false
  })

  if (preferredCandidate) {
    preferredCandidate.click()
    return true
  }

  if (candidates.length === 1) {
    candidates[0].click()
    return true
  }

  const submitCandidate = candidates.find((element) =>
    element.matches('button[type="submit"], input[type="submit"]')
  )

  if (submitCandidate) {
    submitCandidate.click()
    return true
  }

  return false
}

const useGlobalEnterAction = () => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== 'Enter') return
      if (event.defaultPrevented || event.repeat) return
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
      if (event.isComposing || event.target?.closest('[data-disable-global-enter="true"]')) return

      const activeElement = document.activeElement
      if (isNativeActionTarget(activeElement)) return
      if (activeElement?.tagName?.toLowerCase() === 'textarea' || activeElement?.isContentEditable) {
        return
      }

      const shouldHandleForEditableTarget =
        isEditableTarget(activeElement) || !activeElement || activeElement === document.body

      if (!shouldHandleForEditableTarget) return

      const didTriggerAction = triggerDefaultAction(activeElement)
      if (!didTriggerAction) return

      event.preventDefault()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
}

export default useGlobalEnterAction
