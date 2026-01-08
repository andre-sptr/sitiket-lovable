import { Ticket, User, ProgressUpdate, Notification, DashboardStats } from '@/types/ticket';

export const mockUsers: User[] = [
  { id: 'admin-1', name: 'Ahmad Admin', role: 'admin', phone: '081234567890', area: 'Riau', isActive: true },
  { id: 'hd-1', name: 'Rina HelpDesk', role: 'hd', phone: '081234567899', area: 'Pekanbaru', isActive: true },
  { id: 'guest-1', name: 'Eko Guest', role: 'guest', area: 'Sumatra', isActive: true }
];

const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

export const mockProgressUpdates: ProgressUpdate[] = [
  {
    id: 'pu-1',
    ticketId: 'TKT-001',
    timestamp: new Date(today.getTime() + 8 * 60 * 60 * 1000),
    source: 'SYSTEM',
    message: 'Tiket dibuat dari import',
    createdBy: 'admin-1',
  },
  {
    id: 'pu-2',
    ticketId: 'TKT-001',
    timestamp: new Date(today.getTime() + 8.5 * 60 * 60 * 1000),
    source: 'ADMIN',
    message: 'Tiket di-assign ke Budi Santoso',
    statusAfterUpdate: 'ASSIGNED',
    createdBy: 'admin-1',
  },
  {
    id: 'pu-3',
    ticketId: 'TKT-001',
    timestamp: new Date(today.getTime() + 9 * 60 * 60 * 1000),
    source: 'HD',
    message: 'On the way ke lokasi. ETA 30 menit.',
    statusAfterUpdate: 'ONPROGRESS',
    createdBy: 'ta-1',
  },
  {
    id: 'pu-4',
    ticketId: 'TKT-001',
    timestamp: new Date(today.getTime() + 10 * 60 * 60 * 1000),
    source: 'HD',
    message: 'On site. Melakukan pengecekan perangkat. Ditemukan FO putus di jalur 200m dari site.',
    statusAfterUpdate: 'ONPROGRESS',
    createdBy: 'ta-1',
    attachments: ['foto-lokasi-1.jpg'],
  },
];

export const mockTickets: Ticket[] = [
  {
    id: 'TKT-001',
    provider: 'TSEL',
    incNumbers: ['INC44642401'],
    siteCode: 'PPN555',
    siteName: 'SIMPANG KAMBING',
    networkElement: 'TSEL_CNQ_METRO_PPN555_SIMPANG_KAMBING',
    kategori: 'CNQ',
    lokasiText: 'KANDIS, Siak',
    latitude: 1.055839722,
    longitude: 100.79362,
    jarakKmRange: '70-100km',
    ttrCompliance: 'COMPLY',
    jamOpen: new Date(today.getTime() + 8 * 60 * 60 * 1000),
    ttrTargetHours: 8,
    maxJamClose: new Date(today.getTime() + 16 * 60 * 60 * 1000),
    sisaTtrHours: 4.5,
    status: 'ONPROGRESS',
    isPermanent: false,
    teknisiList: ['Budi Santoso', 'Cahyo Pratama'],
    assignedTo: 'ta-1',
    assignedAt: new Date(today.getTime() + 8.5 * 60 * 60 * 1000),
    assignedBy: 'admin-1',
    createdByAdmin: 'admin-1',
    createdAt: new Date(today.getTime() + 8 * 60 * 60 * 1000),
    updatedAt: new Date(today.getTime() + 10 * 60 * 60 * 1000),
    progressUpdates: mockProgressUpdates.filter(p => p.ticketId === 'TKT-001'),
  },
  {
    id: 'TKT-002',
    provider: 'TSEL',
    incNumbers: ['INC44677207', 'INC44677208'],
    siteCode: 'SSI278',
    siteName: 'SELAT LAWANG BUTON',
    networkElement: 'TSEL_MINOR_SSI278_SELAT_LAWANG',
    kategori: 'MINOR [16]',
    lokasiText: 'SEI APIT, Siak',
    latitude: 1.234567,
    longitude: 102.345678,
    jarakKmRange: '0-40km',
    ttrCompliance: 'NOT COMPLY',
    jamOpen: new Date(today.getTime() + 6 * 60 * 60 * 1000),
    ttrTargetHours: 4,
    maxJamClose: new Date(today.getTime() + 10 * 60 * 60 * 1000),
    sisaTtrHours: -2,
    status: 'WAITING_MATERIAL',
    isPermanent: false,
    penyebab: 'Kabel FO putus akibat galian pihak ketiga',
    teknisiList: ['Dewi Anggraini'],
    assignedTo: 'ta-3',
    assignedAt: new Date(today.getTime() + 6.5 * 60 * 60 * 1000),
    assignedBy: 'admin-1',
    createdByAdmin: 'admin-1',
    createdAt: new Date(today.getTime() + 6 * 60 * 60 * 1000),
    updatedAt: new Date(today.getTime() + 11 * 60 * 60 * 1000),
    progressUpdates: [
      {
        id: 'pu-10',
        ticketId: 'TKT-002',
        timestamp: new Date(today.getTime() + 6 * 60 * 60 * 1000),
        source: 'SYSTEM',
        message: 'Tiket dibuat dari import',
        createdBy: 'admin-1',
      },
      {
        id: 'pu-11',
        ticketId: 'TKT-002',
        timestamp: new Date(today.getTime() + 7 * 60 * 60 * 1000),
        source: 'HD',
        message: 'On site. FO putus sepanjang 50m. Butuh material pengganti.',
        statusAfterUpdate: 'WAITING_MATERIAL',
        createdBy: 'ta-3',
      },
    ],
  },
  {
    id: 'TKT-003',
    provider: 'TSEL',
    incNumbers: ['INC44699001'],
    siteCode: 'PKU123',
    siteName: 'PANAM SQUARE',
    kategori: 'CNQ',
    lokasiText: 'TAMPAN, Pekanbaru',
    latitude: 0.468793,
    longitude: 101.378219,
    jarakKmRange: '0-40km',
    ttrCompliance: 'COMPLY',
    jamOpen: new Date(today.getTime() + 10 * 60 * 60 * 1000),
    ttrTargetHours: 8,
    maxJamClose: new Date(today.getTime() + 18 * 60 * 60 * 1000),
    sisaTtrHours: 7,
    status: 'OPEN',
    isPermanent: false,
    createdByAdmin: 'admin-1',
    createdAt: new Date(today.getTime() + 10 * 60 * 60 * 1000),
    updatedAt: new Date(today.getTime() + 10 * 60 * 60 * 1000),
    progressUpdates: [
      {
        id: 'pu-20',
        ticketId: 'TKT-003',
        timestamp: new Date(today.getTime() + 10 * 60 * 60 * 1000),
        source: 'SYSTEM',
        message: 'Tiket dibuat dari import',
        createdBy: 'admin-1',
      },
    ],
  },
  {
    id: 'TKT-004',
    provider: 'TSEL',
    incNumbers: ['INC44688100'],
    siteCode: 'DUM456',
    siteName: 'DUMAI KOTA',
    kategori: 'MAJOR',
    lokasiText: 'DUMAI KOTA, Dumai',
    latitude: 1.658889,
    longitude: 101.443611,
    jarakKmRange: '100-150km',
    ttrCompliance: 'COMPLY',
    jamOpen: new Date(today.getTime() + 7 * 60 * 60 * 1000),
    ttrTargetHours: 6,
    maxJamClose: new Date(today.getTime() + 13 * 60 * 60 * 1000),
    sisaTtrHours: 0.5,
    status: 'TEMPORARY',
    isPermanent: false,
    assignedTo: 'ta-2',
    assignedAt: new Date(today.getTime() + 7.5 * 60 * 60 * 1000),
    assignedBy: 'admin-1',
    createdByAdmin: 'admin-1',
    createdAt: new Date(today.getTime() + 7 * 60 * 60 * 1000),
    updatedAt: new Date(today.getTime() + 12 * 60 * 60 * 1000),
    progressUpdates: [
      {
        id: 'pu-30',
        ticketId: 'TKT-004',
        timestamp: new Date(today.getTime() + 12 * 60 * 60 * 1000),
        source: 'HD',
        message: 'Perbaikan temporary selesai. Menunggu material untuk permanen.',
        statusAfterUpdate: 'TEMPORARY',
        createdBy: 'ta-2',
      },
    ],
  },
  {
    id: 'TKT-005',
    provider: 'TSEL',
    incNumbers: ['INC44655000'],
    siteCode: 'BKL789',
    siteName: 'BENGKALIS UTARA',
    kategori: 'CNQ',
    lokasiText: 'BENGKALIS, Bengkalis',
    latitude: 1.483333,
    longitude: 102.133333,
    jarakKmRange: '40-70km',
    ttrCompliance: 'COMPLY',
    jamOpen: new Date(today.getTime() + 5 * 60 * 60 * 1000),
    ttrTargetHours: 8,
    maxJamClose: new Date(today.getTime() + 13 * 60 * 60 * 1000),
    ttrRealHours: 6.5,
    sisaTtrHours: 0,
    status: 'CLOSED',
    isPermanent: true,
    permanentNotes: 'FO disambung permanen, RX level normal',
    penyebab: 'Kabel digigit tikus',
    assignedTo: 'ta-1',
    createdByAdmin: 'admin-1',
    createdAt: new Date(today.getTime() + 5 * 60 * 60 * 1000),
    updatedAt: new Date(today.getTime() + 11.5 * 60 * 60 * 1000),
    progressUpdates: [
      {
        id: 'pu-40',
        ticketId: 'TKT-005',
        timestamp: new Date(today.getTime() + 11.5 * 60 * 60 * 1000),
        source: 'HD',
        message: 'Perbaikan permanen selesai. Tiket closed.',
        statusAfterUpdate: 'CLOSED',
        createdBy: 'ta-1',
      },
    ],
  },
];

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'overdue',
    title: 'Tiket Overdue',
    message: 'Tiket TKT-002 sudah melewati batas TTR',
    ticketId: 'TKT-002',
    createdAt: new Date(today.getTime() + 10.5 * 60 * 60 * 1000),
    isRead: false,
    userId: 'admin-1',
  },
  {
    id: 'notif-2',
    type: 'reminder',
    title: 'Tiket Hampir Due',
    message: 'Tiket TKT-004 tersisa 30 menit',
    ticketId: 'TKT-004',
    createdAt: new Date(today.getTime() + 12.5 * 60 * 60 * 1000),
    isRead: false,
    userId: 'admin-1',
  },
  {
    id: 'notif-3',
    type: 'assignment',
    title: 'Assignment Baru',
    message: 'Anda mendapat assignment tiket TKT-003',
    ticketId: 'TKT-003',
    createdAt: new Date(today.getTime() + 10 * 60 * 60 * 1000),
    isRead: true,
    userId: 'ta-1',
  },
];

export const mockDashboardStats: DashboardStats = {
  totalToday: 5,
  openTickets: 1,
  overdueTickets: 1,
  closedToday: 1,
  avgResponseTime: 28,
  complianceRate: 80,
};

export const getTicketsByStatus = (status?: string) => {
  if (!status || status === 'ALL') return mockTickets;
  return mockTickets.filter(t => t.status === status);
};

export const getTicketById = (id: string) => {
  return mockTickets.find(t => t.id === id);
};

export const getTicketsAssignedTo = (userId: string) => {
  return mockTickets.filter(t => t.assignedTo === userId);
};

export const getTodayTickets = () => {
  const todayStart = new Date(today);
  const todayEnd = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  return mockTickets.filter(t => t.jamOpen >= todayStart && t.jamOpen < todayEnd);
};
