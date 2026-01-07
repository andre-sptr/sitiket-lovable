import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/StatusBadge';
import { Ticket } from '@/types/ticket';
import { 
  FileUp, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  ChevronDown,
  ChevronUp,
  Trash2,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ParsedTicket {
  id: string;
  incNumbers: string[];
  siteCode: string;
  siteName: string;
  kategori: string;
  lokasiText: string;
  latitude?: number;
  longitude?: number;
  jarakKmRange?: string;
  ttrCompliance: 'COMPLY' | 'NOT COMPLY';
  jamOpen: Date;
  ttrTargetHours: number;
  sisaTtrHours: number;
  status: Ticket['status'];
  teknisiList?: string[];
  rawText: string;
  parseWarnings: string[];
  isValid: boolean;
}

const ImportTicket = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [rawText, setRawText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedTickets, setParsedTickets] = useState<ParsedTicket[]>([]);
  const [expandedTickets, setExpandedTickets] = useState<string[]>([]);

  const parseTicketText = (text: string): ParsedTicket[] => {
    const tickets: ParsedTicket[] = [];
    
    // Split by numbered patterns or TSEL delimiter
    const ticketBlocks = text.split(/(?=\d+\.\s*TSEL\s*\|)|(?=TSEL\s*\|)/g)
      .filter(block => 
        block.trim().length > 0 && /TSEL\s*\|/i.test(block)
      );

    ticketBlocks.forEach((block, index) => {
      const warnings: string[] = [];
      let isValid = true;

      // Extract INC number(s)
      const incMatch = block.match(/INC\d+/g);
      const incNumbers = incMatch || [];
      if (incNumbers.length === 0) {
        warnings.push('INC number tidak ditemukan');
        isValid = false;
      }

      // Extract site code (pattern like PPN555, SSI278)
      const siteCodeMatch = block.match(/\b([A-Z]{2,4}\d{2,4})\b/);
      const siteCode = siteCodeMatch ? siteCodeMatch[1] : 'UNKNOWN';
      if (siteCode === 'UNKNOWN') {
        warnings.push('Site code tidak ditemukan');
      }

      // Extract site name (after site code, before next delimiter)
      const siteNameMatch = block.match(new RegExp(`${siteCode}\\s*[-–]\\s*([A-Z_\\s]+)`, 'i'));
      const siteName = siteNameMatch ? siteNameMatch[1].trim().replace(/_/g, ' ') : 'Unknown Site';

      // Extract kategori
      const kategoriMatch = block.match(/KATEGORI\s*:\s*([^\n]+)/i) || 
                           block.match(/(CNQ|MINOR\s*\[\d+\]|MAJOR|CRITICAL)/i);
      const kategori = kategoriMatch ? kategoriMatch[1].trim() : 'Unknown';

      // Extract lokasi
      const lokasiMatch = block.match(/LOKASI\s*:\s*([^(]+)/i);
      const lokasiText = lokasiMatch ? lokasiMatch[1].trim() : 'Unknown';

      // Extract coordinates
      const coordMatch = block.match(/\((-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\)/);
      const latitude = coordMatch ? parseFloat(coordMatch[1]) : undefined;
      const longitude = coordMatch ? parseFloat(coordMatch[2]) : undefined;

      // Extract jarak
      const jarakMatch = block.match(/JARAK\s*:\s*([^\n]+)/i);
      const jarakKmRange = jarakMatch ? jarakMatch[1].trim() : undefined;

      // Extract TTR compliance
      const complianceMatch = block.match(/TTR\s*COMPLIENCE\s*:\s*(COMPLY|NOT\s*COMPLY)/i);
      const ttrCompliance: 'COMPLY' | 'NOT COMPLY' = 
        complianceMatch && complianceMatch[1].includes('NOT') ? 'NOT COMPLY' : 'COMPLY';

      // Extract jam open
      const jamOpenMatch = block.match(/JAM\s*OPEN\s*:\s*(\d{1,2}[:\-]\d{2})/i);
      const now = new Date();
      let jamOpen = now;
      if (jamOpenMatch) {
        const [hours, mins] = jamOpenMatch[1].split(/[:\-]/).map(Number);
        jamOpen = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, mins);
      }

      // Extract TTR target
      const ttrMatch = block.match(/TTR\s*:\s*(\d+)/i);
      const ttrTargetHours = ttrMatch ? parseInt(ttrMatch[1]) : 8;

      // Extract sisa TTR
      const sisaMatch = block.match(/SISA\s*TTR\s*:\s*(-?\d+\.?\d*)/i);
      const sisaTtrHours = sisaMatch ? parseFloat(sisaMatch[1]) : ttrTargetHours;

      // Extract status
      const statusMatch = block.match(/STATUS\s*TIKET\s*:\s*([^\n]+)/i);
      let status: Ticket['status'] = 'OPEN';
      if (statusMatch) {
        const statusText = statusMatch[1].toUpperCase();
        if (statusText.includes('CLOSE')) status = 'CLOSED';
        else if (statusText.includes('PROGRESS')) status = 'ONPROGRESS';
        else if (statusText.includes('TEMPORARY')) status = 'TEMPORARY';
      }

      // Extract teknisi
      const teknisiMatch = block.match(/TEKNISI\s*:\s*([^\n]+)/i);
      const teknisiList = teknisiMatch 
        ? teknisiMatch[1].split(/[,;]/).map(t => t.trim()).filter(Boolean)
        : undefined;

      tickets.push({
        id: `import-${Date.now()}-${index}`,
        incNumbers,
        siteCode,
        siteName,
        kategori,
        lokasiText,
        latitude,
        longitude,
        jarakKmRange,
        ttrCompliance,
        jamOpen,
        ttrTargetHours,
        sisaTtrHours,
        status,
        teknisiList,
        rawText: block.trim(),
        parseWarnings: warnings,
        isValid,
      });
    });

    return tickets;
  };

  const handleParse = () => {
    if (!rawText.trim()) {
      toast({
        title: "Error",
        description: "Masukkan teks tiket terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setIsParsing(true);
    
    // Simulate parsing delay
    setTimeout(() => {
      const parsed = parseTicketText(rawText);
      setParsedTickets(parsed);
      setExpandedTickets(parsed.map(t => t.id));
      setIsParsing(false);

      if (parsed.length === 0) {
        toast({
          title: "Parsing Gagal",
          description: "Tidak dapat menemukan tiket dalam teks",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Parsing Berhasil",
          description: `Ditemukan ${parsed.length} tiket`,
        });
      }
    }, 500);
  };

  const handleRemoveTicket = (id: string) => {
    setParsedTickets(prev => prev.filter(t => t.id !== id));
  };

  const handleSaveAll = () => {
    const validTickets = parsedTickets.filter(t => t.isValid);
    if (validTickets.length === 0) {
      toast({
        title: "Error",
        description: "Tidak ada tiket valid untuk disimpan",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Tiket Disimpan",
      description: `${validTickets.length} tiket berhasil diimport`,
    });
    
    navigate('/tickets');
  };

  const toggleExpanded = (id: string) => {
    setExpandedTickets(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const sampleText = `1. TSEL | INC44642401 PPN555 - SIMPANG_KAMBING TSEL_CNQ_METRO_PPN555_SIMPANG_KAMBING
KATEGORI : CNQ
LOKASI : KANDIS (1.055839722, 100.79362)
JARAK : 70-100km
TTR COMPLIENCE : COMPLY
JAM OPEN : 08:00
TTR : 8
MAX JAM CLOSE : 16:00
SISA TTR : 4.5
TEKNISI : Budi Santoso, Cahyo Pratama
STATUS TIKET : ONPROGRESS

Timely Report :
1. Jam 08:30 - Tiket diterima, TA on the way
2. Jam 09:15 - On site, pengecekan perangkat
3. Jam 10:00 - Ditemukan FO putus, proses perbaikan`;

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Import Tiket</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Paste teks tiket untuk di-import ke sistem
          </p>
        </div>

        {/* Input Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileUp className="w-5 h-5" />
              Paste Teks Tiket
            </CardTitle>
            <CardDescription>
              Tempel teks tiket mentah. Sistem akan otomatis parsing INC, site, TTR, dan timeline.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste teks tiket di sini..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={handleParse} 
                disabled={isParsing || !rawText.trim()}
                className="flex-1 sm:flex-none"
              >
                {isParsing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  <>
                    <FileUp className="w-4 h-4 mr-2" />
                    Parse Tiket
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setRawText(sampleText)}
                className="flex-1 sm:flex-none"
              >
                Lihat Contoh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Parsed Results */}
        {parsedTickets.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Hasil Parsing ({parsedTickets.length} tiket)
              </h2>
              <div className="flex items-center gap-2">
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {parsedTickets.filter(t => t.isValid).length} valid
                </Badge>
                {parsedTickets.some(t => !t.isValid) && (
                  <Badge variant="warning" className="gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {parsedTickets.filter(t => !t.isValid).length} perlu cek
                  </Badge>
                )}
              </div>
            </div>

            {parsedTickets.map((ticket) => (
              <Collapsible 
                key={ticket.id}
                open={expandedTickets.includes(ticket.id)}
                onOpenChange={() => toggleExpanded(ticket.id)}
              >
                <Card className={ticket.isValid ? '' : 'border-amber-300 bg-amber-50/50'}>
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-mono text-sm">
                              {ticket.incNumbers.join(', ') || 'No INC'}
                            </span>
                            <StatusBadge status={ticket.status} size="sm" />
                            {!ticket.isValid && (
                              <Badge variant="warning" className="gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Perlu cek
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-base">
                            {ticket.siteCode} - {ticket.siteName}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveTicket(ticket.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          {expandedTickets.includes(ticket.id) ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      {ticket.parseWarnings.length > 0 && (
                        <div className="mb-4 p-3 bg-amber-100 rounded-lg">
                          <p className="text-sm font-medium text-amber-800 mb-1">
                            Warning:
                          </p>
                          <ul className="text-sm text-amber-700 list-disc list-inside">
                            {ticket.parseWarnings.map((warning, i) => (
                              <li key={i}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Kategori:</span>
                          <span className="ml-2">{ticket.kategori}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Lokasi:</span>
                          <span className="ml-2">{ticket.lokasiText}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Jarak:</span>
                          <span className="ml-2">{ticket.jarakKmRange || '-'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">TTR:</span>
                          <span className="ml-2">{ticket.ttrTargetHours}h (sisa: {ticket.sisaTtrHours}h)</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Compliance:</span>
                          <span className="ml-2">{ticket.ttrCompliance}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Teknisi:</span>
                          <span className="ml-2">{ticket.teknisiList?.join(', ') || '-'}</span>
                        </div>
                        {ticket.latitude && ticket.longitude && (
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Koordinat:</span>
                            <span className="ml-2 font-mono text-xs">
                              {ticket.latitude}, {ticket.longitude}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Raw Text:</p>
                        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap">
                          {ticket.rawText.slice(0, 300)}
                          {ticket.rawText.length > 300 && '...'}
                        </pre>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}

            {/* Save Button */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setParsedTickets([])}>
                Batal
              </Button>
              <Button onClick={handleSaveAll} className="gap-2">
                <Save className="w-4 h-4" />
                Simpan {parsedTickets.filter(t => t.isValid).length} Tiket
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ImportTicket;
