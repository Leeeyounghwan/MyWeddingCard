import { Download, RefreshCw, Share2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { bride, groom, meta } from '../../data/wedding'
import { buildCardFontCss } from '../../lib/cardFonts'
import { isInAppBrowser, isIOS, isMobile, isSafari } from '../../lib/platform'
import { canShareFiles, pageUrl } from '../../lib/share'
import { toast } from '../../lib/toast'
import { Button } from '../common/Button'
import { Sheet } from '../common/Sheet'
import { CARD_HEIGHT, CARD_TEXT, CARD_WIDTH, InvitationCard } from './InvitationCard'
import styles from './CardSheet.module.css'

type Status = 'rendering' | 'ready' | 'error'

const FILE_NAME = `wedding-${groom.nameEn}-${bride.nameEn}.png`.replace(/\s+/g, '').toLowerCase()

async function waitForImages(node: HTMLElement) {
  const imgs = Array.from(node.querySelectorAll('img'))
  await Promise.all(
    imgs.map(async (img) => {
      if (!img.complete) {
        await new Promise((resolve) => {
          img.addEventListener('load', resolve, { once: true })
          img.addEventListener('error', resolve, { once: true })
        })
      }
      await img.decode?.().catch(() => undefined)
    }),
  )
}

/**
 * 청첩장 이미지 저장 / 공유
 * - InvitationCard 를 화면 밖에 그린 뒤 html-to-image 로 1080×1920 PNG 생성
 * - 모바일: 공유 시트(사진 앱에 저장 가능) / 데스크톱: 파일 다운로드
 * - 인앱 브라우저 등에서 저장이 막히는 경우를 위해 결과 이미지를 길게 눌러 저장할 수 있게 표시
 */
export default function CardSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<Status>('rendering')
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const generate = useCallback(async () => {
    const node = cardRef.current
    if (!node) return
    setStatus('rendering')
    try {
      await document.fonts?.ready
      await waitForImages(node)
      const [{ toBlob, toPng }, fontEmbedCSS] = await Promise.all([import('html-to-image'), buildCardFontCss(CARD_TEXT)])
      const options = {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        pixelRatio: 3,
        backgroundColor: '#fbfaf6',
        ...(fontEmbedCSS ? { fontEmbedCSS } : { skipFonts: true }),
      }
      // Safari 는 foreignObject 안의 이미지를 첫 렌더에서 빠뜨리는 버그가 있어 한 번 예열합니다.
      if (isIOS || isSafari) await toPng(node, options)
      const blob = await toBlob(node, options)
      if (!blob) throw new Error('Card image render failed')
      const url = URL.createObjectURL(blob)
      setDataUrl(url)
      setFile(new File([blob], FILE_NAME, { type: 'image/png' }))
      setStatus('ready')
    } catch (e) {
      console.error(e)
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    if (open && !dataUrl) void generate()
  }, [open, dataUrl, generate])

  useEffect(() => {
    return () => {
      if (dataUrl) URL.revokeObjectURL(dataUrl)
    }
  }, [dataUrl])

  const download = () => {
    if (!file || !dataUrl) return
    // 모바일은 공유 시트의 '이미지 저장'이 사진 앱에 바로 저장되어 가장 확실합니다.
    if (isMobile && !isInAppBrowser && canShareFiles(file)) {
      navigator.share({ files: [file] }).catch(() => undefined)
      return
    }
    const a = document.createElement('a')
    a.href = URL.createObjectURL(file)
    a.download = FILE_NAME
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.setTimeout(() => URL.revokeObjectURL(a.href), 4000)
    if (isInAppBrowser) toast('저장이 되지 않으면 이미지를 길게 눌러 저장해 주세요.', 3200)
  }

  const share = () => {
    if (!file) return
    if (canShareFiles(file)) {
      navigator.share({ files: [file], title: meta.title, text: `${meta.title}\n${pageUrl()}` }).catch(() => undefined)
    } else {
      toast('이 브라우저는 이미지 공유를 지원하지 않아요. 저장 후 공유해 주세요.', 3000)
    }
  }

  const shareSupported = file ? canShareFiles(file) : false

  return (
    <>
      <Sheet open={open} onClose={onClose} eyebrow="Save the Date" title="청첩장 이미지 저장">
        <div className={styles.preview} aria-busy={status === 'rendering'}>
          {status === 'ready' && dataUrl ? (
            <img
              src={dataUrl}
              alt={`${groom.name} ${bride.name} 청첩장 이미지`}
              className={styles.result}
              data-allow-save
            />
          ) : (
            <div className={styles.placeholder}>
              {status === 'error' ? (
                <>
                  <p>이미지를 만들지 못했어요.</p>
                  <Button size="sm" variant="ghost" icon={<RefreshCw size={14} aria-hidden="true" />} onClick={generate}>
                    다시 시도
                  </Button>
                </>
              ) : (
                <p className={styles.loading}>청첩장 이미지를 만들고 있어요…</p>
              )}
            </div>
          )}
        </div>

        <p className={styles.hint}>저장이 되지 않으면 이미지를 길게 눌러 저장해 주세요.</p>

        <div className={styles.buttons}>
          <Button
            variant="primary"
            block
            disabled={status !== 'ready'}
            icon={<Download size={15} strokeWidth={1.5} aria-hidden="true" />}
            onClick={download}
          >
            이미지 저장
          </Button>
          {shareSupported && (
            <Button
              variant="outline"
              block
              disabled={status !== 'ready'}
              icon={<Share2 size={15} strokeWidth={1.5} aria-hidden="true" />}
              onClick={share}
            >
              공유하기
            </Button>
          )}
        </div>
      </Sheet>

      {/* 캡처용 원본 — 화면 밖에 렌더링 */}
      {open &&
        !dataUrl &&
        createPortal(
          <div className={styles.offscreen} aria-hidden="true">
            <InvitationCard ref={cardRef} />
          </div>,
          document.body,
        )}
    </>
  )
}
