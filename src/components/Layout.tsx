import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Ticket, 
  FileUp, 
  BarChart3, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  ChevronDown,
  Wrench
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { mockNotifications } from '@/lib/mockData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children: React.ReactNode;
}

const adminNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tickets', label: 'Semua Tiket', icon: Ticket },
  { path: '/reports', label: 'Laporan', icon: BarChart3 },
  { path: '/users', label: 'Pengguna', icon: Users },
  { path: '/teknisi', label: 'Teknisi', icon: Wrench },
  { path: '/settings', label: 'Pengaturan', icon: Settings },
];

const hdNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tickets', label: 'Semua Tiket', icon: Ticket },
  { path: '/import', label: 'Import Tiket', icon: FileUp },
  { path: '/reports', label: 'Laporan', icon: BarChart3 },
  { path: '/users', label: 'Pengguna', icon: Users },
  { path: '/teknisi', label: 'Teknisi', icon: Wrench },
];

const guestNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tickets', label: 'Semua Tiket', icon: Ticket },
  { path: '/reports', label: 'Laporan', icon: BarChart3 },
  { path: '/users', label: 'Pengguna', icon: Users },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = user?.role === 'admin' ? adminNavItems : 
                   user?.role === 'hd' ? hdNavItems :
                   user?.role === 'guest' ? guestNavItems : [];

  const unreadNotifications = mockNotifications.filter(n => !n.isRead && n.userId === user?.id).length;

  return (
    <div className="min-h-screen bg-slate-200">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo & Mobile Menu Toggle */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <Link to="/dashboard" className="flex items-center gap-2">
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  className="w-8 h-8 object-contain" 
                />
                <span className="font-bold text-lg hidden sm:block">SiTiket</span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      size="sm"
                      className={`gap-2 ${isActive ? 'bg-secondary' : ''}`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadNotifications}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {mockNotifications.slice(0, 5).map((notif) => (
                    <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1 py-2">
                      <span className={`text-sm ${!notif.isRead ? 'font-medium' : ''}`}>
                        {notif.title}
                      </span>
                      <span className="text-xs text-muted-foreground">{notif.message}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="w-7 h-7 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-semibold">
                      {user?.name.charAt(0)}
                    </div>
                    <span className="hidden sm:block max-w-[100px] truncate">{user?.name}</span>
                    <ChevronDown className="w-4 h-4 hidden sm:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user?.name}</span>
                      <span className="text-xs font-normal text-muted-foreground capitalize">{user?.role}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <nav className="fixed left-0 top-14 bottom-0 w-64 bg-card border-r border-border p-4 animate-slide-in-right">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link 
                    key={item.path} 
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={`w-full justify-start gap-3 ${isActive ? 'bg-secondary' : ''}`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 md:py-6">
        {children}
      </main>
    </div>
  );
};
