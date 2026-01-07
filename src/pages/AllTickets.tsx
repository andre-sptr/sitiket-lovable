import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { TicketCard } from '@/components/TicketCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockTickets } from '@/lib/mockData';
import { generateWhatsAppMessage, getStatusLabel } from '@/lib/formatters';
import { Ticket, TicketStatus } from '@/types/ticket';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const statusOptions: TicketStatus[] = [
  'OPEN',
  'ASSIGNED',
  'ONPROGRESS',
  'TEMPORARY',
  'WAITING_MATERIAL',
  'WAITING_ACCESS',
  'WAITING_COORDINATION',
  'CLOSED',
];

const AllTickets = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [complianceFilter, setComplianceFilter] = useState<string>('ALL');

  const filteredTickets = mockTickets.filter(ticket => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      ticket.incNumbers.some(inc => inc.toLowerCase().includes(searchLower)) ||
      ticket.siteCode.toLowerCase().includes(searchLower) ||
      ticket.siteName.toLowerCase().includes(searchLower) ||
      ticket.lokasiText.toLowerCase().includes(searchLower);

    // Status filter
    const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;

    // Compliance filter
    const matchesCompliance = complianceFilter === 'ALL' || ticket.ttrCompliance === complianceFilter;

    return matchesSearch && matchesStatus && matchesCompliance;
  });

  // Sort: overdue first, then by remaining TTR
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (a.status === 'CLOSED' && b.status !== 'CLOSED') return 1;
    if (a.status !== 'CLOSED' && b.status === 'CLOSED') return -1;
    return a.sisaTtrHours - b.sisaTtrHours;
  });

  const handleCopyWhatsApp = (ticket: Ticket) => {
    const message = generateWhatsAppMessage('share', ticket);
    navigator.clipboard.writeText(message);
    toast({
      title: "Pesan WhatsApp Disalin",
      description: `Pesan untuk ${ticket.siteCode} sudah disalin ke clipboard`,
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setComplianceFilter('ALL');
  };

  const activeFiltersCount = 
    (statusFilter !== 'ALL' ? 1 : 0) + 
    (complianceFilter !== 'ALL' ? 1 : 0);

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Semua Tiket</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {filteredTickets.length} dari {mockTickets.length} tiket
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari INC, site code, nama site..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery('')}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Desktop Filters */}
          <div className="hidden md:flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status</SelectItem>
                {statusOptions.map(status => (
                  <SelectItem key={status} value={status}>
                    {getStatusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={complianceFilter} onValueChange={setComplianceFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Compliance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua</SelectItem>
                <SelectItem value="COMPLY">Comply</SelectItem>
                <SelectItem value="NOT COMPLY">Not Comply</SelectItem>
              </SelectContent>
            </Select>

            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Reset
              </Button>
            )}
          </div>

          {/* Mobile Filter Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filter
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto">
              <SheetHeader>
                <SheetTitle>Filter Tiket</SheetTitle>
                <SheetDescription>
                  Pilih filter untuk menyaring tiket
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Semua Status</SelectItem>
                      {statusOptions.map(status => (
                        <SelectItem key={status} value={status}>
                          {getStatusLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Compliance</label>
                  <Select value={complianceFilter} onValueChange={setComplianceFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Compliance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Semua</SelectItem>
                      <SelectItem value="COMPLY">Comply</SelectItem>
                      <SelectItem value="NOT COMPLY">Not Comply</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={clearFilters}>
                    Reset
                  </Button>
                  <SheetTrigger asChild>
                    <Button className="flex-1">Terapkan</Button>
                  </SheetTrigger>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 md:hidden">
            {statusFilter !== 'ALL' && (
              <Badge variant="secondary" className="gap-1">
                Status: {getStatusLabel(statusFilter as TicketStatus)}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => setStatusFilter('ALL')}
                />
              </Badge>
            )}
            {complianceFilter !== 'ALL' && (
              <Badge variant="secondary" className="gap-1">
                {complianceFilter}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => setComplianceFilter('ALL')}
                />
              </Badge>
            )}
          </div>
        )}

        {/* Ticket List */}
        <div className="space-y-3">
          {sortedTickets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Filter className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Tidak ada tiket yang sesuai filter</p>
              <Button variant="link" onClick={clearFilters}>
                Reset filter
              </Button>
            </div>
          ) : (
            sortedTickets.map((ticket, index) => (
              <div 
                key={ticket.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <TicketCard 
                  ticket={ticket} 
                  onCopyWhatsApp={handleCopyWhatsApp}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AllTickets;
