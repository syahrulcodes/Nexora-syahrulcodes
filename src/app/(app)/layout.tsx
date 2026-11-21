import { Sidebar } from "@/components/layout/Sidebar"
import { TopNav } from "@/components/layout/TopNav"
import { AppWrapper } from "@/components/layout/AppWrapper"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppWrapper>
      <Sidebar />
      <div className="flex flex-col min-h-screen">
        <TopNav />
        <main
          className="flex-1 pt-14 transition-all duration-300 ease-in-out"
          id="main-content"
        >
          {children}
        </main>
      </div>
    </AppWrapper>
  )
}
