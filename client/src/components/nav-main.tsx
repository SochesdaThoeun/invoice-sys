import { type Icon } from "@tabler/icons-react"
import { useLocation, useNavigate } from "react-router-dom"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  const location = useLocation()
  const navigate = useNavigate()
  
  return (
    <SidebarGroup>
      <SidebarGroupContent className="space-y-1">
        <SidebarMenu>
          {items.map((item) => {
            const isActive = location.pathname === item.url || 
                            (item.url !== "/" && location.pathname.startsWith(item.url));
            
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  onClick={() => navigate(item.url)}
                  tooltip={item.title}
                  isActive={isActive}
                  className={`
                    cursor-pointer px-2 py-2 rounded-lg transition-all duration-200
                    hover:bg-sidebar-accent/50 flex items-center gap-3
                    ${isActive 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-sidebar-foreground hover:text-sidebar-foreground'
                    }
                  `}
                >
                  {item.icon && (
                    <div className={`flex items-center justify-center w-6 h-6 rounded-md ${
                      isActive ? 'bg-primary/10' : 'bg-sidebar-foreground/5'
                    }`}>
                      <item.icon className={`!size-3 ${isActive ? 'text-primary' : 'text-sidebar-foreground/70'}`} />
                    </div>
                  )}
                  <span className="font-medium">{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
