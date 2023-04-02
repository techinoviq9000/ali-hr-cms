import './globals.css'

export const metadata = {
  title: 'Attendance System',
  description: 'HR Attendance System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
