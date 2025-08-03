import './globals.css'

export const metadata = {
  title: 'MCQ Quiz App',
  description: 'A beautiful, responsive MCQ quiz app powered by Gemini',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-blue-100 via-white to-purple-100 min-h-screen font-sans">
        {children}
      </body>
    </html>
  )
}
