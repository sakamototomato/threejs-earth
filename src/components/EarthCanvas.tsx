import React, { useEffect } from 'react'
import World from '../word/world'

function EarthCanvas() {

  useEffect(() => {
    // earth-canvas
    const dom: HTMLElement = document.querySelector('#earth-canvas')!
    new World({
      dom,
    })
  }, [])
  return (
    <canvas id='earth-canvas'></canvas>
  )
}

export default EarthCanvas