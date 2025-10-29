import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { AppSidebar } from './AppSidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { NotificationContainer } from '@/components/ui/Notification'
import { usePermission } from '@/hooks/usePermission'
import { Separator } from '@/components/ui/Separator'

export function MainLayout() {
  // 初始化权限数据
  usePermission()
  
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <div className="flex flex-1 items-center justify-between">
            <Header />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
        <NotificationContainer />
      </SidebarInset>
    </SidebarProvider>
  )
}
