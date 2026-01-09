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
import { ArrowLeft, Save, Clock, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getTicketById } from '@/lib/mockData';
import { StatusBadge, TTRBadge, ComplianceBadge } from '@/components/StatusBadge';
import { formatDateWIB } from '@/lib/formatters';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';

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

type FormErrors = Partial<Record<keyof UpdateFormData, string>>;

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

// Define required fields with their labels
const REQUIRED_FIELDS: { field: keyof UpdateFormData; label: string }[] = [
  { field: 'statusTiket', label: 'Status Tiket' },
];

// Conditional required fields
const getConditionalRequiredFields = (formData: UpdateFormData): { field: keyof UpdateFormData; label: string }[] => {
  const conditionalFields: { field: keyof UpdateFormData; label: string }[] = [];
  
  // If status is CLOSED, closedDate is required
  if (formData.statusTiket === 'CLOSED') {
    conditionalFields.push({ field: 'closedDate', label: 'Closed Date' });
    conditionalFields.push({ field: 'compliance', label: 'Compliance' });
  }
  
  // If compliance is NOT COMPLY, reason is required
  if (formData.compliance === 'NOT COMPLY') {
    conditionalFields.push({ field: 'penyebabNotComply', label: 'Penyebab Not Comply' });
  }
  
  return conditionalFields;
};

const UpdateTicket = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { options: DROPDOWN_OPTIONS } = useDropdownOptions();
  const [formData, setFormData] = useState<UpdateFormData>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof UpdateFormData, boolean>>>({});

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
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const markTouched = (field: keyof UpdateFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const allRequiredFields = [...REQUIRED_FIELDS, ...getConditionalRequiredFields(formData)];
    
    allRequiredFields.forEach(({ field, label }) => {
      if (!formData[field] || formData[field].trim() === '') {
        newErrors[field] = `${label} wajib diisi`;
      }
    });

    // Validate closedDate format if provided
    if (formData.closedDate && !/^\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}$/.test(formData.closedDate)) {
      newErrors.closedDate = 'Format harus DD/MM/YYYY HH:MM';
    }

    setErrors(newErrors);
    
    // Mark all required fields as touched
    const touchedFields: Partial<Record<keyof UpdateFormData, boolean>> = {};
    allRequiredFields.forEach(({ field }) => {
      touchedFields[field] = true;
    });
    setTouched(prev => ({ ...prev, ...touchedFields }));

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast({
        title: "Validasi Gagal",
        description: "Mohon lengkapi semua field yang wajib diisi",
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

  const isFieldRequired = (field: keyof UpdateFormData): boolean => {
    const allRequiredFields = [...REQUIRED_FIELDS, ...getConditionalRequiredFields(formData)];
    return allRequiredFields.some(f => f.field === field);
  };

  const getFieldError = (field: keyof UpdateFormData): string | undefined => {
    return touched[field] ? errors[field] : undefined;
  };

  const SelectField = ({ 
    label, 
    field, 
    options,
    placeholder = "Pilih...",
  }: { 
    label: string; 
    field: keyof UpdateFormData; 
    options: string[];
    placeholder?: string;
  }) => {
    const error = getFieldError(field);
    const required = isFieldRequired(field);
    
    return (
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        <Select 
          value={formData[field]} 
          onValueChange={(v) => {
            updateField(field, v);
            markTouched(field);
          }}
        >
          <SelectTrigger className={`h-9 ${error ? 'border-destructive ring-1 ring-destructive' : ''}`}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="bg-background border shadow-lg z-50">
            {options.map(opt => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && (
          <p className="text-xs text-destructive flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>
    );
  };

  const InputField = ({ 
    label, 
    field, 
    placeholder = "",
    type = "text",
    disabled = false
  }: { 
    label: string; 
    field: keyof UpdateFormData; 
    placeholder?: string;
    type?: string;
    disabled?: boolean;
  }) => {
    const error = getFieldError(field);
    const required = isFieldRequired(field);
    
    return (
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        <Input
          type={type}
          value={formData[field]}
          onChange={(e) => updateField(field, e.target.value)}
          onBlur={() => markTouched(field)}
          placeholder={placeholder}
          className={`h-9 ${error ? 'border-destructive ring-1 ring-destructive' : ''}`}
          disabled={disabled}
        />
        {error && (
          <p className="text-xs text-destructive flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>
    );
  };

  const hasErrors = Object.keys(errors).length > 0;

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

        {/* Error Summary */}
        {hasErrors && Object.keys(touched).length > 0 && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="py-3">
              <div className="flex items-start gap-2 text-destructive">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Mohon lengkapi field berikut:</p>
                  <ul className="text-xs mt-1 list-disc list-inside">
                    {Object.entries(errors).map(([field, message]) => (
                      <li key={field}>{message}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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