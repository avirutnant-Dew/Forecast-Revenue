/**
 * RevPlanner 2027 Google Apps Script API
 * Run setupInitialSheets() once, then enter actual YTD values in Historical_Actual_YTD.
 */

const SHEET_NAMES = {
  scenarios: 'Config_Scenarios',
  sbus: 'SBU_Baseline_Factors',
  monthly: 'Monthly_Seasonality_2026',
  historical: 'Historical_Actual_YTD',
  log: 'Saved_Scenarios_Log'
};

function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const scenarios = readScenarios_(ss.getSheetByName(SHEET_NAMES.scenarios));
  const sbus = readSbus_(ss.getSheetByName(SHEET_NAMES.sbus));
  const monthlySeasonality = readMonthly_(ss.getSheetByName(SHEET_NAMES.monthly));
  const historicalYTD = readHistorical_(ss.getSheetByName(SHEET_NAMES.historical));

  return json_({
    status: 'success',
    timestamp: new Date().toISOString(),
    scenarios,
    sbus,
    monthlySeasonality,
    historicalYTD,
    historicalActual8M: historicalYTD
  });
}

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.log);
    if (!sheet) throw new Error('Missing Saved_Scenarios_Log sheet. Run setupInitialSheets().');

    sheet.appendRow([
      new Date(),
      String(data.scenario || 'Untitled Scenario').slice(0, 120),
      finiteNumber_(data.hospitalTarget2027),
      finiteNumber_(data.target2027Total),
      finiteNumber_(data.growthPercentage),
      finiteNumber_(data.gap),
      JSON.stringify(Array.isArray(data.sbuDetails) ? data.sbuDetails : []),
      'Web App User'
    ]);

    return json_({ status: 'success', message: 'Saved successfully' });
  } catch (error) {
    return json_({ status: 'error', message: String(error) });
  }
}

function setupInitialSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  setupScenarios_(ss);
  setupSbus_(ss);
  setupMonthly_(ss);
  setupHistorical_(ss);
  setupLog_(ss);

  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) ss.deleteSheet(defaultSheet);
  SpreadsheetApp.getUi().alert('Setup เรียบร้อย: สร้าง/ปรับปรุง 5 แท็บแล้ว กรุณากรอกข้อมูลใน Historical_Actual_YTD โดยระบุ As_Of_Month ให้ตรงกับข้อมูลจริง');
}

function setupScenarios_(ss) {
  const rows = [
    ['Scenario_Key', 'Scenario_Name', 'Target_Revenue_THB', 'Expected_Growth_Pct', 'Description'],
    ['base_2026', '2026 Forecast Base', 983954375, 0, 'ฐานประมาณการสิ้นปี 2026'],
    ['worst', '2027 Worst Case', 1018820000, 0.0354, 'เป้าหมายกรณีต่ำสุด'],
    ['base', '2027 Base Target', 1054853709, 0.0721, 'เป้าหมายหลักของโรงพยาบาล'],
    ['best', '2027 Best Case', 1090580000, 0.1084, 'เป้าหมายกรณีเติบโตสูง']
  ];
  writeSheet_(ss, SHEET_NAMES.scenarios, rows);
  const sheet = ss.getSheetByName(SHEET_NAMES.scenarios);
  sheet.getRange(2, 3, rows.length - 1, 1).setNumberFormat('#,##0');
  sheet.getRange(2, 4, rows.length - 1, 1).setNumberFormat('0.00%');
}

function setupSbus_(ss) {
  const rows = [
    ['SBU_ID', 'SBU_Name', 'Base_2026_Total', 'Base_2026_OPD', 'Base_2026_IPD', 'Fixed_OPD_Rev_Per_Visit', 'Fixed_IPD_Rev_Per_PatientDay', 'Fixed_ALOS', 'Default_Growth_Pct', 'Color_Code'],
    ['PED', 'SBU PED', 296550000, 59310000, 237240000, 2850, 22225, 2.4, 0.0721, '#f59e0b'],
    ['MED', 'SBU MED', 231280000, 69384000, 161896000, 3100, 25000, 3.2, 0.0721, '#ec4899'],
    ['OTHER', 'Other', 137200000, 54880000, 82320000, 2400, 21000, 2.2, 0.0721, '#84cc16'],
    ['OBGYN', 'SBU OB & GYN', 70610000, 16946400, 53663600, 3100, 26000, 2.3, 0.0721, '#8b5cf6'],
    ['ORTHO', 'SBU Ortho', 60760000, 33418000, 27342000, 3600, 31500, 2.6, 0.0721, '#06b6d4'],
    ['TRAUMA', 'SBU Trauma', 57130000, 22852000, 34278000, 3400, 28000, 3.0, 0.0721, '#f97316'],
    ['SURG', 'SBU Surgery', 59980000, 11996000, 47984000, 4100, 36000, 2.8, 0.0721, '#6366f1'],
    ['GI', 'SBU GI', 40060000, 18027000, 22033000, 3850, 29000, 2.1, 0.0721, '#0284c7'],
    ['CATHLAB', 'CATHLAB', 0, 0, 0, 6500, 45000, 1.8, 1, '#14b8a6'],
    ['CHECKUP', 'SBU Checkup', 17404375, 17404375, 0, 2700, 0, 0, 0.0721, '#10b981'],
    ['REHAB', 'SBU Rehab', 12980000, 12980000, 0, 1850, 0, 0, 0.0721, '#a855f7']
  ];
  writeSheet_(ss, SHEET_NAMES.sbus, rows);
  const sheet = ss.getSheetByName(SHEET_NAMES.sbus);
  sheet.getRange(2, 3, rows.length - 1, 5).setNumberFormat('#,##0');
  sheet.getRange(2, 8, rows.length - 1, 1).setNumberFormat('0.0');
  sheet.getRange(2, 9, rows.length - 1, 1).setNumberFormat('0.00%');
}

function setupMonthly_(ss) {
  const rev = [82365595, 69317440, 74642434, 68332060, 76783774, 80763870, 92659168, 87818007, 97583950, 89795400, 83427107, 80465572];
  const names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const rows = [['Month_No', 'Month_Name', 'Month_Short', 'Days_In_Month', 'Forecast_Rev_2026_THB', 'Seasonality_Weight']];
  for (let i = 0; i < 12; i++) rows.push([i + 1, names[i], short[i], days[i], rev[i], `=E${i + 2}/SUM($E$2:$E$13)`]);
  writeSheet_(ss, SHEET_NAMES.monthly, rows);
  const sheet = ss.getSheetByName(SHEET_NAMES.monthly);
  sheet.getRange(2, 5, 12, 1).setNumberFormat('#,##0');
  sheet.getRange(2, 6, 12, 1).setNumberFormat('0.00%');
}

function setupHistorical_(ss) {
  const rows = [[
    'SBU_ID', 'SBU_Name', 'Year', 'As_Of_Month', 'Total_Revenue_YTD_THB', 'OPD_Revenue_YTD_THB', 'IPD_Revenue_YTD_THB',
    'OPD_Visit_Per_Day', 'OPD_Rev_Per_Charge_Visit', 'Admission_Per_Day', 'ALOS', 'IPD_Rev_Per_Patient_Day', 'Updated_At'
  ]];
  const sbus = ['PED', 'MED', 'OTHER', 'OBGYN', 'ORTHO', 'TRAUMA', 'SURG', 'GI', 'CATHLAB', 'CHECKUP', 'REHAB'];
  sbus.forEach(id => rows.push([id, '', 2026, 8, '', '', '', '', '', '', '', '', '']));
  writeSheet_(ss, SHEET_NAMES.historical, rows);
  const sheet = ss.getSheetByName(SHEET_NAMES.historical);
  sheet.getRange(2, 3, rows.length - 1, 2).setNumberFormat('0');
  sheet.getRange(2, 5, rows.length - 1, 3).setNumberFormat('#,##0');
  sheet.getRange(2, 8, rows.length - 1, 1).setNumberFormat('0.0');
  sheet.getRange(2, 9, rows.length - 1, 1).setNumberFormat('#,##0');
  sheet.getRange(2, 10, rows.length - 1, 1).setNumberFormat('0.0');
  sheet.getRange(2, 11, rows.length - 1, 1).setNumberFormat('0.0');
  sheet.getRange(2, 12, rows.length - 1, 1).setNumberFormat('#,##0');
  sheet.getRange(2, 13, rows.length - 1, 1).setNumberFormat('yyyy-mm-dd hh:mm');
  sheet.getRange(2, 3, rows.length - 1, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireNumberBetween(2000, 2100).setAllowInvalid(false).build());
  sheet.getRange(2, 4, rows.length - 1, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireNumberBetween(1, 12).setAllowInvalid(false).build());
  sheet.getRange(2, 4, rows.length - 1, 1).setNote('ใส่เดือนล่าสุดของข้อมูล YTD เช่น 8, 9 หรือ 10; ต้องใช้ค่าเดียวกันทุก SBU');
}

function setupLog_(ss) {
  const sheet = ss.getSheetByName(SHEET_NAMES.log) || ss.insertSheet(SHEET_NAMES.log);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, 8).setValues([['Timestamp', 'Scenario_Name', 'Hospital_Target_2027', 'Total_Simulated_2027', 'Growth_Pct', 'Gap_THB', 'SBU_Detail_JSON', 'Saved_By']]);
    formatHeaderRow_(sheet, 8);
  }
}

function readScenarios_(sheet) {
  const result = {};
  if (!sheet) return result;
  sheet.getDataRange().getValues().slice(1).forEach(r => { if (r[0]) result[String(r[0])] = { key: String(r[0]), name: r[1], target: finiteNumber_(r[2]), growth: finiteNumber_(r[3]) }; });
  return result;
}
function readSbus_(sheet) {
  if (!sheet) return [];
  return sheet.getDataRange().getValues().slice(1).filter(r => r[0]).map(r => ({ id: String(r[0]), name: r[1], base2026Total: finiteNumber_(r[2]), base2026Opd: finiteNumber_(r[3]), base2026Ipd: finiteNumber_(r[4]), opdFactor: finiteNumber_(r[5]), ipdFactor: finiteNumber_(r[6]), alos: finiteNumber_(r[7]), defaultGrowth: finiteNumber_(r[8]) * (finiteNumber_(r[8]) < 1 ? 100 : 1), color: r[9] }));
}
function readMonthly_(sheet) {
  if (!sheet) return [];
  return sheet.getDataRange().getValues().slice(1).filter(r => r[0]).map(r => ({ monthNo: r[0], monthName: r[1], monthShort: r[2], days: finiteNumber_(r[3]), forecast2026: finiteNumber_(r[4]), weight: finiteNumber_(r[5]) }));
}
function readHistorical_(sheet) {
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues().slice(1).filter(r => r[0] && finiteNumber_(r[4]) > 0);
  const months = rows.length ? Math.max(1, Math.min(12, finiteNumber_(rows[0][3]) || 8)) : 0;
  return rows.map(r => ({
    sbuId: String(r[0]), sbuName: r[1], year: finiteNumber_(r[2]), months,
    asOfMonth: months,
    totalRevenueYTD: finiteNumber_(r[4]), opdRevenueYTD: finiteNumber_(r[5]), ipdRevenueYTD: finiteNumber_(r[6]),
    opdVisitsPerDay: finiteNumber_(r[7]), opdRevenuePerVisit: finiteNumber_(r[8]), admissionsPerDay: finiteNumber_(r[9]), alos: finiteNumber_(r[10]), ipdRevenuePerPatientDay: finiteNumber_(r[11]), updatedAt: r[12],
    annualizedTotalRevenue: finiteNumber_(r[4]) / months * 12, annualizedOpdRevenue: finiteNumber_(r[5]) / months * 12, annualizedIpdRevenue: finiteNumber_(r[6]) / months * 12
  }));
}
function writeSheet_(ss, name, rows) { const sheet = ss.getSheetByName(name) || ss.insertSheet(name); sheet.clear(); sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows); formatHeaderRow_(sheet, rows[0].length); }
function formatHeaderRow_(sheet, columns) { sheet.getRange(1, 1, 1, columns).setBackground('#1e293b').setFontColor('#ffffff').setFontWeight('bold').setHorizontalAlignment('center'); sheet.setFrozenRows(1); for (let c = 1; c <= columns; c++) sheet.autoResizeColumn(c); }
function finiteNumber_(value) { const n = Number(value); return Number.isFinite(n) ? n : 0; }
function json_(value) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); }
/** End of Code.gs */
