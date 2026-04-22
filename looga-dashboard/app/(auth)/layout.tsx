export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            looga
          </h1>
          <p className="text-base-content/60 text-sm mt-1">Dashboard Organisateur</p>
        </div>
        {children}
      </div>
    </div>
  )
}
