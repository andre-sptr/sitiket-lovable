import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getTicketById } from '@/lib/mockData';
import { StatusBadge, TTRBadge, ComplianceBadge } from '@/components/StatusBadge';
import { formatDateWIB } from '@/lib/formatters';

// Dropdown options - Admin can modify these later
const DROPDOWN_OPTIONS = {
  statusTiket: ['OPEN', 'PENDING', 'ONPROGRESS', 'CLOSED'],
  compliance: ['COMPLY', 'NOT COMPLY'],
  permanenTemporer: ['PERMANEN', 'TEMPORER'],
  statusAlatBerat: ['TIDAK PERLU', 'DIMINTA', 'DALAM PROSES', 'SELESAI'],
  penyebabGangguan: [
    'Kabel Putus',
    'ODP Rusak',
    'Connector Rusak',
    'Power Off',
    'Gangguan Cuaca',
    'Gangguan Pihak Ketiga',
    'Lainnya'
  ],
  perbaikanGangguan: [
    'Splicing',
    'Ganti Connector',
    'Ganti ODP',
    'Recovery Kabel',
    'Reset Perangkat',
    'Lainnya'
  ],
  kendala: [
    'Tidak Ada Kendala',
    'Akses Lokasi Sulit',
    'Menunggu Material',
    'Menunggu Koordinasi',
    'Cuaca Buruk',
    'Alat Berat Belum Tersedia',
    'Lainnya'
  ],
};

interface UpdateFormData {
  // Status & TTR
  statusTiket: string;
  closedDate: string;
  ttrSisa: string;
  compliance: string;
  penyebabNotComply: string;
  
  // Gangguan & Perbaikan
  segmenTerganggu: string;
  penyebabGangguan: string;
  perbaikanGangguan: string;
  statusAlatBerat: string;
  
  // Progress
  progressSaatIni: string;
  
  // Teknisi
  teknisi1: string;
  teknisi2: string;
  teknisi3: string;
  teknisi4: string;
  
  // Permanen/Temporer
  permanenTemporer: string;
  koordinatTipus: string;
  
  // Timeline MBB
  dispatchMbb: string;
  prepareTim: string;
  otwKeLokasi: string;
  identifikasi: string;
  breakTime: string;
  splicing: string;
  closing: string;
  totalTtr: string;
  
  // Kendala & Lainnya
  kendala: string;
  atbt: string;
  tiketEksternal: string;
}

const emptyForm: UpdateFormData = {
  statusTiket: '',
  closedDate: '',
  ttrSisa: '',
  compliance: '',
  penyebabNotComply: '',
  segmenTerganggu: '',
  penyebabGangguan: '',
  perbaikanGangguan: '',
  statusAlatBerat: '',
  progressSaatIni: '',
  teknisi1: '',
  teknisi2: '',
  teknisi3: '',
  teknisi4: '',
  permanenTemporer: '',
  koordinatTipus: '',
  dispatchMbb: '',
  prepareTim: '',
  otwKeLokasi: '',
  identifikasi: '',
  breakTime: '',
  splicing: '',
  closing: '',
  totalTtr: '',
  kendala: '',
  atbt: '',
  tiketEksternal: '',
};

const UpdateTicket = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<UpdateFormData>(emptyForm);

  const ticket = getTicketById(id || '');

  useEffect(() => {
    if (ticket) {
      // Pre-fill form with existing ticket data
      setFormData(prev => ({
        ...prev,
        statusTiket: ticket.status || '',
        compliance: ticket.ttrCompliance || '',
        ttrSisa: ticket.sisaTtrHours?.toString() || '',
        teknisi1: ticket.teknisiList?.[0] || '',
        teknisi2: ticket.teknisiList?.[1] || '',
        teknisi3: ticket.teknisiList?.[2] || '',
        teknisi4: ticket.teknisiList?.[3] || '',
        penyebabGangguan: ticket.penyebab || '',
        segmenTerganggu: ticket.segmen || '',
        permanenTemporer: ticket.isPermanent ? 'PERMANEN' : 'TEMPORER',
      }));
    }
  }, [ticket]);

  if (!ticket) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Tiket tidak ditemukan</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
            Kembali
          </Button>
        </div>
      </Layout>
    );
  }

  const updateField = (field: keyof UpdateFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.statusTiket) {
      toast({
        title: "Error",
        description: "Status Tiket wajib dipilih",
        variant: "destructive",
      });
      return;
    }

    // TODO: Save to database
    toast({
      title: "Update Berhasil",
      description: `Tiket ${ticket.incNumbers[0]} berhasil diupdate`,
    });
    
    navigate(`/ticket/${id}`);
  };

  const SelectField = ({ 
    label, 
    field, 
    options,
    placeholder = "Pilih...",
    required = false
  }: { 
    label: string; 
    field: keyof UpdateFormData; 
    options: string[];
    placeholder?: string;
    required?: boolean;
  }) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Select value={formData[field]} onValueChange={(v) => updateField(field, v)}>
        <SelectTrigger className="h-9">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-background border shadow-lg z-50">
          {options.map(opt => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const InputField = ({ 
    label, 
    field, 
    placeholder = "",
    type = "text",
    required = false,
    disabled = false
  }: { 
    label: string; 
    field: keyof UpdateFormData; 
    placeholder?: string;
    type?: string;
    required?: boolean;
    disabled?: boolean;
  }) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        type={type}
        value={formData[field]}
        onChange={(e) => updateField(field, e.target.value)}
        placeholder={placeholder}
        className="h-9"
        disabled={disabled}
      />
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">Update Tiket</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Update progress dan status tiket
            </p>
          </div>
          <Button onClick={handleSubmit} className="gap-2">
            <Save className="w-4 h-4" />
            Simpan Update
          </Button>
        </div>

        {/* Ticket Info Summary */}
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <p className="text-xs text-muted-foreground">No. Tiket</p>
                <p className="font-mono font-semibold">{ticket.incNumbers.join(', ')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Site</p>
                <p className="font-medium">{ticket.siteCode} - {ticket.siteName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Kategori</p>
                <p className="font-medium">{ticket.kategori}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status Saat Ini</p>
                <StatusBadge status={ticket.status} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Jam Open</p>
                <p className="font-mono text-xs">{formatDateWIB(ticket.jamOpen)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">TTR Sisa</p>
                <TTRBadge hours={ticket.sisaTtrHours} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Sections */}
        <div className="grid gap-6">
          {/* Section 1: Status & TTR */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Status & TTR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <SelectField 
                  label="Status Tiket" 
                  field="statusTiket" 
                  options={DROPDOWN_OPTIONS.statusTiket} 
                  required 
                />
                <InputField 
                  label="Closed Date" 
                  field="closedDate" 
                  placeholder="DD/MM/YYYY HH:MM" 
                />
                <InputField 
                  label="TTR Sisa (Jam)" 
                  field="ttrSisa" 
                  placeholder="Otomatis dihitung" 
                  type="number"
                />
                <SelectField 
                  label="Compliance" 
                  field="compliance" 
                  options={DROPDOWN_OPTIONS.compliance} 
                />
                <InputField 
                  label="Penyebab Not Comply" 
                  field="penyebabNotComply" 
                  placeholder="Jika NOT COMPLY" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Gangguan & Perbaikan */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Gangguan & Perbaikan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InputField 
                  label="Segmen Terganggu" 
                  field="segmenTerganggu" 
                  placeholder="Segmen A-B" 
                />
                <SelectField 
                  label="Penyebab Gangguan" 
                  field="penyebabGangguan" 
                  options={DROPDOWN_OPTIONS.penyebabGangguan} 
                />
                <SelectField 
                  label="Perbaikan Gangguan" 
                  field="perbaikanGangguan" 
                  options={DROPDOWN_OPTIONS.perbaikanGangguan} 
                />
                <SelectField 
                  label="Status Alat Berat" 
                  field="statusAlatBerat" 
                  options={DROPDOWN_OPTIONS.statusAlatBerat} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Progress */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Progress Saat Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.progressSaatIni}
                onChange={(e) => updateField('progressSaatIni', e.target.value)}
                placeholder="Deskripsikan progress penanganan saat ini..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          {/* Section 4: Teknisi */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Tim Teknisi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InputField label="Teknisi 1" field="teknisi1" placeholder="Nama - NIK" />
                <InputField label="Teknisi 2" field="teknisi2" placeholder="Nama - NIK" />
                <InputField label="Teknisi 3" field="teknisi3" placeholder="Nama - NIK" />
                <InputField label="Teknisi 4" field="teknisi4" placeholder="Nama - NIK" />
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Permanen/Temporer */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Status Perbaikan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField 
                  label="Permanen / Temporer" 
                  field="permanenTemporer" 
                  options={DROPDOWN_OPTIONS.permanenTemporer} 
                />
                <InputField 
                  label="Koordinat Tipus" 
                  field="koordinatTipus" 
                  placeholder="-0.123456, 101.123456" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 6: Timeline MBB */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Timeline Penanganan (MBB)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                <InputField label="Dispatch MBB" field="dispatchMbb" placeholder="HH:MM" />
                <InputField label="Prepare Tim" field="prepareTim" placeholder="HH:MM" />
                <InputField label="OTW Lokasi" field="otwKeLokasi" placeholder="HH:MM" />
                <InputField label="Identifikasi" field="identifikasi" placeholder="HH:MM" />
                <InputField label="Break" field="breakTime" placeholder="HH:MM" />
                <InputField label="Splicing" field="splicing" placeholder="HH:MM" />
                <InputField label="Closing" field="closing" placeholder="HH:MM" />
                <InputField label="Total TTR" field="totalTtr" placeholder="HH:MM" />
              </div>
            </CardContent>
          </Card>

          {/* Section 7: Kendala & Lainnya */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Kendala & Informasi Lainnya</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SelectField 
                  label="Kendala" 
                  field="kendala" 
                  options={DROPDOWN_OPTIONS.kendala} 
                />
                <InputField label="ATBT" field="atbt" placeholder="Alat Berat yang digunakan" />
                <InputField label="Tiket Eksternal" field="tiketEksternal" placeholder="Tiket dari sistem lain" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-end gap-2 pb-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Batal
          </Button>
          <Button onClick={handleSubmit} className="gap-2">
            <Save className="w-4 h-4" />
            Simpan Update
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default UpdateTicket;
