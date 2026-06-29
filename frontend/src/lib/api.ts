const BASE_URL = 'http://localhost:5000/api'

/** Returns headers with the stored JWT token for authenticated requests. */
function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  }
}

/**
 * Generic fetch wrapper that throws on non-OK responses.
 * @param url - Full URL to request
 * @param options - Standard `RequestInit` options
 * @returns Parsed JSON response
 * @throws {Error} With the server error message or "Request failed"
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function request<T = any>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data as T
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiResult = Promise<any>

/**
 * API client for all backend endpoints. Methods are organized by domain
 * (Auth, Accounts, Transactions, Holdings, Budgets, Goals, Reports).
 *
 * All authenticated methods include the JWT token via `authHeaders()`.
 */
export const api = {
  // ── Auth ──────────────────────────────────────────
  async signup(name: string, email: string, password: string): ApiResult {
    return request(`${BASE_URL}/auth/signup`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }),
    })
  },

  async login(email: string, password: string): ApiResult {
    return request(`${BASE_URL}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
    })
  },

  // ── Reports ───────────────────────────────────────
  async getSummary(): ApiResult {
    return request(`${BASE_URL}/reports/summary`, { headers: authHeaders() })
  },

  async getCashflow(): ApiResult {
    return request(`${BASE_URL}/reports/cashflow`, { headers: authHeaders() })
  },

  // ── Accounts ──────────────────────────────────────
  async getAccounts(): ApiResult {
    return request(`${BASE_URL}/accounts`, { headers: authHeaders() })
  },

  async createAccount(data: { name: string; type: string; balance: number }): ApiResult {
    return request(`${BASE_URL}/accounts`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
    })
  },

  async updateAccount(id: string, data: Partial<{ name: string; type: string; balance: number }>): ApiResult {
    return request(`${BASE_URL}/accounts/${id}`, {
      method: 'PATCH', headers: authHeaders(), body: JSON.stringify(data),
    })
  },

  async deleteAccount(id: string): ApiResult {
    return request(`${BASE_URL}/accounts/${id}`, {
      method: 'DELETE', headers: authHeaders(),
    })
  },

  // ── Transactions ──────────────────────────────────
  async getTransactions(params?: { accountId?: string; category?: string; page?: number }): ApiResult {
    const qs = new URLSearchParams()
    if (params?.accountId) qs.set('accountId', params.accountId)
    if (params?.category) qs.set('category', params.category)
    if (params?.page) qs.set('page', String(params.page))
    const query = qs.toString()
    return request(`${BASE_URL}/transactions${query ? '?' + query : ''}`, { headers: authHeaders() })
  },

  async createTransaction(data: {
    accountId: string; categoryId?: string; amount: number;
    description: string; date: string; tags?: string[]; isRecurring?: boolean;
  }): ApiResult {
    return request(`${BASE_URL}/transactions`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
    })
  },

  async updateTransaction(id: string, data: Partial<{
    accountId: string; categoryId: string; amount: number;
    description: string; date: string; tags: string[]; isRecurring: boolean;
  }>): ApiResult {
    return request(`${BASE_URL}/transactions/${id}`, {
      method: 'PATCH', headers: authHeaders(), body: JSON.stringify(data),
    })
  },

  async deleteTransaction(id: string): ApiResult {
    return request(`${BASE_URL}/transactions/${id}`, {
      method: 'DELETE', headers: authHeaders(),
    })
  },

  // ── Holdings ──────────────────────────────────────
  async getHoldings(): ApiResult {
    return request(`${BASE_URL}/holdings`, { headers: authHeaders() })
  },

  async createHolding(data: { ticker: string; quantity: number; costBasis: number; lastPrice: number }): ApiResult {
    return request(`${BASE_URL}/holdings`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
    })
  },

  async updateHolding(id: string, data: Partial<{ ticker: string; quantity: number; costBasis: number; lastPrice: number }>): ApiResult {
    return request(`${BASE_URL}/holdings/${id}`, {
      method: 'PATCH', headers: authHeaders(), body: JSON.stringify(data),
    })
  },

  async deleteHolding(id: string): ApiResult {
    return request(`${BASE_URL}/holdings/${id}`, {
      method: 'DELETE', headers: authHeaders(),
    })
  },

  async refreshPrices(): ApiResult {
    return request(`${BASE_URL}/holdings/prices`, {
      method: 'GET', headers: authHeaders(),
    })
  },

  // ── Budgets ───────────────────────────────────────
  async getBudgets(): ApiResult {
    return request(`${BASE_URL}/budgets`, { headers: authHeaders() })
  },

  async createBudget(data: { categoryId: string; monthlyLimit: number; month: string }): ApiResult {
    return request(`${BASE_URL}/budgets`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
    })
  },

  async updateBudget(id: string, data: Partial<{ categoryId: string; monthlyLimit: number; month: string }>): ApiResult {
    return request(`${BASE_URL}/budgets/${id}`, {
      method: 'PATCH', headers: authHeaders(), body: JSON.stringify(data),
    })
  },

  async deleteBudget(id: string): ApiResult {
    return request(`${BASE_URL}/budgets/${id}`, {
      method: 'DELETE', headers: authHeaders(),
    })
  },

  // ── Goals ─────────────────────────────────────────
  async getGoals(): ApiResult {
    return request(`${BASE_URL}/goals`, { headers: authHeaders() })
  },

  async createGoal(data: { name: string; targetAmount: number; currentAmount: number; targetDate: string; icon?: string }): ApiResult {
    return request(`${BASE_URL}/goals`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
    })
  },

  async updateGoal(id: string, data: Partial<{ name: string; targetAmount: number; currentAmount: number; targetDate: string; icon: string }>): ApiResult {
    return request(`${BASE_URL}/goals/${id}`, {
      method: 'PATCH', headers: authHeaders(), body: JSON.stringify(data),
    })
  },

  async deleteGoal(id: string): ApiResult {
    return request(`${BASE_URL}/goals/${id}`, {
      method: 'DELETE', headers: authHeaders(),
    })
  },
}

export const getToken = () => localStorage.getItem('token')
export const setToken = (token: string) => localStorage.setItem('token', token)
export const removeToken = () => localStorage.removeItem('token')
