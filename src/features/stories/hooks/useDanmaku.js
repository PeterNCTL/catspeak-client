import { useState, useRef, useEffect, useMemo } from "react"
import { generateDanmakuItems } from "../utils/danmaku"

/**
 * Hook that manages the danmaku items generation.
 *
 * @param {Array} combinedStories - Stories with isOwn flag
 * @returns {{ stageRef: React.RefObject, danmakuItems: Array }}
 */
const useDanmaku = (combinedStories) => {
  const stageRef = useRef(null)

  // Generate danmaku items whenever stories change
  const danmakuItems = useMemo(
    () => generateDanmakuItems(combinedStories),
    [combinedStories],
  )

  return { stageRef, danmakuItems }
}

export default useDanmaku
