import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { mockUsers } from '@/lib/mockData';
import { 
  Users, 
  Plus, 
  Search, 
  MoreVertical,
  Shield,
  Wrench,
  Eye,
  Phone,
  MapPin,
  Edit,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from 'react';

const roleIcons = {
  admin: Shield,
  ta: Wrench,
  viewer: Eye,
};

const roleLabels = {
  admin: 'Admin',
  ta: 'Teknisi',
  viewer: 'Viewer',
};

const roleColors = {
  admin: 'bg-blue-100 text-blue-700 border-blue-200',
  ta: 'bg-amber-100 text-amber-700 border-amber-200',
  viewer: 'bg-gray-100 text-gray-700 border-gray-200',
};

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.area?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const usersByRole = {
    admin: filteredUsers.filter(u => u.role === 'admin'),
    ta: filteredUsers.filter(u => u.role === 'ta'),
    viewer: filteredUsers.filter(u => u.role === 'viewer'),
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Pengguna</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Kelola admin, teknisi, dan guest
            </p>
          </div>
          <Button className="gap-2 self-start">
            <Plus className="w-4 h-4" />
            Tambah Pengguna
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, role, atau area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(usersByRole).map(([role, users]) => {
            const Icon = roleIcons[role as keyof typeof roleIcons];
            return (
              <Card key={role} className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    role === 'admin' ? 'bg-blue-100' : 
                    role === 'ta' ? 'bg-amber-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      role === 'admin' ? 'text-blue-600' : 
                      role === 'ta' ? 'text-amber-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{users.length}</p>
                    <p className="text-xs text-muted-foreground">
                      {roleLabels[role as keyof typeof roleLabels]}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* User List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daftar Pengguna</CardTitle>
            <CardDescription>
              {filteredUsers.length} pengguna ditemukan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredUsers.map(user => {
                const Icon = roleIcons[user.role];
                return (
                  <div 
                    key={user.id} 
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center text-lg font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.name}</p>
                          <Badge 
                            variant="outline" 
                            className={`gap-1 ${roleColors[user.role]}`}
                          >
                            <Icon className="w-3 h-3" />
                            {roleLabels[user.role]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          {user.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {user.phone}
                            </span>
                          )}
                          {user.area && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {user.area}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Tidak ada pengguna ditemukan</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default UserManagement;
