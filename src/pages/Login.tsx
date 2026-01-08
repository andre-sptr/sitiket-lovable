import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole } from '@/types/ticket';
import { Ticket, Shield, Wrench, Eye, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const roleCards = [
  {
    role: 'admin' as UserRole,
    title: 'Admin',
    description: 'Kelola tiket & monitor SLA',
    icon: Shield,
    color: 'from-blue-600 to-blue-700',
    redirect: '/dashboard',
  },
  {
    role: 'hd' as UserRole,
    title: 'Help Desk (HD)',
    description: 'Input tiket, monitoring & dispatch',
    icon: Headphones,
    color: 'from-purple-500 to-purple-600', 
    redirect: '/dashboard',
  },
  {
    role: 'guest' as UserRole,
    title: 'Guest',
    description: 'Monitoring dashboard (read-only)',
    icon: Eye,
    color: 'from-emerald-500 to-emerald-600',
    redirect: '/dashboard',
  },
];

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = (role: UserRole, redirect: string) => {
    login(role);
    navigate(redirect);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnptMCAyMGMtNC40MTggMC04LTMuNTgyLTgtOHMzLjU4Mi04IDgtOCA4IDMuNTgyIDggOC0zLjU4MiA4LTggOHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAyIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
      
      <div className="relative w-full max-w-4xl animate-fade-in">
        {/* Logo & Title */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary to-primary/70 rounded-2xl mb-4 shadow-glow">
            <Ticket className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">SiTiket</h1>
          <p className="text-slate-400 text-sm md:text-base">
            Demo/Prototipe Sistem Manajemen Tiket Gangguan Telkom Infra
          </p>
        </div>

        {/* Role Selection */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {roleCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card 
                key={card.role} 
                hover
                className="w-full md:w-[30%] min-w-[280px] bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleLogin(card.role, card.redirect)}
              >
                <CardHeader className="text-center pb-2">
                  <div className={`mx-auto w-14 h-14 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-white text-lg">{card.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-slate-400 text-sm">
                    {card.description}
                  </CardDescription>
                  <Button 
                    variant="outline" 
                    className="mt-4 w-full bg-transparent border-white/20 text-white hover:bg-white/20 hover:text-white"
                  >
                    Masuk sebagai {card.title}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Login;
