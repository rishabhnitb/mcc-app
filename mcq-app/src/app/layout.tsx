import './globals.css'
import { AuthProvider } from '@/lib/contexts/AuthContext'
import ClientWrapper from '@/components/ClientWrapper'

export const metadata = {
  title: 'MCQ Quiz App',
  description: 'A beautiful, responsive MCQ quiz app powered by Gemini',
  icons: {
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gradient-to-br from-blue-100 via-white to-purple-100 min-h-screen font-sans" suppressHydrationWarning>
        <AuthProvider>
          <ClientWrapper>
            {children}
          </ClientWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}
