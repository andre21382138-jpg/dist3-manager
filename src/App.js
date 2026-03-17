import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);



const VENDORS = ['홈플러스', '익스프레스', '롯데마트', '롯데슈퍼', '메가마트', '이마트', '에브리데이', '농협'];

const VENDOR_COLORS = {
  '홈플러스':  '#0068b7',
  '익스프레스':'#00a550',
  '롯데마트':  '#ed1c24',
  '롯데슈퍼':  '#c8102e',
  '메가마트':  '#ff6600',
  '이마트':    '#ffcc00',
  '에브리데이':'#8b5cf6',
  '농협':      '#009a44',
};

/* ─── CSS ─────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy:   #0d1b2a;
    --navy2:  #1b2d42;
    --navy3:  #243447;
    --blue:   #2563eb;
    --blue2:  #3b82f6;
    --sky:    #e8f0fe;
    --white:  #ffffff;
    --gray1:  #f4f6f9;
    --gray2:  #e5e9ef;
    --gray3:  #94a3b8;
    --gray4:  #64748b;
    --text:   #1e293b;
    --red:    #ef4444;
    --green:  #22c55e;
    --amber:  #f59e0b;
    --radius: 10px;
    --shadow: 0 2px 12px rgba(0,0,0,.08);
  }

  body {
    font-family: 'Noto Sans KR', sans-serif;
    background: var(--gray1);
    color: var(--text);
    min-height: 100vh;
  }

  /* ── AUTH PAGE ── */
  .auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--navy) 0%, var(--navy2) 60%, #1a3a5c 100%);
    position: relative;
    overflow: hidden;
  }
  .auth-page::before {
    content: '';
    position: absolute;
    width: 600px; height: 600px;
    border-radius: 50%;
    background: rgba(37,99,235,.08);
    top: -200px; right: -200px;
  }
  .auth-page::after {
    content: '';
    position: absolute;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: rgba(37,99,235,.06);
    bottom: -150px; left: -100px;
  }

  .auth-card {
    background: var(--white);
    border-radius: 16px;
    padding: 48px 44px;
    width: 420px;
    box-shadow: 0 24px 64px rgba(0,0,0,.32);
    position: relative; z-index: 1;
    animation: fadeUp .4s ease;
  }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }

  .auth-logo {
    text-align: center;
    margin-bottom: 32px;
  }
  .auth-logo-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 56px; height: 56px;
    background: var(--navy);
    border-radius: 14px;
    margin-bottom: 12px;
  }
  .auth-logo-badge svg { width: 28px; height: 28px; }
  .auth-title { font-size: 20px; font-weight: 700; color: var(--navy); }
  .auth-sub   { font-size: 13px; color: var(--gray3); margin-top: 4px; }

  .auth-tabs {
    display: flex;
    background: var(--gray1);
    border-radius: 8px;
    padding: 3px;
    margin-bottom: 24px;
  }
  .auth-tab {
    flex: 1;
    padding: 8px;
    border: none;
    background: transparent;
    border-radius: 6px;
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    color: var(--gray4);
    transition: all .2s;
  }
  .auth-tab.active {
    background: var(--white);
    color: var(--navy);
    box-shadow: 0 1px 4px rgba(0,0,0,.1);
  }

  .form-group { margin-bottom: 16px; }
  .form-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: var(--gray4);
    margin-bottom: 6px;
    letter-spacing: .3px;
  }
  .form-input {
    width: 100%;
    padding: 11px 14px;
    border: 1.5px solid var(--gray2);
    border-radius: 8px;
    font-family: inherit;
    font-size: 14px;
    color: var(--text);
    outline: none;
    transition: border-color .2s, box-shadow .2s;
    background: var(--white);
  }
  .form-input:focus {
    border-color: var(--blue);
    box-shadow: 0 0 0 3px rgba(37,99,235,.12);
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 11px 20px;
    border: none;
    border-radius: 8px;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all .2s;
  }
  .btn-primary {
    background: var(--blue);
    color: var(--white);
    width: 100%;
    padding: 13px;
    font-size: 15px;
    margin-top: 4px;
  }
  .btn-primary:hover { background: #1d4ed8; }
  .btn-primary:disabled { background: var(--gray3); cursor: not-allowed; }

  .btn-sm { padding: 7px 14px; font-size: 13px; }
  .btn-outline {
    background: transparent;
    border: 1.5px solid var(--gray2);
    color: var(--gray4);
  }
  .btn-outline:hover { border-color: var(--gray3); color: var(--text); }
  .btn-danger  { background: #fee2e2; color: var(--red); }
  .btn-danger:hover { background: #fecaca; }
  .btn-success { background: #dcfce7; color: #15803d; }
  .btn-success:hover { background: #bbf7d0; }
  .btn-blue-light { background: var(--sky); color: var(--blue); }
  .btn-blue-light:hover { background: #dbeafe; }

  .alert {
    padding: 11px 14px;
    border-radius: 8px;
    font-size: 13px;
    margin-bottom: 14px;
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }
  .alert-error   { background: #fee2e2; color: #b91c1c; }
  .alert-success { background: #dcfce7; color: #15803d; }
  .alert-info    { background: var(--sky); color: #1e40af; }
  .alert-warn    { background: #fef3c7; color: #92400e; }

  /* ── LAYOUT ── */
  .app-layout {
    display: flex;
    min-height: 100vh;
  }

  /* ── SIDEBAR ── */
  .sidebar {
    width: 240px;
    background: var(--navy);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 100;
  }
  .sidebar-header {
    padding: 24px 20px 20px;
    border-bottom: 1px solid rgba(255,255,255,.07);
  }
  .sidebar-brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .sidebar-brand-icon {
    width: 36px; height: 36px;
    background: var(--blue);
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .sidebar-brand-icon svg { width: 18px; height: 18px; }
  .sidebar-brand-name { font-size: 15px; font-weight: 700; color: var(--white); line-height: 1.2; }
  .sidebar-brand-sub  { font-size: 11px; color: rgba(255,255,255,.4); margin-top: 2px; }

  .sidebar-nav { flex: 1; padding: 16px 12px; }
  .nav-section-label {
    font-size: 10px;
    font-weight: 700;
    color: rgba(255,255,255,.3);
    letter-spacing: 1.2px;
    text-transform: uppercase;
    padding: 0 8px;
    margin-bottom: 6px;
    margin-top: 16px;
  }
  .nav-section-label:first-child { margin-top: 0; }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    color: rgba(255,255,255,.6);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    background: transparent;
    font-family: inherit;
    width: 100%;
    text-align: left;
    transition: all .18s;
    margin-bottom: 2px;
  }
  .nav-item:hover  { background: rgba(255,255,255,.07); color: var(--white); }
  .nav-item.active { background: var(--blue); color: var(--white); }
  .nav-item svg { width: 17px; height: 17px; flex-shrink: 0; }

  .sidebar-footer {
    padding: 16px 12px;
    border-top: 1px solid rgba(255,255,255,.07);
  }
  .sidebar-user {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px;
    margin-bottom: 8px;
  }
  .user-avatar {
    width: 32px; height: 32px;
    background: var(--blue2);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; color: white;
    flex-shrink: 0;
  }
  .user-info { flex: 1; min-width: 0; }
  .user-name  { font-size: 13px; font-weight: 600; color: var(--white); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .user-role  { font-size: 11px; color: rgba(255,255,255,.4); }

  /* ── MAIN CONTENT ── */
  .main-content {
    margin-left: 240px;
    flex: 1;
    padding: 32px;
    min-height: 100vh;
  }

  .page-header {
    margin-bottom: 28px;
  }
  .page-title {
    font-size: 22px;
    font-weight: 700;
    color: var(--navy);
  }
  .page-sub {
    font-size: 14px;
    color: var(--gray3);
    margin-top: 4px;
  }

  /* ── HOME ── */
  .home-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    max-width: 800px;
  }
  .menu-card {
    background: var(--white);
    border-radius: 16px;
    padding: 32px;
    cursor: pointer;
    border: 2px solid transparent;
    box-shadow: var(--shadow);
    transition: all .2s;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }
  .menu-card:hover {
    border-color: var(--blue);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(37,99,235,.14);
  }
  .menu-card-icon {
    width: 52px; height: 52px;
    border-radius: 13px;
    display: flex; align-items: center; justify-content: center;
  }
  .menu-card-icon svg { width: 24px; height: 24px; }
  .menu-card-title { font-size: 18px; font-weight: 700; color: var(--navy); }
  .menu-card-desc  { font-size: 13px; color: var(--gray3); line-height: 1.5; }
  .menu-card-arrow {
    margin-top: auto;
    color: var(--gray3);
    font-size: 12px;
    display: flex; align-items: center; gap: 4px;
    transition: color .2s, gap .2s;
  }
  .menu-card:hover .menu-card-arrow { color: var(--blue); gap: 8px; }

  /* ── UPLOAD FLOW ── */
  .flow-steps {
    display: flex;
    align-items: center;
    gap: 0;
    margin-bottom: 32px;
  }
  .flow-step {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 500;
    color: var(--gray3);
  }
  .flow-step.done  { color: var(--blue); }
  .flow-step.active{ color: var(--navy); }
  .step-num {
    width: 26px; height: 26px;
    border-radius: 50%;
    background: var(--gray2);
    color: var(--gray3);
    font-size: 12px;
    font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }
  .flow-step.done  .step-num { background: var(--blue); color: white; }
  .flow-step.active .step-num { background: var(--navy); color: white; }
  .flow-divider {
    flex: 1;
    height: 1px;
    background: var(--gray2);
    margin: 0 12px;
    max-width: 48px;
  }

  .card {
    background: var(--white);
    border-radius: var(--radius);
    padding: 28px;
    box-shadow: var(--shadow);
  }
  .card-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--navy);
    margin-bottom: 18px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Vendor Grid */
  .vendor-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 12px;
  }
  .vendor-btn {
    padding: 16px 12px;
    border: 2px solid var(--gray2);
    border-radius: 10px;
    background: white;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    color: var(--gray4);
    text-align: center;
    transition: all .18s;
    position: relative;
    overflow: hidden;
  }
  .vendor-btn::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: var(--vc, var(--blue));
    opacity: 0;
    transition: opacity .18s;
  }
  .vendor-btn:hover { border-color: var(--vc, var(--blue)); color: var(--vc, var(--blue)); }
  .vendor-btn:hover::before { opacity: 1; }
  .vendor-btn.selected {
    border-color: var(--vc, var(--blue));
    background: color-mix(in srgb, var(--vc, var(--blue)) 8%, white);
    color: var(--vc, var(--blue));
  }
  .vendor-btn.selected::before { opacity: 1; }

  /* Date input */
  .date-input-wrap { max-width: 240px; }

  /* Drop Zone */
  .drop-zone {
    border: 2px dashed var(--gray2);
    border-radius: 12px;
    padding: 48px 24px;
    text-align: center;
    cursor: pointer;
    transition: all .2s;
    background: var(--gray1);
  }
  .drop-zone:hover, .drop-zone.drag-over {
    border-color: var(--blue);
    background: var(--sky);
  }
  .drop-zone.has-file {
    border-style: solid;
    border-color: var(--green);
    background: #f0fdf4;
  }
  .drop-icon {
    width: 48px; height: 48px;
    margin: 0 auto 14px;
    color: var(--gray3);
  }
  .drop-zone.has-file .drop-icon { color: var(--green); }
  .drop-title { font-size: 15px; font-weight: 600; color: var(--navy); margin-bottom: 6px; }
  .drop-sub   { font-size: 13px; color: var(--gray3); }
  .drop-zone.has-file .drop-title { color: #15803d; }

  /* Summary row */
  .summary-box {
    background: var(--sky);
    border-radius: 10px;
    padding: 18px 20px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }
  .summary-item label { font-size: 11px; color: #3b82f6; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; }
  .summary-item value { display: block; font-size: 15px; font-weight: 700; color: var(--navy); margin-top: 4px; }

  /* ── HISTORY TABLE ── */
  .table-wrap {
    background: var(--white);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    overflow: hidden;
  }
  .table-head {
    padding: 18px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--gray2);
  }
  table { width: 100%; border-collapse: collapse; }
  thead th {
    background: var(--gray1);
    font-size: 12px;
    font-weight: 700;
    color: var(--gray4);
    letter-spacing: .4px;
    text-transform: uppercase;
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid var(--gray2);
  }
  tbody tr { transition: background .15s; }
  tbody tr:hover { background: var(--gray1); }
  tbody td {
    padding: 13px 16px;
    font-size: 14px;
    border-bottom: 1px solid var(--gray2);
    color: var(--text);
  }
  tbody tr:last-child td { border-bottom: none; }

  .badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
  }
  .badge-blue   { background: var(--sky); color: var(--blue); }
  .badge-purple { background: #f3e8ff; color: #7c3aed; }
  .badge-green  { background: #dcfce7; color: #15803d; }
  .badge-amber  { background: #fef3c7; color: #92400e; }
  .badge-red    { background: #fee2e2; color: #b91c1c; }

  /* ── ADMIN ── */
  .admin-tabs {
    display: flex;
    gap: 4px;
    background: var(--white);
    border-radius: 10px;
    padding: 4px;
    margin-bottom: 24px;
    box-shadow: var(--shadow);
    width: fit-content;
  }
  .admin-tab {
    padding: 9px 18px;
    border-radius: 7px;
    border: none;
    background: transparent;
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    color: var(--gray4);
    transition: all .18s;
    display: flex; align-items: center; gap: 6px;
  }
  .admin-tab.active { background: var(--navy); color: white; }
  .admin-tab .count {
    background: var(--red);
    color: white;
    font-size: 10px;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 10px;
  }

  /* Pending page */
  .pending-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--gray1);
  }
  .pending-card {
    background: white;
    border-radius: 16px;
    padding: 48px 40px;
    text-align: center;
    max-width: 420px;
    box-shadow: var(--shadow);
    animation: fadeUp .4s ease;
  }
  .pending-icon {
    width: 64px; height: 64px;
    background: #fef3c7;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 20px;
    font-size: 28px;
  }
  .pending-title { font-size: 18px; font-weight: 700; color: var(--navy); margin-bottom: 10px; }
  .pending-sub   { font-size: 14px; color: var(--gray3); line-height: 1.6; }

  /* Filter bar */
  .filter-bar {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .filter-select {
    padding: 8px 12px;
    border: 1.5px solid var(--gray2);
    border-radius: 8px;
    font-family: inherit;
    font-size: 13px;
    color: var(--text);
    background: white;
    outline: none;
    cursor: pointer;
  }
  .filter-select:focus { border-color: var(--blue); }

  .empty-state {
    text-align: center;
    padding: 64px 24px;
    color: var(--gray3);
  }
  .empty-state svg { width: 48px; height: 48px; margin: 0 auto 14px; opacity: .4; }
  .empty-state p { font-size: 14px; }

  .loading-spinner {
    display: inline-block;
    width: 18px; height: 18px;
    border: 2px solid rgba(255,255,255,.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin .7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .divider { height: 1px; background: var(--gray2); margin: 20px 0; }

  /* Vendor dot */
  .vendor-dot {
    display: inline-block;
    width: 8px; height: 8px;
    border-radius: 50%;
    margin-right: 6px;
  }
`;

/* ─── ICONS ────────────────────────────────────────────────────────── */
const Icon = ({ name, style }) => {
  const icons = {
    truck:     <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H3m16.5 0h-.75m-12 0h8.25m8.25-10.5H21v4.5m-4.5-9H3.75A2.25 2.25 0 001.5 5.25v9.75A2.25 2.25 0 003.75 17.25h.75M15.75 8.25v9H21v-9h-5.25z"/>,
    chart:     <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/>,
    upload:    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>,
    home:      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>,
    history:   <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>,
    users:     <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>,
    logout:    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/>,
    check:     <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>,
    x:         <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>,
    download:  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/>,
    file:      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>,
    arrow:     <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>,
    building:  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15l.75 3.75H3.75L4.5 3zM4.5 6.75h15v13.5h-15V6.75z"/>,
    grid:      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/>,
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
         strokeWidth={1.8} stroke="currentColor" style={style}>
      {icons[name]}
    </svg>
  );
};

/* ─── HELPERS ──────────────────────────────────────────────────────── */
function fmt(d) {
  return d ? new Date(d).toLocaleDateString('ko-KR', { year:'numeric', month:'2-digit', day:'2-digit' }) : '-';
}
function fmtDateTime(d) {
  return d ? new Date(d).toLocaleString('ko-KR', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }) : '-';
}
function getInitial(name) { return name ? name[0].toUpperCase() : '?'; }

/* ─── AUTH PAGE ────────────────────────────────────────────────────── */
function AuthPage({ onAuth }) {
  const [tab, setTab]       = useState('login');
  const [email, setEmail]   = useState('');
  const [pw, setPw]         = useState('');
  const [name, setName]     = useState('');
  const [dept, setDept]     = useState('');
  const [msg, setMsg]       = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) setMsg({ type: 'error', text: error.message === 'Invalid login credentials' ? '이메일 또는 비밀번호가 올바르지 않습니다.' : error.message });
    setLoading(false);
  }

  async function handleSignup(e) {
    e.preventDefault();
    if (!name.trim()) { setMsg({ type: 'error', text: '이름을 입력해주세요.' }); return; }
    setLoading(true); setMsg(null);
    const { data, error } = await supabase.auth.signUp({ email, password: pw });
    if (error) { setMsg({ type: 'error', text: error.message }); setLoading(false); return; }
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id, email, name, dept,
        role: 'user', approved: false
      });
      setMsg({ type: 'success', text: '가입 신청이 완료되었습니다. 관리자 승인 후 로그인 가능합니다.' });
    }
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-badge">
            <Icon name="building" style={{ color: 'white' }} />
          </div>
          <div className="auth-title">할인점팀 매입·매출 관리</div>
          <div className="auth-sub">Distribution Management System</div>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab==='login' ? 'active' : ''}`} onClick={() => { setTab('login'); setMsg(null); }}>로그인</button>
          <button className={`auth-tab ${tab==='signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); setMsg(null); }}>회원가입</button>
        </div>

        {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">이메일</label>
              <input className="form-input" type="email" placeholder="email@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">비밀번호</label>
              <input className="form-input" type="password" placeholder="비밀번호" value={pw} onChange={e => setPw(e.target.value)} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <span className="loading-spinner"/> : '로그인'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label className="form-label">이름 *</label>
              <input className="form-input" placeholder="홍길동" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">부서</label>
              <input className="form-input" placeholder="유통3팀" value={dept} onChange={e => setDept(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">이메일 *</label>
              <input className="form-input" type="email" placeholder="email@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">비밀번호 *</label>
              <input className="form-input" type="password" placeholder="6자 이상" value={pw} onChange={e => setPw(e.target.value)} required minLength={6} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <span className="loading-spinner"/> : '가입 신청'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ─── PENDING PAGE ──────────────────────────────────────────────────── */
function PendingPage({ profile, onLogout }) {
  return (
    <div className="pending-page">
      <div className="pending-card">
        <div className="pending-icon">⏳</div>
        <div className="pending-title">승인 대기 중</div>
        <div className="pending-sub">
          <strong>{profile?.name}</strong>님의 가입 신청이 접수되었습니다.<br/>
          관리자 승인 후 로그인하실 수 있습니다.<br/>
          <br/>
          승인이 완료되면 다시 로그인해 주세요.
        </div>
        <div style={{ marginTop: 28 }}>
          <button className="btn btn-outline btn-sm" onClick={onLogout}>로그아웃</button>
        </div>
      </div>
    </div>
  );
}

/* ─── SIDEBAR ────────────────────────────────────────────────────────── */
function Sidebar({ profile, currentPage, onNavigate, onLogout }) {
  const isAdmin = profile?.role === 'admin';
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Icon name="building" style={{ color: 'white' }} />
          </div>
          <div>
            <div className="sidebar-brand-name">할인점팀</div>
            <div className="sidebar-brand-sub">매입·매출 관리시스템</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">메인</div>
        <button className={`nav-item ${currentPage==='home' ? 'active' : ''}`} onClick={() => onNavigate('home')}>
          <Icon name="home" /> 홈
        </button>

        <div className="nav-section-label">업무</div>
        <button className={`nav-item ${currentPage==='purchase' ? 'active' : ''}`} onClick={() => onNavigate('purchase')}>
          <Icon name="truck" /> 매입
        </button>
        <button className={`nav-item ${currentPage==='sales' ? 'active' : ''}`} onClick={() => onNavigate('sales')}>
          <Icon name="chart" /> 매출
        </button>
        <button className={`nav-item ${currentPage==='history' ? 'active' : ''}`} onClick={() => onNavigate('history')}>
          <Icon name="history" /> 업로드 이력
        </button>

        {isAdmin && (
          <>
            <div className="nav-section-label">관리자</div>
            <button className={`nav-item ${currentPage==='admin' ? 'active' : ''}`} onClick={() => onNavigate('admin')}>
              <Icon name="users" /> 사용자 관리
            </button>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{getInitial(profile?.name)}</div>
          <div className="user-info">
            <div className="user-name">{profile?.name || '-'}</div>
            <div className="user-role">{profile?.role === 'admin' ? '관리자' : (profile?.dept || '일반사용자')}</div>
          </div>
        </div>
        <button className="nav-item" onClick={onLogout}>
          <Icon name="logout" /> 로그아웃
        </button>
      </div>
    </div>
  );
}

/* ─── NOTICE BOARD ──────────────────────────────────────────────────── */
const PAGE_SIZE = 10;

function NoticeBoard({ profile }) {
  const isAdmin = profile?.role === 'admin';
  const [notices, setNotices]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [total, setTotal]         = useState(0);
  const [view, setView]           = useState(null);   // 상세보기 공지
  const [writing, setWriting]     = useState(false);  // 작성 폼
  const [editTarget, setEditTarget] = useState(null); // 수정 대상
  const [form, setForm]           = useState({ title: '', content: '', pinned: false });
  const [saving, setSaving]       = useState(false);
  const [comments, setComments]   = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentSaving, setCommentSaving] = useState(false);

  useEffect(() => { loadNotices(); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadNotices() {
    setLoading(true);
    // 전체 수
    const { count } = await supabase.from('notices').select('*', { count: 'exact', head: true });
    setTotal(count || 0);

    // 고정글 먼저, 그 다음 최신순
    const from = (page - 1) * PAGE_SIZE;
    const { data } = await supabase.from('notices').select('*')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    setNotices(data || []);
    setLoading(false);
  }

  async function loadComments(noticeId) {
    const { data } = await supabase.from('notice_comments').select('*')
      .eq('notice_id', noticeId).order('created_at', { ascending: true });
    setComments(data || []);
  }

  async function openNotice(n) {
    setView(n); setCommentText('');
    await loadComments(n.id);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    if (editTarget) {
      await supabase.from('notices').update({
        title: form.title, content: form.content, pinned: form.pinned,
      }).eq('id', editTarget.id);
    } else {
      await supabase.from('notices').insert({
        title: form.title, content: form.content, pinned: form.pinned,
        author_id: profile.id, author_name: '관리자',
      });
    }
    setSaving(false);
    setWriting(false); setEditTarget(null); setForm({ title: '', content: '', pinned: false });
    loadNotices();
  }

  async function handleDelete(id) {
    if (!window.confirm('공지사항을 삭제하시겠습니까?')) return;
    await supabase.from('notice_comments').delete().eq('notice_id', id);
    await supabase.from('notices').delete().eq('id', id);
    if (view?.id === id) setView(null);
    loadNotices();
  }

  async function handleTogglePin(n) {
    await supabase.from('notices').update({ pinned: !n.pinned }).eq('id', n.id);
    loadNotices();
    if (view?.id === n.id) setView({ ...n, pinned: !n.pinned });
  }

  async function handleCommentSubmit() {
    if (!commentText.trim()) return;
    setCommentSaving(true);
    await supabase.from('notice_comments').insert({
      notice_id: view.id,
      author_id: profile.id,
      author_name: profile.name,
      content: commentText.trim(),
    });
    setCommentText('');
    await loadComments(view.id);
    setCommentSaving(false);
  }

  async function handleCommentDelete(cid) {
    await supabase.from('notice_comments').delete().eq('id', cid);
    await loadComments(view.id);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // ── 작성/수정 폼 ──
  if (writing || editTarget) {
    return (
      <div className="card" style={{ marginTop: 0 }}>
        <div className="card-title">
          <Icon name="file" style={{ width: 18, height: 18 }} />
          {editTarget ? '공지사항 수정' : '공지사항 작성'}
        </div>
        <div className="form-group">
          <label className="form-label">제목</label>
          <input className="form-input" placeholder="제목을 입력하세요" value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">내용</label>
          <textarea className="form-input" rows={8} placeholder="내용을 입력하세요"
            style={{ resize: 'vertical', lineHeight: 1.6 }}
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <input type="checkbox" id="pinned" checked={form.pinned}
            onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))} />
          <label htmlFor="pinned" style={{ fontSize: 14, cursor: 'pointer' }}>📌 상단 고정</label>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline btn-sm" onClick={() => { setWriting(false); setEditTarget(null); setForm({ title: '', content: '', pinned: false }); }}>취소</button>
          <button className="btn btn-sm" style={{ background: 'var(--blue)', color: 'white' }}
            disabled={saving || !form.title.trim() || !form.content.trim()} onClick={handleSave}>
            {saving ? <span className="loading-spinner" /> : (editTarget ? '수정 완료' : '등록')}
          </button>
        </div>
      </div>
    );
  }

  // ── 상세보기 ──
  if (view) {
    return (
      <div>
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              {view.pinned && <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, marginRight: 8 }}>📌 고정</span>}
              <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)' }}>{view.title}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              {isAdmin && (
                <>
                  <button className="btn btn-sm btn-outline" onClick={() => handleTogglePin(view)}>
                    {view.pinned ? '고정 해제' : '📌 고정'}
                  </button>
                  <button className="btn btn-sm btn-blue-light" onClick={() => {
                    setEditTarget(view); setForm({ title: view.title, content: view.content, pinned: view.pinned }); setView(null);
                  }}>수정</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(view.id)}>삭제</button>
                </>
              )}
              <button className="btn btn-sm btn-outline" onClick={() => setView(null)}>← 목록</button>
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--gray3)', marginBottom: 20 }}>
            {view.author_name} · {fmtDateTime(view.created_at)}
          </div>
          <div className="divider" />
          <div style={{ fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'var(--text)', padding: '12px 0' }}>
            {view.content}
          </div>
        </div>

        {/* 댓글 */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>
            댓글 <span style={{ fontSize: 13, color: 'var(--gray3)', fontWeight: 400 }}>{comments.length}개</span>
          </div>
          {comments.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--gray3)', textAlign: 'center', padding: '20px 0' }}>첫 댓글을 남겨보세요.</div>
          ) : (
            <div style={{ marginBottom: 16 }}>
              {comments.map(c => (
                <div key={c.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--gray2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="user-avatar" style={{ width: 26, height: 26, fontSize: 11 }}>{getInitial(c.author_name)}</div>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{c.author_name}</span>
                      <span style={{ fontSize: 11, color: 'var(--gray3)' }}>{fmtDateTime(c.created_at)}</span>
                    </div>
                    {(isAdmin || c.author_id === profile?.id) && (
                      <button className="btn btn-sm btn-danger" style={{ padding: '3px 8px', fontSize: 11 }}
                        onClick={() => handleCommentDelete(c.id)}>삭제</button>
                    )}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text)', paddingLeft: 34, lineHeight: 1.6 }}>{c.content}</div>
                </div>
              ))}
            </div>
          )}
          {/* 댓글 입력 */}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input className="form-input" placeholder="댓글을 입력하세요"
              value={commentText} onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCommentSubmit(); } }}
              style={{ flex: 1 }} />
            <button className="btn btn-sm" style={{ background: 'var(--blue)', color: 'white', minWidth: 64 }}
              disabled={!commentText.trim() || commentSaving} onClick={handleCommentSubmit}>
              {commentSaving ? <span className="loading-spinner" /> : '등록'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 목록 ──
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 6 }}>
          📋 공지사항
          <span style={{ fontSize: 12, color: 'var(--gray3)', fontWeight: 400 }}>총 {total}건</span>
        </div>
        {isAdmin && (
          <button className="btn btn-sm" style={{ background: 'var(--blue)', color: 'white' }}
            onClick={() => { setWriting(true); setForm({ title: '', content: '', pinned: false }); }}>
            + 공지 작성
          </button>
        )}
      </div>

      <div className="table-wrap">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--gray3)' }}>불러오는 중...</div>
        ) : notices.length === 0 ? (
          <div className="empty-state" style={{ padding: 40 }}>
            <Icon name="file" style={{ width: 36, height: 36 }} />
            <p>등록된 공지사항이 없습니다.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>제목</th>
                <th style={{ width: 100 }}>작성자</th>
                <th style={{ width: 130 }}>작성일</th>
                {isAdmin && <th style={{ width: 80 }}></th>}
              </tr>
            </thead>
            <tbody>
              {notices.map(n => (
                <tr key={n.id} style={{ cursor: 'pointer' }} onClick={() => openNotice(n)}>
                  <td style={{ textAlign: 'center' }}>
                    {n.pinned && <span title="고정">📌</span>}
                  </td>
                  <td style={{ fontWeight: n.pinned ? 700 : 400, color: n.pinned ? 'var(--navy)' : 'var(--text)' }}>
                    {n.title}
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--gray4)' }}>{n.author_name}</td>
                  <td style={{ fontSize: 12, color: 'var(--gray3)' }}>{fmtDateTime(n.created_at)}</td>
                  {isAdmin && (
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-sm btn-danger" style={{ padding: '3px 8px', fontSize: 11 }}
                          onClick={() => handleDelete(n.id)}>삭제</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
          <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>이전</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} className="btn btn-sm"
              style={{ background: p === page ? 'var(--navy)' : 'transparent', color: p === page ? 'white' : 'var(--gray4)', border: '1.5px solid var(--gray2)', minWidth: 34 }}
              onClick={() => setPage(p)}>{p}</button>
          ))}
          <button className="btn btn-outline btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>다음</button>
        </div>
      )}
    </div>
  );
}

/* ─── HOME PAGE ────────────────────────────────────────────────────── */
function HomePage({ onNavigate, profile }) {
  return (
    <div>
      <div className="page-header">
        <div className="page-title">대시보드</div>
        <div className="page-sub">매입/매출 파일을 업로드하고 이력을 관리하세요.</div>
      </div>

      {/* 메뉴 카드 - 일렬 */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        <div className="menu-card" style={{ flex: 1 }} onClick={() => onNavigate('purchase')}>
          <div className="menu-card-icon" style={{ background: '#eff6ff' }}>
            <Icon name="truck" style={{ color: '#2563eb' }} />
          </div>
          <div className="menu-card-title">매입</div>
          <div className="menu-card-desc">판매처별 매입 엑셀 파일을 업로드합니다.</div>
          <div className="menu-card-arrow">바로가기 <Icon name="arrow" style={{ width: 14, height: 14 }} /></div>
        </div>
        <div className="menu-card" style={{ flex: 1 }} onClick={() => onNavigate('sales')}>
          <div className="menu-card-icon" style={{ background: '#f0fdf4' }}>
            <Icon name="chart" style={{ color: '#22c55e' }} />
          </div>
          <div className="menu-card-title">매출</div>
          <div className="menu-card-desc">판매처별 매출 엑셀 파일을 업로드합니다.</div>
          <div className="menu-card-arrow">바로가기 <Icon name="arrow" style={{ width: 14, height: 14 }} /></div>
        </div>
        <div className="menu-card" style={{ flex: 1 }} onClick={() => onNavigate('history')}>
          <div className="menu-card-icon" style={{ background: '#fdf4ff' }}>
            <Icon name="history" style={{ color: '#a855f7' }} />
          </div>
          <div className="menu-card-title">업로드 이력</div>
          <div className="menu-card-desc">매입·매출 파일 업로드 이력을 조회합니다.</div>
          <div className="menu-card-arrow">바로가기 <Icon name="arrow" style={{ width: 14, height: 14 }} /></div>
        </div>
      </div>

      {/* 공지사항 */}
      <NoticeBoard profile={profile} />
    </div>
  );
}

/* ─── DUPLICATE MODAL ───────────────────────────────────────────────── */
function DuplicateModal({ existing, newFile, onReplace, onAdd, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
    }}>
      <div style={{
        background: 'white', borderRadius: 16, padding: 32, maxWidth: 460, width: '90%',
        boxShadow: '0 24px 64px rgba(0,0,0,.3)', animation: 'fadeUp .25s ease',
      }}>
        {/* 아이콘 */}
        <div style={{
          width: 52, height: 52, background: '#fef3c7', borderRadius: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', fontSize: 24,
        }}>⚠️</div>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>
            동일한 날짜 데이터가 있습니다
          </div>
          <div style={{ fontSize: 13, color: 'var(--gray4)', lineHeight: 1.6 }}>
            <strong>{existing.vendor}</strong> · <strong>{existing.date}</strong> 에<br/>
            이미 업로드된 파일이 있습니다.
          </div>
        </div>

        {/* 기존 파일 정보 */}
        <div style={{
          background: '#fef3c7', borderRadius: 10, padding: '12px 16px',
          marginBottom: 8, fontSize: 13,
        }}>
          <div style={{ color: '#92400e', fontWeight: 600, marginBottom: 4 }}>기존 파일</div>
          <div style={{ color: '#78350f' }}>📄 {existing.file_name}</div>
          <div style={{ color: '#92400e', fontSize: 12, marginTop: 2 }}>
            업로드: {fmtDateTime(existing.created_at)} · {existing.user_name}
          </div>
        </div>

        {/* 새 파일 정보 */}
        <div style={{
          background: '#f0fdf4', borderRadius: 10, padding: '12px 16px',
          marginBottom: 24, fontSize: 13,
        }}>
          <div style={{ color: '#15803d', fontWeight: 600, marginBottom: 4 }}>새 파일</div>
          <div style={{ color: '#166534' }}>📄 {newFile.name}</div>
          <div style={{ color: '#15803d', fontSize: 12, marginTop: 2 }}>
            {(newFile.size / 1024).toFixed(1)} KB
          </div>
        </div>

        {/* 버튼 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn" style={{
            background: '#ef4444', color: 'white', width: '100%', padding: '12px',
            fontSize: 14, fontWeight: 600,
          }} onClick={onReplace}>
            🔄 기존 파일 삭제 후 교체
          </button>
          <button className="btn" style={{
            background: 'var(--blue)', color: 'white', width: '100%', padding: '12px',
            fontSize: 14, fontWeight: 600,
          }} onClick={onAdd}>
            ➕ 기존 파일 유지하고 추가
          </button>
          <button className="btn btn-outline" style={{ width: '100%', padding: '11px' }}
            onClick={onCancel}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── 판매처 파일 자동 감지 및 파싱 ─────────────────────────────────── */
async function detectAndParseFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer.slice(0, 4));
  const isPK = uint8[0] === 0x50 && uint8[1] === 0x4B; // ZIP = xlsx

  const results = []; // [{vendor, date, items:[{code,qty}]}]

  try {
    if (isPK) {
      // xlsx 형식: 이마트/에브리데이 통합 or 메가마트
      const wb = XLSX.read(arrayBuffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const firstCell = String(rows[0]?.[0] || '').trim();

      if (firstCell === '조회일자') {
        // 이마트 / 에브리데이 통합 파일
        const rawDate = String(rows[1]?.[0] || '');
        const date = rawDate.length === 8
          ? `${rawDate.slice(0,4)}-${rawDate.slice(4,6)}-${rawDate.slice(6,8)}`
          : null;

        const emMap = {}, edMap = {};
        for (let i = 1; i < rows.length; i++) {
          const r = rows[i];
          const code = String(r[5] || '').trim();
          if (!code.startsWith('88')) continue;
          const store = String(r[4] || '');
          const qty = Number(r[7]) || 0;
          if (store.startsWith('EM')) emMap[code] = (emMap[code]||0) + qty;
          else if (store.startsWith('ED')) edMap[code] = (edMap[code]||0) + qty;
        }
        if (Object.keys(emMap).length > 0)
          results.push({ vendor: '이마트', date, items: Object.entries(emMap).map(([code,qty])=>({code,qty})) });
        if (Object.keys(edMap).length > 0)
          results.push({ vendor: '에브리데이', date, items: Object.entries(edMap).map(([code,qty])=>({code,qty})) });

      } else {
        // 메가마트 (날짜 없음)
        const codeMap = {};
        for (let i = 1; i < rows.length; i++) {
          const r = rows[i];
          if (!r[2] || String(r[1]||'').includes('합계') || String(r[0]||'') === '합계') continue;
          const code = String(r[2]).trim();
          if (!code.startsWith('88')) continue;
          codeMap[code] = (codeMap[code]||0) + (Number(r[5])||0);
        }
        if (Object.keys(codeMap).length > 0)
          results.push({ vendor: '메가마트', date: null, items: Object.entries(codeMap).map(([code,qty])=>({code,qty})) });
      }

    } else {
      // HTML xls 형식 - 인코딩 감지
      const headerSlice = new TextDecoder('euc-kr').decode(arrayBuffer.slice(0, 300));
      const isEucKr = headerSlice.toLowerCase().includes('euc-kr');

      const wb = XLSX.read(arrayBuffer, { type: 'array', codepage: isEucKr ? 949 : undefined });

      // 헤더 시트에서 판매처/날짜 감지
      const ws0 = wb.Sheets[wb.SheetNames[0]];
      const headerRows = XLSX.utils.sheet_to_json(ws0, { header: 1 });
      const headerText = headerRows.flat().map(v => String(v||'')).join(' ');

      let vendor = null;
      if (headerText.includes('롯데마트')) vendor = '롯데마트';
      else if (headerText.includes('롯데슈퍼')) vendor = '롯데슈퍼';
      else if (headerText.includes('Hyper')) vendor = '홈플러스';
      else if (headerText.includes('Express')) vendor = '익스프레스';

      const dateMatch = headerText.match(/(\d{4}-\d{2}-\d{2})/);
      const date = dateMatch ? dateMatch[1] : null;

      // 데이터 시트 파싱
      const dataSheet = wb.SheetNames.length > 1 ? wb.SheetNames[1] : wb.SheetNames[0];
      const ws1 = wb.Sheets[dataSheet];
      const dataRows = XLSX.utils.sheet_to_json(ws1, { header: 1 });

      const items = [];
      if (vendor === '롯데마트' || vendor === '롯데슈퍼') {
        for (let i = 1; i < dataRows.length; i++) {
          const r = dataRows[i];
          const code = String(r[0]||'').trim();
          if (!code.startsWith('88')) continue;
          items.push({ code, qty: Number(r[4])||0 });
        }
      } else if (vendor === '홈플러스' || vendor === '익스프레스') {
        for (let i = 1; i < dataRows.length; i++) {
          const r = dataRows[i];
          const code = String(r[1]||'').trim();
          if (!code.match(/^\d{10,14}$/) || !code.startsWith('88')) continue;
          items.push({ code, qty: Number(r[4])||0 });
        }
      }

      if (vendor && items.length > 0) results.push({ vendor, date, items });
    }
  } catch (e) {
    throw new Error(`파싱 실패: ${e.message}`);
  }

  return results;
}

/* ─── 자사 양식 다운로드 ────────────────────────────────────────────── */
async function downloadSelfFormat(rows, vendor, date) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('매출내역');

  // 열 너비 설정
  ws.columns = [
    { width: 12 }, // A 업체명
    { width: 8  }, // B 연도
    { width: 6  }, // C 월
    { width: 5  }, // D 일
    { width: 14 }, // E 일자
    { width: 18 }, // F 상품코드
    { width: 12 }, // G 판매수량
  ];

  const FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCCFF' } };
  const FONT = { name: '맑은 고딕', size: 10 };
  const CENTER = { horizontal: 'center' };
  const ACCT = '_-* #,##0_-;\\-* #,##0_-;_-* "-"_-;_-@_-';

  rows.forEach(r => {
    const row = ws.addRow([
      r.업체명, r.연도, r.월, r.일, r.일자, r.상품코드, r.판매수량
    ]);

    row.eachCell({ includeEmpty: false }, (cell, colNum) => {
      cell.font = FONT;
      cell.fill = FILL;

      if (colNum <= 5) {
        // 업체명~일자: 중앙정렬
        cell.alignment = CENTER;
      }
      if (colNum === 6) {
        // 상품코드: 텍스트
        cell.numFmt = '@';
        cell.value = String(r.상품코드);
      }
      if (colNum === 7) {
        // 판매수량: 회계
        cell.numFmt = ACCT;
      }
    });
  });

  // 버퍼 → Blob → 다운로드
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `매출내역_${vendor}_${date}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}


/* ─── UPLOAD FORM (매입 전용) ────────────────────────────────────────── */
function UploadForm({ type, profile, color, bgColor, onUploaded }) {
  const [step, setStep]           = useState(1);
  const [vendor, setVendor]       = useState(null);
  const [date, setDate]           = useState(todayStr());
  const [file, setFile]           = useState(null);
  const [dragging, setDragging]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg]             = useState(null);
  const [dupModal, setDupModal]   = useState(null);
  const fileRef                   = useRef();

  function todayStr() { return new Date().toISOString().split('T')[0]; }
  function resetFlow() { setStep(1); setVendor(null); setDate(todayStr()); setFile(null); setMsg(null); setDupModal(null); }
  function handleDrop(e) { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) acceptFile(f); }
  function handleFileInput(e) { const f = e.target.files[0]; if (f) acceptFile(f); }
  function acceptFile(f) {
    if (!f.name.match(/\.(xlsx|xls|csv)$/i)) { setMsg({ type: 'error', text: 'Excel 파일만 가능합니다.' }); return; }
    setFile(f); setMsg(null);
  }

  async function doUpload(replaceTargets, targetFile) {
    setUploading(true); setDupModal(null); setMsg(null);
    try {
      if (replaceTargets?.length > 0) {
        await supabase.storage.from('excel-uploads').remove(replaceTargets.map(r => r.file_path));
        await supabase.from('uploads').delete().in('id', replaceTargets.map(r => r.id));
      }
      const ts = Date.now();
      const safeName = targetFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const safeVendor = vendor.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `purchase/${safeVendor}/${date}/${ts}_${safeName}`;
      const { error: stErr } = await supabase.storage.from('excel-uploads').upload(path, targetFile);
      if (stErr) throw stErr;
      const { error: dbErr } = await supabase.from('uploads').insert({
        user_id: profile.id, user_name: profile.name,
        type, vendor, date, file_name: targetFile.name, file_path: path, file_size: targetFile.size,
      });
      if (dbErr) throw dbErr;
      setMsg({ type: 'success', text: `✅ 업로드 완료! (${vendor} / ${date})` });
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      if (onUploaded) onUploaded();
    } catch (err) {
      setMsg({ type: 'error', text: `업로드 실패: ${err.message}` });
    } finally { setUploading(false); }
  }

  async function handleUpload() {
    if (!file || uploading) return;
    setMsg(null);
    try {
      const { data: existing } = await supabase.from('uploads').select('*').eq('type', type).eq('vendor', vendor).eq('date', date);
      if (existing?.length > 0) setDupModal({ existing });
      else doUpload(null, file);
    } catch (err) { setMsg({ type: 'error', text: `오류: ${err.message}` }); }
  }

  const steps = ['판매처 선택', '날짜 선택', '파일 업로드'];
  return (
    <div>
      {dupModal && (
        <DuplicateModal existing={dupModal.existing[0]} newFile={file}
          onReplace={() => { const f = file; setFile(null); doUpload(dupModal.existing, f); }}
          onAdd={() => { const f = file; setFile(null); doUpload(null, f); }}
          onCancel={() => setDupModal(null)} />
      )}
      <div className="flow-steps" style={{ marginBottom: 28 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:0, flex: i < steps.length-1 ? 1 : 'none' }}>
            <div className={`flow-step ${step > i+1 ? 'done' : step === i+1 ? 'active' : ''}`}
                 style={{ cursor: step > i+1 ? 'pointer' : 'default' }}
                 onClick={() => { if (step > i+1) setStep(i+1); }}>
              <div className="step-num">{step > i+1 ? <Icon name="check" style={{ width:12,height:12 }} /> : i+1}</div>
              <span style={{ fontSize:13 }}>{s}</span>
            </div>
            {i < steps.length-1 && <div className="flow-divider" />}
          </div>
        ))}
      </div>
      {step === 1 && (
        <div className="card">
          <div className="card-title"><Icon name="building" style={{ width:18,height:18,color }} />판매처를 선택하세요</div>
          <div className="vendor-grid">
            {VENDORS.map(v => (
              <button key={v} className={`vendor-btn ${vendor===v?'selected':''}`} style={{'--vc': VENDOR_COLORS[v]}}
                onClick={() => { setVendor(v); setStep(2); }}>{v}</button>
            ))}
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="card">
          <div className="card-title"><Icon name="history" style={{ width:18,height:18,color }} />날짜를 선택하세요</div>
          <div className="date-input-wrap">
            <label className="form-label">날짜</label>
            <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div style={{ marginTop:20, display:'flex', gap:10 }}>
            <button className="btn btn-outline btn-sm" onClick={() => setStep(1)}>← 이전</button>
            <button className="btn btn-sm" style={{ background:color, color:'white' }} onClick={() => setStep(3)} disabled={!date}>다음 →</button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="card">
          <div className="card-title"><Icon name="upload" style={{ width:18,height:18,color }} />파일을 업로드하세요</div>
          <div className="summary-box" style={{ background:bgColor }}>
            <div className="summary-item"><label style={{color}}>구분</label><value>{type}</value></div>
            <div className="summary-item"><label style={{color}}>판매처</label><value style={{color:VENDOR_COLORS[vendor]}}><span className="vendor-dot" style={{background:VENDOR_COLORS[vendor]}}/>{vendor}</value></div>
            <div className="summary-item"><label style={{color}}>날짜</label><value>{date}</value></div>
          </div>
          {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
          <div className={`drop-zone ${dragging?'drag-over':''} ${file?'has-file':''}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}>
            <div className="drop-icon"><Icon name={file?'file':'upload'} style={{width:48,height:48}} /></div>
            {file
              ? (<><div className="drop-title">{file.name}</div><div className="drop-sub">{(file.size/1024).toFixed(1)} KB</div></>)
              : (<><div className="drop-title">파일을 드래그하거나 클릭하여 선택</div><div className="drop-sub">.xlsx, .xls, .csv 지원</div></>)
            }
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{display:'none'}} onChange={handleFileInput} />
          </div>
          <div style={{ marginTop:20, display:'flex', gap:10, justifyContent:'space-between' }}>
            <button className="btn btn-outline btn-sm" onClick={() => setStep(2)}>← 이전</button>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-outline btn-sm" onClick={resetFlow}>처음부터</button>
              <button className="btn btn-sm" style={{ background:color, color:'white', minWidth:100 }}
                disabled={!file || uploading} onClick={handleUpload}>
                {uploading ? <span className="loading-spinner" /> : `업로드${file ? '' : ' (파일 선택 필요)'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── BULK UPLOAD FORM (매출 전용) ──────────────────────────────────── */
function BulkUploadForm({ profile, onUploaded }) {
  const [files, setFiles]       = useState([]);
  const [detected, setDetected] = useState([]); // [{file, vendor, date, items, needsDate, error}]
  const [detecting, setDetecting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg]           = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  async function handleFiles(fileList) {
    const arr = Array.from(fileList).filter(f => f.name.match(/\.(xlsx|xls)$/i));
    if (!arr.length) return;
    setFiles(arr); setDetecting(true); setMsg(null); setDetected([]);
    const results = [];
    for (const file of arr) {
      try {
        const parsed = await detectAndParseFile(file);
        for (const p of parsed) {
          results.push({ file, vendor: p.vendor || '감지 실패', date: p.date || '', items: p.items, needsDate: !p.date, error: null });
        }
        if (parsed.length === 0) results.push({ file, vendor: '감지 실패', date: '', items: [], needsDate: false, error: '판매처를 인식할 수 없습니다.' });
      } catch (e) {
        results.push({ file, vendor: '감지 실패', date: '', items: [], needsDate: false, error: e.message });
      }
    }
    setDetected(results); setDetecting(false);
  }

  function updateDate(idx, date) { setDetected(prev => prev.map((d,i) => i===idx ? {...d, date} : d)); }
  function updateVendor(idx, vendor) { setDetected(prev => prev.map((d,i) => i===idx ? {...d, vendor} : d)); }

  async function handleUpload() {
    const valid = detected.filter(d => d.vendor !== '감지 실패' && d.date && d.items.length > 0);
    if (!valid.length) return;
    setUploading(true); setMsg(null);
    let success = 0, fail = 0;

    for (const d of valid) {
      try {
        const ts = Date.now();
        const safeName = d.file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const safeVendor = d.vendor.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `sales/${safeVendor}/${d.date}/${ts}_${safeName}`;

        const { error: stErr } = await supabase.storage.from('excel-uploads').upload(path, d.file, { upsert: true });
        if (stErr) throw stErr;

        const { data: uploadRow, error: upErr } = await supabase.from('uploads').insert({
          user_id: profile.id, user_name: profile.name,
          type: '매출', vendor: d.vendor, date: d.date,
          file_name: d.file.name, file_path: path, file_size: d.file.size,
        }).select().single();
        if (upErr) throw upErr;

        const year  = d.date.substring(0,4) + '년';
        const month = parseInt(d.date.substring(5,7)) + '월';
        const day   = parseInt(d.date.substring(8,10));
        const salesRows = d.items.map(item => ({
          upload_id: uploadRow.id, vendor: d.vendor, date: d.date,
          year, month, day, product_code: item.code, quantity: item.qty,
        }));
        const { error: sdErr } = await supabase.from('sales_data').insert(salesRows);
        if (sdErr) throw sdErr;
        success++;
      } catch (e) { console.error(e); fail++; }
    }

    setMsg({ type: fail>0?'warn':'success', text: `✅ ${success}건 업로드 완료${fail>0?` / ${fail}건 실패`:''}` });
    setUploading(false); setFiles([]); setDetected([]);
    if (onUploaded) onUploaded();
  }

  const readyCount = detected.filter(d => d.vendor !== '감지 실패' && d.date && d.items.length > 0).length;

  return (
    <div>
      <div className={`drop-zone ${dragging?'drag-over':''} ${files.length>0?'has-file':''}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}>
        <div className="drop-icon"><Icon name="upload" style={{width:48,height:48}} /></div>
        {files.length > 0
          ? (<><div className="drop-title">{files.length}개 파일 선택됨</div><div className="drop-sub">클릭하여 변경</div></>)
          : (<><div className="drop-title">판매처 매출 파일을 드래그하거나 클릭하여 선택</div><div className="drop-sub">여러 파일 동시 선택 가능 · .xlsx, .xls 지원</div></>)
        }
        <input ref={fileRef} type="file" accept=".xlsx,.xls" multiple style={{display:'none'}}
          onChange={e => handleFiles(e.target.files)} />
      </div>

      {detecting && (
        <div className="alert alert-info" style={{marginTop:16}}>
          <span className="loading-spinner" style={{borderColor:'rgba(37,99,235,.3)',borderTopColor:'#2563eb'}} />
          파일 분석 중...
        </div>
      )}

      {detected.length > 0 && !detecting && (
        <div style={{marginTop:20}}>
          <div style={{fontSize:14,fontWeight:700,color:'var(--navy)',marginBottom:12}}>
            감지 결과 확인 — 날짜나 판매처가 틀리면 직접 수정하세요
          </div>
          <div className="table-wrap" style={{marginBottom:16}}>
            <table>
              <thead>
                <tr>
                  <th>파일명</th>
                  <th>판매처</th>
                  <th>날짜</th>
                  <th>상품수</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {detected.map((d, i) => (
                  <tr key={i}>
                    <td style={{fontSize:12,color:'var(--gray4)',maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      {d.file.name}
                    </td>
                    <td>
                      {d.vendor !== '감지 실패' ? (
                        <select className="filter-select" value={d.vendor} onChange={e => updateVendor(i, e.target.value)} style={{padding:'4px 8px',fontSize:12}}>
                          {VENDORS.map(v => <option key={v}>{v}</option>)}
                        </select>
                      ) : (
                        <select className="filter-select" value="" onChange={e => updateVendor(i, e.target.value)} style={{padding:'4px 8px',fontSize:12}}>
                          <option value="">판매처 선택</option>
                          {VENDORS.map(v => <option key={v}>{v}</option>)}
                        </select>
                      )}
                    </td>
                    <td>
                      <input type="date" className="filter-select" value={d.date}
                        onChange={e => updateDate(i, e.target.value)}
                        style={{padding:'4px 8px'}} />
                    </td>
                    <td style={{fontSize:13}}>{d.items.length}개</td>
                    <td>
                      {d.error ? <span className="badge badge-red">오류</span>
                        : (!d.date || d.vendor === '감지 실패') ? <span className="badge badge-amber">확인 필요</span>
                        : <span className="badge badge-green">준비됨</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {msg && <div className={`alert alert-${msg.type}`} style={{marginBottom:12}}>{msg.text}</div>}
          <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
            <button className="btn btn-outline btn-sm" onClick={() => { setFiles([]); setDetected([]); setMsg(null); }}>초기화</button>
            <button className="btn btn-sm" style={{background:'#22c55e',color:'white',minWidth:120}}
              disabled={uploading || readyCount === 0} onClick={handleUpload}>
              {uploading ? <span className="loading-spinner" /> : `${readyCount}건 업로드`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── SALES DATA VIEW (매출 데이터 조회) ────────────────────────────── */
function SalesDataView({ profile, refreshKey }) { // eslint-disable-line no-unused-vars
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filterVendor, setFilterVendor]     = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo]     = useState('');
  const [selected, setSelected]   = useState(new Set());
  const [downloading, setDownloading] = useState(false);

  useEffect(() => { loadSummaries(); }, [filterVendor, filterDateFrom, filterDateTo, refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadSummaries() {
    setLoading(true);
    let q = supabase.from('sales_data').select('vendor, date, product_code, quantity');
    if (filterVendor)   q = q.eq('vendor', filterVendor);
    if (filterDateFrom) q = q.gte('date', filterDateFrom);
    if (filterDateTo)   q = q.lte('date', filterDateTo);
    const { data } = await q;

    const map = {};
    (data || []).forEach(row => {
      const key = `${row.vendor}|${row.date}`;
      if (!map[key]) map[key] = { vendor: row.vendor, date: row.date, count: 0, total_qty: 0 };
      map[key].count++;
      map[key].total_qty += row.quantity;
    });
    setSummaries(Object.values(map).sort((a,b) => b.date.localeCompare(a.date) || a.vendor.localeCompare(b.vendor)));
    setLoading(false);
  }

  function toggleSelect(key) {
    setSelected(prev => { const s = new Set(prev); s.has(key) ? s.delete(key) : s.add(key); return s; });
  }
  function toggleAll() {
    setSelected(selected.size === summaries.length ? new Set() : new Set(summaries.map(s => `${s.vendor}|${s.date}`)));
  }

  async function handleDownload(keys) {
    if (!keys.size) return;
    setDownloading(true);
    try {
      const conditions = Array.from(keys).map(k => { const [vendor, date] = k.split('|'); return { vendor, date }; });
      let allRows = [];
      for (const { vendor, date } of conditions) {
        const { data } = await supabase.from('sales_data').select('*').eq('vendor', vendor).eq('date', date);
        allRows = allRows.concat(data || []);
      }
      const label = conditions.length === 1 ? conditions[0].vendor : '통합';
      const dateLabel = conditions.length === 1 ? conditions[0].date : new Date().toISOString().split('T')[0];
      await downloadSelfFormat(
        allRows.map(r => ({ 업체명: r.vendor, 연도: r.year, 월: r.month, 일: r.day, 일자: r.date, 상품코드: r.product_code, 판매수량: r.quantity })),
        label, dateLabel
      );
    } catch(e) { console.error(e); }
    setDownloading(false);
  }

  // 판매처별 요약 카드
  const vendorSums = VENDORS.map(v => ({
    vendor: v, count: summaries.filter(s => s.vendor === v).length,
  })).filter(v => v.count > 0);

  return (
    <div>
      {/* 판매처 요약 카드 */}
      {!filterVendor && vendorSums.length > 0 && (
        <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:20}}>
          {vendorSums.map(({vendor, count}) => (
            <div key={vendor} onClick={() => setFilterVendor(vendor)}
              style={{background:'white',border:`2px solid ${VENDOR_COLORS[vendor]||'#e5e9ef'}`,borderRadius:10,padding:'10px 16px',cursor:'pointer',display:'flex',alignItems:'center',gap:8,boxShadow:'var(--shadow)',transition:'transform .15s'}}
              onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e=>e.currentTarget.style.transform=''}>
              <span className="vendor-dot" style={{background:VENDOR_COLORS[vendor],width:10,height:10}} />
              <span style={{fontSize:13,fontWeight:600,color:'var(--navy)'}}>{vendor}</span>
              <span style={{background:`${VENDOR_COLORS[vendor]}20`,color:VENDOR_COLORS[vendor],fontSize:12,fontWeight:700,padding:'1px 8px',borderRadius:10}}>{count}일치</span>
            </div>
          ))}
        </div>
      )}

      {/* 필터 + 다운로드 버튼 */}
      <div className="filter-bar">
        <select className="filter-select" value={filterVendor} onChange={e => setFilterVendor(e.target.value)}>
          <option value="">전체 판매처</option>
          {VENDORS.map(v => <option key={v}>{v}</option>)}
        </select>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <input type="date" className="filter-select" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} />
          <span style={{color:'var(--gray3)',fontSize:13}}>~</span>
          <input type="date" className="filter-select" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} />
        </div>
        {(filterVendor||filterDateFrom||filterDateTo) && (
          <button className="btn btn-outline btn-sm" onClick={() => { setFilterVendor(''); setFilterDateFrom(''); setFilterDateTo(''); }}>필터 초기화</button>
        )}
        <div style={{marginLeft:'auto',display:'flex',gap:8,alignItems:'center'}}>
          {selected.size > 0 && (
            <span style={{fontSize:13,color:'var(--gray3)'}}>{selected.size}건 선택</span>
          )}
          {selected.size > 0 && (
            <button className="btn btn-sm" style={{background:'#22c55e',color:'white'}}
              disabled={downloading} onClick={() => handleDownload(selected)}>
              {downloading ? <span className="loading-spinner" /> : <><Icon name="download" style={{width:14,height:14}} /> 선택 다운로드</>}
            </button>
          )}
          {summaries.length > 0 && (
            <button className="btn btn-sm btn-blue-light" disabled={downloading}
              onClick={() => handleDownload(new Set(summaries.map(s=>`${s.vendor}|${s.date}`)))}>
              전체 다운로드
            </button>
          )}
        </div>
      </div>

      {/* 데이터 테이블 */}
      <div className="table-wrap">
        {loading ? (
          <div style={{textAlign:'center',padding:48,color:'var(--gray3)'}}>불러오는 중...</div>
        ) : summaries.length === 0 ? (
          <div className="empty-state"><Icon name="file" style={{width:48,height:48}} /><p>데이터가 없습니다.</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{width:40}}>
                  <input type="checkbox" checked={selected.size===summaries.length&&summaries.length>0} onChange={toggleAll} />
                </th>
                <th>날짜</th>
                <th>판매처</th>
                <th>상품수</th>
                <th>총 판매수량</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {summaries.map(s => {
                const key = `${s.vendor}|${s.date}`;
                return (
                  <tr key={key} style={{cursor:'pointer'}} onClick={() => toggleSelect(key)}>
                    <td onClick={e=>e.stopPropagation()}>
                      <input type="checkbox" checked={selected.has(key)} onChange={() => toggleSelect(key)} />
                    </td>
                    <td style={{fontWeight:600,fontVariantNumeric:'tabular-nums'}}>{s.date}</td>
                    <td>
                      <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
                        <span className="vendor-dot" style={{background:VENDOR_COLORS[s.vendor]||'#94a3b8'}} />
                        <span style={{fontWeight:500}}>{s.vendor}</span>
                      </span>
                    </td>
                    <td style={{fontSize:13,color:'var(--gray4)'}}>{s.count}개</td>
                    <td style={{fontVariantNumeric:'tabular-nums'}}>{s.total_qty.toLocaleString()}</td>
                    <td>
                      <button className="btn btn-sm btn-blue-light"
                        onClick={e => { e.stopPropagation(); handleDownload(new Set([key])); }}>
                        <Icon name="download" style={{width:14,height:14}} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}


/* ─── DATA VIEW ─────────────────────────────────────────────────────── */
function DataView({ type, profile, color, bgColor, refreshKey }) {
  const [rows, setRows]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filterVendor, setFilterVendor] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo]     = useState('');

  const isAdmin = profile?.role === 'admin';

  useEffect(() => { loadData(); }, [filterVendor, filterDateFrom, filterDateTo, refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadData() {
    setLoading(true);
    let q = supabase.from('uploads').select('*')
      .eq('type', type)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    if (filterVendor)   q = q.eq('vendor', filterVendor);
    if (filterDateFrom) q = q.gte('date', filterDateFrom);
    if (filterDateTo)   q = q.lte('date', filterDateTo);
    const { data } = await q;
    setRows(data || []);
    setLoading(false);
  }

  async function handleDownload(row) {
    const { data } = await supabase.storage.from('excel-uploads').createSignedUrl(row.file_path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  }

  async function handleDelete(row) {
    if (!window.confirm(`"${row.file_name}" 파일을 삭제하시겠습니까?`)) return;
    await supabase.storage.from('excel-uploads').remove([row.file_path]);
    await supabase.from('uploads').delete().eq('id', row.id);
    loadData();
  }

  // 판매처별 건수 집계
  const vendorCounts = VENDORS.map(v => ({
    vendor: v,
    count: rows.filter(r => r.vendor === v).length,
  })).filter(v => v.count > 0);

  return (
    <div>
      {/* 판매처별 요약 카드 */}
      {!filterVendor && vendorCounts.length > 0 && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          {vendorCounts.map(({ vendor, count }) => (
            <div key={vendor}
              onClick={() => setFilterVendor(vendor)}
              style={{
                background: 'white', border: `2px solid ${VENDOR_COLORS[vendor] || '#e5e9ef'}`,
                borderRadius: 10, padding: '10px 16px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, boxShadow: 'var(--shadow)',
                transition: 'transform .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = ''}>
              <span className="vendor-dot" style={{ background: VENDOR_COLORS[vendor], width: 10, height: 10 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{vendor}</span>
              <span style={{
                background: `${VENDOR_COLORS[vendor]}20`, color: VENDOR_COLORS[vendor],
                fontSize: 12, fontWeight: 700, padding: '1px 8px', borderRadius: 10,
              }}>{count}건</span>
            </div>
          ))}
        </div>
      )}

      {/* 필터 바 */}
      <div className="filter-bar">
        <select className="filter-select" value={filterVendor} onChange={e => setFilterVendor(e.target.value)}>
          <option value="">전체 판매처</option>
          {VENDORS.map(v => <option key={v}>{v}</option>)}
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="date" className="filter-select" value={filterDateFrom}
            onChange={e => setFilterDateFrom(e.target.value)} placeholder="시작일" />
          <span style={{ color: 'var(--gray3)', fontSize: 13 }}>~</span>
          <input type="date" className="filter-select" value={filterDateTo}
            onChange={e => setFilterDateTo(e.target.value)} placeholder="종료일" />
        </div>
        {(filterVendor || filterDateFrom || filterDateTo) && (
          <button className="btn btn-outline btn-sm"
            onClick={() => { setFilterVendor(''); setFilterDateFrom(''); setFilterDateTo(''); }}>
            필터 초기화
          </button>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--gray3)' }}>
          총 <strong style={{ color: 'var(--navy)' }}>{rows.length}</strong>건
        </span>
      </div>

      {/* 테이블 */}
      <div className="table-wrap">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--gray3)' }}>불러오는 중...</div>
        ) : rows.length === 0 ? (
          <div className="empty-state">
            <Icon name="file" style={{ width: 48, height: 48 }} />
            <p>업로드된 데이터가 없습니다.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>날짜</th>
                <th>판매처</th>
                <th>파일명</th>
                <th>크기</th>
                <th>업로더</th>
                <th>업로드 시각</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id}>
                  <td style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{row.date}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span className="vendor-dot" style={{ background: VENDOR_COLORS[row.vendor] || '#94a3b8' }} />
                      <span style={{ fontWeight: 500 }}>{row.vendor}</span>
                    </span>
                  </td>
                  <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, color: 'var(--gray4)' }}>
                    <Icon name="file" style={{ width: 13, height: 13, marginRight: 4, verticalAlign: 'middle' }} />
                    {row.file_name}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--gray3)' }}>
                    {row.file_size ? `${(row.file_size/1024).toFixed(0)} KB` : '-'}
                  </td>
                  <td style={{ fontSize: 13 }}>{row.user_name}</td>
                  <td style={{ fontSize: 12, color: 'var(--gray3)', fontVariantNumeric: 'tabular-nums' }}>
                    {fmtDateTime(row.created_at)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-sm btn-blue-light" onClick={() => handleDownload(row)} title="다운로드">
                        <Icon name="download" style={{ width: 14, height: 14 }} />
                      </button>
                      {(isAdmin || row.user_id === profile?.id) && (
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(row)} title="삭제">
                          <Icon name="x" style={{ width: 14, height: 14 }} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ─── UPLOAD PAGE ──────────────────────────────────────────────────── */
function UploadPage({ type, profile }) {
  const [tab, setTab]           = useState('upload');
  const [refreshKey, setRefreshKey] = useState(0);

  const color   = type === '매입' ? '#2563eb' : '#22c55e';
  const bgColor = type === '매입' ? '#eff6ff' : '#f0fdf4';
  const isSales = type === '매출';

  function handleUploaded() { setRefreshKey(k => k + 1); }

  return (
    <div>
      <div className="page-header">
        <div className="page-title" style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ background:bgColor, color, padding:'2px 12px', borderRadius:20, fontSize:14 }}>{type}</span>
          {type} 관리
        </div>
        {isSales && <div className="page-sub">파일을 업로드하면 판매처·날짜가 자동으로 인식됩니다.</div>}
      </div>

      <div className="admin-tabs" style={{ marginBottom:24 }}>
        <button className={`admin-tab ${tab==='upload'?'active':''}`} onClick={() => setTab('upload')}>
          <Icon name="upload" style={{width:15,height:15}} /> {isSales ? '일괄 업로드' : '파일 업로드'}
        </button>
        <button className={`admin-tab ${tab==='data'?'active':''}`} onClick={() => setTab('data')}>
          <Icon name="grid" style={{width:15,height:15}} /> 데이터 조회
        </button>
      </div>

      {tab === 'upload' && isSales && <BulkUploadForm profile={profile} onUploaded={handleUploaded} />}
      {tab === 'upload' && !isSales && <UploadForm type={type} profile={profile} color={color} bgColor={bgColor} onUploaded={handleUploaded} />}
      {tab === 'data'   && isSales && <SalesDataView profile={profile} refreshKey={refreshKey} />}
      {tab === 'data'   && !isSales && <DataView type={type} profile={profile} color={color} bgColor={bgColor} refreshKey={refreshKey} />}
    </div>
  );
}

/* ─── HISTORY PAGE ──────────────────────────────────────────────────── */
function HistoryPage({ profile }) {
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filterType, setFilterType]   = useState('');
  const [filterVendor, setFilterVendor] = useState('');

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    loadHistory();
  }, [filterType, filterVendor]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadHistory() {
    setLoading(true);
    let q = supabase.from('uploads').select('*').order('created_at', { ascending: false });
    if (filterType)   q = q.eq('type', filterType);
    if (filterVendor) q = q.eq('vendor', filterVendor);
    const { data } = await q;
    setRows(data || []);
    setLoading(false);
  }

  async function handleDownload(row) {
    const { data } = await supabase.storage.from('excel-uploads').createSignedUrl(row.file_path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  }

  async function handleDelete(row) {
    if (!window.confirm(`"${row.file_name}" 파일을 삭제하시겠습니까?`)) return;
    await supabase.storage.from('excel-uploads').remove([row.file_path]);
    await supabase.from('uploads').delete().eq('id', row.id);
    loadHistory();
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">업로드 이력</div>
        <div className="page-sub">전체 업로드 이력입니다.</div>
      </div>

      <div className="filter-bar">
        <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">전체 구분</option>
          <option value="매입">매입</option>
          <option value="매출">매출</option>
        </select>
        <select className="filter-select" value={filterVendor} onChange={e => setFilterVendor(e.target.value)}>
          <option value="">전체 판매처</option>
          {VENDORS.map(v => <option key={v}>{v}</option>)}
        </select>
        <button className="btn btn-outline btn-sm" onClick={loadHistory}>새로고침</button>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--gray3)' }}>불러오는 중...</div>
        ) : rows.length === 0 ? (
          <div className="empty-state">
            <Icon name="file" style={{ width: 48, height: 48 }} />
            <p>업로드 이력이 없습니다.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>구분</th>
                <th>판매처</th>
                <th>날짜</th>
                <th>파일명</th>
                <th>업로더</th>
                <th>업로드 시각</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id}>
                  <td>
                    <span className={`badge ${row.type === '매입' ? 'badge-blue' : 'badge-green'}`}>
                      {row.type}
                    </span>
                  </td>
                  <td>
                    <span className="vendor-dot" style={{ background: VENDOR_COLORS[row.vendor] || '#94a3b8' }} />
                    {row.vendor}
                  </td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>{row.date}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, color: 'var(--gray4)' }}>
                    <Icon name="file" style={{ width: 14, height: 14, marginRight: 4, verticalAlign: 'middle' }} />
                    {row.file_name}
                  </td>
                  <td style={{ fontSize: 13 }}>{row.user_name}</td>
                  <td style={{ fontSize: 13, color: 'var(--gray3)', fontVariantNumeric: 'tabular-nums' }}>{fmtDateTime(row.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-sm btn-blue-light" onClick={() => handleDownload(row)} title="다운로드">
                        <Icon name="download" style={{ width: 14, height: 14 }} />
                      </button>
                      {(isAdmin || row.user_id === profile?.id) && (
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(row)} title="삭제">
                          <Icon name="x" style={{ width: 14, height: 14 }} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ─── ADMIN PAGE ────────────────────────────────────────────────────── */
function AdminPage() {
  const [tab, setTab]       = useState('pending');
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUsers(); }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadUsers() {
    setLoading(true);
    let q = supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (tab === 'pending')  q = q.eq('approved', false).eq('role', 'user');
    if (tab === 'approved') q = q.eq('approved', true).eq('role', 'user');
    const { data } = await q;
    setUsers(data || []);
    setLoading(false);
  }

  async function approve(id) {
    await supabase.from('profiles').update({ approved: true }).eq('id', id);
    loadUsers();
  }
  async function reject(id) {
    if (!window.confirm('이 사용자를 삭제하시겠습니까?')) return;
    await supabase.from('profiles').delete().eq('id', id);
    await supabase.auth.admin.deleteUser(id).catch(() => {}); // optional
    loadUsers();
  }
  async function revoke(id) {
    if (!window.confirm('승인을 취소하시겠습니까?')) return;
    await supabase.from('profiles').update({ approved: false }).eq('id', id);
    loadUsers();
  }

  const pendingCount = tab === 'pending' ? users.length : null;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">사용자 관리</div>
        <div className="page-sub">회원가입 요청을 승인하거나 거절합니다.</div>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab==='pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>
          대기 중
          {pendingCount > 0 && <span className="count">{pendingCount}</span>}
        </button>
        <button className={`admin-tab ${tab==='approved' ? 'active' : ''}`} onClick={() => setTab('approved')}>
          승인됨
        </button>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--gray3)' }}>불러오는 중...</div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <Icon name="users" style={{ width: 48, height: 48 }} />
            <p>{tab === 'pending' ? '대기 중인 가입 요청이 없습니다.' : '승인된 사용자가 없습니다.'}</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>이름</th>
                <th>이메일</th>
                <th>부서</th>
                <th>신청일</th>
                <th>상태</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="user-avatar" style={{ width: 28, height: 28, fontSize: 12 }}>{getInitial(u.name)}</div>
                      {u.name}
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--gray4)' }}>{u.email}</td>
                  <td style={{ fontSize: 13 }}>{u.dept || '-'}</td>
                  <td style={{ fontSize: 13, color: 'var(--gray3)' }}>{fmt(u.created_at)}</td>
                  <td>
                    <span className={`badge ${u.approved ? 'badge-green' : 'badge-amber'}`}>
                      {u.approved ? '승인됨' : '대기 중'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {!u.approved && (
                        <button className="btn btn-sm btn-success" onClick={() => approve(u.id)}>
                          <Icon name="check" style={{ width: 13, height: 13 }} /> 승인
                        </button>
                      )}
                      {u.approved && (
                        <button className="btn btn-sm btn-outline" onClick={() => revoke(u.id)}>
                          승인 취소
                        </button>
                      )}
                      <button className="btn btn-sm btn-danger" onClick={() => reject(u.id)}>
                        <Icon name="x" style={{ width: 13, height: 13 }} /> 삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ─── MAIN APP ──────────────────────────────────────────────────────── */
export default function App() {
  const [session, setSession]   = useState(null);
  const [profile, setProfile]   = useState(null);
  const [appReady, setAppReady] = useState(false);
  const [page, setPage]         = useState('home');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
      else setAppReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
      else { setProfile(null); setAppReady(true); }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(uid) {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    setProfile(data);
    setAppReady(true);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setPage('home');
  }

  if (!appReady) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--navy)' }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div className="loading-spinner" style={{ width: 32, height: 32, borderWidth: 3, margin: '0 auto 12px' }} />
        <div style={{ fontSize: 14, opacity: .6 }}>로딩 중...</div>
      </div>
    </div>
  );

  if (!session) return <AuthPage />;
  if (!profile) return <AuthPage />;
  if (!profile.approved && profile.role !== 'admin') return <PendingPage profile={profile} onLogout={handleLogout} />;

  return (
    <div className="app-layout">
      <Sidebar profile={profile} currentPage={page} onNavigate={setPage} onLogout={handleLogout} />
      <div className="main-content">
        {page === 'home'     && <HomePage onNavigate={setPage} profile={profile} />}
        {page === 'purchase' && <UploadPage type="매입" profile={profile} key="purchase" />}
        {page === 'sales'    && <UploadPage type="매출" profile={profile} key="sales" />}
        {page === 'history'  && <HistoryPage profile={profile} />}
        {page === 'admin'    && profile.role === 'admin' && <AdminPage />}
      </div>
    </div>
  );
}

/* ─── STYLE INJECT ──────────────────────────────────────────────────── */
const styleTag = document.createElement('style');
styleTag.textContent = CSS;
document.head.appendChild(styleTag);
