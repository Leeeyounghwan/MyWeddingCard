import { Account } from './components/account/Account'
import { Countdown } from './components/countdown/Countdown'
import { Couple } from './components/couple/Couple'
import { Ending } from './components/ending/Ending'
import { Gallery } from './components/gallery/Gallery'
import { Guestbook } from './components/guestbook/Guestbook'
import { Location } from './components/location/Location'
import { Rsvp } from './components/rsvp/Rsvp'
import { WeddingDay } from './components/wedding-day/WeddingDay'
import { features } from './data/wedding'

/**
 * 첫 화면(Hero · Invitation) 이후의 섹션들.
 * 순서를 바꾸고 싶다면 이 파일에서 컴포넌트 순서만 바꾸면 됩니다.
 */
export default function BelowFold() {
  return (
    <>
      <WeddingDay>{features.countdown && <Countdown />}</WeddingDay>
      <Couple />
      <Gallery />
      <Location />
      {features.rsvp && <Rsvp />}
      {features.guestbook && <Guestbook />}
      {features.account && <Account />}
      <Ending />
    </>
  )
}
