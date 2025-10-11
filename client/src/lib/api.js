// localStorage-based API implementation
const STORAGE_KEYS = {
  USERS: 'lostandfound_users',
  ITEMS: 'lostandfound_items',
  CURRENT_USER: 'lostandfound_current_user'
}

// Helper functions for localStorage operations
const getFromStorage = (key, defaultValue = []) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch (error) {
    console.error(`Error reading from localStorage key ${key}:`, error)
    return defaultValue
  }
}

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Error saving to localStorage key ${key}:`, error)
    throw new Error('Failed to save data')
  }
}

// Generate unique ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)

// Simulate async operations for consistency with original API
const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms))

export const api = {
  // Authentication functions
  register: async (email, password) => {
    await delay()
    const users = getFromStorage(STORAGE_KEYS.USERS)
    
    // Check if user already exists
    if (users.find(user => user.email === email)) {
      throw new Error('User already exists')
    }
    
    const newUser = {
      id: generateId(),
      email,
      password, // In a real app, this would be hashed
      createdAt: new Date().toISOString()
    }
    
    users.push(newUser)
    saveToStorage(STORAGE_KEYS.USERS, users)
    
    return { message: 'User created successfully' }
  },

  login: async (email, password) => {
    await delay()
    const users = getFromStorage(STORAGE_KEYS.USERS)
    
    const user = users.find(u => u.email === email && u.password === password)
    if (!user) {
      throw new Error('Invalid credentials')
    }
    
    const token = generateId()
    const currentUser = {
      id: user.id,
      email: user.email,
      token,
      createdAt: user.createdAt
    }
    
    saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser)
    
    return { token, user: currentUser }
  },

  verify: async (token) => {
    await delay()
    const currentUser = getFromStorage(STORAGE_KEYS.CURRENT_USER)
    
    if (!currentUser || currentUser.token !== token) {
      throw new Error('Invalid token')
    }
    
    return { user: currentUser }
  },

  // Items functions
  listItems: async (q, status) => {
    await delay()
    const items = getFromStorage(STORAGE_KEYS.ITEMS)
    
    let filteredItems = items
    
    // Filter by status if provided
    if (status) {
      filteredItems = filteredItems.filter(item => item.status === status)
    }
    
    // Filter by search query if provided
    if (q) {
      const query = q.toLowerCase()
      filteredItems = filteredItems.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.location?.toLowerCase().includes(query)
      )
    }
    
    return { items: filteredItems }
  },

  createItem: async (token, itemData) => {
    await delay()
    const currentUser = getFromStorage(STORAGE_KEYS.CURRENT_USER)
    
    if (!currentUser || currentUser.token !== token) {
      throw new Error('Unauthorized')
    }
    
    const items = getFromStorage(STORAGE_KEYS.ITEMS)
    
    const newItem = {
      id: generateId(),
      title: itemData.title,
      description: itemData.description || '',
      location: itemData.location,
      status: itemData.status,
      category: itemData.category || 'other',
      contact_email: itemData.contact_email || '',
      contact_phone: itemData.contact_phone || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: currentUser.id
    }
    
    items.push(newItem)
    saveToStorage(STORAGE_KEYS.ITEMS, items)
    
    return newItem
  },

  markFound: async (token, id) => {
    await delay()
    const currentUser = getFromStorage(STORAGE_KEYS.CURRENT_USER)
    
    if (!currentUser || currentUser.token !== token) {
      throw new Error('Unauthorized')
    }
    
    const items = getFromStorage(STORAGE_KEYS.ITEMS)
    const itemIndex = items.findIndex(item => item.id === id)
    
    if (itemIndex === -1) {
      throw new Error('Item not found')
    }
    
    items[itemIndex].status = 'found'
    items[itemIndex].updated_at = new Date().toISOString()
    items[itemIndex].found_by = currentUser.id
    
    saveToStorage(STORAGE_KEYS.ITEMS, items)
    
    return items[itemIndex]
  },

  // Additional helper functions for localStorage management
  getCurrentUser: () => getFromStorage(STORAGE_KEYS.CURRENT_USER),
  
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
  },
  
  clearAllData: () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key))
  },

  // Helper function to populate sample data for testing
  populateSampleData: () => {
    const sampleUsers = [
      {
        id: 'user1',
        email: 'test@example.com',
        password: 'password123',
        createdAt: new Date().toISOString()
      }
    ]
    
    const sampleItems = [
      {
        id: 'item1',
        title: 'iPhone 13',
        description: 'Black iPhone 13 with a cracked screen',
        location: 'Library',
        status: 'lost',
        category: 'electronics',
        contact_email: 'test@example.com',
        contact_phone: '',
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updated_at: new Date(Date.now() - 86400000).toISOString(),
        user_id: 'user1'
      },
      {
        id: 'item2',
        title: 'Blue Backpack',
        description: 'Navy blue backpack with laptop compartment',
        location: 'Cafeteria',
        status: 'found',
        category: 'bags',
        contact_email: 'finder@example.com',
        contact_phone: '',
        created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        updated_at: new Date(Date.now() - 172800000).toISOString(),
        user_id: 'user1'
      }
    ]
    
    saveToStorage(STORAGE_KEYS.USERS, sampleUsers)
    saveToStorage(STORAGE_KEYS.ITEMS, sampleItems)
    
    return { users: sampleUsers, items: sampleItems }
  }
}


