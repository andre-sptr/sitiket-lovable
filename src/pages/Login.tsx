import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole } from '@/types/ticket';
import { Ticket, Shield, Eye, Headphones, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const roleCards = [
  {
    role: 'admin' as UserRole,
    title: 'Admin',
    description: 'Kelola tiket & monitor SLA',
    icon: Shield,
    gradient: 'from-primary to-primary/70',
    redirect: '/dashboard',
  },
  {
    role: 'hd' as UserRole,
    title: 'Help Desk',
    description: 'Input tiket, monitoring & dispatch',
    icon: Headphones,
    gradient: 'from-violet-500 to-purple-600', 
    redirect: '/dashboard',
  },
  {
    role: 'guest' as UserRole,
    title: 'Guest',
    description: 'Monitoring dashboard (read-only)',
    icon: Eye,
    gradient: 'from-emerald-500 to-teal-600',
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
    <div className="dark min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl opacity-50" />
      
      <div className="relative w-full max-w-4xl animate-fade-in">
        <div className="text-center mb-10 md:mb-14">
          <img 
            src="/logo.png" 
            alt="SiTiket Logo" 
            className="w-16 h-16 md:w-20 md:h-20 mb-5 object-contain mx-auto" 
          />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">SiTiket</h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
            Demo/Prototipe Sistem Manajemen Tiket Gangguan
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 md:gap-5">
          {roleCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card 
                key={card.role} 
                className="w-full md:w-[calc(33.333%-1rem)] min-w-[280px] max-w-[320px] border-border/50 hover:border-primary/30 bg-card/80 backdrop-blur-sm transition-all duration-300 cursor-pointer group hover:shadow-lg hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleLogin(card.role, card.redirect)}
              >
                <CardHeader className="text-center pb-3">
                  <div className={`mx-auto w-14 h-14 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-foreground text-lg font-semibold">{card.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center pb-6">
                  <CardDescription className="text-muted-foreground text-sm mb-5">
                    {card.description}
                  </CardDescription>
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300"
                  >
                    Masuk
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
