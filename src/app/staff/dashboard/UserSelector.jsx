'use client'

import { useState, useTransition } from 'react'
import { searchEligibleManagers } from '@/app/actions/managers'

export default function UserSelector({ roles, name = "initial_manager_id", required = true }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  
  const handleSearch = async (e) => {
    const val = e.target.value
    setQuery(val)
    setSelectedUser(null)
    
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

  const handleSelect = (user) => {
    setSelectedUser(user)
    setQuery(user.name)
    setIsOpen(false)
    setResults([])
  }

  return (
    <div style={{ position: 'relative' }}>
      <label style={{ display: 'block', marginBottom: '0.25rem' }}>Initial Manager ({roles.join(' or ')})</label>
      <input 
        type="text" 
        value={query}
        onChange={handleSearch}
        placeholder={`Search by name...`}
        required={required && !selectedUser}
        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
      />
      <input type="hidden" name={name} value={selectedUser?.id || ''} required={required} />
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
    </div>
  )
}
