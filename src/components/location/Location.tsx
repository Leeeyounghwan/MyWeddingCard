import { Copy, Phone } from 'lucide-react'
import { Suspense, useCallback, useState } from 'react'
import { venue } from '../../data/wedding'
import { transportation } from '../../data/transportation'
import { getCurrentPosition, openKakaoMap, openNaverMap, openTmap } from '../../lib/map'
import { copyText } from '../../lib/share'
import { Reveal } from '../common/Reveal'
import { Section } from '../common/Section'
import { MapView } from './map/MapProvider'
import { StaticMap } from './StaticMap'
import { Transportation } from './Transportation'
import styles from './Location.module.css'

function MapAppIcon({ app }: { app: 'naver' | 'kakao' | 'tmap' }) {
  return <span className={styles.appIcon} data-app={app} aria-hidden="true" />
}

type MapApp = 'naver' | 'kakao' | 'tmap'

export function Location() {
  const [mapFailed, setMapFailed] = useState(false)
  const onMapError = useCallback(() => setMapFailed(true), [])
  const openRoute = useCallback(async (app: MapApp) => {
    const result = await getCurrentPosition()
    const from = result.ok ? result.position : null

    if (app === 'naver') openNaverMap(from)
    else if (app === 'kakao') openKakaoMap(from)
    else openTmap(from)
  }, [])

  return (
    <Section id="location" eyebrow="Location" title="오시는 길" className={styles.section}>
      <Reveal className={styles.venue}>
        <h3 className={styles.name}>{venue.name}</h3>
        {venue.hall && <p className={styles.hall}>{venue.hall}</p>}
        <p className={styles.address}>
          {venue.address}
          <button
            type="button"
            className={styles.copy}
            onClick={() => copyText(venue.address, '주소가 복사되었습니다')}
            aria-label="주소 복사"
          >
            <Copy size={14} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </p>
        {venue.addressDetail && <p className={styles.detail}>{venue.addressDetail}</p>}
        {venue.tel && (
          <a className={styles.tel} href={`tel:${venue.tel.replace(/[^0-9]/g, '')}`}>
            <Phone size={13} strokeWidth={1.5} aria-hidden="true" /> {venue.tel}
          </a>
        )}
      </Reveal>

      <Reveal className={styles.mapFrame} delay={0.1}>
        <div className={styles.map}>
          {MapView && !mapFailed ? (
            <Suspense fallback={<StaticMap />}>
              <MapView lat={venue.lat} lng={venue.lng} title={venue.name} address={venue.address} onError={onMapError} />
            </Suspense>
          ) : (
            <StaticMap />
          )}
        </div>
      </Reveal>

      <Reveal className={styles.apps} delay={0.15}>
        <div className={styles.appsHead}>
          <span>지도 앱 길찾기</span>
          <small>현재 위치에서 예식장까지</small>
        </div>
        <div className={styles.appGrid}>
          <button type="button" className={styles.app} onClick={() => void openRoute('naver')}>
            <MapAppIcon app="naver" />
            <span className={styles.appText}>
              <strong>네이버지도</strong>
              <small>길찾기</small>
            </span>
          </button>
          <button type="button" className={styles.app} onClick={() => void openRoute('kakao')}>
            <MapAppIcon app="kakao" />
            <span className={styles.appText}>
              <strong>카카오맵</strong>
              <small>길찾기</small>
            </span>
          </button>
          <button type="button" className={styles.app} onClick={() => void openRoute('tmap')}>
            <MapAppIcon app="tmap" />
            <span className={styles.appText}>
              <strong>티맵</strong>
              <small>길찾기</small>
            </span>
          </button>
        </div>
      </Reveal>

      {transportation.length > 0 && <Transportation items={transportation} />}
    </Section>
  )
}
