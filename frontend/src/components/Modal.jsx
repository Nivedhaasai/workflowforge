import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

function getFocusableElements(container){
  if(!container) return []
  return Array.from(container.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'))
}

export default function Modal({ open, title, children, primary, secondary, onClose }){
  const modalRef = useRef(null)
  const lastActiveRef = useRef(null)

  useEffect(()=>{
    function onKey(e){
      if(e.key === 'Escape') { onClose && onClose(); return }
      if(e.key === 'Tab' && modalRef.current){
        const focusable = getFocusableElements(modalRef.current)
        if(focusable.length === 0) { e.preventDefault(); return }
        const first = focusable[0]
        const last = focusable[focusable.length -1]
        if(!e.shiftKey && document.activeElement === last){
          e.preventDefault(); first.focus()
        }
        if(e.shiftKey && document.activeElement === first){
          e.preventDefault(); last.focus()
        }
      }
    }

    if(open) document.addEventListener('keydown', onKey)
    return ()=> document.removeEventListener('keydown', onKey)
  },[open,onClose])

  useEffect(()=>{
    if(open){
      lastActiveRef.current = document.activeElement
      document.body.style.overflow = 'hidden'
      // focus first focusable element inside modal, or the modal itself
      setTimeout(()=>{
        const el = modalRef.current
        const focusable = getFocusableElements(el)
        if(focusable.length) focusable[0].focus()
        else if(el) el.focus()
      }, 0)
    } else {
      document.body.style.overflow = ''
      try{ lastActiveRef.current && lastActiveRef.current.focus() }catch(e){}
    }
  },[open])

  if(typeof document === 'undefined') return null
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{opacity:0}}
          animate={{opacity:1}}
          exit={{opacity:0}}
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-hidden={!open}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={()=> onClose && onClose()} />

          <motion.div
            id="wf-modal"
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="wf-modal-title"
            tabIndex={-1}
            initial={{scale:0.98, opacity:0}}
            animate={{scale:1, opacity:1}}
            exit={{scale:0.98, opacity:0}}
            transition={{duration:0.16}}
            className="z-50 max-w-lg w-full bg-[#07121a]/80 border border-gray-800 p-6 rounded-2xl shadow-2xl ring-1 ring-white/5"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 id="wf-modal-title" className="text-lg font-semibold">{title}</h3>
              </div>
              <button
                type="button"
                onClick={()=> onClose && onClose()}
                className="text-muted hover:bg-surface/20 p-2 rounded-lg -mr-2"
                aria-label="Close dialog"
                title="Close"
              >
                <span className="sr-only">Close</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 8.586L15.293 3.293a1 1 0 011.414 1.414L11.414 10l5.293 5.293a1 1 0 01-1.414 1.414L10 11.414l-5.293 5.293a1 1 0 01-1.414-1.414L8.586 10 3.293 4.707A1 1 0 014.707 3.293L10 8.586z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="mt-4">{children}</div>

            <div className="mt-6 flex justify-end gap-3">
              {secondary && (
                <button
                  type="button"
                  onClick={()=> secondary.onClick && secondary.onClick()}
                  className="btn-secondary px-4 py-2 rounded-md"
                >{secondary.label}</button>
              )}

              {primary ? (
                <button
                  type="button"
                  onClick={()=> primary.onClick && primary.onClick()}
                  className="px-4 py-2 rounded-md bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md hover:brightness-105"
                >{primary.label}</button>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>, document.body
  )
}
