import React from 'react'
export default function Button({ children, variant='primary', ...props }){
  if (variant === 'primary') return <button className="btn-primary transition-fast" {...props}>{children}</button>
  return <button className="btn-secondary transition-fast" {...props}>{children}</button>
}
