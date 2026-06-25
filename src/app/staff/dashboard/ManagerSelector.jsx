'use client'

import { useState, useTransition } from 'react'
import { searchEligibleManagers } from '@/app/actions/managers'

export default function ManagerSelector({ roles, onAddManager }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState(null)
  
  const handleSearch = async (e) => {
    const val = e.target.value
    setQuery(val)
    
    if (val.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    startTransition(async () => {
      const users = await searchEligibleManagers(val, roles)
      setResults(users)
      setIsOpen(true)
    })
  }

  const handleSelect = async (user) => {
    setError(null)
    setQuery('')
    setIsOpen(false)
    setResults([])
    
    const res = await onAddManager(user.id)
    if (res?.error) {
      setError(res.error)
    }
  }

  return (
    <div style={{ position: 'relative', marginTop: '1rem' }}>
      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Add Manager</label>
      <input 
        type="text" 
        value={query}
        onChange={handleSearch}
        placeholder={`Search ${roles.join(' or ')} by name...`}
        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
      />
      {isPending && <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>Searching...</div>}
      
      {isOpen && results.length > 0 && (
        <ul style={{ 
          position: 'absolute', top: '100%', left: 0, right: 0, 
          background: 'white', border: '1px solid #d1d5db', borderRadius: '0.25rem',
          maxHeight: '150px', overflowY: 'auto', margin: 0, padding: 0, listStyle: 'none',
          zIndex: 10
        }}>
          {results.map(user => (
            <li 
              key={user.id} 
              onClick={() => handleSelect(user)}
              style={{ padding: '0.5rem', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}
            >
              <div style={{ fontWeight: 'bold' }}>{user.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{user.email} - {user.responsibilities.join(', ')}</div>
            </li>
          ))}
        </ul>
      )}
      
      {isOpen && results.length === 0 && !isPending && query.length >= 2 && (
        <div style={{ 
          position: 'absolute', top: '100%', left: 0, right: 0, 
          background: 'white', border: '1px solid #d1d5db', borderRadius: '0.25rem',
          padding: '0.5rem', zIndex: 10, color: '#6b7280', fontSize: '0.875rem'
        }}>
          No eligible users found.
        </div>
      )}

      {error && <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{error}</div>}
    </div>
  )
}
