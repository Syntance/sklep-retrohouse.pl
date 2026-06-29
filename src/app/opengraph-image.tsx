import { ImageResponse } from 'next/og'

export const alt = 'RetroHouse — antyki i vintage z Wiednia'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #D9C9B6 0%, #F5EFE6 45%, #FFFFFF 100%)',
          color: '#2D1810',
          padding: '0 80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#A84424',
            marginBottom: 24,
          }}
        >
          RetroHouse
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.1,
            maxWidth: 900,
          }}
        >
          Antyki z prawdziwą historią — prosto z Wiednia
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 28,
            fontSize: 28,
            lineHeight: 1.4,
            color: '#5C4A3A',
            maxWidth: 820,
          }}
        >
          Sklep w Nowym Targu · wysyłka w całej Polsce
        </div>
      </div>
    ),
    { ...size },
  )
}
