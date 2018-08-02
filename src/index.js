import path from 'path'
import fs from 'fs'
import mime from 'mime'

function processor(data) {
  const {
    file
  } = data

  let {
    url
  } = data


  if (isFilePath(url)) {
    const filePath = path.isAbsolute(url)
      ? path.normalize(url)
      : path.resolve(path.dirname(file), url)

    let base64Str = ''
    try {
      base64Str = fs.readFileSync(filePath).toString('base64')
    } catch (err) {
      return data
    }

    const mimeType = mime.getType(filePath)
    data.url = `data:${mimeType};base64,${base64Str}`
  }

  return data
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
      path = alias[str] + path.slice(alias[str].length)
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

    const processed = await Promise.all(urls.map(processor))

    processed.forEach(function (url) {
      code = code.replace(url.string, `url(${url.quote}${url.url}${url.suffix}${url.quote})`)
    })

    op.code = code

    return op.next()
  }
}

export default URLResolver
