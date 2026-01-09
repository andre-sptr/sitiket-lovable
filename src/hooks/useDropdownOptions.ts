import { useState, useEffect, useCallback } from 'react';

export interface DropdownOptions {
  // Import Ticket Options
  hsa: string[];
  sto: string[];
  odc: string[];
  stakeHolder: string[];
  jenisPelanggan: string[];
  kategori: string[];
  losNonLos: string[];
  classSite: string[];
  tim: string[];
  
  // Update Ticket Options
  statusTiket: string[];
  compliance: string[];
  permanenTemporer: string[];
  statusAlatBerat: string[];
  penyebabGangguan: string[];
  perbaikanGangguan: string[];
  kendala: string[];
}

export const defaultDropdownOptions: DropdownOptions = {
  // Import Ticket Options
  hsa: ['MIS', 'SLJ', 'TBH', 'DUM', 'PKU', 'BKN'],
  sto: ['MIS', 'SLJ', 'TBH', 'DUM', 'PKU', 'BKN'],
  odc: ['MIS', 'SLJ', 'TBH', 'DUM', 'PKU', 'BKN'],
  stakeHolder: ['TLKM', 'OTHER'],
  jenisPelanggan: ['TSEL', 'ISAT', 'XL', 'OTHER'],
  kategori: ['CNQ', 'MINOR [8]', 'MINOR [12]', 'MINOR [24]', 'MAJOR', 'CRITICAL', 'LOW [24]'],
  losNonLos: ['LOS', 'NON LOS', 'UNSPEC'],
  classSite: ['Platinum', 'Gold', 'Silver', 'Bronze'],
  tim: ['Tim A', 'Tim B', 'Selat Panjang'],
  
  // Update Ticket Options
  statusTiket: ['OPEN', 'ASSIGNED', 'ONPROGRESS', 'TEMPORARY', 'WAITING_MATERIAL', 'WAITING_ACCESS', 'WAITING_COORDINATION', 'CLOSED'],
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

const STORAGE_KEY = 'tiketops_dropdown_options';

export const getDropdownOptions = (): DropdownOptions => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all keys exist
      return { ...defaultDropdownOptions, ...parsed };
    }
  } catch (e) {
    console.error('Failed to parse dropdown options', e);
  }
  return defaultDropdownOptions;
};

export const saveDropdownOptions = (options: DropdownOptions): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
  // Dispatch custom event to notify other components
  window.dispatchEvent(new CustomEvent('dropdown-options-updated'));
};

export const useDropdownOptions = () => {
  const [options, setOptions] = useState<DropdownOptions>(getDropdownOptions);

  useEffect(() => {
    const handleUpdate = () => {
      setOptions(getDropdownOptions());
    };

    // Listen for custom event
    window.addEventListener('dropdown-options-updated', handleUpdate);
    // Listen for storage changes (for cross-tab sync)
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) {
        handleUpdate();
      }
    });

    return () => {
      window.removeEventListener('dropdown-options-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const refreshOptions = useCallback(() => {
    setOptions(getDropdownOptions());
  }, []);

  const updateOptions = useCallback((newOptions: DropdownOptions) => {
    saveDropdownOptions(newOptions);
    setOptions(newOptions);
  }, []);

  return { options, refreshOptions, updateOptions };
};

// Labels for display in settings
export const dropdownLabels: Record<keyof DropdownOptions, string> = {
  hsa: 'HSA (Holding Sub Area)',
  sto: 'STO (Sentral Telepon Otomat)',
  odc: 'ODC',
  stakeHolder: 'Stake Holder',
  jenisPelanggan: 'Jenis Pelanggan',
  kategori: 'Kategori Tiket',
  losNonLos: 'LOS / Non LOS',
  classSite: 'Class Site',
  tim: 'Tim',
  statusTiket: 'Status Tiket',
  compliance: 'Compliance',
  permanenTemporer: 'Permanen / Temporer',
  statusAlatBerat: 'Status Alat Berat',
  penyebabGangguan: 'Penyebab Gangguan',
  perbaikanGangguan: 'Perbaikan Gangguan',
  kendala: 'Kendala',
};

// Group options for display
export const optionGroups = {
  'Import Tiket': ['hsa', 'sto', 'odc', 'stakeHolder', 'jenisPelanggan', 'kategori', 'losNonLos', 'classSite', 'tim'] as (keyof DropdownOptions)[],
  'Update Tiket': ['statusTiket', 'compliance', 'permanenTemporer', 'statusAlatBerat', 'penyebabGangguan', 'perbaikanGangguan', 'kendala'] as (keyof DropdownOptions)[],
};