import { Copy, LocateFixed, MapPin, Phone } from 'lucide-react'
import { lazy, Suspense, useCallback, useState } from 'react'
import { venue } from '../../data/wedding'
import { transportation } from '../../data/transportation'
import { useDisclosure } from '../../hooks/useDisclosure'
import { openKakaoMap, openNaverMap, openTmap } from '../../lib/map'
import { copyText } from '../../lib/share'
import { Button } from '../common/Button'
import { Reveal } from '../common/Reveal'
import { Section } from '../common/Section'
import { MapView } from './map/MapProvider'
import { StaticMap } from './StaticMap'
import { Transportation } from './Transportation'
import styles from './Location.module.css'

const DirectionsSheet = lazy(() => import('./DirectionsSheet'))

function MapAppIcon({ app }: { app: 'naver' | 'kakao' | 'tmap' }) {
  return <span className={styles.appIcon} data-app={app} aria-hidden="true" />
}

export function Location() {
  const [mapFailed, setMapFailed] = useState(false)
  const onMapError = useCallback(() => setMapFailed(true), [])
  const directions = useDisclosure()

  return (
    <Section id="location" eyebrow="Location" title="오시는 길">
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
        <button type="button" className={styles.app} onClick={() => openNaverMap()}>
          <MapAppIcon app="naver" />
          네이버지도
        </button>
        <button type="button" className={styles.app} onClick={() => openKakaoMap()}>
          <MapAppIcon app="kakao" />
          카카오맵
        </button>
        <button type="button" className={styles.app} onClick={() => openTmap()}>
          <MapAppIcon app="tmap" />
          티맵
        </button>
      </Reveal>

      <Reveal className={styles.route} delay={0.2}>
        <Button
          variant="primary"
          block
          icon={<LocateFixed size={16} strokeWidth={1.5} aria-hidden="true" />}
          onClick={directions.show}
          aria-haspopup="dialog"
        >
          현재 위치에서 길찾기
        </Button>
        <p className={styles.routeHint}>
          <MapPin size={12} strokeWidth={1.5} aria-hidden="true" /> 위치 권한을 허용하지 않아도 이용할 수 있어요
        </p>
      </Reveal>

      {transportation.length > 0 && <Transportation items={transportation} />}

      {directions.mounted && (
        <Suspense fallback={null}>
          <DirectionsSheet open={directions.open} onClose={directions.hide} />
        </Suspense>
      )}
    </Section>
  )
}
