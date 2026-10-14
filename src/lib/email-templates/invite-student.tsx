import React from 'react'
import { Body, Button, Container, Head, Heading, Html, Img, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  registerUrl?: string
  courseName?: string
}

const Email = ({ registerUrl, courseName }: Props) => (
  <Html lang="ro" dir="ltr">
    <Head />
    <Preview>Ai acces la platforma Arhitectura Afacerii — creează-ți contul</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src="https://aa.morarvictor.com/logo-email.png" alt="Arhitectura Afacerii" width="56" height="56" style={logoImg} />
        <Text style={logo}>ARHITECTURA AFACERII</Text>
        <Heading style={heading}>Bine ai venit!</Heading>
        <Text style={text}>
          Ai primit acces la programul <strong>{courseName || 'Arhitectura Afacerii'}</strong>.
          Pentru a intra pe platformă, trebuie mai întâi să îți creezi contul — durează mai puțin de un minut.
        </Text>
        <Button style={button} href={registerUrl || 'https://aa.morarvictor.com/register'}>
          Creează contul
        </Button>
        <Text style={small}>
          Important: folosește exact această adresă de email la înregistrare — accesul tău e legat de ea.
        </Text>
        <Text style={small}>
          Dacă butonul nu funcționează, copiază acest link în browser:{' '}
          {registerUrl || 'https://aa.morarvictor.com/register'}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Invitație: acces la platforma Arhitectura Afacerii',
  displayName: 'Invitație elev nou',
  previewData: { registerUrl: 'https://aa.morarvictor.com/register', courseName: 'Arhitectura Afacerii' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const logoImg = { borderRadius: '12px', marginBottom: '12px' }
const logo = { fontSize: '12px', letterSpacing: '3px', color: '#1A5C38', fontWeight: 'bold' as const, marginBottom: '24px' }
const heading = { fontSize: '24px', color: '#0D0907', margin: '0 0 16px' }
const text = { fontSize: '15px', lineHeight: '1.6', color: '#333333', margin: '0 0 24px' }
const button = {
  backgroundColor: '#1A5C38',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  padding: '14px 28px',
  borderRadius: '10px',
  textDecoration: 'none',
  display: 'inline-block',
  marginBottom: '24px',
}
const small = { fontSize: '13px', lineHeight: '1.6', color: '#666666', margin: '0 0 12px' }
