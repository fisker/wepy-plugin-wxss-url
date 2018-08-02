import path from 'path'
import fs from 'fs'
import mime from 'mime'

async function processor(data) {
  const {
    file
  } = data

  let {
    url
  } = data


  if (isFilePath(url)) {
    let filePath = path.isAbsolute(url)
      ? url
      : path.resolve(path.dirname(file), url)

    filePath = path.normalize(filePath)

    let content = ''

    try {
      content = await readFile(filePath, 500)
    } catch (err) {
      return data
    }

    const mimeType = mime.getType(filePath)
    data.url = `data:${mimeType};base64,${base64Str.toString('base64')}`
  }

  return data
}

function readFile(file, timeout) {
  let startTime = Date.now()
  let content = ''
  return new Promise((resolve, reject) => {
    (function readFile() {
      try {
        content = fs.readFileSync(file)
      } catch (err) {}

      if (content.length) {
        return resolve(content)
      }

      if (Date.now() - startTime > timeout) {
        return reject(new Error('timeout'))
      }

      process.nextTick(readFile)
    })()
  })
}

function isFilePath(url) {
  if (protocolRelative(url)) {
    return false
  }

  url = url.replace(/\\/g, '/')

  if (path.isAbsolute(url)) {
    return true
  }

  if (url[0] === '.' || url[0] === '/') {
    return true
  }

  return false
}

function protocolRelative(url) {
  return url[0] === '/' && url[1] === '/'
}

function replaceAlias(path, alias) {
  Object.keys(alias).forEach(function(str) {
    if (path.indexOf(str) === 0) {
      path = alias[str] + '/' + path.slice(str.length)
    }
  })

  return path
}

class URLResolver {
  setting = {
    re: /url\((["']?)(.*?)(\1)\)/g,
    alias: {
      '@': path.join(process.cwd(), 'src')
    }
  }

  constructor(options = {}) {
    Object.assign(this.setting, options)
  }

  async apply(op) {
    const {
      re,
      alias
    } = this.setting

    const {
      type,
      file
    } = op
    let {
      code
    } = op

    if (!code || type !== 'css') {
      return op.next()
    }

    const urls = []
    let match

    while (true) {
      match = re.exec(code)
      if (!match) {
        break
      }

      let url = match[2]
      let quoteIndex = url.indexOf('?')
      let hashIndex = url.indexOf('#')
      let suffixIndex = url.length
      if (quoteIndex !== -1) {
        suffixIndex = Math.min(suffixIndex, quoteIndex)
      }
      if (hashIndex !== -1) {
        suffixIndex = Math.min(suffixIndex, hashIndex)
      }

      let urlSuffix = url.slice(suffixIndex)
      url = url.slice(0, suffixIndex)

      url = replaceAlias(url, alias)

      urls.push({
        file: file,
        string: match[0],
        quote: match[1],
        url: url,
        suffix: urlSuffix
      })
    }

    await new Promise(resolve => process.nextTick(resolve)) // delay for dist file ready
    const processed = await Promise.all(urls.map(processor))

    processed.forEach(function (url) {
      code = code.replace(url.string, `url(${url.quote}${url.url}${url.suffix}${url.quote})`)
    })

    op.code = code

    return op.next()
  }
}

export default URLResolver
