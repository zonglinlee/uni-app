import { getRealRoute } from '@dcloudio/uni-core'
import { DATA_RE, SCHEME_RE, cacheStringFunction } from '@dcloudio/uni-shared'
export function getRealPath(filepath: string) {
  // 无协议的情况补全 https
  if (filepath.indexOf('//') === 0) {
    return 'https:' + filepath
  }

  // 网络资源或base64
  if (SCHEME_RE.test(filepath) || DATA_RE.test(filepath)) {
    return filepath
  }

  if (isSystemURL(filepath)) {
    return 'file://' + normalizeLocalPath(filepath)
  }

  const wwwPath = 'file://' + normalizeLocalPath('_www')
  // 绝对路径转换为本地文件系统路径
  if (filepath.indexOf('/') === 0) {
    // 平台绝对路径 安卓、iOS
    if (
      filepath.startsWith('/storage/') ||
      filepath.includes('/Containers/Data/Application/')
    ) {
      return 'file://' + filepath
    }
    return wwwPath + filepath
  }
  // 相对资源
  if (filepath.indexOf('../') === 0 || filepath.indexOf('./') === 0) {
    // @ts-expect-error app-view
    if (typeof __id__ === 'string') {
      // @ts-expect-error app-view
      return wwwPath + getRealRoute('/' + __id__, filepath)
    } else {
      const pages = getCurrentPages()
      if (pages.length) {
        return (
          wwwPath + getRealRoute('/' + pages[pages.length - 1].route, filepath)
        )
      }
    }
  }
  return filepath
}

const normalizeLocalPath = cacheStringFunction((filepath: string) => {
  return plus.io
    .convertLocalFileSystemURL(filepath as any)
    .replace(/^\/?apps\//, '/android_asset/apps/')
    .replace(/\/$/, '')
})

function isSystemURL(filepath: string) {
  if (
    filepath.indexOf('_www') === 0 ||
    filepath.indexOf('_doc') === 0 ||
    filepath.indexOf('_documents') === 0 ||
    filepath.indexOf('_downloads') === 0
  ) {
    return true
  }
  return false
}
