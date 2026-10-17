/**
 * Made with 💛 by Karim Saif
 * @framerIntrinsicWidth 900
 * @framerIntrinsicHeight 600
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */

"use client"

import * as React from "react"
import { addPropertyControls, ControlType, useIsStaticRenderer, useReducedMotion } from "framer"

type Preset = "classic" | "diagonal" | "ripple" | "flow" | "calm"
interface Props {
    color: string
    backgroundColor: string
    size: number
    strokeWidth: number
    speed: number
    preset: Preset
    paused: boolean
    cursorInteraction: boolean
    cursorRadius: number
    cursorStrength: number
    cursorSmoothness: number
    style?: React.CSSProperties
}
const defaults = {
    color: "#E5484D",
    backgroundColor: "#F3EEE4",
    size: 40,
    strokeWidth: 20,
    speed: 1,
    preset: "classic" as Preset,
    paused: false,
    cursorInteraction: true,
    cursorRadius: 160,
    cursorStrength: 1.5,
    cursorSmoothness: 12,
}
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n))
const safe = (n: number, fallback: number) => Number.isFinite(n) ? n : fallback
function hash(i: number, j: number) {
    const x = Math.sin(i * 127.1 + j * 311.7) * 43758.5453
    return x - Math.floor(x) > 0.5 ? 1 : 0
}
function wave(i: number, j: number, t: number, preset: Preset) {
    let v = 0
    switch (preset) {
        case "diagonal": v = Math.sin((i + j) * 0.38 - t * 1.1); break
        case "ripple": v = Math.sin(Math.hypot(i, j) * 0.48 - t * 1.5); break
        case "flow":
            v = Math.sin(i * 0.24 + t * 0.7) * Math.cos(j * 0.32 - t * 0.5)
                + Math.sin((i - j) * 0.16 + t * 0.35)
            break
        case "calm": v = Math.sin(i * 0.16 + t * 0.3) + Math.sin(j * 0.19 - t * 0.25); break
        default:
            v = Math.sin(i * 0.35 + t * 0.8) + Math.sin(j * 0.45 - t * 0.6)
                + Math.sin((i + j) * 0.2 + t * 0.45)
    }
    return (v > 0 ? 1 : 0) ^ hash(i, j)
}
function arcs(cx: number, cy: number, half: number, theta: number) {
    const cos = Math.cos(theta)
    const sin = Math.sin(theta)
    const commands: string[] = []
    for (const s of [-1, 1]) {
        const ax = cx + (cos - sin) * half * s
        const ay = cy + (sin + cos) * half * s
        const start = theta + (s < 0 ? 0 : Math.PI)
        commands.push(
            "M" + (ax + half * Math.cos(start)) + " " + (ay + half * Math.sin(start)) +
            " A" + half + " " + half + " 0 0 1 " +
            (ax + half * Math.cos(start + Math.PI / 2)) + " " +
            (ay + half * Math.sin(start + Math.PI / 2))
        )
    }
    return commands.join(" ")
}
function Preview({ color, backgroundColor, size, strokeWidth, preset }: Pick<Props, "color" | "backgroundColor" | "size" | "strokeWidth" | "preset">) {
    const tile = clamp(safe(size, 40), 12, 200)
    const count = Math.min(50, Math.ceil(900 / tile) + 2)
    const total = count * tile
    const items: React.ReactNode[] = []
    for (let j = 0; j < count; j++) {
        for (let i = 0; i < count; i++) {
            items.push(<path key={i + "-" + j} d={arcs((i + 0.5) * tile, (j + 0.5) * tile, tile / 2, wave(i, j, 0, preset) * Math.PI / 2)} />)
        }
    }
    return (
        <svg aria-hidden="true" viewBox={`0 0 ${total} ${total}`} preserveAspectRatio="xMidYMid slice"
            style={{ width: "100%", height: "100%", display: "block", position: "absolute", inset: 0, backgroundColor }}>
            <g stroke={color} fill="none" strokeWidth={tile * clamp(safe(strokeWidth, 20), 2, 60) / 100} strokeLinecap="round" strokeLinejoin="round">{items}</g>
        </svg>
    )
}
export default function KarimSaifTruchetWeaveBackground(props: Props) {
    const p = { ...defaults, ...props }
    const hostRef = React.useRef<HTMLDivElement>(null)
    const canvasRef = React.useRef<HTMLCanvasElement>(null)
    const staticMode = useIsStaticRenderer()
    const reducedMotion = useReducedMotion()
    const shouldPreview = staticMode || reducedMotion
    React.useEffect(() => {
        if (shouldPreview) return
        const host = hostRef.current
        const canvas = canvasRef.current
        if (!host || !canvas) return
        const ctx = canvas.getContext("2d", { alpha: false })
        if (!ctx) return
        const requestedSize = clamp(safe(p.size, 40), 12, 200)
        const speed = clamp(safe(p.speed, 1), 0, 5)
        const smooth = clamp(safe(p.cursorSmoothness, 12), 1, 30)
        const radius = clamp(safe(p.cursorRadius, 160), 30, 600)
        const strength = clamp(safe(p.cursorStrength, 1.5), 0, 4)
        const stroke = clamp(safe(p.strokeWidth, 20), 2, 60)
        let width = 0
        let height = 0
        let dpr = 1
        let tile = requestedSize
        let cols = 0
        let rows = 0
        let waveTime = 0
        let lastTime = 0
        let frame = 0
        let visible = false
        let disposed = false
        let moving = false
        let pointerInside = false
        let px = -1e5
        let py = -1e5
        type Cell = { previous: number; target: number; angle: number; cursor: number }
        let cells = new Map<string, Cell>()
        const auto = !p.paused && speed > 0
        const cursor = !p.paused && p.cursorInteraction && strength > 0
        const key = (i: number, j: number) => i + ":" + j
        const running = () => !disposed && visible && !document.hidden && !p.paused && (auto || moving)
        const stop = () => { if (frame) { cancelAnimationFrame(frame); frame = 0 } }
        const draw = (dt: number) => {
            if (!width || !height) return
            ctx.fillStyle = p.backgroundColor
            ctx.fillRect(0, 0, width, height)
            ctx.beginPath()
            ctx.strokeStyle = p.color
            ctx.lineWidth = tile * stroke / 100
            ctx.lineCap = "round"
            ctx.lineJoin = "round"
            const autoEase = dt ? 1 - Math.exp(-7 * dt) : 0
            const cursorEase = dt ? 1 - Math.exp(-smooth * dt) : 0
            let active = false
            const half = tile / 2
            for (let j = 0; j < rows; j++) {
                for (let i = 0; i < cols; i++) {
                    const cell = cells.get(key(i, j))
                    if (!cell) continue
                    const cx = (i + 0.5) * tile
                    const cy = (j + 0.5) * tile
                    if (auto && dt) {
                        const next = wave(i, j, waveTime, p.preset)
                        if (next !== cell.previous) {
                            cell.previous = next
                            cell.target += 1
                        }
                        if (cell.target > 8 && Math.abs(cell.target - cell.angle) < 0.01) {
                            cell.target -= 4
                            cell.angle -= 4
                        }
                    }
                    let cursorTarget = 0
                    if (cursor && pointerInside) {
                        const distance = Math.hypot(cx - px, cy - py)
                        if (distance < radius) {
                            const v = 1 - distance / radius
                            cursorTarget = strength * v * v * (3 - 2 * v)
                        }
                    }
                    if (dt) {
                        cell.angle += (cell.target - cell.angle) * autoEase
                        cell.cursor += (cursorTarget - cell.cursor) * cursorEase
                    }
                    if (Math.abs(cell.target - cell.angle) > 0.002 || Math.abs(cursorTarget - cell.cursor) > 0.002) active = true
                    const theta = (cell.angle + cell.cursor) * Math.PI / 2
                    const c = Math.cos(theta)
                    const s = Math.sin(theta)
                    for (const sign of [-1, 1]) {
                        const ax = cx + (c - s) * half * sign
                        const ay = cy + (s + c) * half * sign
                        const start = theta + (sign < 0 ? 0 : Math.PI)
                        ctx.moveTo(ax + half * Math.cos(start), ay + half * Math.sin(start))
                        ctx.arc(ax, ay, half, start, start + Math.PI / 2)
                    }
                }
            }
            ctx.stroke()
            moving = active
        }
        const tick = (now: number) => {
            frame = 0
            if (!running()) return
            const dt = clamp((now - lastTime) / 1000, 0, 0.05)
            lastTime = now
            if (auto) waveTime += dt * speed
            draw(dt)
            if (running()) frame = requestAnimationFrame(tick)
        }
        const start = () => {
            if (frame || !running()) return
            lastTime = performance.now()
            frame = requestAnimationFrame(tick)
        }
        const update = () => {
            stop()
            if (disposed) return
            if (running()) start()
        }
        const resize = () => {
            if (disposed) return
            const bounds = host.getBoundingClientRect()
            const w = Math.max(0, Math.round(bounds.width))
            const h = Math.max(0, Math.round(bounds.height))
            const nextDpr = clamp(window.devicePixelRatio || 1, 1, 2)
            let nextTile = requestedSize
            let nextCols = Math.ceil(w / nextTile) + 1
            let nextRows = Math.ceil(h / nextTile) + 1
            while (nextCols * nextRows > 5500) {
                nextTile *= 1.05
                nextCols = Math.ceil(w / nextTile) + 1
                nextRows = Math.ceil(h / nextTile) + 1
            }
            if (w === width && h === height && nextDpr === dpr && nextTile === tile) return
            const oldTile = tile
            width = w
            height = h
            dpr = nextDpr
            tile = nextTile
            cols = nextCols
            rows = nextRows
            if (oldTile !== tile) cells.clear()
            const next = new Map<string, Cell>()
            for (let j = 0; j < rows; j++) {
                for (let i = 0; i < cols; i++) {
                    const id = key(i, j)
                    const initial = wave(i, j, waveTime, p.preset)
                    next.set(id, cells.get(id) || { previous: initial, target: initial, angle: initial, cursor: 0 })
                }
            }
            cells = next
            canvas.width = Math.max(1, Math.round(width * dpr))
            canvas.height = Math.max(1, Math.round(height * dpr))
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            draw(0)
        }
        const onPointer = (event: PointerEvent) => {
            if (!cursor) return
            const bounds = host.getBoundingClientRect()
            px = event.clientX - bounds.left
            py = event.clientY - bounds.top
            pointerInside = true
            moving = true
            start()
        }
        const onLeave = () => {
            if (!cursor) return
            pointerInside = false
            moving = true
            start()
        }
        const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null
        const io = typeof IntersectionObserver !== "undefined"
            ? new IntersectionObserver(entries => {
                visible = entries[0]?.isIntersecting ?? false
                update()
            }, { threshold: 0 })
            : null
        ro?.observe(host)
        if (io) io.observe(host)
        else visible = true
        host.addEventListener("pointermove", onPointer)
        host.addEventListener("pointerenter", onPointer)
        host.addEventListener("pointerleave", onLeave)
        document.addEventListener("visibilitychange", update)
        window.addEventListener("resize", resize)
        resize()
        update()
        return () => {
            disposed = true
            stop()
            ro?.disconnect()
            io?.disconnect()
            host.removeEventListener("pointermove", onPointer)
            host.removeEventListener("pointerenter", onPointer)
            host.removeEventListener("pointerleave", onLeave)
            document.removeEventListener("visibilitychange", update)
            window.removeEventListener("resize", resize)
        }
    }, [
        p.color, p.backgroundColor, p.size, p.strokeWidth, p.speed, p.preset,
        p.paused, p.cursorInteraction, p.cursorRadius, p.cursorStrength,
        p.cursorSmoothness, shouldPreview,
    ])
    return (
        <div ref={hostRef} style={{
            ...p.style,
            position: "relative",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            backgroundColor: p.backgroundColor,
            isolation: "isolate",
            touchAction: "pan-y",
        }}>
            {shouldPreview
                ? <Preview color={p.color} backgroundColor={p.backgroundColor} size={p.size} strokeWidth={p.strokeWidth} preset={p.preset} />
                : <canvas ref={canvasRef} aria-hidden="true" style={{
                    position: "absolute", inset: 0, width: "100%",
                    height: "100%", display: "block", pointerEvents: "none",
                }} />}
        </div>
    )
}
KarimSaifTruchetWeaveBackground.defaultProps = defaults

addPropertyControls(KarimSaifTruchetWeaveBackground, {
    color: {
        type: ControlType.Color,
        title: "Arc Color",
        defaultValue: defaults.color,
        description: "Sets the color of the quarter-circle arcs forming the geometric weave.",
    },
    backgroundColor: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: defaults.backgroundColor,
        description: "Sets the background color behind the animated Truchet pattern.",
    },
    preset: {
        type: ControlType.Enum,
        title: "Wave Preset",
        options: ["classic", "diagonal", "ripple", "flow", "calm"],
        optionTitles: ["Classic", "Diagonal", "Ripple", "Flow", "Calm"],
        defaultValue: defaults.preset,
        description: "Choose how animated waves propagate through the quarter-circle tile grid.",
    },
    size: {
        type: ControlType.Number,
        title: "Tile Size",
        min: 12,
        max: 200,
        step: 1,
        defaultValue: defaults.size,
        unit: "px",
        displayStepper: true,
        description: "Controls tile size and grid density; very large grids are automatically optimized.",
    },
    strokeWidth: {
        type: ControlType.Number,
        title: "Stroke Width",
        min: 2,
        max: 60,
        step: 1,
        defaultValue: defaults.strokeWidth,
        unit: "%",
        displayStepper: true,
        description: "Controls the curved line thickness relative to each tile.",
    },
    speed: {
        type: ControlType.Number,
        title: "Speed",
        min: 0,
        max: 5,
        step: 0.1,
        defaultValue: defaults.speed,
        displayStepper: true,
        description: "Sets wave animation speed. Zero enables cursor-only interaction.",
    },
    paused: {
        type: ControlType.Boolean,
        title: "Paused",
        defaultValue: defaults.paused,
        enabledTitle: "Yes",
        disabledTitle: "No",
        description: "Disables automatic animation and interactive cursor movement.",
    },
    cursorInteraction: {
        type: ControlType.Boolean,
        title: "Cursor",
        defaultValue: defaults.cursorInteraction,
        enabledTitle: "On",
        disabledTitle: "Off",
        description: "Enables smooth cursor-driven rotations of nearby tiles.",
    },
    cursorRadius: {
        type: ControlType.Number,
        title: "Cursor Radius",
        min: 30,
        max: 600,
        step: 10,
        defaultValue: defaults.cursorRadius,
        unit: "px",
        displayStepper: true,
        hidden: props => !props.cursorInteraction,
        description: "Determines how far the pointer influences nearby tiles.",
    },
    cursorStrength: {
        type: ControlType.Number,
        title: "Cursor Strength",
        min: 0,
        max: 4,
        step: 0.1,
        defaultValue: defaults.cursorStrength,
        displayStepper: true,
        hidden: props => !props.cursorInteraction,
        description: "Sets the intensity of cursor-induced tile rotation.",
    },
    cursorSmoothness: {
        type: ControlType.Number,
        title: "Cursor Smoothness",
        min: 1,
        max: 30,
        step: 1,
        defaultValue: defaults.cursorSmoothness,
        displayStepper: true,
        hidden: props => !props.cursorInteraction,
        description: "Adjusts the cursor effect easing and how gently the tiles settle.",
    },
})
