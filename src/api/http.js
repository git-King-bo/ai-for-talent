const DEFAULT_TIMEOUT = 10000

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, item))
      return
    }

    searchParams.append(key, value)
  })

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  if (contentType.includes('text/')) {
    return response.text()
  }

  return response.blob()
}

class HttpClient {
  constructor(options = {}) {
    this.baseURL = options.baseURL || import.meta.env.VITE_API_BASE_URL || '/api'
    this.timeout = options.timeout || DEFAULT_TIMEOUT
    this.requestInterceptors = []
    this.responseInterceptors = []
  }

  useRequest(interceptor) {
    this.requestInterceptors.push(interceptor)
  }

  useResponse(interceptor) {
    this.responseInterceptors.push(interceptor)
  }

  async request(config) {
    let finalConfig = {
      method: 'GET',
      headers: {},
      timeout: this.timeout,
      ...config,
    }

    for (const interceptor of this.requestInterceptors) {
      finalConfig = (await interceptor(finalConfig)) || finalConfig
    }

    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), finalConfig.timeout || DEFAULT_TIMEOUT)

    const requestInit = {
      method: finalConfig.method,
      headers: { ...finalConfig.headers },
      signal: controller.signal,
    }

    if (finalConfig.body !== undefined && finalConfig.body !== null) {
      if (finalConfig.body instanceof FormData) {
        requestInit.body = finalConfig.body
      } else if (isPlainObject(finalConfig.body)) {
        requestInit.body = JSON.stringify(finalConfig.body)
        requestInit.headers['Content-Type'] = 'application/json'
      } else {
        requestInit.body = finalConfig.body
      }
    }

    const requestUrl = `${this.baseURL}${finalConfig.url}${buildQuery(finalConfig.params)}`

    try {
      const response = await fetch(requestUrl, requestInit)
      const payload = await parseResponse(response)

      if (!response.ok) {
        const message = payload?.message || `请求失败，状态码 ${response.status}`
        const error = new Error(message)
        error.status = response.status
        error.payload = payload
        throw error
      }

      let result = payload

      for (const interceptor of this.responseInterceptors) {
        result = (await interceptor(result, response)) ?? result
      }

      return result
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('请求超时，请稍后重试')
      }

      throw error
    } finally {
      window.clearTimeout(timeoutId)
    }
  }

  get(url, config = {}) {
    return this.request({
      ...config,
      url,
      method: 'GET',
    })
  }

  post(url, body, config = {}) {
    return this.request({
      ...config,
      url,
      body,
      method: 'POST',
    })
  }

  put(url, body, config = {}) {
    return this.request({
      ...config,
      url,
      body,
      method: 'PUT',
    })
  }

  delete(url, config = {}) {
    return this.request({
      ...config,
      url,
      method: 'DELETE',
    })
  }
}

export const http = new HttpClient()

http.useRequest((config) => {
  const token = localStorage.getItem('token')

  return {
    ...config,
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...config.headers,
    },
  }
})

http.useResponse((payload) => {
  if (!isPlainObject(payload) || !('code' in payload)) {
    return payload
  }

  const successCodes = [0, 200]

  if (!successCodes.includes(payload.code)) {
    throw new Error(payload.message || '业务请求失败')
  }

  return payload.data ?? payload
})
