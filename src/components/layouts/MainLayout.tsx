import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { NotificationContainer } from '@/components/ui/Notification'
import { usePermission } from '@/hooks'
import { PermissionDebugger } from '@/components/PermissionDebugger'

export function MainLayout() {
  // 初始化权限数据
  usePermission()
  
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
      <NotificationContainer />
      
      {/* 开发环境下的权限调试组件 <PermissionTester />*/}
      <PermissionDebugger />
    </div>
  )
}
