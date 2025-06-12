import * as React from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import {
  IconCalculator,
  IconDashboard,
  IconFileInvoice,
  IconInnerShadowTop,
  IconSettings,
  IconShoppingCart,
  IconUsers,
  IconLogout,
  IconPercentage,
  IconCreditCard,
  IconMapPin
} from "@tabler/icons-react"
import { Moon, Sun } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/components/theme-provider"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { useEffect } from "react"
import { getUserProfile } from "@/features/settings/settingsSlice"
import { logout } from "@/features/auth/authSlice"

// Remove Sign Out from regular nav items since we'll handle it separately
const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconDashboard,
  },
  {
    title: "Quotations",
    url: "/quotations",
    icon: IconCalculator,
  },
  {
    title: "Orders",
    url: "/orders",
    icon: IconShoppingCart,
  },
  {
    title: "Invoices",
    url: "/invoices",
    icon: IconFileInvoice,
  },
  {
    title: "Customers",
    url: "/customers",
    icon: IconUsers,
  },
  {
    title: "Business Addresses",
    url: "/business-addresses",
    icon: IconMapPin,
  },
  {
    title: "Products",
    url: "/products",
    icon: IconShoppingCart,
  },
  {
    title: "Tax Codes",
    url: "/tax",
    icon: IconPercentage,
  },
  {
    title: "Payment Types",
    url: "/payment-types",
    icon: IconCreditCard,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: IconSettings,
  }
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const { userProfile } = useSelector((state: RootState) => state.settings);
  //console.log(userProfile)

  // Fetch user profile on component mount
  useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);
  
  // Use profile from settings if available, otherwise fall back to auth user
  const profile = userProfile;
  
  // Create user data for sidebar
  const userData = React.useMemo(() => {
    if (!profile) {
      return {
        name: "Guest",
        email: "guest@example.com",
        avatar: "https://ui-avatars.com/api/?name=Guest&background=random"
      };
    }
    
    // Extract name from email (text before @)
    const name = profile.email.split('@')[0];
    
    return {
      name,
      email: profile.email,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    };
  }, [profile]);

  // Handle sign out
  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(logout());
    navigate('/auth');
  };

  // Handle night mode toggle
  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Sidebar collapsible="offcanvas" className="bg-gradient-sidebar" {...props}>
      <SidebarHeader className="border-b border-sidebar-border/50 bg-sidebar/80 backdrop-blur-sm">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-3 hover:bg-sidebar-accent/50"
            >
              <a href="#" className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
                  <IconInnerShadowTop className="!size-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-semibold text-sidebar-foreground">
                    {profile?.businessName || "Your Business"}
                  </span>
                  <span className="text-xs text-sidebar-foreground/60">
                    Invoice System
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <div className="py-2">
          <NavMain items={navItems} />
        </div>
        
        {/* Settings Section */}
        <div className="mt-auto py-2 space-y-2">
          {/* Night Mode Toggle */}
          <div className="px-2 py-2 bg-sidebar-accent/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-md">
                  {theme === "dark" ? (
                    <Moon className="!size-3 text-primary" />
                  ) : (
                    <Sun className="!size-3 text-primary" />
                  )}
                </div>
                <span className="text-sm font-medium text-sidebar-foreground">Night Mode</span>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={handleThemeToggle}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>
          
          {/* Sign Out Button */}
          <SidebarMenuButton 
            onClick={handleSignOut} 
            className="cursor-pointer w-full justify-start px-2 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive hover:text-destructive rounded-lg"
          >
            <div className="flex items-center justify-center w-6 h-6 bg-destructive/10 rounded-md mr-3">
              <IconLogout className="!size-3" />
            </div>
            <span className="font-medium">Sign Out</span>
          </SidebarMenuButton>
        </div>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/50 p-2">
        <div className="bg-sidebar-accent/30 rounded-lg p-1">
          <NavUser user={userData} />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
