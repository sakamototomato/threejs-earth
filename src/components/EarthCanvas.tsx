import React, { useEffect } from 'react'
import World from '../word/world'

function EarthCanvas() {
  useEffect(() => {
    if (!window.earthCanvasContainer) {
      // earth-canvas
      console.log('initialized')
      const dom: HTMLElement =
        document.querySelector('#earth-canvas')!
      new World({
        dom,
      })
      window.earthCanvasContainer = dom
    }
  }, [])
  return <div id="earth-canvas"></div>
}

export default React.memo(EarthCanvas)
