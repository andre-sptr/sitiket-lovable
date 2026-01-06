import { TicketStatus, TTRCompliance } from '@/types/ticket';

export const formatDateWIB = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  };
  
  const formatted = new Intl.DateTimeFormat('id-ID', options).format(date);
  return `${formatted} WIB`;
};

export const formatDateShort = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  };
  
  return new Intl.DateTimeFormat('id-ID', options).format(date);
};

export const formatTimeOnly = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  };
  
  return new Intl.DateTimeFormat('id-ID', options).format(date);
};

export const formatTTR = (hours: number): string => {
  if (hours <= 0) {
    const absHours = Math.abs(hours);
    const h = Math.floor(absHours);
    const m = Math.round((absHours - h) * 60);
    return `-${h}j ${m}m (OVERDUE)`;
  }
  
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}j ${m}m`;
};

export const getStatusLabel = (status: TicketStatus): string => {
  const labels: Record<TicketStatus, string> = {
    OPEN: 'Open',
    ASSIGNED: 'Assigned',
    ONPROGRESS: 'On Progress',
    TEMPORARY: 'Temporary',
    WAITING_MATERIAL: 'Menunggu Material',
    WAITING_ACCESS: 'Menunggu Akses',
    WAITING_COORDINATION: 'Menunggu Koordinasi',
    CLOSED: 'Closed',
  };
  return labels[status];
};

export const getStatusColor = (status: TicketStatus): string => {
  const colors: Record<TicketStatus, string> = {
    OPEN: 'bg-status-open text-white',
    ASSIGNED: 'bg-status-assigned text-white',
    ONPROGRESS: 'bg-status-onprogress text-white',
    TEMPORARY: 'bg-status-temporary text-white',
    WAITING_MATERIAL: 'bg-status-waiting text-black',
    WAITING_ACCESS: 'bg-status-waiting text-black',
    WAITING_COORDINATION: 'bg-status-waiting text-black',
    CLOSED: 'bg-status-closed text-white',
  };
  return colors[status];
};

export const getComplianceColor = (compliance: TTRCompliance): string => {
  return compliance === 'COMPLY' 
    ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
    : 'bg-red-100 text-red-700 border-red-200';
};

export const getTTRClass = (hours: number): string => {
  if (hours <= 0) return 'countdown-critical';
  if (hours <= 2) return 'countdown-warning';
  return 'countdown-safe';
};

export const generateGoogleMapsLink = (lat?: number, lon?: number): string => {
  if (!lat || !lon) return '#';
  return `https://www.google.com/maps?q=${lat},${lon}`;
};

export const generateWhatsAppMessage = (
  type: 'share' | 'update',
  ticket: {
    id: string;
    incNumbers: string[];
    siteCode: string;
    siteName: string;
    kategori: string;
    lokasiText: string;
    latitude?: number;
    longitude?: number;
    jarakKmRange?: string;
    jamOpen: Date;
    sisaTtrHours: number;
    status: TicketStatus;
  }
): string => {
  if (type === 'share') {
    const mapsLink = generateGoogleMapsLink(ticket.latitude, ticket.longitude);
    const koordinat = ticket.latitude && ticket.longitude 
      ? `${ticket.latitude}, ${ticket.longitude}` 
      : '-';
    
    return `🎫 *TIKET HARI INI*
━━━━━━━━━━━━━━━━━━
*[${ticket.kategori}] - ${ticket.siteCode}*
*${ticket.siteName}*

📋 *INC:* ${ticket.incNumbers.join(', ')}
📍 *Lokasi:* ${ticket.lokasiText}
🗺️ *Koordinat:* ${koordinat}
🔗 *Maps:* ${mapsLink}
📏 *Jarak:* ${ticket.jarakKmRange || '-'}

⏰ *Jam Open:* ${formatDateWIB(ticket.jamOpen)}
⏳ *Sisa TTR:* ${formatTTR(ticket.sisaTtrHours)}
📊 *Status:* ${getStatusLabel(ticket.status)}

━━━━━━━━━━━━━━━━━━
📝 Mohon TA update progress berkala.
🔗 Link Tiket: [URL_TIKET/${ticket.id}]`;
  }
  
  // Update template
  const now = new Date();
  return `📍 *UPDATE PROGRESS*
━━━━━━━━━━━━━━━━━━
🎫 Tiket: ${ticket.incNumbers.join(', ')}
📍 Site: ${ticket.siteCode} - ${ticket.siteName}

⏰ Jam: ${formatTimeOnly(now)} WIB
📍 Posisi: [On the way/On site/...]
🔧 Aktivitas: [Apa yang dilakukan]
📋 Hasil: [Hasil ukur/temuan]
⚠️ Kendala: [Akses/material/cuaca/tidak ada]
➡️ Next Action & ETA: [Rencana + estimasi]
🆘 Butuh Bantuan: [Ya/Tidak + detail]
━━━━━━━━━━━━━━━━━━`;
};
