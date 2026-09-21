'use client';

// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import {
  Building2, TrendingUp, Users, BedDouble, DollarSign,
  CheckCircle2, AlertCircle, Save, Menu, X, ChevronRight,
  Sliders, Calendar, Activity, FileSpreadsheet, Layers,
  PieChart, BarChart3, RefreshCw, Settings2, ArrowUpRight,
  ArrowDownRight, Sparkles, Filter, Info, Eye, ArrowRight,
  Link, Globe, Check, AlertTriangle, Database, Edit3
} from 'lucide-react';

// =========================================================================
// 1. ข้อมูลฐาน (Baseline 2026 Forecast = 983.95M และเป้าหมาย 2027)
// =========================================================================

const ACTUAL_REV_2026_MONTHLY = [
  82365595, // Jan
  69317440, // Feb
  74642434, // Mar
  68332060, // Apr
  76783774, // May
  80763870, // Jun
  92659168, // Jul
  87818007, // Aug
  97583950, // Sep
  89795400, // Oct
  83427107, // Nov
  80465572  // Dec
];

const TOTAL_2026_FORECAST = 983954375; // 983.95M (Excel Row 56)
const SEASONALITY_WEIGHTS_2026 = ACTUAL_REV_2026_MONTHLY.map(v => v / TOTAL_2026_FORECAST);

// ปรับค่าเริ่มต้นของ 11 SBU ให้รวมกันได้ 1,054,853,709 บาท พอดีเป๊ะ (+7.21%)
const INITIAL_SBU_DATA_2027 = [
  {
    id: 'PED',
    name: 'SBU PED',
    base2026Total: 296550000,
    base2026Opd: 59310000,
    base2026Ipd: 237240000,
    defaultTarget2027: 317918065,
    defaultGrowth: 7.21,
    opdFactor: 2850,
    ipdFactor: 22225,
    alos: 2.4,
    color: '#f59e0b'
  },
  {
    id: 'MED',
    name: 'SBU MED',
    base2026Total: 231280000,
    base2026Opd: 69384000,
    base2026Ipd: 161896000,
    defaultTarget2027: 247944954,
    defaultGrowth: 7.21,
    opdFactor: 3100,
    ipdFactor: 25000,
    alos: 3.2,
    color: '#ec4899'
  },
  {
    id: 'OTHER',
    name: 'Other',
    base2026Total: 137200000,
    base2026Opd: 54880000,
    base2026Ipd: 82320000,
    defaultTarget2027: 147086019,
    defaultGrowth: 7.21,
    opdFactor: 2400,
    ipdFactor: 21000,
    alos: 2.2,
    color: '#84cc16'
  },
  {
    id: 'OBGYN',
    name: 'SBU OB & GYN',
    base2026Total: 70610000,
    base2026Opd: 16946400,
    base2026Ipd: 53663600,
    defaultTarget2027: 75697841,
    defaultGrowth: 7.21,
    opdFactor: 3100,
    ipdFactor: 26000,
    alos: 2.3,
    color: '#8b5cf6'
  },
  {
    id: 'ORTHO',
    name: 'SBU Ortho',
    base2026Total: 60760000,
    base2026Opd: 33418000,
    base2026Ipd: 27342000,
    defaultTarget2027: 65138094,
    defaultGrowth: 7.21,
    opdFactor: 3600,
    ipdFactor: 31500,
    alos: 2.6,
    color: '#06b6d4'
  },
  {
    id: 'TRAUMA',
    name: 'SBU Trauma',
    base2026Total: 57130000,
    base2026Opd: 22852000,
    base2026Ipd: 34278000,
    defaultTarget2027: 61246533,
    defaultGrowth: 7.21,
    opdFactor: 3400,
    ipdFactor: 28000,
    alos: 3.0,
    color: '#f97316'
  },
  {
    id: 'SURG',
    name: 'SBU Surgery',
    base2026Total: 59980000,
    base2026Opd: 11996000,
    base2026Ipd: 47984000,
    defaultTarget2027: 64301891,
    defaultGrowth: 7.21,
    opdFactor: 4100,
    ipdFactor: 36000,
    alos: 2.8,
    color: '#6366f1'
  },
  {
    id: 'GI',
    name: 'SBU GI',
    base2026Total: 40060000,
    base2026Opd: 18027000,
    base2026Ipd: 22033000,
    defaultTarget2027: 42946546,
    defaultGrowth: 7.21,
    opdFactor: 3850,
    ipdFactor: 29000,
    alos: 2.1,
    color: '#0284c7'
  },
  {
    id: 'CATHLAB',
    name: 'CATHLAB',
    base2026Total: 0,
    base2026Opd: 0,
    base2026Ipd: 0,
    defaultTarget2027: 0,
    defaultGrowth: 0,
    opdFactor: 6500,
    ipdFactor: 45000,
    alos: 1.8,
    color: '#14b8a6'
  },
  {
    id: 'CHECKUP',
    name: 'SBU Checkup',
    base2026Total: 17404375,
    base2026Opd: 17404375,
    base2026Ipd: 0,
    defaultTarget2027: 18658453,
    defaultGrowth: 7.21,
    opdFactor: 2700,
    ipdFactor: 0,
    alos: 0,
    color: '#10b981'
  },
  {
    id: 'REHAB',
    name: 'SBU Rehab',
    base2026Total: 12980000,
    base2026Opd: 12980000,
    base2026Ipd: 0,
    defaultTarget2027: 13915313,
    defaultGrowth: 7.21,
    opdFactor: 1850,
    ipdFactor: 0,
    alos: 0,
    color: '#a855f7'
  }
];

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const SCENARIOS_2027 = {
  worst: { label: '2027 Worst', target: 1018820000, growth: 3.54 },
  base: { label: '2027 Base', target: 1054853709, growth: 7.21 },
  best: { label: '2027 Best', target: 1090580000, growth: 10.84 }
};

const formatTHB = (num) => new Intl.NumberFormat('th-TH').format(Math.round(num || 0));
const formatMillion = (num) => (Number(num || 0) / 1000000).toFixed(2) + 'M';
const formatBillion = (num) => (Number(num || 0) / 1000000000).toFixed(3) + 'B';

// Component Input พร้อม Comma คั่นหลักพัน ใช้ฟอนต์ Sans-Serif มาตรฐานเดียวกับตัวแสดงผล
function NumberInputWithComma({ value, onChange, className = '' }) {
  const [isFocused, setIsFocused] = useState(false);
  const [localText, setLocalText] = useState('');

  const handleFocus = () => {
    setIsFocused(true);
    setLocalText(String(Math.round(value || 0)));
  };

  const handleChange = (e) => {
    const rawVal = e.target.value.replace(/,/g, '');
    setLocalText(e.target.value);
    const numericVal = parseFloat(rawVal);
    if (!isNaN(numericVal)) {
      onChange(numericVal);
    } else if (rawVal === '') {
      onChange(0);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <input
      type="text"
      value={isFocused ? localText : formatTHB(value)}
      onFocus={handleFocus}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
    />
  );
}

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDeptId, setSelectedDeptId] = useState('PED');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

// Google Apps Script Web App URL
  const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzXvFoSmM7XL8Y3_pmxiVO-BONfrFT_heKW2h3MN2ABmjpBuBqhIkIJiOIv7Q9fiDsY/exec';
  const [scriptUrl, setScriptUrl] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('revplanner_script_url') || DEFAULT_SCRIPT_URL : DEFAULT_SCRIPT_URL);
  const [urlInputValue, setUrlInputValue] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('revplanner_script_url') || DEFAULT_SCRIPT_URL : DEFAULT_SCRIPT_URL);

  // Simulation Parameters
  const [hospitalTarget, setHospitalTarget] = useState(1054853709);
  const [activePreset, setActivePreset] = useState('base');
  const [sbuConfigs, setSbuConfigs] = useState(
    INITIAL_SBU_DATA_2027.map(s => ({
      ...s,
      growthPct: s.defaultGrowth,
      targetTotal: s.defaultTarget2027
    }))
  );
  const [historicalYTD, setHistoricalYTD] = useState([]);

  const [editingFactors, setEditingFactors] = useState(null);
  const [comparisonSbuId, setComparisonSbuId] = useState(null);
  const [factorReviewOpen, setFactorReviewOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncMessage, setSyncMessage] = useState('');
  const [savedScenarios, setSavedScenarios] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('revplanner_saved_scenarios') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (scriptUrl) {
      setUrlInputValue(scriptUrl);
      if (scriptUrl.startsWith('https://script.google.com')) {
        fetchDataFromGoogleSheet(scriptUrl);
      }
    }
  }, []);

  const handleSaveUrlDirectly = () => {
    const trimmed = urlInputValue.trim();
    setScriptUrl(trimmed);
    localStorage.setItem('revplanner_script_url', trimmed);
    if (trimmed) {
      fetchDataFromGoogleSheet(trimmed);
    }
  };

  // ดึงข้อมูลจริงจาก Google Sheets
  const fetchDataFromGoogleSheet = async (url) => {
    if (!url) return;
    setSyncStatus('fetching');
    setSyncMessage('กำลังดึงข้อมูลจากชีต...');
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.status === 'success') {
        if (data.sbus && data.sbus.length > 0) {
          setSbuConfigs(data.sbus.map(s => ({
            ...s,
            growthPct: s.defaultGrowth || 7.21,
            targetTotal: s.base2026Total ? Math.round(s.base2026Total * (1 + (s.defaultGrowth || 7.21) / 100)) : 20000000
          })));
        }
        if (data.scenarios && data.scenarios.base) {
          setHospitalTarget(data.scenarios.base.target);
        }
        setHistoricalYTD(Array.isArray(data.historicalYTD) ? data.historicalYTD : (Array.isArray(data.historicalActual8M) ? data.historicalActual8M : []));
        setSyncStatus('success');
        setSyncMessage('เชื่อมต่อชีตสำเร็จ!');
        setTimeout(() => setSyncStatus(null), 3000);
      } else {
        throw new Error('Invalid format');
      }
    } catch (err) {
      console.error('Fetch Error:', err);
      setSyncStatus('error');
      setSyncMessage('ไม่สามารถเชื่อมต่อได้ ตรวจสอบ URL หรือสิทธิ์ Anyone');
      setTimeout(() => setSyncStatus(null), 4000);
    }
  };

  // บันทึก Scenario กลับ Google Sheets
  const handleSaveToSheet = async () => {
    if (!scriptUrl) {
      alert('กรุณากรอก Google Apps Script Web URL ด้านบนก่อนบันทึก');
      return;
    }

    setSyncStatus('saving');
    setSyncMessage('กำลังบันทึกลงชีต...');

    const payload = {
      scenario: `Budget_2027_${activePreset.toUpperCase()}`,
      hospitalTarget2027: hospitalTarget,
      target2027Total: calculatedData.sumTargetTotal,
      growthPercentage: calculatedData.overallGrowth.toFixed(2),
      gap: calculatedData.gap,
      sbuDetails: calculatedData.sbus.map(s => ({
        sbuId: s.id,
        target2027: s.targetTotal,
        growthPct: s.growthPct,
        opdVisitsDay: Math.round(s.opdVisitsPerDay),
        ipdAdmissionsDay: Number(s.admissionsPerDay.toFixed(1))
      }))
    };

    try {
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const newScenario = {
        id: Date.now(),
        name: `Plan 2027 (${activePreset.toUpperCase()}) - ${new Date().toLocaleTimeString('th-TH')}`,
        targetTotal: calculatedData.sumTargetTotal,
        growth: calculatedData.overallGrowth.toFixed(2),
        date: new Date().toLocaleString('th-TH'),
        snapshot: {
          activeTab,
          selectedDeptId,
          hospitalTarget,
          activePreset,
          sbuConfigs
        }
      };
      const nextScenarios = [newScenario, ...savedScenarios];
      setSavedScenarios(nextScenarios);
      localStorage.setItem('revplanner_saved_scenarios', JSON.stringify(nextScenarios));
      setSyncStatus('success');
      setSyncMessage('บันทึก Scenario สำเร็จ!');
      setTimeout(() => setSyncStatus(null), 3000);
    } catch (err) {
      console.error('Save Error:', err);
      setSyncStatus('error');
      setSyncMessage('บันทึกไม่สำเร็จ');
      setTimeout(() => setSyncStatus(null), 3000);
    }
  };

  const handleLoadScenario = (scenario) => {
    const snapshot = scenario?.snapshot;
    if (!snapshot) return;
    setActiveTab(snapshot.activeTab || 'overview');
    setSelectedDeptId(snapshot.selectedDeptId || 'PED');
    setHospitalTarget(Number(snapshot.hospitalTarget) || 0);
    setActivePreset(snapshot.activePreset || 'custom');
    if (Array.isArray(snapshot.sbuConfigs) && snapshot.sbuConfigs.length) {
      setSbuConfigs(snapshot.sbuConfigs);
    }
    setSyncMessage(`โหลด Scenario ${scenario.name} สำเร็จ`);
    setSyncStatus('success');
    setTimeout(() => setSyncStatus(null), 3000);
  };

  const handleDeleteScenario = (scenarioId) => {
    const nextScenarios = savedScenarios.filter(scenario => scenario.id !== scenarioId);
    setSavedScenarios(nextScenarios);
    localStorage.setItem('revplanner_saved_scenarios', JSON.stringify(nextScenarios));
  };

  const handleGrowthChange = (id, newGrowth) => {
    setActivePreset('custom');
    setSbuConfigs(prev => prev.map(sbu => {
      if (sbu.id === id) {
        const growth = parseFloat(newGrowth) || 0;
        let newTarget = sbu.base2026Total > 0 
          ? sbu.base2026Total * (1 + growth / 100)
          : sbu.defaultTarget2027 * (growth / 100);
        return {
          ...sbu,
          growthPct: Math.round(growth * 100) / 100,
          targetTotal: Math.round(newTarget)
        };
      }
      return sbu;
    }));
  };

  const handleTargetChange = (id, newTarget) => {
    setActivePreset('custom');
    setSbuConfigs(prev => prev.map(sbu => {
      if (sbu.id === id) {
        const target = parseFloat(newTarget) || 0;
        const growth = sbu.base2026Total > 0 
          ? ((target - sbu.base2026Total) / sbu.base2026Total) * 100
          : 100;
        return {
          ...sbu,
          growthPct: Math.round(growth * 100) / 100,
          targetTotal: target
        };
      }
      return sbu;
    }));
  };

  const handleSaveFactors = (updated) => {
    setSbuConfigs(prev => prev.map(s => s.id === updated.id ? { ...s, ...updated } : s));
    setEditingFactors(null);
  };

  const applyPresetScenario = (scenarioKey) => {
    const sc = SCENARIOS_2027[scenarioKey];
    if (!sc) return;
    setActivePreset(scenarioKey);
    setHospitalTarget(sc.target);

    // เกลี่ยเป้าหมายตามสัดส่วนฐานปี 2026 ให้ผลรวมเท่ากับเป้าหมายโรงพยาบาลพอดี
    setSbuConfigs(prev => prev.map(sbu => {
      if (sbu.base2026Total > 0) {
        const target = Math.round(sbu.base2026Total * (sc.target / TOTAL_2026_FORECAST));
        const growth = ((target - sbu.base2026Total) / sbu.base2026Total) * 100;
        return {
          ...sbu,
          growthPct: Math.round(growth * 100) / 100,
          targetTotal: target
        };
      } else {
        return {
          ...sbu,
          growthPct: 0,
          targetTotal: 0
        };
      }
    }));
  };

  // ฟังก์ชันเกลี่ยเป้าทุก SBU ให้ลงตัวพอดีกับ Hospital Target อัตโนมัติ
  const handleAutoBalanceToTarget = () => {
    const activeSum = sbuConfigs.reduce((acc, curr) => acc + curr.targetTotal, 0);
    if (activeSum === 0) return;

    const scaleFactor = hospitalTarget / activeSum;
    setSbuConfigs(prev => prev.map(sbu => {
      const newTarget = Math.round(sbu.targetTotal * scaleFactor);
      const newGrowth = sbu.base2026Total > 0
        ? ((newTarget - sbu.base2026Total) / sbu.base2026Total) * 100
        : sbu.growthPct;

      return {
        ...sbu,
        targetTotal: newTarget,
        growthPct: Math.round(newGrowth * 100) / 100
      };
    }));
  };

  // รวมการคำนวณและ Driver ทั้งหมด
  const calculatedData = useMemo(() => {
    const sbus = sbuConfigs.map(sbu => {
      const totalBase = (sbu.base2026Opd + sbu.base2026Ipd) || 1;
      const opdRatio = sbu.id === 'CHECKUP' || sbu.id === 'REHAB'
        ? 1.0
        : (sbu.base2026Opd > 0 ? sbu.base2026Opd / totalBase : 0.2);

      const targetOpd = Math.round(sbu.targetTotal * opdRatio);
      const targetIpd = Math.round(sbu.targetTotal - targetOpd);

      const annualOpdVisits = sbu.opdFactor > 0 ? targetOpd / sbu.opdFactor : 0;
      const opdVisitsPerDay = annualOpdVisits / 365;

      const annualPatientDays = sbu.ipdFactor > 0 ? targetIpd / sbu.ipdFactor : 0;
      const adc = annualPatientDays / 365;
      const admissionsPerDay = sbu.alos > 0 ? adc / sbu.alos : 0;

      return {
        ...sbu,
        targetOpd,
        targetIpd,
        opdVisitsPerDay,
        adc,
        admissionsPerDay
      };
    });

    const sumTargetTotal = sbus.reduce((acc, curr) => acc + curr.targetTotal, 0);
    const sumTargetOpd = sbus.reduce((acc, curr) => acc + curr.targetOpd, 0);
    const sumTargetIpd = sbus.reduce((acc, curr) => acc + curr.targetIpd, 0);
    const sumBase2026 = sbus.reduce((acc, curr) => acc + curr.base2026Total, 0);
    const overallGrowth = sumBase2026 > 0 ? ((sumTargetTotal - sumBase2026) / sumBase2026) * 100 : 0;
    // Keep the selected hospital target for balancing, but compare scenarios
    // against the official Base target so the gap visibly changes per scenario.
    const hospitalGap = sumTargetTotal - hospitalTarget;
    const gap = sumTargetTotal - SCENARIOS_2027.base.target;

    return {
      sbus,
      sumTargetTotal,
      sumTargetOpd,
      sumTargetIpd,
      sumBase2026,
      overallGrowth,
      hospitalGap,
      gap
    };
  }, [sbuConfigs, hospitalTarget]);

  const historicalMonths = historicalYTD[0]?.months || 0;
  const historicalBySbu = useMemo(() => {
    const rows = Array.isArray(historicalYTD) ? historicalYTD : [];
    return rows.reduce((acc, row) => {
      const id = String(row.sbuId || row.SBU_ID || '').trim();
      if (id) acc[id] = row;
      return acc;
    }, {});
  }, [historicalYTD]);

  const factorAlerts = useMemo(() => {
    const definitions = [
      ['OPD Visit / day', 'opdVisitsPerDay', 'opdVisitsPerDay', ' visit/day', 1],
      ['OPD Rev / Charge Visit', 'opdRevenuePerVisit', 'opdFactor', ' บาท/visit', 0],
      ['Admission / day', 'admissionsPerDay', 'admissionsPerDay', ' admission/day', 1],
      ['ALOS', 'alos', 'alos', ' วัน', 1],
      ['IPD Rev / Patient Day', 'ipdRevenuePerPatientDay', 'ipdFactor', ' บาท/pt-day', 0]
    ];
    return calculatedData.sbus.flatMap(sbu => {
      const historical = historicalBySbu[sbu.id] || {};
      return definitions.flatMap(([label, historicalKey, targetKey, suffix, decimals]) => {
        const actual = Number(historical[historicalKey] || 0);
        const target = Number(sbu[targetKey] || 0);
        if (!actual || !target || target >= actual) return [];
        return [{ sbu, label, actual, target, suffix, decimals, change: ((target - actual) / actual) * 100 }];
      });
    });
  }, [calculatedData.sbus, historicalBySbu]);

  // ภาพรวมรายเดือน 12 เดือน
  const monthlyOverallData = useMemo(() => {
    return MONTH_SHORT.map((m, idx) => {
      const weight = SEASONALITY_WEIGHTS_2026[idx];
      const mRev2027 = calculatedData.sumTargetTotal * weight;
      const mOpd = calculatedData.sumTargetOpd * weight;
      const mIpd = calculatedData.sumTargetIpd * weight;
      const mRev2026 = ACTUAL_REV_2026_MONTHLY[idx];

      return {
        month: m,
        fullName: MONTH_NAMES[idx],
        totalRev2027: mRev2027,
        opdRev: mOpd,
        ipdRev: mIpd,
        rev2026: mRev2026,
        totalM: mRev2027 / 1000000,
        opdM: mOpd / 1000000,
        ipdM: mIpd / 1000000,
        act2026M: mRev2026 / 1000000
      };
    });
  }, [calculatedData]);

  // คำนวณเจาะลึก SBU ที่เลือกสำหรับกราฟ OPD แ��ะ IPD
  const selectedSbuDetail = useMemo(() => {
    const sbu = calculatedData.sbus.find(s => s.id === selectedDeptId) || calculatedData.sbus[0];
    const monthly = MONTH_SHORT.map((m, idx) => {
      const weight = SEASONALITY_WEIGHTS_2026[idx];
      const days = DAYS_IN_MONTH[idx];
      
      const mTotalRev = (sbu.targetTotal || 0) * weight;
      const mOpdRev = (sbu.targetOpd || 0) * weight;
      const mIpdRev = (sbu.targetIpd || 0) * weight;

      const opdVisitsDay = sbu.opdFactor > 0 ? (mOpdRev / sbu.opdFactor) / days : 0;
      const adcMonth = sbu.ipdFactor > 0 ? (mIpdRev / sbu.ipdFactor) / days : 0;
      const admDay = sbu.alos > 0 ? adcMonth / sbu.alos : 0;

      return {
        month: m,
        days,
        totalRevM: (mTotalRev / 1000000) || 0,
        opdRevM: (mOpdRev / 1000000) || 0,
        ipdRevM: (mIpdRev / 1000000) || 0,
        opdVisitsDay: Math.round(opdVisitsDay * 10) / 10,
        adcMonth: Math.round(adcMonth),
        admDay: Math.round(admDay * 10) / 10,
        opdFactor: sbu.opdFactor || 0,
        ipdFactor: sbu.ipdFactor || 0
      };
    });

    return { sbu, monthly };
  }, [calculatedData, selectedDeptId]);

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800 font-sans antialiased overflow-hidden">
      
      {/* Sidebar เมนูนำทาง */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm leading-tight">RevPlanner 2027</h1>
              <p className="text-[11px] text-slate-500 font-medium">PPNP Hospital Target Planning</p>
            </div>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Reports & What-If (2027)
          </div>
          
          <button
            onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'overview'
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">SBU What-If Planning 2027</span>
          </button>

          <button
            onClick={() => { setActiveTab('monthly'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'monthly'
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Target SBU 2027 (Monthly)</span>
          </button>

          <button
            onClick={() => { setActiveTab('ipd'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'ipd'
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <BedDouble className="w-4 h-4 flex-shrink-0 text-amber-500" />
            <span className="truncate">Target SBU IPD 2027</span>
          </button>

          <button
            onClick={() => { setActiveTab('opd'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'opd'
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 flex-shrink-0 text-blue-500" />
            <span className="truncate">Target SBU OPD 2027</span>
          </button>

          <button
            onClick={() => { setActiveTab('growth'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'growth'
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <PieChart className="w-4 h-4 flex-shrink-0 text-emerald-500" />
            <span className="truncate">Estimate SBU Growth 2027</span>
          </button>

          <div className="pt-4 px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Database & Sync
          </div>

          <button
            onClick={() => { setActiveTab('sync'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'sync'
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span className="truncate">Google Sheets Connector</span>
          </button>
        </nav>

        {/* Sync Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium">
              <span className={`w-2 h-2 rounded-full ${scriptUrl ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
              {scriptUrl ? 'เชื่อมต่อชีตแล้ว' : 'ยังไม่ได้เชื่อมต่อ'}
            </span>
            <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-700 font-mono">
              2026: 983.95M
            </span>
          </div>

          <button
            onClick={handleSaveToSheet}
            disabled={syncStatus === 'saving' || syncStatus === 'fetching'}
            className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition disabled:opacity-50"
          >
            {syncStatus === 'saving' || syncStatus === 'fetching' ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {syncStatus === 'saving' ? 'กำลังบันทึกลงชีต...' : 'Save 2027 Scenario'}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* แถบกรอก Web URL เด่นชัดด้านบนสุด */}
        <div className="bg-slate-900 text-white px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-sm flex-shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
            <span className="flex items-center gap-1.5 text-blue-300">
              <Link className="w-4 h-4 text-blue-400" />
              Google Apps Script Web URL:
            </span>
          </div>

          <div className="flex-1 max-w-2xl flex items-center gap-2">
            <input
              type="url"
              placeholder="วาง https://script.google.com/macros/s/.../exec ที่นี่..."
              value={urlInputValue}
              onChange={(e) => setUrlInputValue(e.target.value)}
              className="w-full bg-slate-800 text-slate-100 placeholder-slate-400 px-3 py-1.5 text-xs rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 font-mono tracking-tight"
            />
            <button
              onClick={handleSaveUrlDirectly}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 whitespace-nowrap shadow-xs"
            >
              <Check className="w-3.5 h-3.5" /> เชื่อมต่อ & Sync
            </button>
          </div>

          <div className="flex items-center gap-2">
            {syncStatus === 'success' && (
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {syncMessage}
              </span>
            )}
            {syncStatus === 'error' && (
              <span className="text-[11px] font-bold text-rose-300 bg-rose-950/80 border border-rose-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {syncMessage}
              </span>
            )}
            {syncStatus === 'fetching' && (
              <span className="text-[11px] font-bold text-amber-300 bg-amber-950/80 border border-amber-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" /> {syncMessage}
              </span>
            )}
          </div>
        </div>

        {/* Top Header */}
        <header className="h-14 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm md:text-base font-black text-slate-900 flex items-center gap-2">
                Draft Target Rev SBU 2027
                <span className="text-[11px] font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  Base 2026: {formatMillion(calculatedData.sumBase2026)}
                </span>
              </h2>
            </div>
          </div>

          {/* ปุ่มเลือกสถานการณ์จำลอง (Presets) */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs">
              <button
                onClick={() => applyPresetScenario('worst')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  activePreset === 'worst' ? 'bg-white text-rose-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Worst (+3.5%)
              </button>
              <button
                onClick={() => applyPresetScenario('base')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  activePreset === 'base' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Base (+7.2%)
              </button>
              <button
                onClick={() => applyPresetScenario('best')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  activePreset === 'best' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Best (+10.8%)
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          
          {/* ========================================================================= */}
          {/* TOP KPI BAR: ปรับ Typography ฟอนต์ Sans-Serif มาตรฐานเดียวกับแดชบอร์���� */}
          {/* ========================================================================= */}
          <section className="bg-white rounded-2xl p-4 md:p-5 shadow-xs border border-slate-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* Box 1: Hospital Target 2027 (ใช้ Font-Sans ตัวหนาแบบเดี���วกับ Box 2) */}
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-semibold uppercase tracking-wider">HOSPITAL TARGET 2027</span>
                    <button 
                      type="button" 
                      className="text-[10px] text-blue-600 font-semibold hover:underline" 
                      onClick={() => applyPresetScenario('base')}
                    >
                      Reset Base
                    </button>
                  </div>
                  
                  {/* ช่องกรอกใช้ font-sans เดียวกันกับค่าใน Box 2 */}
                  <div className="relative flex items-center group mt-1">
                    <NumberInputWithComma
                      value={hospitalTarget}
                      onChange={(newVal) => {
                        setHospitalTarget(newVal);
                        setActivePreset('custom');
                      }}
                      className="w-full text-xl md:text-2xl font-black text-slate-900 bg-transparent border-b border-dashed border-slate-300 hover:border-blue-400 focus:border-blue-600 focus:outline-none tracking-tight py-0.5 transition-colors cursor-text"
                    />
                    <Edit3 className="w-4 h-4 text-slate-400 opacity-40 group-hover:opacity-100 transition-opacity absolute right-1 pointer-events-none" />
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 font-medium mt-1.5">
                  = {formatBillion(hospitalTarget)} บาท ({formatMillion(hospitalTarget)})
                </div>
              </div>

              {/* Box 2: Simulated Target 2027 */}
              <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">
                    SIMULATED TARGET 2027
                  </div>
                  <div className="text-xl md:text-2xl font-black text-blue-950 tracking-tight py-0.5 mt-1">
                    {formatBillion(calculatedData.sumTargetTotal)}
                  </div>
                </div>
                <div className="text-[11px] text-blue-700 font-medium mt-1.5 flex items-center gap-1">
                  <span className="text-emerald-600 font-bold flex items-center">
                    <ArrowUpRight className="w-3 h-3" />+{calculatedData.overallGrowth.toFixed(2)}%
                  </span>
                  <span>vs 2026 ({formatMillion(calculatedData.sumBase2026)})</span>
                </div>
              </div>

              {/* Box 3: Gap to Target 2027 */}
              <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${
Math.abs(calculatedData.gap) < 200000
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                  : calculatedData.gap > 0
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50/60 border-rose-200 text-rose-900'
              }`}>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>GAP VS BASE TARGET 2027</span>
                    {Math.abs(calculatedData.hospitalGap) < 200000 ? (
                      <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded font-bold">MATCHED HOSPITAL</span>
                    ) : (
                      <button
                        onClick={handleAutoBalanceToTarget}
                        className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white px-1.5 py-0.5 rounded font-bold transition flex items-center gap-0.5 cursor-pointer shadow-xs"
                        title="คลิกเพื่อเกลี่ยเป้า SBU ทั้งหมดให้เท่ากับเป้าโรงพยาบาลพอดี"
                      >
                        <Sparkles className="w-2.5 h-2.5" /> Auto-Balance
                      </button>
                    )}
                  </div>
                  <div className="text-xl md:text-2xl font-black tracking-tight py-0.5 mt-1 flex items-center gap-1">
                    {calculatedData.gap >= 0 ? `+${formatMillion(calculatedData.gap)}` : `${formatMillion(calculatedData.gap)}`}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-1.5 truncate">
                  {Math.abs(calculatedData.gap) < 200000
                    ? 'เท่ากับเป้าหมาย Base 2027'
                    : calculatedData.gap > 0
                      ? 'สูงกว่าเป้าหมาย Base 2027'
                      : 'ต่ำกว่าเป้าหมาย Base 2027'}
                </div>
              </div>

              {/* Box 4: OPD / IPD Ratio 2027 */}
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
                    TARGET OPD / IPD RATIO (2027)
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 py-0.5 mt-1 font-sans">
                    <span className="text-blue-600">OPD: {formatMillion(calculatedData.sumTargetOpd)}</span>
                    <span className="text-amber-600">IPD: {formatMillion(calculatedData.sumTargetIpd)}</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex mt-2">
                  <div 
                    className="bg-blue-600 h-full" 
                    style={{ width: `${(calculatedData.sumTargetOpd / calculatedData.sumTargetTotal) * 100}%` }}
                    title="OPD"
                  ></div>
                  <div 
                    className="bg-amber-500 h-full" 
                    style={{ width: `${(calculatedData.sumTargetIpd / calculatedData.sumTargetTotal) * 100}%` }}
                    title="IPD"
                  ></div>
                </div>
              </div>

            </div>
          </section>

          {/* ========================================================= */}
          {/* TAB 1: SBU WHAT-IF PLANNING */}
          {/* ========================================================= */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-blue-600" />
                      ปรับ % Growth ปี 2027 และคำนวณย้อนกลับหา Drivers
                    </h3>
                    <p className="text-xs text-slate-400">เปรียบเทียบกับฐานเต���มปี 2026 ({formatMillion(calculatedData.sumBase2026)})</p>
                  </div>
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    11 SBU Portfolios
                  </span>
                </div>

                <div className="space-y-3">
                  {calculatedData.sbus.map((sbu) => (
                    <div
                      key={sbu.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        selectedDeptId === sbu.id 
                          ? 'border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/10' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sbu.color }}></span>
                          <span 
                            onClick={() => setSelectedDeptId(sbu.id)}
                            className="font-bold text-slate-900 text-xs md:text-sm hover:text-blue-600 cursor-pointer font-sans"
                          >
                            {sbu.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-sans">
                            ('26 Base: {formatMillion(sbu.base2026Total)})
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-sans">
                          <span className="text-slate-400">Target '27:</span>
                          <NumberInputWithComma
                            value={sbu.targetTotal}
                            onChange={(val) => handleTargetChange(sbu.id, val)}
                            className="w-32 text-right px-2 py-0.5 border border-slate-200 rounded font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-sans"
                          />
                          <span className="text-slate-400">฿</span>

                          <input
                            type="number"
                            value={sbu.growthPct}
                            onChange={(e) => handleGrowthChange(sbu.id, e.target.value)}
                            step="0.1"
                            className={`w-16 text-right px-1.5 py-0.5 border rounded font-bold text-xs font-sans ${
                              sbu.growthPct >= 0 
                                ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                                : 'text-rose-700 bg-rose-50 border-rose-200'
                            }`}
                          />
                          <span className="font-bold text-slate-500">%</span>

                          <button
                            onClick={() => setEditingFactors(sbu)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 ml-1"
                            title="แก้ไข Factors (Rev/Visit, ALOS, Rev/PatientDay)"
                          >
                            <Settings2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mb-2.5">
                        <input
                          type="range"
                          min="-10"
                          max="40"
                          step="0.1"
                          value={sbu.growthPct}
                          onChange={(e) => handleGrowthChange(sbu.id, e.target.value)}
                          className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600 bg-slate-50/50 p-2 rounded-lg font-sans">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Target OPD Rev 2027</span>
                          <span className="font-semibold text-blue-700">{formatMillion(sbu.targetOpd)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Req. OPD Visit/Day</span>
                          <span className="font-semibold text-slate-800 flex items-center gap-1">
                            <Users className="w-3 h-3 text-blue-500" />
                            {Math.round(sbu.opdVisitsPerDay)} v/d
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Target IPD Rev 2027</span>
                          <span className="font-semibold text-amber-700">{formatMillion(sbu.targetIpd)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Req. Adm / Day (ADC)</span>
                          <span className="font-semibold text-slate-800 flex items-center gap-1">
                            <BedDouble className="w-3 h-3 text-amber-500" />
                            {sbu.admissionsPerDay.toFixed(1)} adm ({Math.round(sbu.adc)} beds)
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: SBU Monthly Preview */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-900 text-xs md:text-sm flex items-center gap-2 font-sans">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      {selectedSbuDetail.sbu.name} - Monthly Target 2027
                    </h4>
                    <select
                      value={selectedDeptId}
                      onChange={(e) => setSelectedDeptId(e.target.value)}
                      className="text-xs font-semibold bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-sans"
                    >
                      {calculatedData.sbus.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <p className="text-xs text-slate-400 mb-4 font-sans">
                    ��ารกระจายเป้ารายได้ 12 เดือนของปี 2027 อิงตาม Seasonality จริงจากปี 2026
                  </p>

                  <div className="h-60 w-full relative">
                    <svg className="w-full h-full" viewBox="0 0 420 210">
                      <line x1="30" y1="20" x2="410" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="30" y1="70" x2="410" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="30" y1="120" x2="410" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="30" y1="170" x2="410" y2="170" stroke="#cbd5e1" strokeWidth="1" />

                      {selectedSbuDetail.monthly.map((m, idx) => {
                        const x = 35 + idx * 31;
                        const maxVal = Math.max(...selectedSbuDetail.monthly.map(d => d.totalRevM || 0), 1);
                        const totalHeight = ((m.totalRevM || 0) / (maxVal * 1.15)) * 140;
                        const opdHeight = ((m.opdRevM || 0) / (maxVal * 1.15)) * 140;
                        const ipdHeight = totalHeight - opdHeight;
                        const yTotal = 170 - totalHeight;
                        const yOpd = 170 - opdHeight;
                        const yIpd = yTotal;

                        return (
                          <g key={idx}>
                            {ipdHeight > 0 && (
                              <rect x={x} y={yIpd} width="20" height={ipdHeight} fill="#f59e0b" rx="2" />
                            )}
                            {opdHeight > 0 && (
                              <rect x={x} y={yOpd} width="20" height={opdHeight} fill="#3b82f6" rx="2" />
                            )}
                            <text x={x + 10} y={yTotal - 4} fontSize="8" fill="#64748b" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">
                              {m.totalRevM.toFixed(1)}
                            </text>
                            <text x={x + 10} y="185" fontSize="9" fill="#94a3b8" textAnchor="middle" fontFamily="sans-serif">
                              {m.month}
                            </text>
                          </g>
                        );
                      })}
                    </svg>

                    <div className="flex items-center justify-center gap-5 text-xs text-slate-600 mt-2 font-sans">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-blue-500"></span> OPD Rev (M)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-amber-500"></span> IPD Rev (M)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center font-sans">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-400 block">Rev / OPD Visit</span>
                      <span className="font-bold text-xs text-blue-700">฿{selectedSbuDetail.sbu.opdFactor.toLocaleString()}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-400 block">Rev / Pt-Day</span>
                      <span className="font-bold text-xs text-amber-700">฿{selectedSbuDetail.sbu.ipdFactor.toLocaleString()}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-400 block">Avg ALOS</span>
                      <span className="font-bold text-xs text-slate-800">{selectedSbuDetail.sbu.alos} วัน</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-xs md:text-sm mb-3 font-sans">
                    สัดส่วนรายได้เป้าหมายปี 2027 ราย SBU
                  </h4>
                  <div className="space-y-2 font-sans">
                    {calculatedData.sbus.map((s) => {
                      const share = (s.targetTotal / calculatedData.sumTargetTotal) * 100;
                      return (
                        <div key={s.id} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-slate-700">{s.name}</span>
                            <span className="font-bold text-slate-900">{formatMillion(s.targetTotal)} ({share.toFixed(1)}%)</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${share}%`, backgroundColor: s.color }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <section className="lg:col-span-12 bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Database className="w-4 h-4 text-emerald-600" />
                      Historical Benchmark: Actual YTD และ Annualized Floor ราย SBU
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">เป้าหมายปี 2027 ควรไม่ต่ำกว่า Run Rate จากข้อมูลจริงที่กรอกใน Historical_Actual_YTD</p>
                  </div>
                  <div className="flex items-center gap-2">
  <button
  onClick={() => setComparisonSbuId(calculatedData.sbus[0]?.id || null)}
  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-700 transition hover:bg-blue-100"
  >
  <Eye className="w-3.5 h-3.5" />
  ดู Factor Comparison
  </button>
  <button
  onClick={() => setFactorReviewOpen(true)}
  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold transition ${factorAlerts.length > 0 ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100' : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
  >
  <AlertTriangle className="w-3.5 h-3.5" />
  Review Factor Alerts{factorAlerts.length > 0 ? ` · ${factorAlerts.length}` : ''}
  </button>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">{historicalYTD.length} SBU loaded</span>
                  </div>
                </div>
                {historicalYTD.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4 text-xs text-amber-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" /> ยังไม่มีข้อมูล Historical 8 เดือน กรุณากรอกข้อมูลใน Google Sheet แล้วกด Sync ใหม่
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] text-xs font-sans">
                      <thead><tr className="text-left text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                        <th className="py-2 pr-3">SBU</th><th className="py-2 pr-3">Actual YTD</th><th className="py-2 pr-3">Annualized Floor</th><th className="py-2 pr-3">Target 2027</th><th className="py-2 pr-3">Gap vs Floor</th><th className="py-2 pr-3">Actual Factors ({historicalMonths ? `M${historicalMonths}` : 'YTD'})</th><th className="py-2">Status</th>
                      </tr></thead>
                      <tbody>
                        {calculatedData.sbus.map((sbu) => {
                          const h = historicalBySbu[sbu.id];
                          const floor = Number(h?.annualizedTotalRevenue || h?.totalRevenueYTD ? (Number(h.totalRevenueYTD) / Math.max(1, Number(h.months || 8)) * 12) : 0);
                          const gap = sbu.targetTotal - floor;
                          const hasData = floor > 0;
                          return <tr key={sbu.id} className="border-b border-slate-50 last:border-0 align-top">
                            <td className="py-3 pr-3 font-bold text-slate-800">{sbu.name}</td>
                            <td className="py-3 pr-3 text-slate-600">{hasData ? formatMillion(h.totalRevenueYTD) : '—'}<span className="block text-[10px] text-slate-400">{hasData ? `${h.months || 8} เดือน` : 'ไม่มีข้อมูล'}</span></td>
                            <td className="py-3 pr-3 font-bold text-emerald-700">{hasData ? formatMillion(floor) : '—'}</td>
                            <td className="py-3 pr-3 font-bold text-blue-700">{formatMillion(sbu.targetTotal)}</td>
                            <td className={`py-3 pr-3 font-bold ${!hasData ? 'text-slate-400' : gap >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{hasData ? `${gap >= 0 ? '+' : ''}${formatMillion(gap)}` : '—'}</td>
                            <td className="py-3 pr-3 text-[10px] text-slate-600 leading-5">{hasData ? `OPD ${Number(h.opdVisitsPerDay || 0).toFixed(1)} v/d · ฿${formatTHB(h.opdRevenuePerVisit)} / visit · Adm ${Number(h.admissionsPerDay || 0).toFixed(1)} / d · ALOS ${Number(h.alos || 0).toFixed(1)} · ฿${formatTHB(h.ipdRevenuePerPatientDay)} / pt-day` : '—'}</td>
                            <td className="py-3">{!hasData ? <span className="text-slate-400">No baseline</span> : gap >= 0 ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700"><CheckCircle2 className="w-3 h-3" /> Above floor</span> : <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-700"><AlertTriangle className="w-3 h-3" /> Below floor</span>}</td>
                          </tr>;
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: TARGET SBU 2027 (MONTHLY) */}
          {/* ========================================================= */}
          {activeTab === 'monthly' && (
            <div className="space-y-6 font-sans">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                      Target Total Rev 2027
                    </span>
                    <div className="text-3xl font-black text-emerald-600">
                      {formatBillion(calculatedData.sumTargetTotal)}
                    </div>
                    <span className="text-xs text-slate-500 font-medium mt-1 block">
                      AVG Rev / MO: {formatMillion(calculatedData.sumTargetTotal / 12)}
                    </span>
                  </div>

                  <div className="pt-4 md:pt-0">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                      Target OPD Rev 2027
                    </span>
                    <div className="text-3xl font-black text-blue-600">
                      {formatMillion(calculatedData.sumTargetOpd)}
                    </div>
                    <span className="text-xs text-slate-500 font-medium mt-1 block">
                      AVG OPD / MO: {formatMillion(calculatedData.sumTargetOpd / 12)}
                    </span>
                  </div>

                  <div className="pt-4 md:pt-0">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                      Target IPD Rev 2027
                    </span>
                    <div className="text-3xl font-black text-amber-600">
                      {formatMillion(calculatedData.sumTargetIpd)}
                    </div>
                    <span className="text-xs text-slate-500 font-medium mt-1 block">
                      AVG IPD / MO: {formatMillion(calculatedData.sumTargetIpd / 12)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Monthly Revenue Target Comparison (2027 Target vs 2026 Forecast)
                    </h3>
                    <p className="text-xs text-slate-400">
                      เ���รียบเทียบเป้ารายเดือนปี 2027 แยก OPD/IPD กับตัวเลขจริง/ประมาณการปี 2026 จากไฟล์ Excel
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-blue-600 rounded"></span> OPD Rev 2027
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-amber-500 rounded"></span> IPD Rev 2027
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-600">
                      <span className="w-4 h-0.5 bg-emerald-500"></span> Total Rev 2027
                    </span>
                    <span className="flex items-center gap-1.5 text-pink-500">
                      <span className="w-4 h-0.5 border-b border-pink-400 border-dashed"></span> Forecast 2026 (Excel)
                    </span>
                  </div>
                </div>

                <div className="h-80 w-full overflow-x-auto">
                  <svg className="w-full h-full min-w-[700px]" viewBox="0 0 850 280">
                    {[0, 25, 50, 75, 100, 125].map((val, idx) => {
                      const y = 240 - (val / 130) * 220;
                      return (
                        <g key={idx}>
                          <line x1="40" y1={y} x2="820" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                          <text x="35" y={y + 4} fontSize="10" fill="#94a3b8" textAnchor="end" fontFamily="sans-serif">{val}M</text>
                        </g>
                      );
                    })}
                    <line x1="40" y1="240" x2="820" y2="240" stroke="#cbd5e1" strokeWidth="1" />

                    {monthlyOverallData.map((m, idx) => {
                      const x = 55 + idx * 64;
                      const opdHeight = ((m.opdM || 0) / 130) * 220;
                      const ipdHeight = ((m.ipdM || 0) / 130) * 220;
                      const yOpd = 240 - opdHeight;
                      const yIpd = yOpd - ipdHeight;

                      return (
                        <g key={idx}>
                          <rect x={x} y={yIpd} width="34" height={Math.max(ipdHeight, 2)} fill="#f59e0b" rx="3" />
                          <text x={x + 17} y={yIpd + ipdHeight / 2 + 3} fontSize="8" fill="#ffffff" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">
                            {m.ipdM.toFixed(1)}M
                          </text>
                          <rect x={x} y={yOpd} width="34" height={Math.max(opdHeight, 2)} fill="#2563eb" rx="3" />
                          <text x={x + 17} y={yOpd + opdHeight / 2 + 3} fontSize="8" fill="#ffffff" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">
                            {m.opdM.toFixed(1)}M
                          </text>
                          <text x={x + 17} y="256" fontSize="11" fill="#64748b" textAnchor="middle" fontWeight="500" fontFamily="sans-serif">
                            {m.month}
                          </text>
                        </g>
                      );
                    })}

                    <path
                      d={monthlyOverallData.map((m, idx) => {
                        const x = 55 + idx * 64 + 17;
                        const y = 240 - ((m.act2026M || 0) / 130) * 220;
                        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#ec4899"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />

                    <path
                      d={monthlyOverallData.map((m, idx) => {
                        const x = 55 + idx * 64 + 17;
                        const y = 240 - ((m.totalM || 0) / 130) * 220;
                        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                    />

                    {monthlyOverallData.map((m, idx) => {
                      const x = 55 + idx * 64 + 17;
                      const y = 240 - ((m.totalM || 0) / 130) * 220;
                      return (
                        <g key={idx}>
                          <circle cx={x} cy={y} r="4" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                          <text x={x - 8} y={y - 8} fontSize="10" fill="#065f46" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">
                            {m.totalM.toFixed(1)}M
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: TARGET SBU IPD 2027 (พร้อม Label ครบทั้ง ADC & Adm/Day และกราฟ Rate) */}
          {/* ========================================================= */}
          {activeTab === 'ipd' && (
            <div className="space-y-6 font-sans">
              <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department:</span>
                    <select
                      value={selectedDeptId}
                      onChange={(e) => setSelectedDeptId(e.target.value)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                    >
                      {calculatedData.sbus.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    *โมเดลจำลองตัวชี้วัด IPD ประจำปี 2027 (Fixed Rev / Patient Day)
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-center font-sans">
                  <div className="p-3.5 bg-blue-50/40 rounded-xl border border-blue-200/60">
                    <span className="text-[11px] font-bold text-blue-600 block mb-1">Target IPD Rev 2027</span>
                    <div className="text-xl md:text-2xl font-black text-blue-950">
                      {formatMillion(selectedSbuDetail.sbu.targetIpd)}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">Admission / Day</span>
                    <div className="text-xl md:text-2xl font-black text-slate-900">
                      {selectedSbuDetail.sbu.admissionsPerDay.toFixed(1)}
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                      +{selectedSbuDetail.sbu.growthPct}% vs 2026
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">ALOS</span>
                    <div className="text-xl md:text-2xl font-black text-slate-900">
                      {selectedSbuDetail.sbu.alos}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">วันนอนเฉลี่ย</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">IPD / Patient Day</span>
                    <div className="text-xl md:text-2xl font-black text-slate-900">
                      {selectedSbuDetail.sbu.ipdFactor.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">฿ / วันนอน (Fixed)</span>
                  </div>

                  <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200">
                    <span className="text-[11px] font-bold text-emerald-700 block mb-1">Avg Daily Census (ADC)</span>
                    <div className="text-xl md:text-2xl font-black text-emerald-950">
                      {Math.round(selectedSbuDetail.sbu.adc)}
                    </div>
                    <span className="text-[10px] text-emerald-600 block mt-0.5">เตียง / วัน</span>
                  </div>
                </div>
              </div>

              {/* กราฟแท่ง 1: Monthly IPD Revenue รายเดือน */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-slate-900 text-sm">
                    Monthly IPD Revenue 2027 ({selectedSbuDetail.sbu.name})
                  </h4>
                  <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded">
                    Total: {formatMillion(selectedSbuDetail.sbu.targetIpd)}
                  </span>
                </div>

                <div className="w-full h-64 overflow-x-auto">
                  <svg className="w-full h-full min-w-[700px]" viewBox="0 0 750 200">
                    <line x1="30" y1="160" x2="730" y2="160" stroke="#cbd5e1" strokeWidth="1" />
                    {selectedSbuDetail.monthly.map((m, idx) => {
                      const x = 45 + idx * 56;
                      const maxVal = Math.max(...selectedSbuDetail.monthly.map(d => d.ipdRevM || 0), 1);
                      const barHeight = ((m.ipdRevM || 0) / (maxVal * 1.2)) * 130;
                      const y = 160 - barHeight;

                      return (
                        <g key={idx}>
                          <rect x={x} y={y} width="32" height={Math.max(barHeight, 2)} fill="#f59e0b" rx="4" />
                          <text x={x + 16} y={y - 6} fontSize="10" fill="#78350f" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">
                            {m.ipdRevM.toFixed(1)}M
                          </text>
                          <text x={x + 16} y="178" fontSize="11" fill="#64748b" textAnchor="middle" fontWeight="500" fontFamily="sans-serif">
                            {m.month}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* กราฟเส้น 2: Daily Drivers (Admission/Day vs ADC) */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Target Admission/Day vs ADC ({selectedSbuDetail.sbu.name})</h4>
                    <p className="text-xs text-slate-400">อัตราการครองเตียงเฉลี่ย (ADC) และยอดรับคนไข้ใหม่ต่อวัน (Admission/Day)</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold font-sans">
                      <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg">
                        <span className="w-3 h-0.5 bg-blue-600"></span> Admission/Day: {selectedSbuDetail.sbu.admissionsPerDay.toFixed(1)}
                      </span>
                      <span className="flex items-center gap-1.5 text-pink-600 bg-pink-50 px-2.5 py-1.5 rounded-lg">
                        <span className="w-3 h-0.5 bg-pink-600"></span> ADC (Beds): {Math.round(selectedSbuDetail.sbu.adc)}
                      </span>
                  </div>
                </div>

                <div className="w-full h-56 overflow-x-auto">
                  <svg className="w-full h-full min-w-[700px]" viewBox="0 0 750 180">
                    <line x1="30" y1="40" x2="730" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="30" y1="90" x2="730" y2="90" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="30" y1="145" x2="730" y2="145" stroke="#cbd5e1" strokeWidth="1" />
                    
                    {/* ADC Path */}
                    <path
                      d={selectedSbuDetail.monthly.map((m, idx) => {
                        const x = 45 + idx * 56 + 16;
                        const maxAdc = Math.max(...selectedSbuDetail.monthly.map(d => d.adcMonth || 0), 1);
                        const y = 145 - ((m.adcMonth || 0) / (maxAdc * 1.35)) * 100;
                        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#ec4899"
                      strokeWidth="2.5"
                    />

                    {/* Admission/Day Path */}
                    <path
                      d={selectedSbuDetail.monthly.map((m, idx) => {
                        const x = 45 + idx * 56 + 16;
                        const maxAdm = Math.max(...selectedSbuDetail.monthly.map(d => d.admDay || 0), 1);
                        const y = 155 - ((m.admDay || 0) / (maxAdm * 1.5)) * 50;
                        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2.5"
                    />

                    {selectedSbuDetail.monthly.map((m, idx) => {
                      const x = 45 + idx * 56 + 16;
                      const maxAdc = Math.max(...selectedSbuDetail.monthly.map(d => d.adcMonth || 0), 1);
                      const maxAdm = Math.max(...selectedSbuDetail.monthly.map(d => d.admDay || 0), 1);
                      const yAdc = 145 - ((m.adcMonth || 0) / (maxAdc * 1.35)) * 100;
                      const yAdm = 155 - ((m.admDay || 0) / (maxAdm * 1.5)) * 50;

                      return (
                        <g key={idx}>
                          {/* ADC Dot & Label */}
                          <circle cx={x} cy={yAdc} r="4" fill="#ec4899" stroke="#fff" strokeWidth="1.5" />
                          <text x={x} y={yAdc - 7} fontSize="10" fill="#be185d" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">
                            {m.adcMonth}
                          </text>

                          {/* Admission/Day Dot & Label */}
                          <circle cx={x} cy={yAdm} r="4" fill="#2563eb" stroke="#fff" strokeWidth="1.5" />
                          <text x={x} y={yAdm - 7} fontSize="10" fill="#1d4ed8" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">
                            {typeof m.admDay === 'number' ? m.admDay.toFixed(1) : m.admDay}
                          </text>

                          {/* Month Label */}
                          <text x={x} y="165" fontSize="11" fill="#64748b" textAnchor="middle" fontWeight="500" fontFamily="sans-serif">
                            {m.month}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* กราฟเส้น 3: Fixed IPD / Patient Day */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">IPD / Patient Day Rate ({selectedSbuDetail.sbu.name})</h4>
                    <p className="text-xs text-slate-400">อัตราค่าบริการเฉลี่ยต่อวันนอน (Fixed Parameter: ฿{selectedSbuDetail.sbu.ipdFactor.toLocaleString()})</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    ฿{selectedSbuDetail.sbu.ipdFactor.toLocaleString()} / วันนอน
                  </span>
                </div>

                <div className="w-full h-32 overflow-x-auto">
                  <svg className="w-full h-full min-w-[700px]" viewBox="0 0 750 90">
                    <line x1="30" y1="65" x2="730" y2="65" stroke="#cbd5e1" strokeWidth="1" />
                    
                    <line x1="45" y1="35" x2="705" y2="35" stroke="#10b981" strokeWidth="2.5" />
                    {selectedSbuDetail.monthly.map((m, idx) => {
                      const x = 45 + idx * 56 + 16;
                      return (
                        <g key={idx}>
                          <circle cx={x} cy="35" r="4" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
                          <text x={x} y={24} fontSize="9" fill="#047857" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">
                            {selectedSbuDetail.sbu.ipdFactor.toLocaleString()}
                          </text>
                          <text x={x} y="80" fontSize="10" fill="#94a3b8" textAnchor="middle" fontFamily="sans-serif">
                            {m.month}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: TARGET SBU OPD 2027 */}
          {/* ========================================================= */}
          {activeTab === 'opd' && (
            <div className="space-y-6 font-sans">
              <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department:</span>
                    <select
                      value={selectedDeptId}
                      onChange={(e) => setSelectedDeptId(e.target.value)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                    >
                      {calculatedData.sbus.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    *โมเดลจำลองตัวชี้วัด OPD ประจำปี 2027 (Fixed Rev / Visit)
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center font-sans">
                  <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200/80">
                    <span className="text-xs font-bold text-blue-600 block mb-1">Target OPD Rev 2027</span>
                    <div className="text-2xl md:text-3xl font-black text-blue-950">
                      {formatMillion(selectedSbuDetail.sbu.targetOpd)}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-500 block mb-1">AVG Charge Visit / Day</span>
                    <div className="text-2xl md:text-3xl font-black text-slate-900">
                      {Math.round(selectedSbuDetail.sbu.opdVisitsPerDay)}
                    </div>
                    <span className="text-xs text-slate-400 block mt-0.5">คนไข้ต่อวัน</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-500 block mb-1">AVG OPD / Charge Visit (2027)</span>
                    <div className="text-2xl md:text-3xl font-black text-emerald-700">
                      {selectedSbuDetail.sbu.opdFactor.toLocaleString()}
                    </div>
                    <span className="text-xs text-slate-400 block mt-0.5">บาท / ครั้ง (Fixed Factor)</span>
                  </div>
                </div>
              </div>

              {/* กราฟแท่ง 1: Monthly OPD Revenue รายเดือน */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-slate-900 text-sm">
                    Monthly OPD Revenue 2027 ({selectedSbuDetail.sbu.name})
                  </h4>
                  <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded">
                    Total: {formatMillion(selectedSbuDetail.sbu.targetOpd)}
                  </span>
                </div>

                <div className="w-full h-64 overflow-x-auto">
                  <svg className="w-full h-full min-w-[700px]" viewBox="0 0 750 200">
                    <line x1="30" y1="160" x2="730" y2="160" stroke="#cbd5e1" strokeWidth="1" />
                    {selectedSbuDetail.monthly.map((m, idx) => {
                      const x = 45 + idx * 56;
                      const maxVal = Math.max(...selectedSbuDetail.monthly.map(d => d.opdRevM || 0), 1);
                      const barHeight = ((m.opdRevM || 0) / (maxVal * 1.2)) * 130;
                      const y = 160 - barHeight;

                      return (
                        <g key={idx}>
                          <rect x={x} y={y} width="32" height={Math.max(barHeight, 2)} fill="#2563eb" rx="4" />
                          <text x={x + 16} y={y - 6} fontSize="10" fill="#1e3a8a" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">
                            {m.opdRevM.toFixed(1)}M
                          </text>
                          <text x={x + 16} y="178" fontSize="11" fill="#64748b" textAnchor="middle" fontWeight="500" fontFamily="sans-serif">
                            {m.month}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* กราฟเส้น 2: Target Charge Visits / Day */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Target Charge Visits / Day ({selectedSbuDetail.sbu.name})</h4>
                    <p className="text-xs text-slate-400">จำนวนการตรวจต่อวันรายเดือนที่ต้องทำให้ได้ตามเป้าหมาย</p>
                  </div>
                  <span className="text-xs text-orange-600 font-semibold bg-orange-50 px-2 py-1 rounded font-sans">
                    Avg: {Math.round(selectedSbuDetail.sbu.opdVisitsPerDay)} visits/day
                  </span>
                </div>

                <div className="w-full h-56 overflow-x-auto">
                  <svg className="w-full h-full min-w-[700px]" viewBox="0 0 750 170">
                    <line x1="30" y1="135" x2="730" y2="135" stroke="#cbd5e1" strokeWidth="1" />
                    
                    <path
                      d={selectedSbuDetail.monthly.map((m, idx) => {
                        const x = 45 + idx * 56 + 16;
                        const maxV = Math.max(...selectedSbuDetail.monthly.map(d => d.opdVisitsDay || 0), 1);
                        const y = 135 - ((m.opdVisitsDay || 0) / (maxV * 1.3)) * 100;
                        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#ea580c"
                      strokeWidth="2.5"
                    />

                    {selectedSbuDetail.monthly.map((m, idx) => {
                      const x = 45 + idx * 56 + 16;
                      const maxV = Math.max(...selectedSbuDetail.monthly.map(d => d.opdVisitsDay || 0), 1);
                      const y = 135 - ((m.opdVisitsDay || 0) / (maxV * 1.3)) * 100;

                      return (
                        <g key={idx}>
                          <circle cx={x} cy={y} r="4" fill="#ea580c" stroke="#fff" strokeWidth="1.5" />
                          <text x={x} y={y - 7} fontSize="10" fill="#c2410c" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">
                            {m.opdVisitsDay}
                          </text>
                          <text x={x} y="152" fontSize="11" fill="#94a3b8" textAnchor="middle" fontFamily="sans-serif">
                            {m.month}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* กราฟเส้น 3: Fixed AVG OPD / Charge Visit */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">AVG OPD / Charge Visit Rate ({selectedSbuDetail.sbu.name})</h4>
                    <p className="text-xs text-slate-400">อัตราค่าบริการเฉลี่ยต่อการตรวจ (Fixed Parameter: ฿{selectedSbuDetail.sbu.opdFactor.toLocaleString()})</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    ฿{selectedSbuDetail.sbu.opdFactor.toLocaleString()} / visit
                  </span>
                </div>

                <div className="w-full h-32 overflow-x-auto">
                  <svg className="w-full h-full min-w-[700px]" viewBox="0 0 750 90">
                    <line x1="30" y1="65" x2="730" y2="65" stroke="#cbd5e1" strokeWidth="1" />
                    
                    <line x1="45" y1="35" x2="705" y2="35" stroke="#10b981" strokeWidth="2.5" />
                    {selectedSbuDetail.monthly.map((m, idx) => {
                      const x = 45 + idx * 56 + 16;
                      return (
                        <g key={idx}>
                          <circle cx={x} cy="35" r="4" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
                          <text x={x} y="24" fontSize="9" fill="#047857" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">
                            {selectedSbuDetail.sbu.opdFactor.toLocaleString()}
                          </text>
                          <text x={x} y="80" fontSize="10" fill="#94a3b8" textAnchor="middle" fontFamily="sans-serif">
                            {m.month}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: ESTIMATE SBU GROWTH 2027 */}
          {/* ========================================================= */}
          {activeTab === 'growth' && (
            <div className="space-y-6 font-sans">
              <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 text-sm md:text-base">
                    Estimate SBU Growth Table (2026 Forecast vs 2027 Target)
                  </h3>
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-bold border border-emerald-200">
                    Hospital Total Growth: +{calculatedData.overallGrowth.toFixed(2)}%
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-sans">
                      <tr>
                        <th className="p-3 font-bold w-12">#</th>
                        <th className="p-3 font-bold">BU / Department</th>
                        <th className="p-3 font-bold text-right">Forecast Rev 2026</th>
                        <th className="p-3 font-bold text-right">Target Rev 2027</th>
                        <th className="p-3 font-bold text-right">% Growth</th>
                        <th className="p-3 font-bold text-right">OPD Rev 2027</th>
                        <th className="p-3 font-bold text-right">IPD Rev 2027</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {calculatedData.sbus.map((s, idx) => (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-3 text-slate-400">{idx + 1}.</td>
                          <td className="p-3 font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }}></span>
                            {s.name}
                          </td>
                          <td className="p-3 text-right text-slate-600">
                            {s.base2026Total > 0 ? formatTHB(s.base2026Total) : '0'}
                          </td>
                          <td className="p-3 text-right font-bold text-slate-900">
                            {formatTHB(s.targetTotal)}
                          </td>
                          <td className="p-3 text-right font-bold">
                            <span className={`px-2 py-0.5 rounded ${
                              s.growthPct >= 10 ? 'bg-emerald-100 text-emerald-800' :
                              s.growthPct >= 0 ? 'bg-emerald-50 text-emerald-700' :
                              'bg-rose-50 text-rose-700'
                            }`}>
                              {s.growthPct >= 0 ? `+${s.growthPct}%` : `${s.growthPct}%`}
                            </span>
                          </td>
                          <td className="p-3 text-right text-blue-700">
                            {formatTHB(s.targetOpd)}
                          </td>
                          <td className="p-3 text-right text-amber-700">
                            {s.targetIpd > 0 ? formatTHB(s.targetIpd) : '-'}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                        <td className="p-3" colSpan="2">Grand Total</td>
                        <td className="p-3 text-right">{formatTHB(calculatedData.sumBase2026)}</td>
                        <td className="p-3 text-right text-emerald-800">{formatTHB(calculatedData.sumTargetTotal)}</td>
                        <td className="p-3 text-right text-emerald-800">+{calculatedData.overallGrowth.toFixed(2)}%</td>
                        <td className="p-3 text-right text-blue-800">{formatTHB(calculatedData.sumTargetOpd)}</td>
                        <td className="p-3 text-right text-amber-800">{formatTHB(calculatedData.sumTargetIpd)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: GOOGLE SHEETS CONNECTOR */}
          {/* ========================================================= */}
          {activeTab === 'sync' && (
            <div className="space-y-6 font-sans">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Google Sheets Integration
                    </h3>
                    <p className="text-xs text-slate-400">
                      เชื่อมต่อผ่าน Google Apps Script Web App Endpoint
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">Web App URL ปัจจุบัน:</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${scriptUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {scriptUrl ? 'CONFIGURED' : 'NOT SET'}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-slate-700 truncate bg-white p-2.5 rounded-lg border border-slate-200">
                    {scriptUrl || 'ยังไม่ได้ระบุ Web URL (โปรดวาง URL ในแถบสีดำด้านบนสุด)'}
                  </div>
                  <button
                    onClick={() => fetchDataFromGoogleSheet(scriptUrl)}
                    disabled={!scriptUrl || syncStatus === 'fetching'}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'fetching' ? 'animate-spin' : ''}`} />
                    ทดสอบดึงข้อมูลสดจาก Google Sheets
                  </button>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-700">ตัวอย่าง Payload ที่จะส่งไปบันทึกลงชีต:</span>
                    <button
                      onClick={handleSaveToSheet}
                      disabled={!scriptUrl || syncStatus === 'saving'}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" /> บันทึกเป้าหมาย 2027 ลงชีต
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto max-h-44">
                    {JSON.stringify({
                      scenario: `Budget_2027_${activePreset.toUpperCase()}`,
                      target2027Total: calculatedData.sumTargetTotal,
                      baseline2026Total: calculatedData.sumBase2026,
                      growthPercentage: calculatedData.overallGrowth.toFixed(2),
                      sbuDetails: calculatedData.sbus.map(s => ({
                        sbuId: s.id,
                        target2027: s.targetTotal,
                        growthPct: s.growthPct,
                        opdVisitsDay: Math.round(s.opdVisitsPerDay),
                        ipdAdmissionsDay: Number(s.admissionsPerDay.toFixed(1))
                      }))
                    }, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Log History */}
              <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 font-sans">
                <h4 className="font-bold text-slate-900 text-sm mb-3">
                  ประวัติการบันทึกเป้าหมายปี 2027
                </h4>
                <div className="space-y-2">
                  {savedScenarios.map((sc) => (
                    <div key={sc.id} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition border border-slate-200/60">
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">{sc.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{sc.date}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-xs text-emerald-700">
                          {formatTHB(sc.targetTotal)} บาท (+{sc.growth}%)
                        </span>
                        <button
                          onClick={() => handleLoadScenario(sc)}
                          disabled={!sc.snapshot}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded text-[10px] font-bold disabled:opacity-40"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleDeleteScenario(sc.id)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded text-[10px] font-bold"
                        >
                          Delete
                        </button>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                          Recorded
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Factor Review Center */}
      {factorReviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setFactorReviewOpen(false)}>
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-5 py-4">
              <div>
                <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-rose-600" /><h3 className="text-base font-black text-slate-900">Factor Review Center</h3></div>
                <p className="mt-1 text-xs text-slate-500">ตรวจเฉพาะ Factor ที่ Target 2027 ต่ำกว่า Historical YTD ก่อนบันทึก Scenario</p>
              </div>
              <button onClick={() => setFactorReviewOpen(false)} aria-label="ปิด Factor Review Center" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4 p-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">SBU ทั้งหมด</p><p className="mt-1 text-xl font-black text-slate-800">{calculatedData.sbus.length}</p></div>
                <div className="rounded-xl border border-rose-100 bg-rose-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-rose-600">ต้องตรวจสอบ</p><p className="mt-1 text-xl font-black text-rose-700">{factorAlerts.length}</p></div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">ผ่าน</p><p className="mt-1 text-xl font-black text-emerald-700">{Math.max(0, calculatedData.sbus.length * 5 - factorAlerts.length)}</p></div>
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-blue-600">Historical</p><p className="mt-1 text-xl font-black text-blue-700">{historicalMonths ? `M${historicalMonths}` : 'YTD'}</p></div>
              </div>
              {factorAlerts.length === 0 ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center"><CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" /><p className="mt-2 text-sm font-bold text-emerald-800">All factors meet or exceed historical baseline.</p><p className="mt-1 text-xs text-emerald-700">ไม่มี Factor ที่ต่ำกว่า Historical ใน Scenario ปัจจุบัน</p></div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <div className="hidden grid-cols-[1.2fr_1.5fr_1fr_1fr_.8fr] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400 sm:grid"><span>SBU</span><span>Factor</span><span>Historical</span><span>Target</span><span>Change</span></div>
                  {factorAlerts.map(alert => (
                    <div key={`${alert.sbu.id}-${alert.label}`} className="grid gap-3 border-t border-slate-100 px-4 py-3 first:border-t-0 sm:grid-cols-[1.2fr_1.5fr_1fr_1fr_.8fr] sm:items-center">
                      <div><p className="text-xs font-bold text-slate-800">{alert.sbu.name}</p><p className="text-[10px] text-slate-400">{alert.sbu.id}</p></div>
                      <div><p className="text-xs font-bold text-slate-700">{alert.label}</p><p className="text-[10px] text-rose-600">ต่ำกว่าฐาน ควรตรวจสอบ</p></div>
                      <div><span className="text-[10px] text-slate-400 sm:hidden">Historical · </span><span className="text-xs text-slate-600">{alert.actual.toFixed(alert.decimals)}{alert.suffix}</span></div>
                      <div><span className="text-[10px] text-slate-400 sm:hidden">Target · </span><span className="text-xs font-bold text-blue-700">{alert.target.toFixed(alert.decimals)}{alert.suffix}</span></div>
                      <div className="font-bold text-rose-600">{alert.change.toFixed(1)}%</div>
                      <div className="flex flex-wrap gap-2 sm:col-span-5"><button onClick={() => { setComparisonSbuId(alert.sbu.id); setFactorReviewOpen(false); }} className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[10px] font-bold text-blue-700 hover:bg-blue-100">ดู Comparison</button><button onClick={() => { setEditingFactors(alert.sbu); setFactorReviewOpen(false); }} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-700 hover:bg-slate-50">แก้ Factor</button></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SBU Factor Comparison Modal */}
      {comparisonSbuId && (() => {
        const compareSbu = calculatedData.sbus.find(s => s.id === comparisonSbuId) || calculatedData.sbus[0];
        const h = historicalBySbu[compareSbu?.id] || {};
        const floor = Number(h.annualizedTotalRevenue || h.totalRevenueYTD ? Number(h.totalRevenueYTD || 0) / Math.max(1, Number(h.months || 8)) * 12 : 0);
        const rows = [
          ['OPD Visit / day', Number(h.opdVisitsPerDay || 0), Number(compareSbu?.opdVisitsPerDay || 0), ' visit/day', 1],
          ['OPD Rev / Charge Visit', Number(h.opdRevenuePerVisit || 0), Number(compareSbu?.opdFactor || 0), ' บาท/visit', 0],
          ['Admission / day', Number(h.admissionsPerDay || 0), Number(compareSbu?.admissionsPerDay || 0), ' admission/day', 1],
          ['ALOS', Number(h.alos || 0), Number(compareSbu?.alos || 0), ' วัน', 1],
          ['IPD Rev / Patient Day', Number(h.ipdRevenuePerPatientDay || 0), Number(compareSbu?.ipdFactor || 0), ' บาท/pt-day', 0]
        ];
        return <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setComparisonSbuId(null)}>
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-5 py-4">
              <div><div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: compareSbu?.color }} /><h3 className="text-base font-black text-slate-900">SBU Factor Comparison</h3></div><p className="mt-1 text-xs text-slate-500">เปรียบเทียบ Historical M8 กับ Target 2027 โดยไม่ต้องจำตัวเลขจากตารางหลัก</p></div>
              <button onClick={() => setComparisonSbuId(null)} aria-label="ปิดหน้าต่างเปรียบเทียบ" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4 p-5">
              <div className="flex flex-wrap gap-2">{calculatedData.sbus.map(sbu => <button key={sbu.id} onClick={() => setComparisonSbuId(sbu.id)} className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${sbu.id === compareSbu?.id ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`} style={sbu.id === compareSbu?.id ? { backgroundColor: sbu.color } : undefined}>{sbu.name}</button>)}</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Historical Actual YTD</p><p className="mt-1 text-lg font-black text-slate-800">{h.totalRevenueYTD ? formatMillion(h.totalRevenueYTD) : '—'}</p><p className="text-[10px] text-slate-400">Total Revenue</p></div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">Annualized Floor</p><p className="mt-1 text-lg font-black text-emerald-700">{floor ? formatMillion(floor) : '—'}</p><p className="text-[10px] text-emerald-600">Actual YTD ÷ months × 12</p></div>
                <div className={`rounded-xl border p-3 ${compareSbu?.targetTotal >= floor ? 'border-blue-100 bg-blue-50' : 'border-rose-100 bg-rose-50'}`}><p className="text-[10px] font-bold uppercase tracking-wide text-blue-600">Target 2027</p><p className="mt-1 text-lg font-black text-blue-700">{formatMillion(compareSbu?.targetTotal)}</p><p className={`text-[10px] font-bold ${compareSbu?.targetTotal >= floor ? 'text-emerald-600' : 'text-rose-600'}`}>{floor ? `${compareSbu.targetTotal >= floor ? '+' : ''}${formatMillion(compareSbu.targetTotal - floor)} vs floor` : 'No historical baseline'}</p></div>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200"><div className="grid grid-cols-[1.5fr_1fr_1fr_.8fr] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400"><span>Factor</span><span>Historical M8</span><span>Target 2027</span><span>Change</span></div>{rows.map(([label, actual, target, suffix, decimals]) => { const change = actual ? ((target - actual) / actual) * 100 : null; return <div key={label} className="grid grid-cols-[1.5fr_1fr_1fr_.8fr] items-center gap-3 border-t border-slate-100 px-4 py-3 text-xs"><span className="font-bold text-slate-700">{label}</span><span className="text-slate-600">{actual ? `${actual.toFixed(decimals)}${suffix}` : '—'}</span><span className="font-bold text-blue-700">{target ? `${target.toFixed(decimals)}${suffix}` : '—'}</span><span className={change === null ? 'text-slate-400' : change >= 0 ? 'font-bold text-emerald-600' : 'font-bold text-rose-600'}>{change === null ? '—' : `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`}</span></div>; })}</div>
            </div>
          </div>
        </div>;
      })()}

      {/* Factor Customizer Modal */}
      {editingFactors && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  ตั้งค่า Factors: {editingFactors.name} (2027)
                </h3>
              </div>
              <button 
                onClick={() => setEditingFactors(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  OPD Rev / Charge Visit (บาท / ครั้ง)
                </label>
                <input
                  type="number"
                  value={editingFactors.opdFactor}
                  onChange={(e) => setEditingFactors({ ...editingFactors, opdFactor: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  IPD Rev / Patient Day (บาท / วันนอน)
                </label>
                <input
                  type="number"
                  value={editingFactors.ipdFactor}
                  onChange={(e) => setEditingFactors({ ...editingFactors, ipdFactor: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Average Length of Stay (ALOS ในหน่วยวัน)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={editingFactors.alos}
                  onChange={(e) => setEditingFactors({ ...editingFactors, alos: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setEditingFactors(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleSaveFactors(editingFactors)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs shadow-xs transition"
              >
                บันทึกการเปลี่ยนแปลง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
