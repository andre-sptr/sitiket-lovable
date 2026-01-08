import { useState } from 'react';
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
import { Save, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Dropdown options - Admin can modify these later
const DROPDOWN_OPTIONS = {
  hsa: ['MIS', 'SLJ', 'TBH', 'DUM', 'PKU', 'BKN'],
  sto: ['MIS', 'SLJ', 'TBH', 'DUM', 'PKU', 'BKN'],
  odc: ['MIS', 'SLJ', 'TBH', 'DUM', 'PKU', 'BKN'],
  stakeHolder: ['TLKM', 'OTHER'],
  jenisPelanggan: ['TSEL', 'ISAT', 'XL', 'OTHER'],
  kategori: ['CNQ', 'MINOR [8]', 'MINOR [12]', 'MINOR [24]', 'MAJOR', 'CRITICAL', 'LOW [24]'],
  losNonLos: ['LOS', 'NON LOS', 'UNSPEC'],
  classSite: ['Platinum', 'Gold', 'Silver', 'Bronze'],
  tim: ['Tim A', 'Tim B', 'Selat Panjang'],
};

interface TicketFormData {
  // Lokasi
  hsa: string;
  sto: string;
  odc: string;
  stakeHolder: string;
  jenisPelanggan: string;
  kategori: string;
  // Info Tiket
  tiket: string;
  tiketTacc: string;
  indukGamas: string;
  kjd: string;
  summary: string;
  // Pelanggan & Site
  idPelanggan: string;
  namaPelanggan: string;
  datek: string;
  losNonLos: string;
  siteImpact: string;
  classSite: string;
  koordinat: string;
  histori6Bulan: string;
  // TTR Target & Report Date
  reportDate: string;
  ttrTarget: string;
  // Teknisi awal
  teknisi1: string;
  tim: string;
}

const emptyForm: TicketFormData = {
  hsa: '',
  sto: '',
  odc: '',
  stakeHolder: '',
  jenisPelanggan: '',
  kategori: '',
  tiket: '',
  tiketTacc: '',
  indukGamas: '',
  kjd: '',
  summary: '',
  idPelanggan: '',
  namaPelanggan: '',
  datek: '',
  losNonLos: '',
  siteImpact: '',
  classSite: '',
  koordinat: '',
  histori6Bulan: '',
  reportDate: '',
  ttrTarget: '',
  teknisi1: '',
  tim: '',
};

const ImportTicket = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TicketFormData>(emptyForm);

  const updateField = (field: keyof TicketFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setFormData(emptyForm);
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.tiket) {
      toast({
        title: "Error",
        description: "Nomor Tiket (INC) wajib diisi",
        variant: "destructive",
      });
      return;
    }

    if (!formData.kategori) {
      toast({
        title: "Error",
        description: "Kategori Tiket wajib dipilih",
        variant: "destructive",
      });
      return;
    }

    // TODO: Save to database - status will be set to OPEN by default
    toast({
      title: "Tiket Berhasil Disimpan",
      description: `Tiket ${formData.tiket} telah ditambahkan dengan status OPEN`,
    });
    
    navigate('/tickets');
  };

  const SelectField = ({ 
    label, 
    field, 
    options,
    placeholder = "Pilih...",
    required = false
  }: { 
    label: string; 
    field: keyof TicketFormData; 
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
    required = false
  }: { 
    label: string; 
    field: keyof TicketFormData; 
    placeholder?: string;
    type?: string;
    required?: boolean;
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
      />
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Input Tiket Baru</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Masukkan data awal tiket gangguan. Progress & status akan diupdate kemudian.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            <Button onClick={handleSubmit} className="gap-2">
              <Save className="w-4 h-4" />
              Simpan
            </Button>
          </div>
        </div>

        {/* Form Sections */}
        <div className="grid gap-6">
          {/* Section 1: Lokasi & Kategori */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Lokasi & Kategori</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <SelectField label="HSA" field="hsa" options={DROPDOWN_OPTIONS.hsa} />
                <SelectField label="STO" field="sto" options={DROPDOWN_OPTIONS.sto} />
                <SelectField label="ODC" field="odc" options={DROPDOWN_OPTIONS.odc} />
                <SelectField label="Stake Holder" field="stakeHolder" options={DROPDOWN_OPTIONS.stakeHolder} />
                <SelectField label="Jenis Pelanggan" field="jenisPelanggan" options={DROPDOWN_OPTIONS.jenisPelanggan} />
                <SelectField label="Kategori Tiket" field="kategori" options={DROPDOWN_OPTIONS.kategori} required />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Info Tiket */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Informasi Tiket</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InputField label="No. Tiket (INC)" field="tiket" placeholder="INC44646411" required />
                <InputField label="Tiket TACC" field="tiketTacc" placeholder="Optional" />
                <InputField label="Induk GAMAS" field="indukGamas" placeholder="INC..." />
                <InputField label="KJD" field="kjd" placeholder="KJD25199" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <InputField label="Report Date" field="reportDate" placeholder="DD/MM/YYYY HH:MM" />
                <InputField label="TTR Target (Jam)" field="ttrTarget" placeholder="24" />
              </div>
              <div className="mt-4">
                <Label className="text-xs font-medium text-muted-foreground">Summary</Label>
                <Textarea
                  value={formData.summary}
                  onChange={(e) => updateField('summary', e.target.value)}
                  placeholder="TSEL_METRO_BLS153_UTAMA_TENAN..."
                  className="mt-1.5 min-h-[60px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Info Pelanggan & Site */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Pelanggan & Site</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InputField label="ID Pelanggan / Site" field="idPelanggan" placeholder="BLS153" />
                <InputField label="Nama Pelanggan / Site" field="namaPelanggan" placeholder="UTAMA_TENAN" />
                <InputField label="DATEK" field="datek" placeholder="SLJ/GPON00-D1-SLJ-3" />
                <SelectField label="LOS / Non LOS" field="losNonLos" options={DROPDOWN_OPTIONS.losNonLos} />
                <InputField label="Site Impact" field="siteImpact" placeholder="PPN555" />
                <SelectField label="Class Site" field="classSite" options={DROPDOWN_OPTIONS.classSite} />
                <InputField label="Koordinat" field="koordinat" placeholder="-0.123456, 101.123456" />
                <InputField label="Histori 6 Bulan" field="histori6Bulan" placeholder="10x" />
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Teknisi & Tim */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Teknisi & Tim (Assign Awal)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Teknisi 1" field="teknisi1" placeholder="22010054-DIMAS RIO" />
                <SelectField label="Tim" field="tim" options={DROPDOWN_OPTIONS.tim} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-end gap-2 pb-6">
          <Button variant="outline" onClick={handleReset}>
            Reset Form
          </Button>
          <Button onClick={handleSubmit} className="gap-2">
            <Save className="w-4 h-4" />
            Simpan Tiket
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default ImportTicket;
