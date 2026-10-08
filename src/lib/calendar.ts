import { bride, ceremony, groom, venue } from '../data/wedding'
import { weddingDate, weddingEnd } from './date'

const title = `${groom.firstName}♡${bride.firstName} 결혼식`
const locationText = `${venue.name}${venue.hall ? ` ${venue.hall}` : ''}, ${venue.address}`
const description = `${groom.name} · ${bride.name} 결혼식\n${venue.name}${venue.hall ? ` ${venue.hall}` : ''}`

function compactUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

function escapeIcs(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
}

export function googleCalendarUrl(): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${compactUtc(weddingDate)}/${compactUtc(new Date(weddingEnd))}`,
    details: description,
    location: locationText,
    ctz: 'Asia/Seoul',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function downloadIcs(): void {
  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'PRODID:-//Mobile Wedding Card//KR',
    'BEGIN:VEVENT',
    `UID:${ceremony.dateTime}@mobile-wedding-card`,
    `DTSTAMP:${compactUtc(new Date())}`,
    `DTSTART:${compactUtc(weddingDate)}`,
    `DTEND:${compactUtc(new Date(weddingEnd))}`,
    `SUMMARY:${escapeIcs(title)}`,
    `LOCATION:${escapeIcs(locationText)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const url = URL.createObjectURL(new Blob([body], { type: 'text/calendar;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = 'wedding.ics'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
