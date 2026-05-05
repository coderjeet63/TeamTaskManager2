import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, 'dist')
const port = Number(process.env.PORT) || 3000

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

const sendResponse = (res, statusCode, body, headers = {}) => {
  res.writeHead(statusCode, headers)
  res.end(body)
}

const resolveAssetPath = (pathname) => {
  const relativePath = pathname === '/' ? '/index.html' : pathname
  const absolutePath = path.resolve(distDir, `.${relativePath}`)

  if (!absolutePath.startsWith(distDir)) {
    return null
  }

  return absolutePath
}

const getFilePath = async (pathname) => {
  const assetPath = resolveAssetPath(pathname)

  if (!assetPath) {
    return null
  }

  try {
    const assetStats = await stat(assetPath)

    if (assetStats.isFile()) {
      return assetPath
    }
  } catch {
    if (!path.extname(pathname)) {
      return path.join(distDir, 'index.html')
    }
  }

  return null
}

const server = createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method || 'GET')) {
    sendResponse(res, 405, 'Method not allowed', {
      Allow: 'GET, HEAD',
      'Content-Type': 'text/plain; charset=utf-8',
    })
    return
  }

  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
    const pathname = decodeURIComponent(url.pathname)
    const filePath = await getFilePath(pathname)

    if (!filePath) {
      sendResponse(res, 404, 'Not found', {
        'Content-Type': 'text/plain; charset=utf-8',
      })
      return
    }

    const body = req.method === 'HEAD' ? null : await readFile(filePath)
    const extension = path.extname(filePath).toLowerCase()

    sendResponse(res, 200, body, {
      'Cache-Control': filePath.endsWith('index.html') ? 'no-cache' : 'public, max-age=31536000, immutable',
      'Content-Type': contentTypes[extension] || 'application/octet-stream',
    })
  } catch (error) {
    sendResponse(res, 500, 'Internal server error', {
      'Content-Type': 'text/plain; charset=utf-8',
    })
  }
})

server.listen(port, '0.0.0.0', () => {
  console.log(`Frontend server listening on port ${port}.`)
})
