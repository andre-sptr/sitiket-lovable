import { useState, useEffect, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { TicketCard } from '@/components/TicketCard';
import { TicketCardSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useAuth } from '@/contexts/AuthContext';
import { getTicketsAssignedTo } from '@/lib/mockData';
import { generateWhatsAppMessage, getStatusLabel } from '@/lib/formatters';
import { Ticket, TicketStatus } from '@/types/ticket';
import { 
  Ticket as TicketIcon, 
  RefreshCw, 
  AlertTriangle, 
  Clock, 
  Search, 
  X, 
  SlidersHorizontal,
  Calendar as CalendarIcon,
  RotateCcw,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, isWithinInterval, startOfDay, endOfDay, subDays } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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

// Extract unique values from tickets for filter options
const getUniqueValues = (tickets: Ticket[], key: keyof Ticket): string[] => {
  const values = tickets.map(t => t[key]).filter(Boolean) as string[];
  return [...new Set(values)].sort();
};

const MyTickets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  const myTickets = user ? getTicketsAssignedTo(user.id) : [];

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [complianceFilter, setComplianceFilter] = useState<string>('ALL');
  const [kategoriFilter, setKategoriFilter] = useState<string>('ALL');
  const [jarakFilter, setJarakFilter] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [sortBy, setSortBy] = useState<string>('ttr');

  // Extract unique filter options from data
  const filterOptions = useMemo(() => ({
    kategoris: getUniqueValues(myTickets, 'kategori'),
    jaraks: getUniqueValues(myTickets, 'jarakKmRange'),
  }), [myTickets]);

  // Simulate initial data loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredTickets = useMemo(() => {
    return myTickets.filter(ticket => {
      // Search filter - comprehensive search across multiple fields
      const searchLower = searchQuery.toLowerCase().trim();
      const matchesSearch = !searchLower || 
        ticket.incNumbers.some(inc => inc.toLowerCase().includes(searchLower)) ||
        ticket.siteCode.toLowerCase().includes(searchLower) ||
        ticket.siteName.toLowerCase().includes(searchLower) ||
        ticket.lokasiText.toLowerCase().includes(searchLower) ||
        ticket.kategori?.toLowerCase().includes(searchLower) ||
        ticket.networkElement?.toLowerCase().includes(searchLower) ||
        ticket.penyebab?.toLowerCase().includes(searchLower) ||
        ticket.incGamas?.toLowerCase().includes(searchLower) ||
        ticket.kjd?.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;

      // Compliance filter
      const matchesCompliance = complianceFilter === 'ALL' || ticket.ttrCompliance === complianceFilter;

      // Kategori filter
      const matchesKategori = kategoriFilter === 'ALL' || ticket.kategori === kategoriFilter;

      // Jarak filter
      const matchesJarak = jarakFilter === 'ALL' || ticket.jarakKmRange === jarakFilter;

      // Date range filter
      let matchesDateRange = true;
      if (dateRange.from && dateRange.to) {
        const ticketDate = new Date(ticket.jamOpen);
        matchesDateRange = isWithinInterval(ticketDate, {
          start: startOfDay(dateRange.from),
          end: endOfDay(dateRange.to),
        });
      } else if (dateRange.from) {
        matchesDateRange = new Date(ticket.jamOpen) >= startOfDay(dateRange.from);
      } else if (dateRange.to) {
        matchesDateRange = new Date(ticket.jamOpen) <= endOfDay(dateRange.to);
      }

      return matchesSearch && matchesStatus && matchesCompliance && 
             matchesKategori && matchesJarak && matchesDateRange;
    });
  }, [myTickets, searchQuery, statusFilter, complianceFilter, kategoriFilter, jarakFilter, dateRange]);

  // Sort tickets based on selected criteria
  const sortedTickets = useMemo(() => {
    return [...filteredTickets].sort((a, b) => {
      switch (sortBy) {
        case 'ttr':
          // Closed tickets last, then by remaining TTR
          if (a.status === 'CLOSED' && b.status !== 'CLOSED') return 1;
          if (a.status !== 'CLOSED' && b.status === 'CLOSED') return -1;
          return a.sisaTtrHours - b.sisaTtrHours;
        case 'newest':
          return new Date(b.jamOpen).getTime() - new Date(a.jamOpen).getTime();
        case 'oldest':
          return new Date(a.jamOpen).getTime() - new Date(b.jamOpen).getTime();
        case 'site':
          return a.siteCode.localeCompare(b.siteCode);
        default:
          return 0;
      }
    });
  }, [filteredTickets, sortBy]);

  const overdueTickets = myTickets.filter(t => t.sisaTtrHours < 0 && t.status !== 'CLOSED');
  const dueSoonTickets = myTickets.filter(t => t.sisaTtrHours > 0 && t.sisaTtrHours <= 2 && t.status !== 'CLOSED');
  const activeTickets = myTickets.filter(t => t.status !== 'CLOSED');

  const handleCopyWhatsApp = (ticket: Ticket) => {
    const message = generateWhatsAppMessage('update', ticket);
    navigator.clipboard.writeText(message);
    toast({
      title: "Template Disalin",
      description: "Template update progress sudah disalin ke clipboard",
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setComplianceFilter('ALL');
    setKategoriFilter('ALL');
    setJarakFilter('ALL');
    setDateRange({ from: undefined, to: undefined });
    setSortBy('ttr');
  };

  const handlePresetRange = (days: number) => {
    setDateRange({
      from: subDays(new Date(), days - 1),
      to: new Date(),
    });
  };

  const activeFiltersCount = 
    (statusFilter !== 'ALL' ? 1 : 0) + 
    (complianceFilter !== 'ALL' ? 1 : 0) +
    (kategoriFilter !== 'ALL' ? 1 : 0) +
    (jarakFilter !== 'ALL' ? 1 : 0) +
    (dateRange.from || dateRange.to ? 1 : 0);

  // Filter component for reuse
  const FilterSelect = ({ 
    label, 
    value, 
    onValueChange, 
    options, 
    placeholder,
    allLabel = "Semua"
  }: { 
    label: string;
    value: string; 
    onValueChange: (val: string) => void; 
    options: string[];
    placeholder: string;
    allLabel?: string;
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{allLabel}</SelectItem>
          {options.map(option => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Tiket Saya</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {activeTickets.length} tiket aktif dari {myTickets.length} total
              {activeFiltersCount > 0 && (
                <span className="text-primary"> • {activeFiltersCount} filter aktif</span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Sort dropdown - desktop */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Urutkan:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ttr">Sisa TTR</SelectItem>
                  <SelectItem value="newest">Terbaru</SelectItem>
                  <SelectItem value="oldest">Terlama</SelectItem>
                  <SelectItem value="site">Site Code</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {(overdueTickets.length > 0 || dueSoonTickets.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {overdueTickets.length > 0 && (
              <Badge variant="destructive" className="gap-1.5 py-1.5 px-3">
                <AlertTriangle className="w-3.5 h-3.5" />
                {overdueTickets.length} tiket overdue - Segera update!
              </Badge>
            )}
            {dueSoonTickets.length > 0 && (
              <Badge variant="outline" className="gap-1.5 py-1.5 px-3 border-amber-500 text-amber-600">
                <Clock className="w-3.5 h-3.5" />
                {dueSoonTickets.length} tiket hampir due
              </Badge>
            )}
          </div>
        )}

        {/* Search & Filters */}
        <div className="flex flex-col gap-3">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari INC, site, lokasi, network element..."
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

            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden gap-2 shrink-0">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="sr-only sm:not-sr-only">Filter</span>
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filter & Urutkan</SheetTitle>
                  <SheetDescription>
                    Pilih kriteria untuk menyaring tiket
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-4 mt-4">
                  {/* Sort */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Urutkan</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ttr">Sisa TTR</SelectItem>
                        <SelectItem value="newest">Terbaru</SelectItem>
                        <SelectItem value="oldest">Terlama</SelectItem>
                        <SelectItem value="site">Site Code</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
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

                  {/* Compliance */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Compliance</label>
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

                  {/* Kategori */}
                  <FilterSelect
                    label="Kategori"
                    value={kategoriFilter}
                    onValueChange={setKategoriFilter}
                    options={filterOptions.kategoris}
                    placeholder="Kategori"
                  />

                  {/* Jarak */}
                  <FilterSelect
                    label="Range Jarak"
                    value={jarakFilter}
                    onValueChange={setJarakFilter}
                    options={filterOptions.jaraks}
                    placeholder="Jarak"
                  />

                  {/* Date Range */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Periode</label>
                    <div className="flex gap-2 flex-wrap">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handlePresetRange(7)}
                        className="text-xs"
                      >
                        7 Hari
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handlePresetRange(14)}
                        className="text-xs"
                      >
                        14 Hari
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handlePresetRange(30)}
                        className="text-xs"
                      >
                        30 Hari
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "flex-1 justify-start text-left font-normal text-xs",
                              !dateRange.from && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3 w-3" />
                            {dateRange.from ? format(dateRange.from, "dd MMM yy", { locale: id }) : "Dari"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateRange.from}
                            onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                            disabled={(date) => date > new Date() || (dateRange.to ? date > dateRange.to : false)}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "flex-1 justify-start text-left font-normal text-xs",
                              !dateRange.to && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3 w-3" />
                            {dateRange.to ? format(dateRange.to, "dd MMM yy", { locale: id }) : "Sampai"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateRange.to}
                            onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                            disabled={(date) => date > new Date() || (dateRange.from ? date < dateRange.from : false)}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" className="flex-1" onClick={clearFilters}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                    <SheetClose asChild>
                      <Button className="flex-1">Terapkan</Button>
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Filters */}
          <div className="hidden md:flex items-center gap-2 flex-wrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
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
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Compliance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Compliance</SelectItem>
                <SelectItem value="COMPLY">Comply</SelectItem>
                <SelectItem value="NOT COMPLY">Not Comply</SelectItem>
              </SelectContent>
            </Select>

            <Select value={kategoriFilter} onValueChange={setKategoriFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Kategori</SelectItem>
                {filterOptions.kategoris.map(kategori => (
                  <SelectItem key={kategori} value={kategori}>
                    {kategori}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={jarakFilter} onValueChange={setJarakFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Jarak" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Jarak</SelectItem>
                {filterOptions.jaraks.map(jarak => (
                  <SelectItem key={jarak} value={jarak}>
                    {jarak}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Range Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateRange.from && !dateRange.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd MMM", { locale: id })} - {format(dateRange.to, "dd MMM", { locale: id })}
                      </>
                    ) : (
                      format(dateRange.from, "dd MMM yyyy", { locale: id })
                    )
                  ) : (
                    "Periode"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="start">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handlePresetRange(7)}>
                      7 Hari
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handlePresetRange(14)}>
                      14 Hari
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handlePresetRange(30)}>
                      30 Hari
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Dari</p>
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                        disabled={(date) => date > new Date() || (dateRange.to ? date > dateRange.to : false)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Sampai</p>
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                        disabled={(date) => date > new Date() || (dateRange.from ? date < dateRange.from : false)}
                        className="pointer-events-auto"
                      />
                    </div>
                  </div>
                  {(dateRange.from || dateRange.to) && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setDateRange({ from: undefined, to: undefined })}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Hapus Periode
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset ({activeFiltersCount})
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Display - Mobile */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 md:hidden">
            {statusFilter !== 'ALL' && (
              <Badge variant="secondary" className="gap-1">
                {getStatusLabel(statusFilter as TicketStatus)}
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
            {kategoriFilter !== 'ALL' && (
              <Badge variant="secondary" className="gap-1">
                {kategoriFilter}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => setKategoriFilter('ALL')}
                />
              </Badge>
            )}
            {jarakFilter !== 'ALL' && (
              <Badge variant="secondary" className="gap-1">
                {jarakFilter}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => setJarakFilter('ALL')}
                />
              </Badge>
            )}
            {(dateRange.from || dateRange.to) && (
              <Badge variant="secondary" className="gap-1">
                {dateRange.from && format(dateRange.from, "dd/MM", { locale: id })}
                {dateRange.from && dateRange.to && " - "}
                {dateRange.to && format(dateRange.to, "dd/MM", { locale: id })}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => setDateRange({ from: undefined, to: undefined })}
                />
              </Badge>
            )}
          </div>
        )}

        {/* Ticket List */}
        <div className="space-y-3">
          {isLoading ? (
            <TicketCardSkeleton count={3} />
          ) : sortedTickets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {myTickets.length === 0 ? (
                <>
                  <TicketIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">Tidak ada tiket</p>
                  <p className="text-sm">Anda belum memiliki tiket yang di-assign</p>
                </>
              ) : (
                <>
                  <Filter className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Tidak ada tiket yang sesuai filter</p>
                  <p className="text-sm mt-1">Coba ubah atau reset filter</p>
                  <Button variant="link" onClick={clearFilters} className="mt-2">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset semua filter
                  </Button>
                </>
              )}
            </div>
          ) : (
            sortedTickets.map((ticket, index) => (
              <div 
                key={ticket.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
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

export default MyTickets;
