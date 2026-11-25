'use client'

import { useEffect, useState } from 'react'

const KEY = 'wukong-demo-controls'
/**
 * 调试用的演示控制（调时钟、指定召唤结果、载入示例部族）默认隐藏。
 * 在任意页面地址后加 ?demo=1 开启，?demo=0 关闭；开关保存在本浏览器。
 */
export function useDemoControls() {
  const [enabled, setEnabled] = useState(false)
  useEffect(() => {
    try {
      const flag = new URLSearchParams(window.location.search).get('demo')
      if (flag === '1') localStorage.setItem(KEY, '1')
      if (flag === '0') localStorage.removeItem(KEY)
      setEnabled(localStorage.getItem(KEY) === '1')
    } catch { setEnabled(false) }
  }, [])
  return enabled
}
