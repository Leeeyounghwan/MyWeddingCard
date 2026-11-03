import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { transformWithOxc } from 'vite'

const source = readFileSync(new URL('../src/components/gallery/Carousel.tsx', import.meta.url), 'utf8')
const transformed = await transformWithOxc(source, 'Carousel.tsx')
const code = transformed.code.replace('export function', 'function').replace(/import \{([^}]+)\} from ([^;]+);/g, (_, names, path) => 'const {' + names.replace(/ as /g, ': ') + '} = require(' + path + ');').replace(/import (\w+) from ([^;]+);/g, 'const $1 = require($2).default;').replace(/export \{[^}]+\};?/g, '') + '\nexports.Carousel = Carousel;'
function setup() {
  const refs = []
  const states = []
  const jsx = (type, props) => ({ type, props })
  const module = { exports: {} }
  const require = (name) => {
    if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx }
    if (name === 'react') return {
      useState: () => [0, (value) => states.push(value)],
      useRef: (value) => { const ref = { current: value }; refs.push(ref); return ref },
      useEffect: () => {},
    }
    if (name === 'lucide-react') return {}
    if (name.endsWith('/asset')) return { asset: (path) => path }
    return { default: {} }
  }
  new Function('require', 'exports', code)(require, module.exports)
  const tree = module.exports.Carousel({ images: Array.from({ length: 3 }, (_, i) => ({ src: `${i}.jpg`, alt: `${i}` })) })
  const nodes = []
  const visit = (node) => { if (Array.isArray(node)) node.forEach(visit); else if (node?.props) { nodes.push(node); visit(node.props.children) } }
  visit(tree)
  const track = { clientWidth: 320, scrollLeft: 0, scrollTo({ left }) { this.scrollLeft = left } }
  refs[0].current = track
  return { nodes, track, states }
}

test('arrows advance repeatedly and wrap without an animation lock', () => {
  const { nodes, track } = setup()
  const next = nodes.find((node) => node.props['aria-label'] === '다음 사진')
  next.props.onClick(); assert.equal(track.scrollLeft, 320)
  next.props.onClick(); assert.equal(track.scrollLeft, 640)
  next.props.onClick(); assert.equal(track.scrollLeft, 0)
  nodes.find((node) => node.props['aria-label'] === '이전 사진').props.onClick()
  assert.equal(track.scrollLeft, 640)
})

test('thumbnail goes directly to its image; touch scrolling updates selection', () => {
  const { nodes, track, states } = setup()
  nodes.find((node) => node.props['aria-label'] === '웨딩 사진 3 보기').props.onClick()
  assert.equal(track.scrollLeft, 640)
  track.scrollLeft = 320
  nodes.find((node) => node.props.onScroll).props.onScroll({ currentTarget: track })
  assert.equal(states.at(-1), 1)
})
