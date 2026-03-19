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
    help:      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"/>,
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

        <div className="nav-section-label">데이터 업로드</div>
        <button className={`nav-item ${currentPage==='purchase' ? 'active' : ''}`} onClick={() => onNavigate('purchase')}>
          <Icon name="truck" /> 매입
        </button>
        <button className={`nav-item ${currentPage==='sales' ? 'active' : ''}`} onClick={() => onNavigate('sales')}>
          <Icon name="upload" /> 매출
        </button>
        <button className={`nav-item ${currentPage==='history' ? 'active' : ''}`} onClick={() => onNavigate('history')}>
          <Icon name="history" /> 업로드 이력
        </button>
        <button className={`nav-item ${currentPage==='products' ? 'active' : ''}`} onClick={() => onNavigate('products')}>
          <Icon name="grid" /> 상품DB 업로드
        </button>

        <div className="nav-section-label">데이터 조회</div>
        <button className={`nav-item ${currentPage==='purchase-query' ? 'active' : ''}`} onClick={() => onNavigate('purchase-query')}>
          <Icon name="truck" /> 매입
        </button>
        <button className={`nav-item ${currentPage==='sales-query' ? 'active' : ''}`} onClick={() => onNavigate('sales-query')}>
          <Icon name="chart" /> 매출
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
        <div className="nav-section-label">도움말</div>
        <button className={`nav-item ${currentPage==='help' ? 'active' : ''}`} onClick={() => onNavigate('help')}>
          <Icon name="help" /> 사용방법
        </button>

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
function VendorSummaryCard({ type, metric, color, bgColor }) {
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now     = new Date();
    const year    = now.getFullYear();
    const month   = String(now.getMonth() + 1).padStart(2, '0');
    const from    = `${year}-${month}-01`;
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    const to      = `${year}-${month}-${lastDay}`;

    async function load() {
      setLoading(true);
      const map = {};

      if (type === '매입' && metric === '건수') {
        // purchase_data 공급수량 합계
        const { data: rows } = await supabase.from('purchase_data')
          .select('vendor, quantity').gte('date', from).lte('date', to);
        (rows || []).forEach(r => { map[r.vendor] = (map[r.vendor] || 0) + (r.quantity || 0); });

      } else if (type === '매입' && metric === '공급가') {
        // purchase_data 금액 합계
        const { data: rows } = await supabase.from('purchase_data')
          .select('vendor, amount').gte('date', from).lte('date', to);
        (rows || []).forEach(r => { map[r.vendor] = (map[r.vendor] || 0) + (r.amount || 0); });

      } else if (type === '매출' && metric === '건수') {
        // 매출 판매수량 합계
        const { data: rows } = await supabase.from('sales_data')
          .select('vendor, quantity').gte('date', from).lte('date', to);
        (rows || []).forEach(r => { map[r.vendor] = (map[r.vendor] || 0) + (r.quantity || 0); });

      } else if (type === '매출' && metric === '매출액') {
        // 매출액 = quantity * normal_price
        const { data: rows } = await supabase.from('sales_data')
          .select('vendor, product_code, quantity').gte('date', from).lte('date', to);
        if (rows?.length) {
          const codes = [...new Set(rows.map(r => r.product_code))];
          const { data: prods } = await supabase.from('products').select('product_code, normal_price').in('product_code', codes);
          const priceMap = {};
          (prods || []).forEach(p => { priceMap[p.product_code] = p.normal_price || 0; });
          rows.forEach(r => {
            const amt = (priceMap[r.product_code] || 0) * (r.quantity || 0);
            map[r.vendor] = (map[r.vendor] || 0) + amt;
          });
        }
      }

      setData(VENDORS.map(v => ({ vendor: v, value: map[v] || 0 })).filter(d => d.value > 0));
      setLoading(false);
    }
    load();
  }, [type, metric]);

  const total = data.reduce((s, d) => s + d.value, 0);
  const isMoney = metric === '매출액' || metric === '공급가';
  const fmtVal  = v => isMoney ? (v >= 10000 ? (v/10000).toFixed(0)+'만' : v.toLocaleString()) : v.toLocaleString();

  const metricLabel = metric === '건수' ? (type === '매입' ? '공급수량 기준' : '판매수량 합계') :
                      metric === '공급가' ? '공급가 기준' : '매출액 기준';
  const fmtTotal = v => isMoney ? Math.round(v/10000).toLocaleString()+'만원' :
                        v.toLocaleString()+' EA';
  return (
    <div style={{ background:'white', borderRadius:12, padding:22, boxShadow:'var(--shadow)', flex:1 }}>
      {/* 헤더 */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
            <span style={{ background:bgColor, color, padding:'3px 12px', borderRadius:20, fontSize:13, fontWeight:700 }}>{type}</span>
            <span style={{ fontSize:13, fontWeight:600, color:'var(--navy)' }}>판매처별 현황</span>
          </div>
          <div style={{ fontSize:12, color:'var(--gray3)' }}>{metricLabel}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:11, color:'var(--gray3)' }}>합계</div>
          <div style={{ fontSize:16, fontWeight:700, color }}>{fmtTotal(total)}</div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:24, color:'var(--gray3)', fontSize:13 }}>불러오는 중...</div>
      ) : data.length === 0 ? (
        <div style={{ textAlign:'center', padding:24, color:'var(--gray3)', fontSize:13 }}>당월 데이터 없음</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
          {data.sort((a,b) => b.value - a.value).map(d => {
            const pct = total > 0 ? Math.round(d.value / total * 100) : 0;
            const vc  = VENDOR_COLORS[d.vendor] || color;
            return (
              <div key={d.vendor}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span className="vendor-dot" style={{ background:vc, width:8, height:8 }} />
                    <span style={{ fontSize:12, fontWeight:500, color:'var(--navy)' }}>{d.vendor}</span>
                  </div>
                  <div style={{ fontSize:12, color:'var(--gray4)' }}>
                    <strong style={{ color:'var(--navy)' }}>{fmtVal(d.value)}</strong>
                    <span style={{ fontSize:11, marginLeft:4, color:'var(--gray3)' }}>{pct}%</span>
                  </div>
                </div>
                <div style={{ height:5, background:'var(--gray2)', borderRadius:4, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:vc, borderRadius:4, transition:'width .6s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function HomePage({ onNavigate, profile }) {
  const now = new Date();
  const monthLabel = `${now.getFullYear()}년 ${now.getMonth()+1}월`;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">대시보드</div>
        <div className="page-sub">{monthLabel} 판매처별 매입·매출 현황</div>
      </div>

      {/* 매입 2개 + 매출 1개 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:28 }}>
        <VendorSummaryCard type="매입" metric="건수"   color="#2563eb" bgColor="#eff6ff" />
        <VendorSummaryCard type="매입" metric="공급가"  color="#2563eb" bgColor="#eff6ff" />
        <div style={{ gridColumn:'span 2' }}>
          <VendorSummaryCard type="매출" metric="건수" color="#22c55e" bgColor="#f0fdf4" />
        </div>
      </div>

      {/* 공지사항 */}
      <NoticeBoard profile={profile} />
    </div>
  );
}

/* ─── DUPLICATE MODAL ───────────────────────────────────────────────── */

/* ─── 판매처 파일 자동 감지 및 파싱 ─────────────────────────────────── */
/* ─── 판매처 감지 헬퍼 ──────────────────────────────────────────────── */
function detectVendorFromText(text) {
  if (text.includes('씨에스유통') || text.includes('CS유통')) return '롯데슈퍼';
  if (text.includes('롯데마트'))  return '롯데마트';
  if (text.includes('롯데슈퍼'))  return '롯데슈퍼';
  if (text.includes('Hyper'))    return '홈플러스';
  if (text.includes('Express'))  return '익스프레스';
  // EUC-KR 깨진 경우 - '홈'이 포함된 특정 패턴
  if (text.includes('홈占') || text.includes('홈플')) return '홈플러스';
  return null;
}

async function detectAndParseFile(file, dataType = '매출') {
  const arrayBuffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer.slice(0, 4));
  const isPK = uint8[0] === 0x50 && uint8[1] === 0x4B;

  const results = [];

  function extractDate(text) {
    const m = text.match(/(\d{4}-\d{2}-\d{2})/);
    return m ? m[1] : null;
  }

  function parseHtmlTables(htmlStr) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlStr, 'text/html');
    const tables = doc.querySelectorAll('table');
    return Array.from(tables).map(table =>
      Array.from(table.querySelectorAll('tr')).map(tr =>
        Array.from(tr.querySelectorAll('td,th')).map(td => td.textContent.trim())
      )
    );
  }

  try {
    if (isPK) {
      const wb = XLSX.read(arrayBuffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const firstCell = String(rows[0]?.[0] || '').trim();

      if (dataType === '매출') {
        if (firstCell === '조회일자') {
          // 이마트/에브리데이 매출
          const rawDate = String(rows[1]?.[0] || '');
          const date = rawDate.length === 8
            ? `${rawDate.slice(0,4)}-${rawDate.slice(4,6)}-${rawDate.slice(6,8)}` : null;
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
            results.push({ vendor: '이마트', date, items: Object.entries(emMap).map(([code,qty])=>({code,qty,amt:0})) });
          if (Object.keys(edMap).length > 0)
            results.push({ vendor: '에브리데이', date, items: Object.entries(edMap).map(([code,qty])=>({code,qty,amt:0})) });
        } else if (firstCell === '점포코드') {
          // 판매점별제품별조회 형식 매출
          // 컬럼: 점포코드[0] 점포명[1] 상품코드[2] 소스코드(바코드)[3] 상품명[4] 규격[5] 판매수량[6] 원가합계[7] 매가합계[8] 구성비[9]
          const codeMap = {};
          for (let i = 1; i < rows.length; i++) {
            const r = rows[i];
            // 합계행 스킵: r[0]이 없거나 '합계', 또는 r[2]에 '합계' 포함
            if (!r[0] || String(r[0]||'') === '합계' || String(r[2]||'').includes('합계')) continue;
            const code = String(r[3] || '').trim(); // 소스코드(바코드)
            if (!code.startsWith('88')) continue;
            const qty = Number(String(r[6]||'').replace(/,/g,'')) || 0; // 판매수량
            codeMap[code] = (codeMap[code]||0) + qty;
          }
          if (Object.keys(codeMap).length > 0)
            results.push({ vendor: '메가마트', date: null, items: Object.entries(codeMap).map(([code,qty])=>({code,qty,amt:0})) });
        } else {
          // 메가마트 매출 (기존 형식)
          const codeMap = {};
          for (let i = 1; i < rows.length; i++) {
            const r = rows[i];
            if (!r[2] || String(r[1]||'').includes('합계') || String(r[0]||'') === '합계') continue;
            const code = String(r[2]).trim();
            if (!code.startsWith('88')) continue;
            codeMap[code] = (codeMap[code]||0) + (Number(r[5])||0);
          }
          if (Object.keys(codeMap).length > 0)
            results.push({ vendor: '메가마트', date: null, items: Object.entries(codeMap).map(([code,qty])=>({code,qty,amt:0})) });
        }

      } else {
        // 매입
        if (firstCell === '점포코드') {
          // 이마트/에브리데이 매입 (엑셀저장 시트)
          const emMap = {}, edMap = {};
          const emAmt = {}, edAmt = {};
          for (let i = 1; i < rows.length; i++) {
            const r = rows[i];
            const code = String(r[6] || '').trim();
            if (!code.startsWith('88')) continue;
            const bizType = String(r[2] || ''); // 업태명
            const qty = Number(r[13]) || 0;     // 납품량
            const amt = Number(r[15]) || 0;     // 납품금액
            if (bizType.includes('이마트')) {
              emMap[code] = (emMap[code]||0) + qty;
              emAmt[code] = (emAmt[code]||0) + amt;
            } else if (bizType.includes('에브리데이')) {
              edMap[code] = (edMap[code]||0) + qty;
              edAmt[code] = (edAmt[code]||0) + amt;
            }
          }
          // 날짜: 첫 데이터행 납품일자
          const rawDate = String(rows[1]?.[8] || '');
          const date = rawDate.length === 8
            ? `${rawDate.slice(0,4)}-${rawDate.slice(4,6)}-${rawDate.slice(6,8)}` : null;
          if (Object.keys(emMap).length > 0)
            results.push({ vendor: '이마트', date, items: Object.entries(emMap).map(([code,qty])=>({code,qty,amt:emAmt[code]||0})) });
          if (Object.keys(edMap).length > 0)
            results.push({ vendor: '에브리데이', date, items: Object.entries(edMap).map(([code,qty])=>({code,qty,amt:edAmt[code]||0})) });

        } else {
          // 메가마트 매입
          const codeMap = {}, amtMap = {};
          let date = null;
          for (let i = 1; i < rows.length; i++) {
            const r = rows[i];
            if (!r[2] || String(r[1]||'').includes('합계') || String(r[0]||'') === '합계') continue;
            const code = String(r[2]).trim();
            if (!code.startsWith('88')) continue;
            const qty = Number(r[7]) || 0;
            const amt = Number(r[9]) || 0;
            // 전표번호 앞 8자리에서 날짜 추출
            if (!date) {
              const rawDate = String(r[3] || '').substring(0, 8);
              if (rawDate.length === 8)
                date = `${rawDate.slice(0,4)}-${rawDate.slice(4,6)}-${rawDate.slice(6,8)}`;
            }
            codeMap[code] = (codeMap[code]||0) + qty;
            amtMap[code]  = (amtMap[code]||0)  + amt;
          }
          if (Object.keys(codeMap).length > 0)
            results.push({ vendor: '메가마트', date, items: Object.entries(codeMap).map(([code,qty])=>({code,qty,amt:amtMap[code]||0})) });
        }
      }

    } else {
      // HTML xls
      let htmlStr;
      const utf8Peek = new TextDecoder('utf-8').decode(arrayBuffer.slice(0, 500));
      const isEucKr  = utf8Peek.toLowerCase().includes('euc-kr');
      const isUtf8   = utf8Peek.toLowerCase().includes('utf-8');

      if (isEucKr || (!isUtf8)) {
        // EUC-KR: charset 메타 태그를 utf-8로 바꿔서 DOMParser가 올바르게 해석하도록
        const raw = new TextDecoder('euc-kr').decode(arrayBuffer);
        htmlStr = raw.replace(/charset=euc-kr/gi, 'charset=utf-8')
                     .replace(/charset="euc-kr"/gi, 'charset="utf-8"')
                     .replace(/charset='euc-kr'/gi, "charset='utf-8'");
      } else {
        htmlStr = new TextDecoder('utf-8').decode(arrayBuffer);
      }

      const vendor = detectVendorFromText(htmlStr);
      const date   = extractDate(htmlStr);
      const tables = parseHtmlTables(htmlStr);
      const items  = [];

      if (dataType === '매출') {
        if (vendor === '롯데마트' || vendor === '롯데슈퍼') {
          const dataTable = tables.length > 1 ? tables[1] : tables[0];
          for (let i = 1; i < dataTable.length; i++) {
            const r = dataTable[i];
            const code = String(r[1] || '').trim();
            if (!code.startsWith('88')) continue;
            items.push({ code, qty: Number(String(r[4]||'').replace(/,/g,''))||0, amt: 0 });
          }
        } else if (vendor === '홈플러스' || vendor === '익스프레스') {
          // col: 유통채널[0] 상품코드(바코드)[1] TPNB[2] 상품명[3] 수량[4]
          // 테이블이 1개일 수도 있음
          const dataTable = tables.length > 1 ? tables[1] : tables[0];
          for (let i = 1; i < dataTable.length; i++) {
            const r = dataTable[i];
            if (r.length < 5) continue;
            const code = String(r[1] || '').trim();
            if (!code.match(/^\d{10,14}$/) || !code.startsWith('88')) continue;
            items.push({ code, qty: Number(String(r[4]||'').replace(/,/g,''))||0, amt: 0 });
          }
        }
      } else {
        // 매입
        if (vendor === '롯데마트' || vendor === '롯데슈퍼') {
          // col: 매입일[0] 상품코드[1] 판매코드[2] 상품명[3] 규격[4] 매입구분[5] 주문수량[6] 주문금액[7] 박스[8] 낱개[9] 금액[10]
          const dataTable = tables.length > 1 ? tables[1] : tables[0];
          for (let i = 1; i < dataTable.length; i++) {
            const r = dataTable[i];
            const code = String(r[2] || '').trim(); // 판매코드(바코드)
            if (!code.startsWith('88')) continue;
            const qty = Number(String(r[9]||'').replace(/,/g,'')) || 0; // 낱개수량
            const amt = Number(String(r[10]||'').replace(/,/g,'')) || 0;
            // 날짜: 첫 행의 매입일
            items.push({ code, qty, amt });
          }
        } else if (vendor === '홈플러스' || vendor === '익스프레스') {
          // col: 상품코드[0] TPNB[1] 상품명[2] 매입구분[3] 점포구분[4] 점포코드[5] 점포명[6] 수량[7] 금액[8]
          // 점포명에 EXP 포함 → 익스프레스, 아니면 홈플러스
          const dataTable = tables.length > 1 ? tables[1] : tables[0];
          const hyperMap = {}, hyperAmt = {};
          const expMap   = {}, expAmt   = {};
          for (let i = 1; i < dataTable.length; i++) {
            const r = dataTable[i];
            if (r.length < 9) continue; // 소계행 제외
            const code = String(r[0] || '').trim();
            if (!code.match(/^\d{10,14}$/) || !code.startsWith('88')) continue;
            const qty     = Number(String(r[7]||'').replace(/,/g,'')) || 0;
            const amt     = Number(String(r[8]||'').replace(/,/g,'')) || 0;
            const store   = String(r[6] || '');
            if (store.includes('EXP')) {
              expMap[code]   = (expMap[code]||0)   + qty;
              expAmt[code]   = (expAmt[code]||0)   + amt;
            } else {
              hyperMap[code] = (hyperMap[code]||0) + qty;
              hyperAmt[code] = (hyperAmt[code]||0) + amt;
            }
          }
          if (Object.keys(hyperMap).length > 0)
            items.push(...Object.entries(hyperMap).map(([code,qty]) => ({ code, qty, amt: hyperAmt[code]||0, _v: '홈플러스' })));
          if (Object.keys(expMap).length > 0)
            items.push(...Object.entries(expMap).map(([code,qty]) => ({ code, qty, amt: expAmt[code]||0, _v: '익스프레스' })));
        }
      }

      if (vendor && items.length > 0) {
        // 매입 홈플러스/익스프레스는 _v로 분리, 매출은 vendor 그대로
        if ((vendor === '홈플러스' || vendor === '익스프레스') && dataType === '매입') {
          const hyperItems = items.filter(i => i._v === '홈플러스');
          const expItems   = items.filter(i => i._v === '익스프레스');
          if (hyperItems.length > 0) results.push({ vendor: '홈플러스', date, items: hyperItems });
          if (expItems.length > 0)   results.push({ vendor: '익스프레스', date, items: expItems });
        } else {
          results.push({ vendor, date, items });
        }
      }
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

/* ─── BULK UPLOAD FORM (매출 전용) ──────────────────────────────────── */
function BulkUploadForm({ type, profile, onUploaded }) {
  const isSales = type === '매출';
  const color   = isSales ? '#22c55e' : '#2563eb';

  const [files, setFiles]         = useState([]);
  const [detected, setDetected]   = useState([]);
  const [detecting, setDetecting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg]             = useState(null);
  const [dragging, setDragging]   = useState(false);
  const fileRef = useRef();

  async function handleFiles(fileList) {
    const arr = Array.from(fileList).filter(f => f.name.match(/\.(xlsx|xls)$/i));
    if (!arr.length) return;
    setFiles(arr); setDetecting(true); setMsg(null); setDetected([]);
    const results = [];
    for (const file of arr) {
      try {
        const parsed = await detectAndParseFile(file, type);
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
        const safeName   = d.file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const safeVendor = d.vendor.replace(/[^a-zA-Z0-9._-]/g, '_');
        const folder     = isSales ? 'sales' : 'purchase';
        const path       = `${folder}/${safeVendor}/${d.date}/${ts}_${safeName}`;

        const { error: stErr } = await supabase.storage.from('excel-uploads').upload(path, d.file, { upsert: true });
        if (stErr) throw stErr;

        const { data: uploadRow, error: upErr } = await supabase.from('uploads').insert({
          user_id: profile.id, user_name: profile.name,
          type, vendor: d.vendor, date: d.date,
          file_name: d.file.name, file_path: path, file_size: d.file.size,
        }).select().single();
        if (upErr) throw upErr;

        const year  = d.date.substring(0,4) + '년';
        const month = parseInt(d.date.substring(5,7)) + '월';
        const day   = parseInt(d.date.substring(8,10));

        if (isSales) {
          const dataRows = d.items.map(item => ({
            upload_id: uploadRow.id, vendor: d.vendor, date: d.date,
            year, month, day, product_code: item.code, quantity: item.qty,
          }));
          const { error } = await supabase.from('sales_data').insert(dataRows);
          if (error) throw error;
        } else {
          const dataRows = d.items.map(item => ({
            upload_id: uploadRow.id, vendor: d.vendor, date: d.date,
            year, month, day, product_code: item.code, quantity: item.qty, amount: item.amt || 0,
          }));
          const { error } = await supabase.from('purchase_data').insert(dataRows);
          if (error) throw error;
        }
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
          : (<><div className="drop-title">판매처 {type} 파일을 드래그하거나 클릭하여 선택</div><div className="drop-sub">여러 파일 동시 선택 가능 · .xlsx, .xls 지원</div></>)
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
                      <select className="filter-select"
                        value={d.vendor !== '감지 실패' ? d.vendor : ''}
                        onChange={e => updateVendor(i, e.target.value)}
                        style={{padding:'4px 8px',fontSize:12}}>
                        {d.vendor === '감지 실패' && <option value="">판매처 선택</option>}
                        {VENDORS.map(v => <option key={v}>{v}</option>)}
                      </select>
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
            <button className="btn btn-sm" style={{background:color,color:'white',minWidth:120}}
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
function SalesDataView({ profile, refreshKey }) {
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

/* ─── PURCHASE DATA VIEW (매입 데이터 조회) ─────────────────────────── */
function PurchaseDataView({ refreshKey }) {
  const [rows, setRows]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterVendor, setFilterVendor]     = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo]     = useState('');
  const [selected, setSelected]     = useState(new Set());
  const [downloading, setDownloading] = useState(false);

  useEffect(() => { loadData(); }, [filterVendor, filterDateFrom, filterDateTo, refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadData() {
    setLoading(true); setSelected(new Set());
    let q = supabase.from('purchase_data').select('*')
      .order('date', { ascending: false }).order('vendor');
    if (filterVendor)   q = q.eq('vendor', filterVendor);
    if (filterDateFrom) q = q.gte('date', filterDateFrom);
    if (filterDateTo)   q = q.lte('date', filterDateTo);
    const { data: purchaseData } = await q;
    if (!purchaseData?.length) { setRows([]); setLoading(false); return; }

    // 상품 정보 조인
    const codes = [...new Set(purchaseData.map(r => r.product_code))];
    const { data: productData } = await supabase.from('products').select('product_code, product_name, brand').in('product_code', codes);
    const productMap = {};
    (productData || []).forEach(p => { productMap[p.product_code] = p; });

    const joined = purchaseData.map(r => ({
      ...r,
      brand:        productMap[r.product_code]?.brand        || '-',
      product_name: productMap[r.product_code]?.product_name || r.product_code,
    }));
    setRows(joined);
    setLoading(false);
  }

  // 날짜/판매처별 요약 (다운로드용)
  const summaryMap = {};
  rows.forEach(r => {
    const key = `${r.vendor}|${r.date}`;
    if (!summaryMap[key]) summaryMap[key] = { vendor: r.vendor, date: r.date };
  });
  function toggleSelect(id) {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }
  function toggleAll() {
    setSelected(prev => prev.size === rows.length ? new Set() : new Set(rows.map(r => r.id)));
  }

  async function handleDownload(ids) {
    if (!ids.size) return;
    setDownloading(true);
    try {
      const targets = rows.filter(r => ids.has(r.id));
      // 날짜/판매처 라벨
      const vendors = [...new Set(targets.map(r => r.vendor))];
      const dates   = [...new Set(targets.map(r => r.date))];
      const label     = vendors.length === 1 ? vendors[0] : '통합';
      const dateLabel = dates.length === 1   ? dates[0]   : new Date().toISOString().split('T')[0];
      await downloadPurchaseFormat(
        targets.map(r => ({
          업체명: r.vendor, 연도: r.year, 월: r.month, 일: r.day,
          일자: r.date, 상품코드: r.product_code,
          공급수량: r.quantity, 총액: r.amount || 0,
        })),
        label, dateLabel
      );
    } catch(e) { console.error(e); }
    setDownloading(false);
  }

  const fmt = n => n ? Math.round(n).toLocaleString() : '-';
  const totals = rows.reduce((acc, r) => ({
    qty: acc.qty + (r.quantity || 0),
    amt: acc.amt + (r.amount   || 0),
  }), { qty: 0, amt: 0 });

  // 판매처별 카드
  const vendorCounts = VENDORS.map(v => ({
    vendor: v, count: rows.filter(r => r.vendor === v).length,
  })).filter(v => v.count > 0);

  return (
    <div>
      {/* 판매처별 카드 */}
      {!filterVendor && vendorCounts.length > 0 && (
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:20 }}>
          {vendorCounts.map(({ vendor, count }) => (
            <div key={vendor} onClick={() => setFilterVendor(vendor)}
              style={{ background:'white', border:`2px solid ${VENDOR_COLORS[vendor]||'#e5e9ef'}`, borderRadius:10, padding:'10px 16px', cursor:'pointer', display:'flex', alignItems:'center', gap:8, boxShadow:'var(--shadow)', transition:'transform .15s' }}
              onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e=>e.currentTarget.style.transform=''}>
              <span className="vendor-dot" style={{ background:VENDOR_COLORS[vendor], width:10, height:10 }} />
              <span style={{ fontSize:13, fontWeight:600, color:'var(--navy)' }}>{vendor}</span>
              <span style={{ background:`${VENDOR_COLORS[vendor]}20`, color:VENDOR_COLORS[vendor], fontSize:12, fontWeight:700, padding:'1px 8px', borderRadius:10 }}>{count}건</span>
            </div>
          ))}
        </div>
      )}

      {/* 필터 + 버튼 */}
      <div className="filter-bar">
        <select className="filter-select" value={filterVendor} onChange={e => setFilterVendor(e.target.value)}>
          <option value="">전체 판매처</option>
          {VENDORS.map(v => <option key={v}>{v}</option>)}
        </select>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <input type="date" className="filter-select" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} />
          <span style={{ color:'var(--gray3)', fontSize:13 }}>~</span>
          <input type="date" className="filter-select" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} />
        </div>
        {(filterVendor||filterDateFrom||filterDateTo) && (
          <button className="btn btn-outline btn-sm" onClick={() => { setFilterVendor(''); setFilterDateFrom(''); setFilterDateTo(''); }}>필터 초기화</button>
        )}
        <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
          {selected.size > 0 && <span style={{ fontSize:13, color:'var(--gray3)' }}>{selected.size}개 선택</span>}
          {selected.size > 0 && (
            <button className="btn btn-sm" style={{ background:'#2563eb', color:'white' }}
              disabled={downloading} onClick={() => handleDownload(selected)}>
              {downloading ? <span className="loading-spinner" /> : <><Icon name="download" style={{ width:14,height:14 }} /> 선택 다운로드</>}
            </button>
          )}
          {rows.length > 0 && (
            <button className="btn btn-sm btn-blue-light" disabled={downloading}
              onClick={() => handleDownload(new Set(rows.map(r => r.id)))}>
              전체 다운로드
            </button>
          )}
        </div>
      </div>

      {/* 요약 */}
      {rows.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:16 }}>
          {[
            { label:'총 공급수량', value: totals.qty.toLocaleString() + ' EA', color:'#2563eb' },
            { label:'총 공급금액', value: fmt(totals.amt) + ' 원', color:'#ef4444' },
            { label:'조회 건수', value: rows.length.toLocaleString() + ' 건', color:'#a855f7' },
          ].map(s => (
            <div key={s.label} style={{ background:'white', borderRadius:10, padding:'14px 18px', boxShadow:'var(--shadow)', borderTop:`3px solid ${s.color}` }}>
              <div style={{ fontSize:12, color:'var(--gray3)', marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:15, fontWeight:700, color:s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* 테이블 */}
      <div className="table-wrap">
        {loading ? (
          <div style={{ textAlign:'center', padding:48, color:'var(--gray3)' }}>불러오는 중...</div>
        ) : rows.length === 0 ? (
          <div className="empty-state"><Icon name="file" style={{ width:48,height:48 }} /><p>업로드된 데이터가 없습니다.</p></div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ minWidth:900 }}>
              <thead>
                <tr>
                  <th style={{ width:40 }}>
                    <input type="checkbox" checked={selected.size === rows.length && rows.length > 0} onChange={toggleAll} />
                  </th>
                  <th>날짜</th>
                  <th>판매처</th>
                  <th>브랜드</th>
                  <th>상품명</th>
                  <th style={{ textAlign:'right' }}>공급수량</th>
                  <th style={{ textAlign:'right' }}>공급금액</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} style={{ cursor:'pointer' }} onClick={() => toggleSelect(r.id)}>
                    <td onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} />
                    </td>
                    <td style={{ fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap' }}>{r.date}</td>
                    <td>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}>
                        <span className="vendor-dot" style={{ background:VENDOR_COLORS[r.vendor]||'#94a3b8' }} />
                        {r.vendor}
                      </span>
                    </td>
                    <td style={{ fontSize:13 }}>{r.brand}</td>
                    <td style={{ fontSize:13, maxWidth:220, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.product_name}</td>
                    <td style={{ textAlign:'right', fontWeight:600 }}>{r.quantity.toLocaleString()}</td>
                    <td style={{ textAlign:'right', fontSize:13 }}>{fmt(r.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
          <Icon name="grid" style={{width:15,height:15}} /> 양식변환/다운로드
        </button>
      </div>

      {tab === 'upload' && <BulkUploadForm type={type} profile={profile} onUploaded={handleUploaded} />}
      {tab === 'data'   && isSales && <SalesDataView profile={profile} refreshKey={refreshKey} />}
      {tab === 'data'   && !isSales && <PurchaseDataView refreshKey={refreshKey} />}
    </div>
  );
}

/* ─── HISTORY PAGE ──────────────────────────────────────────────────── */
function HistoryPage({ profile }) {
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filterType, setFilterType]     = useState('');
  const [filterVendor, setFilterVendor] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [deleting, setDeleting] = useState(false);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    loadHistory();
  }, [filterType, filterVendor]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadHistory() {
    setLoading(true);
    setSelected(new Set());
    let q = supabase.from('uploads').select('*').order('created_at', { ascending: false });
    if (filterType)   q = q.eq('type', filterType);
    if (filterVendor) q = q.eq('vendor', filterVendor);
    const { data } = await q;
    setRows(data || []);
    setLoading(false);
  }

  function toggleSelect(id) {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }
  function toggleAll() {
    const deletable = rows.filter(r => isAdmin || r.user_id === profile?.id);
    setSelected(prev => prev.size === deletable.length ? new Set() : new Set(deletable.map(r => r.id)));
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

  async function handleBulkDelete() {
    if (!selected.size) return;
    if (!window.confirm(`선택한 ${selected.size}개 파일을 삭제하시겠습니까?`)) return;
    setDeleting(true);
    const targets = rows.filter(r => selected.has(r.id));
    const paths   = targets.map(r => r.file_path);
    const ids     = targets.map(r => r.id);
    await supabase.storage.from('excel-uploads').remove(paths);
    await supabase.from('uploads').delete().in('id', ids);
    setDeleting(false);
    loadHistory();
  }

  const deletableRows = rows.filter(r => isAdmin || r.user_id === profile?.id);
  const allSelected   = deletableRows.length > 0 && selected.size === deletableRows.length;

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
        <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
          {selected.size > 0 && (
            <>
              <span style={{ fontSize:13, color:'var(--gray3)' }}>{selected.size}개 선택</span>
              <button className="btn btn-sm btn-danger" disabled={deleting} onClick={handleBulkDelete}>
                {deleting ? <span className="loading-spinner" style={{ borderColor:'rgba(239,68,68,.3)', borderTopColor:'#ef4444' }} /> : '🗑 선택 삭제'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div style={{ textAlign:'center', padding:48, color:'var(--gray3)' }}>불러오는 중...</div>
        ) : rows.length === 0 ? (
          <div className="empty-state">
            <Icon name="file" style={{ width:48, height:48 }} />
            <p>업로드 이력이 없습니다.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width:40 }}>
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                </th>
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
              {rows.map(row => {
                const canDelete = isAdmin || row.user_id === profile?.id;
                return (
                  <tr key={row.id} style={{ cursor: canDelete ? 'pointer' : 'default' }}
                    onClick={() => canDelete && toggleSelect(row.id)}>
                    <td onClick={e => e.stopPropagation()}>
                      {canDelete && (
                        <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleSelect(row.id)} />
                      )}
                    </td>
                    <td>
                      <span className={`badge ${row.type === '매입' ? 'badge-blue' : 'badge-green'}`}>
                        {row.type}
                      </span>
                    </td>
                    <td>
                      <span className="vendor-dot" style={{ background: VENDOR_COLORS[row.vendor] || '#94a3b8' }} />
                      {row.vendor}
                    </td>
                    <td style={{ fontVariantNumeric:'tabular-nums' }}>{row.date}</td>
                    <td style={{ maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontSize:13, color:'var(--gray4)' }}>
                      <Icon name="file" style={{ width:14, height:14, marginRight:4, verticalAlign:'middle' }} />
                      {row.file_name}
                    </td>
                    <td style={{ fontSize:13 }}>{row.user_name}</td>
                    <td style={{ fontSize:13, color:'var(--gray3)', fontVariantNumeric:'tabular-nums' }}>{fmtDateTime(row.created_at)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-sm btn-blue-light" onClick={() => handleDownload(row)} title="다운로드">
                          <Icon name="download" style={{ width:14, height:14 }} />
                        </button>
                        {canDelete && (
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(row)} title="삭제">
                            <Icon name="x" style={{ width:14, height:14 }} />
                          </button>
                        )}
                      </div>
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

/* ─── PRODUCTS PAGE (상품 관리) ─────────────────────────────────────── */
function ProductsPage() {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg]             = useState(null);
  const [search, setSearch]       = useState('');
  const fileRef                   = useRef();

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('product_code');
    setProducts(data || []);
    setLoading(false);
  }

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true); setMsg(null);
    try {
      const ab = await file.arrayBuffer();
      const wb = XLSX.read(ab, { type: 'array', dense: true });

      // '상품리스트' 시트 찾기
      const sheetName = wb.SheetNames.find(s => s.includes('상품리스트')) || wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', blankrows: true, raw: true });

      // 2행이 헤더, 3행부터 데이터
      const upsertRows = [];
      for (let i = 2; i < rows.length; i++) {
        const r = rows[i];
        const code = String(r[2] || '').trim(); // 상품코드
        if (!code || !code.startsWith('88')) continue;
        upsertRows.push({
          product_code: code,
          product_name: r[4]  || null,  // 상품명
          brand:        r[5]  || null,  // 브랜드
          category_1:   r[6]  || null,  // 분류_1
          category_2:   r[7]  || null,  // 분류_2
          category_3:   r[8]  || null,  // 분류_3
          final_cost:   Number(r[19]) || null, // 최종원가
          normal_price: Number(r[23]) || null, // 마트 정상판매가
          sale_price:   Number(r[24]) || null, // 마트 행사판매가
          is_active:    String(r[1] || '').trim() === 'O', // 운영여부
          updated_at:   new Date().toISOString(),
        });
      }

      if (!upsertRows.length) throw new Error('상품 데이터를 찾을 수 없습니다.');

      // 상품코드 중복 제거 (마지막 값 기준)
      const deduped = Object.values(
        upsertRows.reduce((acc, r) => { acc[r.product_code] = r; return acc; }, {})
      );

      // 배치로 upsert
      const BATCH = 100;
      for (let i = 0; i < deduped.length; i += BATCH) {
        const { error } = await supabase.from('products').upsert(deduped.slice(i, i + BATCH), { onConflict: 'product_code' });
        if (error) throw error;
      }
      setMsg({ type: 'success', text: `✅ ${deduped.length}개 상품 등록/업데이트 완료!` });
      loadProducts();
    } catch (err) {
      setMsg({ type: 'error', text: `오류: ${err.message}` });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  const filtered = products.filter(p =>
    !search || p.product_code?.includes(search) || p.product_name?.includes(search) || p.brand?.includes(search)
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-title">상품 관리</div>
        <div className="page-sub">상품리스트 엑셀 파일을 업로드하여 상품 정보를 등록/업데이트합니다.</div>
      </div>

      {/* 업로드 영역 */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title"><Icon name="upload" style={{ width:18,height:18 }} />상품리스트 업로드</div>
        {msg && <div className={`alert alert-${msg.type}`} style={{ marginBottom: 12 }}>{msg.text}</div>}
        <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
          <button className="btn btn-sm" style={{ background:'var(--blue)', color:'white' }}
            disabled={uploading} onClick={() => fileRef.current?.click()}>
            {uploading ? <><span className="loading-spinner" /> 업로드 중...</> : '📂 엑셀 파일 선택'}
          </button>
          <span style={{ fontSize:13, color:'var(--gray3)' }}>매출현황 엑셀 파일 (상품리스트 시트 포함)</span>
        </div>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display:'none' }} onChange={handleUpload} />
      </div>

      {/* 검색 + 테이블 */}
      <div className="filter-bar">
        <input className="filter-select" placeholder="상품코드, 상품명, 브랜드 검색" value={search}
          onChange={e => setSearch(e.target.value)} style={{ minWidth: 240 }} />
        <span style={{ fontSize:13, color:'var(--gray3)', marginLeft:'auto' }}>
          총 <strong style={{ color:'var(--navy)' }}>{filtered.length}</strong>개
        </span>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div style={{ textAlign:'center', padding:48, color:'var(--gray3)' }}>불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><Icon name="file" style={{ width:48,height:48 }} /><p>등록된 상품이 없습니다.</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>상품코드</th>
                <th>브랜드</th>
                <th>상품명</th>
                <th>분류</th>
                <th style={{ textAlign:'right' }}>최종원가</th>
                <th style={{ textAlign:'right' }}>정상판매가</th>
                <th style={{ textAlign:'right' }}>행사판매가</th>
                <th>운영</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.product_code}>
                  <td style={{ fontSize:12, fontFamily:'monospace' }}>{p.product_code}</td>
                  <td style={{ fontSize:13 }}>{p.brand || '-'}</td>
                  <td style={{ fontSize:13, maxWidth:260, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.product_name || '-'}</td>
                  <td style={{ fontSize:12, color:'var(--gray4)' }}>{[p.category_1,p.category_2].filter(Boolean).join(' > ')}</td>
                  <td style={{ textAlign:'right', fontSize:13 }}>{p.final_cost ? p.final_cost.toLocaleString() : '-'}</td>
                  <td style={{ textAlign:'right', fontSize:13 }}>{p.normal_price ? p.normal_price.toLocaleString() : '-'}</td>
                  <td style={{ textAlign:'right', fontSize:13 }}>{p.sale_price ? p.sale_price.toLocaleString() : '-'}</td>
                  <td><span className={`badge ${p.is_active ? 'badge-green' : 'badge-red'}`}>{p.is_active ? '운영' : '중단'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ─── SALES QUERY PAGE (매출 데이터 조회) ───────────────────────────── */
function SalesQueryPage() {
  const [rows, setRows]             = useState([]);
  const [loading, setLoading]       = useState(false);
  const [searched, setSearched]     = useState(false);
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo]     = useState('');
  const [selVendors, setSelVendors] = useState(new Set()); // 선택된 판매처
  const [selBrands, setSelBrands]   = useState(new Set()); // 선택된 브랜드
  const [brands, setBrands]         = useState([]);        // DB에서 불러온 브랜드 목록

  // 브랜드 목록 로드
  useEffect(() => {
    supabase.from('products').select('brand').then(({ data }) => {
      const list = [...new Set((data||[]).map(p => p.brand).filter(Boolean))].sort();
      setBrands(list);
    });
  }, []);

  function toggleVendor(v) {
    setSelVendors(prev => { const s = new Set(prev); s.has(v) ? s.delete(v) : s.add(v); return s; });
  }
  function toggleBrand(b) {
    setSelBrands(prev => { const s = new Set(prev); s.has(b) ? s.delete(b) : s.add(b); return s; });
  }
  function toggleAllVendors() {
    setSelVendors(prev => prev.size === VENDORS.length ? new Set() : new Set(VENDORS));
  }
  function toggleAllBrands() {
    setSelBrands(prev => prev.size === brands.length ? new Set() : new Set(brands));
  }
  function resetFilters() {
    setFilterDateFrom(''); setFilterDateTo('');
    setSelVendors(new Set()); setSelBrands(new Set());
    setRows([]); setSearched(false);
  }

  async function loadData() {
    setLoading(true); setSearched(true);
    let q = supabase.from('sales_data').select('*');
    if (filterDateFrom) q = q.gte('date', filterDateFrom);
    if (filterDateTo)   q = q.lte('date', filterDateTo);
    if (selVendors.size > 0) q = q.in('vendor', [...selVendors]);
    q = q.order('date', { ascending: false }).order('vendor');
    const { data: salesData } = await q;

    if (!salesData?.length) { setRows([]); setLoading(false); return; }

    // 상품 정보 조회
    const codes = [...new Set(salesData.map(r => r.product_code))];
    const { data: productData } = await supabase.from('products').select('*').in('product_code', codes);
    const productMap = {};
    (productData || []).forEach(p => { productMap[p.product_code] = p; });

    // 조인 + 브랜드 필터
    const joined = salesData.map(s => {
      const p = productMap[s.product_code] || {};
      const finalCost = p.final_cost || 0;
      const qty = s.quantity || 0;
      return {
        date:         s.date,
        vendor:       s.vendor,
        brand:        p.brand        || '-',
        product_name: p.product_name || s.product_code,
        product_code: s.product_code,
        final_cost:   finalCost,
        quantity:     qty,
        total_cost:   finalCost * qty,
      };
    }).filter(r => selBrands.size === 0 || selBrands.has(r.brand));

    setRows(joined);
    setLoading(false);
  }

  const totals = rows.reduce((acc, r) => ({
    quantity:   acc.quantity   + r.quantity,
    total_cost: acc.total_cost + r.total_cost,
  }), { quantity:0, total_cost:0 });

  function fmt(n) { return n ? Math.round(n).toLocaleString() : '-'; }

  // 체크박스 토글 그룹 컴포넌트
  function CheckGroup({ label, items, selected, onToggle, onToggleAll, colorMap }) {
    const allSelected = items.length > 0 && selected.size === items.length;
    return (
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
          <label className="form-label" style={{ margin:0 }}>{label}</label>
          <button className="btn btn-outline btn-sm" style={{ padding:'2px 10px', fontSize:11 }}
            onClick={onToggleAll}>
            {allSelected ? '전체 해제' : '전체 선택'}
          </button>
          {selected.size > 0 && (
            <span style={{ fontSize:11, color:'var(--blue)', fontWeight:600 }}>{selected.size}개 선택</span>
          )}
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {items.map(item => (
            <button key={item}
              onClick={() => onToggle(item)}
              style={{
                padding:'5px 12px', borderRadius:20, fontSize:12, fontWeight:500,
                border: `1.5px solid ${selected.has(item) ? (colorMap?.[item] || 'var(--blue)') : 'var(--gray2)'}`,
                background: selected.has(item) ? `${colorMap?.[item] || 'var(--blue)'}15` : 'white',
                color: selected.has(item) ? (colorMap?.[item] || 'var(--blue)') : 'var(--gray4)',
                cursor:'pointer', transition:'all .15s',
              }}>
              {colorMap && <span style={{ display:'inline-block', width:7, height:7, borderRadius:'50%', background: colorMap[item]||'#94a3b8', marginRight:5, verticalAlign:'middle' }} />}
              {item}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <span style={{ background:'#f0fdf4', color:'#22c55e', padding:'2px 12px', borderRadius:20, fontSize:14, marginRight:8 }}>매출</span>
          데이터 조회
        </div>
        <div className="page-sub">조회 조건을 설정하고 조회 버튼을 눌러주세요.</div>
      </div>

      {/* 검색 조건 카드 */}
      <div className="card" style={{ marginBottom:20 }}>
        {/* 조회기간 */}
        <div style={{ marginBottom:20 }}>
          <label className="form-label">조회기간</label>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <input type="date" className="form-input" style={{ width:160 }} value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} />
            <span style={{ color:'var(--gray3)' }}>~</span>
            <input type="date" className="form-input" style={{ width:160 }} value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} />
          </div>
        </div>

        <div className="divider" />

        {/* 판매처 */}
        <div style={{ marginBottom:20 }}>
          <CheckGroup
            label="판매처"
            items={VENDORS}
            selected={selVendors}
            onToggle={toggleVendor}
            onToggleAll={toggleAllVendors}
            colorMap={VENDOR_COLORS}
          />
        </div>

        <div className="divider" />

        {/* 브랜드 */}
        <div style={{ marginBottom:20 }}>
          <CheckGroup
            label="브랜드"
            items={brands}
            selected={selBrands}
            onToggle={toggleBrand}
            onToggleAll={toggleAllBrands}
          />
        </div>

        {/* 버튼 */}
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn-sm" style={{ background:'var(--blue)', color:'white', minWidth:100 }}
            disabled={loading} onClick={loadData}>
            {loading ? <span className="loading-spinner" /> : '🔍 조회'}
          </button>
          <button className="btn btn-sm btn-outline" onClick={resetFilters}>초기화</button>
        </div>
      </div>

      {/* 결과 */}
      {!searched ? (
        <div className="empty-state" style={{ background:'white', borderRadius:10, padding:64 }}>
          <Icon name="chart" style={{ width:48,height:48 }} />
          <p>조건을 설정하고 조회 버튼을 눌러주세요.</p>
        </div>
      ) : (
        <>
          {rows.length > 0 && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
              {[
                { label:'총 판매수량', value: totals.quantity.toLocaleString() + ' EA', color:'#2563eb' },
                { label:'총 판매원가', value: fmt(totals.total_cost) + ' 원', color:'#ef4444' },
                { label:'조회 결과', value: rows.length.toLocaleString() + ' 건', color:'#a855f7' },
              ].map(s => (
                <div key={s.label} style={{ background:'white', borderRadius:10, padding:'16px 20px', boxShadow:'var(--shadow)', borderTop:`3px solid ${s.color}` }}>
                  <div style={{ fontSize:12, color:'var(--gray3)', marginBottom:6 }}>{s.label}</div>
                  <div style={{ fontSize:16, fontWeight:700, color:s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          )}

          <div className="table-wrap">
            {rows.length === 0 ? (
              <div className="empty-state"><Icon name="file" style={{ width:48,height:48 }} /><p>조회 결과가 없습니다.</p></div>
            ) : (
              <div style={{ overflowX:'auto' }}>
                <table style={{ minWidth:1000 }}>
                  <thead>
                    <tr>
                      <th>날짜</th>
                      <th>판매처</th>
                      <th>브랜드</th>
                      <th>상품명</th>
                      <th style={{ textAlign:'right' }}>최종원가</th>
                      <th style={{ textAlign:'right' }}>판매수량</th>
                      <th style={{ textAlign:'right' }}>총판매원가</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i}>
                        <td style={{ fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap' }}>{r.date}</td>
                        <td>
                          <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}>
                            <span className="vendor-dot" style={{ background:VENDOR_COLORS[r.vendor]||'#94a3b8' }} />
                            {r.vendor}
                          </span>
                        </td>
                        <td style={{ fontSize:13 }}>{r.brand}</td>
                        <td style={{ fontSize:13, maxWidth:220, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.product_name}</td>
                        <td style={{ textAlign:'right', fontSize:13 }}>{fmt(r.final_cost)}</td>
                        <td style={{ textAlign:'right', fontWeight:600 }}>{r.quantity.toLocaleString()}</td>
                        <td style={{ textAlign:'right', fontSize:13, fontWeight:600 }}>{fmt(r.total_cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── PURCHASE QUERY PAGE (매입 데이터 조회 - 준비 중) ──────────────── */
/* ─── 매입 자사 양식 다운로드 ───────────────────────────────────────── */
async function downloadPurchaseFormat(rows, vendor, date) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('매입내역');

  ws.columns = [
    { width: 12 }, // 업체명
    { width: 8  }, // 연도
    { width: 6  }, // 월
    { width: 5  }, // 일
    { width: 14 }, // 일자
    { width: 18 }, // 상품코드
    { width: 12 }, // 공급수량
    { width: 14 }, // 총액(VAT별도)
  ];

  const FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCCFF' } };
  const FONT = { name: '맑은 고딕', size: 10 };
  const CENTER = { horizontal: 'center' };
  const ACCT = '_-* #,##0_-;\\-* #,##0_-;_-* "-"_-;_-@_-';

  rows.forEach(r => {
    const row = ws.addRow([
      r.업체명, r.연도, r.월, r.일, r.일자, r.상품코드, r.공급수량, r.총액
    ]);
    row.eachCell({ includeEmpty: false }, (cell, colNum) => {
      cell.font = FONT;
      cell.fill = FILL;
      if (colNum <= 5) cell.alignment = CENTER;
      if (colNum === 6) { cell.numFmt = '@'; cell.value = String(r.상품코드); }
      if (colNum === 7 || colNum === 8) cell.numFmt = ACCT;
    });
  });

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `매입내역_${vendor}_${date}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── PURCHASE QUERY PAGE (매입 데이터 조회) ────────────────────────── */
function PurchaseQueryPage() {
  const [rows, setRows]             = useState([]);
  const [loading, setLoading]       = useState(false);
  const [searched, setSearched]     = useState(false);
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo]     = useState('');
  const [selVendors, setSelVendors] = useState(new Set());
  const [selected, setSelected]     = useState(new Set());
  const [downloading, setDownloading] = useState(false);

  function toggleVendor(v) {
    setSelVendors(prev => { const s = new Set(prev); s.has(v) ? s.delete(v) : s.add(v); return s; });
  }
  function toggleAllVendors() {
    setSelVendors(prev => prev.size === VENDORS.length ? new Set() : new Set(VENDORS));
  }
  function resetFilters() {
    setFilterDateFrom(''); setFilterDateTo('');
    setSelVendors(new Set()); setRows([]); setSearched(false); setSelected(new Set());
  }

  async function loadData() {
    setLoading(true); setSearched(true); setSelected(new Set());
    let q = supabase.from('purchase_data').select('*');
    if (filterDateFrom) q = q.gte('date', filterDateFrom);
    if (filterDateTo)   q = q.lte('date', filterDateTo);
    if (selVendors.size > 0) q = q.in('vendor', [...selVendors]);
    q = q.order('date', { ascending: false }).order('vendor');
    const { data: purchaseData } = await q;

    if (!purchaseData?.length) { setRows([]); setLoading(false); return; }

    const codes = [...new Set(purchaseData.map(r => r.product_code))];
    const { data: productData } = await supabase.from('products').select('product_code, product_name, brand').in('product_code', codes);
    const productMap = {};
    (productData || []).forEach(p => { productMap[p.product_code] = p; });

    setRows(purchaseData.map(r => ({
      ...r,
      brand:        productMap[r.product_code]?.brand        || '-',
      product_name: productMap[r.product_code]?.product_name || r.product_code,
    })));
    setLoading(false);
  }

  const totals = rows.reduce((acc, r) => ({
    quantity: acc.quantity + (r.quantity || 0),
    amount:   acc.amount   + (r.amount   || 0),
  }), { quantity: 0, amount: 0 });

  function fmt(n) { return n ? Math.round(n).toLocaleString() : '-'; }

  function toggleSelect(id) {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }
  function toggleAll() {
    setSelected(prev => prev.size === rows.length ? new Set() : new Set(rows.map(r => r.id)));
  }

  async function handleDownload(ids) {
    if (!ids.size) return;
    setDownloading(true);
    try {
      const targets = rows.filter(r => ids.has(r.id));
      const vendors = [...new Set(targets.map(r => r.vendor))];
      const dates   = [...new Set(targets.map(r => r.date))];
      await downloadPurchaseFormat(
        targets.map(r => ({
          업체명: r.vendor, 연도: r.year, 월: r.month, 일: r.day,
          일자: r.date, 상품코드: r.product_code,
          공급수량: r.quantity, 총액: r.amount || 0,
        })),
        vendors.length === 1 ? vendors[0] : '통합',
        dates.length === 1 ? dates[0] : new Date().toISOString().split('T')[0]
      );
    } catch(e) { console.error(e); }
    setDownloading(false);
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <span style={{ background:'#eff6ff', color:'#2563eb', padding:'2px 12px', borderRadius:20, fontSize:14, marginRight:8 }}>매입</span>
          데이터 조회
        </div>
        <div className="page-sub">조회 조건을 설정하고 조회 버튼을 눌러주세요.</div>
      </div>

      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ marginBottom:20 }}>
          <label className="form-label">조회기간</label>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <input type="date" className="form-input" style={{ width:160 }} value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} />
            <span style={{ color:'var(--gray3)' }}>~</span>
            <input type="date" className="form-input" style={{ width:160 }} value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} />
          </div>
        </div>
        <div className="divider" />
        <div style={{ marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <label className="form-label" style={{ margin:0 }}>판매처</label>
            <button className="btn btn-outline btn-sm" style={{ padding:'2px 10px', fontSize:11 }} onClick={toggleAllVendors}>
              {selVendors.size === VENDORS.length ? '전체 해제' : '전체 선택'}
            </button>
            {selVendors.size > 0 && <span style={{ fontSize:11, color:'var(--blue)', fontWeight:600 }}>{selVendors.size}개 선택</span>}
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {VENDORS.map(v => (
              <button key={v} onClick={() => toggleVendor(v)}
                style={{
                  padding:'5px 12px', borderRadius:20, fontSize:12, fontWeight:500, cursor:'pointer', transition:'all .15s',
                  border:`1.5px solid ${selVendors.has(v) ? VENDOR_COLORS[v]||'var(--blue)' : 'var(--gray2)'}`,
                  background: selVendors.has(v) ? `${VENDOR_COLORS[v]||'var(--blue)'}15` : 'white',
                  color: selVendors.has(v) ? VENDOR_COLORS[v]||'var(--blue)' : 'var(--gray4)',
                }}>
                <span style={{ display:'inline-block', width:7, height:7, borderRadius:'50%', background:VENDOR_COLORS[v]||'#94a3b8', marginRight:5, verticalAlign:'middle' }} />
                {v}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn-sm" style={{ background:'var(--blue)', color:'white', minWidth:100 }}
            disabled={loading} onClick={loadData}>
            {loading ? <span className="loading-spinner" /> : '🔍 조회'}
          </button>
          <button className="btn btn-sm btn-outline" onClick={resetFilters}>초기화</button>
        </div>
      </div>

      {!searched ? (
        <div className="empty-state" style={{ background:'white', borderRadius:10, padding:64 }}>
          <Icon name="truck" style={{ width:48,height:48 }} />
          <p>조건을 설정하고 조회 버튼을 눌러주세요.</p>
        </div>
      ) : (
        <>
          {rows.length > 0 && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
              {[
                { label:'총 공급수량', value: totals.quantity.toLocaleString() + ' EA', color:'#2563eb' },
                { label:'총 공급금액', value: fmt(totals.amount) + ' 원', color:'#ef4444' },
                { label:'조회 건수', value: rows.length.toLocaleString() + ' 건', color:'#a855f7' },
              ].map(s => (
                <div key={s.label} style={{ background:'white', borderRadius:10, padding:'16px 20px', boxShadow:'var(--shadow)', borderTop:`3px solid ${s.color}` }}>
                  <div style={{ fontSize:12, color:'var(--gray3)', marginBottom:6 }}>{s.label}</div>
                  <div style={{ fontSize:16, fontWeight:700, color:s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          )}
          <div className="filter-bar" style={{ marginBottom:16 }}>
            {selected.size > 0 && <span style={{ fontSize:13, color:'var(--gray3)' }}>{selected.size}개 선택</span>}
            {selected.size > 0 && (
              <button className="btn btn-sm" style={{ background:'#2563eb', color:'white' }}
                disabled={downloading} onClick={() => handleDownload(selected)}>
                {downloading ? <span className="loading-spinner" /> : <><Icon name="download" style={{ width:14,height:14 }} /> 선택 다운로드</>}
              </button>
            )}
            {rows.length > 0 && (
              <button className="btn btn-sm btn-blue-light" disabled={downloading}
                onClick={() => handleDownload(new Set(rows.map(r => r.id)))}>
                전체 다운로드
              </button>
            )}
          </div>
          <div className="table-wrap">
            {rows.length === 0 ? (
              <div className="empty-state"><Icon name="file" style={{ width:48,height:48 }} /><p>조회 결과가 없습니다.</p></div>
            ) : (
              <div style={{ overflowX:'auto' }}>
                <table style={{ minWidth:900 }}>
                  <thead>
                    <tr>
                      <th style={{ width:40 }}>
                        <input type="checkbox" checked={selected.size === rows.length && rows.length > 0} onChange={toggleAll} />
                      </th>
                      <th>날짜</th>
                      <th>판매처</th>
                      <th>브랜드</th>
                      <th>상품명</th>
                      <th style={{ textAlign:'right' }}>공급수량</th>
                      <th style={{ textAlign:'right' }}>공급금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(r => (
                      <tr key={r.id} style={{ cursor:'pointer' }} onClick={() => toggleSelect(r.id)}>
                        <td onClick={e => e.stopPropagation()}>
                          <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} />
                        </td>
                        <td style={{ fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap' }}>{r.date}</td>
                        <td>
                          <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}>
                            <span className="vendor-dot" style={{ background:VENDOR_COLORS[r.vendor]||'#94a3b8' }} />
                            {r.vendor}
                          </span>
                        </td>
                        <td style={{ fontSize:13 }}>{r.brand}</td>
                        <td style={{ fontSize:13, maxWidth:220, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.product_name}</td>
                        <td style={{ textAlign:'right', fontWeight:600 }}>{r.quantity.toLocaleString()}</td>
                        <td style={{ textAlign:'right', fontSize:13 }}>{fmt(r.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
/* ─── HELP PAGE ─────────────────────────────────────────────────────── */

/* 목업 프레임 — 브라우저 창처럼 보이는 컨테이너 */
function MockupFrame({ title, children }) {
  return (
    <div style={{ border:'2px solid var(--gray2)',borderRadius:12,overflow:'hidden',margin:'14px 0 22px',boxShadow:'0 4px 20px rgba(0,0,0,.08)' }}>
      <div style={{ padding:'7px 14px',background:'#dde3ea',display:'flex',alignItems:'center',gap:5 }}>
        <span style={{ width:9,height:9,borderRadius:'50%',background:'#ef4444',display:'inline-block' }}/>
        <span style={{ width:9,height:9,borderRadius:'50%',background:'#f59e0b',display:'inline-block' }}/>
        <span style={{ width:9,height:9,borderRadius:'50%',background:'#22c55e',display:'inline-block' }}/>
        {title && <span style={{ fontSize:11,color:'#4a5568',marginLeft:10,fontWeight:600 }}>{title}</span>}
      </div>
      <div>{children}</div>
    </div>
  );
}

/* HelpCard */
function HelpCard({ title, children, accent }) {
  return (
    <div style={{ background:'var(--white)',borderRadius:'var(--radius)',boxShadow:'var(--shadow)',overflow:'hidden',marginBottom:20 }}>
      {title && (
        <div style={{ padding:'14px 20px',borderBottom:'1px solid var(--gray2)',display:'flex',alignItems:'center',gap:8 }}>
          {accent && <span style={{ width:4,height:18,background:accent,borderRadius:2,flexShrink:0 }}/>}
          <span style={{ fontSize:15,fontWeight:700,color:'var(--navy)' }}>{title}</span>
        </div>
      )}
      <div style={{ padding:'20px 24px' }}>{children}</div>
    </div>
  );
}

/* HelpStep */
function HelpStep({ number, title, desc, note, children }) {
  return (
    <div style={{ display:'flex',gap:14,marginBottom:20 }}>
      <div style={{ width:32,height:32,borderRadius:'50%',background:'var(--blue)',color:'white',fontSize:14,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:2 }}>{number}</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:14,fontWeight:700,color:'var(--navy)',marginBottom:4 }}>{title}</div>
        {desc && <div style={{ fontSize:13,color:'var(--gray4)',lineHeight:1.7,marginBottom:8 }}>{desc}</div>}
        {note && <div style={{ padding:'8px 12px',background:'var(--sky)',borderRadius:6,fontSize:12,color:'#1e40af',lineHeight:1.5,marginBottom:8 }}>💡 {note}</div>}
        {children}
      </div>
    </div>
  );
}

/* ── 목업: 전체 화면 구성 ── */
function MockOverview() {
  return (
    <MockupFrame title="로그인 후 기본 화면 구성">
      <div style={{ display:'flex',height:260 }}>
        <div style={{ width:130,background:'var(--navy)',padding:'12px 8px',flexShrink:0 }}>
          <div style={{ display:'flex',alignItems:'center',gap:6,padding:'4px 8px 10px',borderBottom:'1px solid rgba(255,255,255,.1)',marginBottom:8 }}>
            <div style={{ width:22,height:22,background:'var(--blue)',borderRadius:5,flexShrink:0 }}/>
            <div><div style={{ fontSize:9,color:'white',fontWeight:700 }}>할인점팀</div><div style={{ fontSize:8,color:'rgba(255,255,255,.4)' }}>매입·매출 관리</div></div>
          </div>
          <div style={{ fontSize:8,color:'rgba(255,255,255,.3)',letterSpacing:.8,padding:'0 6px',marginBottom:4 }}>메인</div>
          <div style={{ padding:'5px 8px',borderRadius:5,background:'rgba(255,255,255,.07)',color:'rgba(255,255,255,.7)',fontSize:9,marginBottom:8 }}>🏠 홈</div>
          <div style={{ fontSize:8,color:'rgba(255,255,255,.3)',letterSpacing:.8,padding:'0 6px',marginBottom:4 }}>데이터 업로드</div>
          {['매입','매출','업로드 이력','상품DB 업로드'].map(m => <div key={m} style={{ padding:'4px 8px',color:'rgba(255,255,255,.45)',fontSize:9,marginBottom:1 }}>{m}</div>)}
          <div style={{ fontSize:8,color:'rgba(255,255,255,.3)',letterSpacing:.8,padding:'0 6px',margin:'6px 0 4px' }}>데이터 조회</div>
          {['매입 조회','매출 조회'].map(m => <div key={m} style={{ padding:'4px 8px',color:'rgba(255,255,255,.45)',fontSize:9,marginBottom:1 }}>{m}</div>)}
          <div style={{ fontSize:8,color:'rgba(255,255,255,.3)',letterSpacing:.8,padding:'0 6px',margin:'6px 0 4px' }}>도움말</div>
          <div style={{ padding:'4px 8px',color:'rgba(255,255,255,.45)',fontSize:9 }}>사용방법</div>
        </div>
        <div style={{ flex:1,padding:14,background:'var(--gray1)',overflow:'hidden' }}>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:13,fontWeight:700,color:'var(--navy)' }}>대시보드</div>
            <div style={{ fontSize:10,color:'var(--gray3)' }}>당월 판매처별 매입·매출 현황</div>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8 }}>
            {['매입 – 공급수량','매입 – 공급가'].map(card => (
              <div key={card} style={{ background:'white',borderRadius:8,padding:10,boxShadow:'0 1px 4px rgba(0,0,0,.06)' }}>
                <div style={{ display:'flex',gap:4,alignItems:'center',marginBottom:6 }}>
                  <span style={{ background:'#eff6ff',color:'var(--blue)',padding:'1px 6px',borderRadius:8,fontSize:8,fontWeight:700 }}>매입</span>
                  <span style={{ fontSize:9,color:'var(--navy)',fontWeight:600 }}>판매처별 현황</span>
                </div>
                {[['홈플러스','#0068b7',75],['롯데마트','#ed1c24',52],['이마트','#e6b800',38],['메가마트','#ff6600',24]].map(([v,c,w]) => (
                  <div key={v} style={{ marginBottom:3 }}>
                    <div style={{ display:'flex',justifyContent:'space-between',fontSize:8,marginBottom:1 }}>
                      <span style={{ display:'flex',alignItems:'center',gap:3 }}><span style={{ width:5,height:5,borderRadius:'50%',background:c,display:'inline-block' }}/>{v}</span>
                      <span style={{ color:'var(--gray4)' }}>{w}%</span>
                    </div>
                    <div style={{ height:3,background:'var(--gray2)',borderRadius:2 }}><div style={{ height:'100%',width:`${w}%`,background:c,borderRadius:2 }}/></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ background:'white',borderRadius:8,padding:10,boxShadow:'0 1px 4px rgba(0,0,0,.06)',fontSize:10,color:'var(--gray3)',textAlign:'center' }}>📋 공지사항</div>
        </div>
      </div>
      <div style={{ display:'flex',borderTop:'1px solid var(--gray2)' }}>
        <div style={{ width:130,flexShrink:0,padding:'8px 12px',background:'#e8f0fe',fontSize:10,color:'var(--blue)',fontWeight:700,textAlign:'center' }}>① 사이드바 — 메뉴 이동</div>
        <div style={{ flex:1,padding:'8px 12px',background:'#f0fdf4',fontSize:10,color:'#15803d',fontWeight:700,textAlign:'center' }}>② 메인 화면 — 현황 및 기능</div>
      </div>
    </MockupFrame>
  );
}

/* ── 목업: 매출 업로드 - 판매처 선택 ── */
function MockSalesVendor() {
  return (
    <MockupFrame title="매출 업로드 — ① 판매처 파일 선택 화면">
      <div style={{ padding:16 }}>
        <div style={{ display:'flex',alignItems:'center',gap:0,marginBottom:16 }}>
          {['판매처 선택','파일 업로드','확인 및 저장'].map((s,i) => (
            <div key={s} style={{ display:'flex',alignItems:'center' }}>
              <div style={{ display:'flex',alignItems:'center',gap:5,fontSize:10 }}>
                <div style={{ width:20,height:20,borderRadius:'50%',background:i===0?'var(--navy)':'var(--gray2)',color:i===0?'white':'var(--gray3)',fontSize:9,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center' }}>{i+1}</div>
                <span style={{ color:i===0?'var(--navy)':'var(--gray3)',fontWeight:i===0?700:400 }}>{s}</span>
              </div>
              {i<2 && <div style={{ width:32,height:1,background:'var(--gray2)',margin:'0 8px' }}/>}
            </div>
          ))}
        </div>
        <div style={{ fontSize:11,fontWeight:700,color:'var(--navy)',marginBottom:10 }}>판매처 파일 업로드 — 파일을 끌어다 놓으면 자동 인식</div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8 }}>
          {[['홈플러스','#0068b7'],['익스프레스','#00a550'],['롯데마트','#ed1c24'],['롯데슈퍼','#c8102e'],['메가마트','#ff6600'],['이마트','#e6b800'],['에브리데이','#8b5cf6'],['농협','#009a44']].map(([name,color]) => (
            <div key={name} style={{ padding:'10px 6px',border:`2px solid ${color}`,borderRadius:8,background:`${color}12`,textAlign:'center',fontSize:10,fontWeight:600,color,position:'relative' }}>
              <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:color,borderRadius:'6px 6px 0 0' }}/>
              {name}
            </div>
          ))}
        </div>
        <div style={{ marginTop:12,padding:'9px 12px',background:'var(--sky)',borderRadius:8,fontSize:10,color:'#1e40af',display:'flex',alignItems:'center',gap:6 }}>
          💡 파일을 드래그&드롭하면 판매처가 자동으로 인식됩니다
        </div>
      </div>
    </MockupFrame>
  );
}

/* ── 목업: 파일 드롭존 ── */
function MockDropzone({ uploaded }) {
  return (
    <MockupFrame title={uploaded ? "매출 업로드 — ② 파일 인식 완료" : "매출 업로드 — ② 파일 업로드 영역"}>
      <div style={{ padding:16 }}>
        {!uploaded ? (
          <div style={{ border:'2.5px dashed #93c5fd',borderRadius:12,padding:'32px 20px',textAlign:'center',background:'var(--sky)' }}>
            <div style={{ fontSize:32,marginBottom:10 }}>📂</div>
            <div style={{ fontSize:13,fontWeight:700,color:'var(--navy)',marginBottom:4 }}>여기에 엑셀 파일을 끌어다 놓거나 클릭하세요</div>
            <div style={{ fontSize:11,color:'var(--gray3)' }}>XLS, XLSX 파일 지원 · 판매처 자동 인식</div>
          </div>
        ) : (
          <div style={{ border:'2px solid var(--green)',borderRadius:12,padding:'20px',background:'#f0fdf4',display:'flex',alignItems:'center',gap:14 }}>
            <div style={{ fontSize:28 }}>✅</div>
            <div>
              <div style={{ fontSize:13,fontWeight:700,color:'#15803d',marginBottom:2 }}>홈플러스_매출_2025-03-15.xlsx</div>
              <div style={{ fontSize:11,color:'#166534' }}>판매처: 홈플러스 · 날짜: 2025-03-15 · 상품 24건 인식됨</div>
            </div>
          </div>
        )}
      </div>
    </MockupFrame>
  );
}

/* ── 목업: 미리보기 및 저장 ── */
function MockPreviewSave() {
  return (
    <MockupFrame title="매출 업로드 — ③ 미리보기 확인 및 저장">
      <div style={{ padding:16 }}>
        <div style={{ background:'var(--sky)',borderRadius:8,padding:'10px 14px',display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:12 }}>
          {[{label:'판매처',value:'홈플러스'},{label:'날짜',value:'2025-03-15'},{label:'상품 수',value:'24건'}].map(item => (
            <div key={item.label}>
              <div style={{ fontSize:9,color:'var(--blue)',fontWeight:700,textTransform:'uppercase',letterSpacing:.5 }}>{item.label}</div>
              <div style={{ fontSize:13,fontWeight:700,color:'var(--navy)',marginTop:2 }}>{item.value}</div>
            </div>
          ))}
        </div>
        <div style={{ background:'white',borderRadius:8,overflow:'hidden',border:'1px solid var(--gray2)',marginBottom:12 }}>
          <div style={{ display:'grid',gridTemplateColumns:'1.5fr 2fr 1fr 1fr',background:'var(--gray1)',padding:'6px 10px',gap:8,borderBottom:'1px solid var(--gray2)' }}>
            {['상품코드','상품명','수량','금액'].map(h => <div key={h} style={{ fontSize:9,fontWeight:700,color:'var(--gray4)',textTransform:'uppercase' }}>{h}</div>)}
          </div>
          {[['8801234567890','제품명 A',120,'₩240,000'],['8801234567891','제품명 B',85,'₩170,000'],['8801234567892','제품명 C',210,'₩420,000']].map(([code,name,qty,amt]) => (
            <div key={code} style={{ display:'grid',gridTemplateColumns:'1.5fr 2fr 1fr 1fr',padding:'6px 10px',gap:8,borderTop:'1px solid var(--gray2)',alignItems:'center' }}>
              <div style={{ fontSize:8,color:'var(--gray4)',fontFamily:'monospace' }}>{code}</div>
              <div style={{ fontSize:10,color:'var(--navy)' }}>{name}</div>
              <div style={{ fontSize:10,fontWeight:600,color:'var(--navy)' }}>{qty}</div>
              <div style={{ fontSize:10,color:'var(--gray4)' }}>{amt}</div>
            </div>
          ))}
        </div>
        <div style={{ display:'flex',justifyContent:'flex-end',gap:8 }}>
          <div style={{ padding:'7px 14px',background:'var(--sky)',color:'var(--blue)',borderRadius:8,fontSize:11,fontWeight:700,cursor:'pointer',border:'1px solid #dbeafe' }}>자사 양식 다운로드</div>
          <div style={{ padding:'7px 24px',background:'var(--blue)',color:'white',borderRadius:8,fontSize:12,fontWeight:700,cursor:'pointer',boxShadow:'0 2px 8px rgba(37,99,235,.3)' }}>저장</div>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ── 목업: 매입 업로드 ── */
function MockPurchaseVendor() {
  return (
    <MockupFrame title="매입 업로드 — 판매처 선택 및 날짜 입력">
      <div style={{ padding:16 }}>
        <div style={{ fontSize:11,fontWeight:700,color:'var(--navy)',marginBottom:8 }}>① 판매처 선택</div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:16 }}>
          {[['홈플러스','#0068b7',true],['익스프레스','#00a550',false],['롯데마트','#ed1c24',false],['롯데슈퍼','#c8102e',false],['메가마트','#ff6600',false],['이마트','#e6b800',false],['에브리데이','#8b5cf6',false],['농협','#009a44',false]].map(([name,color,sel]) => (
            <div key={name} style={{ padding:'8px 4px',border:`2px solid ${sel?color:'var(--gray2)'}`,borderRadius:8,background:sel?`${color}15`:'white',textAlign:'center',fontSize:9,fontWeight:600,color:sel?color:'var(--gray4)',position:'relative' }}>
              {sel && <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:color,borderRadius:'6px 6px 0 0' }}/>}
              {name}
            </div>
          ))}
        </div>
        <div style={{ fontSize:11,fontWeight:700,color:'var(--navy)',marginBottom:8 }}>② 매입 날짜 선택</div>
        <div style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'8px 14px',border:'1.5px solid var(--blue)',borderRadius:8,background:'var(--sky)',fontSize:11,color:'var(--navy)',fontWeight:500 }}>
          📅 2025-03-15
        </div>
        <div style={{ marginTop:12,fontSize:11,fontWeight:700,color:'var(--navy)',marginBottom:8 }}>③ 파일 업로드</div>
        <div style={{ border:'2px dashed #93c5fd',borderRadius:10,padding:'16px',textAlign:'center',background:'var(--sky)',fontSize:11,color:'var(--gray3)' }}>
          매입 엑셀 파일을 여기에 끌어다 놓거나 클릭
        </div>
      </div>
    </MockupFrame>
  );
}

/* ── 목업: 조회 화면 ── */
function MockQueryPage({ type }) {
  const isP = type === 'purchase';
  const qtyLabel = isP ? '공급수량' : '판매수량';
  const amtLabel = isP ? '공급금액' : '매출금액';
  return (
    <MockupFrame title={`${isP ? '매입' : '매출'} 조회 — 필터 및 결과 화면`}>
      <div style={{ padding:16 }}>
        <div style={{ display:'flex',gap:8,alignItems:'center',marginBottom:12,flexWrap:'wrap' }}>
          {['판매처 전체','2025-03-01','2025-03-31','브랜드 전체'].map(val => (
            <div key={val} style={{ padding:'6px 10px',border:'1.5px solid var(--gray2)',borderRadius:8,background:'white',fontSize:10,color:'var(--text)',display:'flex',alignItems:'center',gap:4 }}>
              {val} <span style={{ color:'var(--gray3)' }}>▾</span>
            </div>
          ))}
          <div style={{ padding:'6px 16px',background:'var(--blue)',color:'white',borderRadius:8,fontSize:10,fontWeight:700 }}>조회</div>
        </div>
        <div style={{ background:'white',borderRadius:8,overflow:'hidden',border:'1px solid var(--gray2)' }}>
          <div style={{ display:'flex',justifyContent:'space-between',padding:'8px 12px',borderBottom:'1px solid var(--gray2)',background:'var(--gray1)' }}>
            <span style={{ fontSize:10,fontWeight:700,color:'var(--navy)' }}>조회 결과 · 42건</span>
            <div style={{ display:'flex',gap:6 }}>
              <div style={{ padding:'4px 10px',background:'var(--sky)',color:'var(--blue)',borderRadius:6,fontSize:9,fontWeight:700,cursor:'pointer' }}>선택 다운로드</div>
              <div style={{ padding:'4px 10px',background:'var(--sky)',color:'var(--blue)',borderRadius:6,fontSize:9,fontWeight:700,cursor:'pointer' }}>전체 다운로드</div>
            </div>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'20px 72px 70px 60px 1fr 56px 70px',background:'var(--gray1)',padding:'5px 12px',gap:6,borderBottom:'1px solid var(--gray2)' }}>
            {['','날짜','판매처','브랜드','상품명',qtyLabel,amtLabel].map(h => (
              <div key={h} style={{ fontSize:8,fontWeight:700,color:'var(--gray4)',textTransform:'uppercase',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{h}</div>
            ))}
          </div>
          {[['2025-03-15','홈플러스','#0068b7','브랜드A','제품명 A',120,'₩240,000'],['2025-03-15','롯데마트','#ed1c24','브랜드B','제품명 B',85,'₩170,000'],['2025-03-14','이마트','#e6b800','브랜드A','제품명 C',210,'₩420,000']].map(([date,vendor,vc,brand,prod,qty,amt]) => (
            <div key={date+vendor} style={{ display:'grid',gridTemplateColumns:'20px 72px 70px 60px 1fr 56px 70px',padding:'6px 12px',gap:6,borderBottom:'1px solid var(--gray2)',alignItems:'center' }}>
              <input type="checkbox" style={{ width:10,height:10 }} readOnly/>
              <div style={{ fontSize:9,color:'var(--gray4)' }}>{date}</div>
              <div style={{ fontSize:9,display:'flex',alignItems:'center',gap:3 }}><span style={{ width:6,height:6,borderRadius:'50%',background:vc,display:'inline-block',flexShrink:0 }}/>{vendor}</div>
              <div style={{ fontSize:9,color:'var(--gray4)' }}>{brand}</div>
              <div style={{ fontSize:9,color:'var(--navy)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{prod}</div>
              <div style={{ fontSize:9,fontWeight:700,color:'var(--navy)',textAlign:'right' }}>{qty}</div>
              <div style={{ fontSize:9,color:'var(--gray4)',textAlign:'right' }}>{amt}</div>
            </div>
          ))}
        </div>
      </div>
    </MockupFrame>
  );
}

/* ── 목업: 상품DB ── */
function MockProductsUpload() {
  return (
    <MockupFrame title="상품DB 업로드 화면">
      <div style={{ padding:16 }}>
        <div style={{ border:'2px dashed var(--gray2)',borderRadius:10,padding:'24px 20px',textAlign:'center',background:'var(--gray1)',marginBottom:14 }}>
          <div style={{ fontSize:28,marginBottom:8 }}>📦</div>
          <div style={{ fontSize:13,fontWeight:700,color:'var(--navy)',marginBottom:4 }}>상품DB 엑셀 파일 업로드</div>
          <div style={{ fontSize:10,color:'var(--gray3)',marginBottom:12 }}>상품코드 · 브랜드 · 상품명 · 정가 컬럼 포함</div>
          <div style={{ display:'inline-flex',padding:'7px 18px',background:'var(--blue)',color:'white',borderRadius:8,fontSize:11,fontWeight:700 }}>파일 선택</div>
        </div>
        <div style={{ background:'white',borderRadius:8,border:'1px solid var(--gray2)',overflow:'hidden' }}>
          <div style={{ display:'grid',gridTemplateColumns:'1.5fr 1fr 2fr 1fr',background:'var(--gray1)',padding:'5px 10px',gap:8,borderBottom:'1px solid var(--gray2)' }}>
            {['상품코드','브랜드','상품명','정가'].map(h => <div key={h} style={{ fontSize:9,fontWeight:700,color:'var(--gray4)' }}>{h}</div>)}
          </div>
          {[['8801234567890','브랜드A','상품명 A','₩2,000'],['8801234567891','브랜드A','상품명 B','₩1,500'],['8801234567892','브랜드B','상품명 C','₩3,000']].map(([code,brand,name,price]) => (
            <div key={code} style={{ display:'grid',gridTemplateColumns:'1.5fr 1fr 2fr 1fr',padding:'5px 10px',gap:8,borderBottom:'1px solid var(--gray2)' }}>
              <div style={{ fontSize:8,color:'var(--gray4)',fontFamily:'monospace' }}>{code}</div>
              <div style={{ fontSize:9,color:'var(--navy)' }}>{brand}</div>
              <div style={{ fontSize:9,color:'var(--navy)' }}>{name}</div>
              <div style={{ fontSize:9,fontWeight:600,color:'var(--navy)' }}>{price}</div>
            </div>
          ))}
        </div>
      </div>
    </MockupFrame>
  );
}

/* ── 목업: 로그인/회원가입 ── */
function MockAuthScreen({ tab }) {
  return (
    <MockupFrame title={tab === 'login' ? '로그인 화면' : '회원가입 화면'}>
      <div style={{ padding:16,display:'flex',justifyContent:'center',background:'linear-gradient(135deg,#0d1b2a 0%,#1b2d42 100%)' }}>
        <div style={{ background:'white',borderRadius:12,padding:20,width:260,boxShadow:'0 8px 32px rgba(0,0,0,.3)' }}>
          <div style={{ textAlign:'center',marginBottom:14 }}>
            <div style={{ width:36,height:36,background:'var(--navy)',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 8px' }}>
              <div style={{ width:14,height:14,background:'white',borderRadius:2 }}/>
            </div>
            <div style={{ fontSize:12,fontWeight:700,color:'var(--navy)' }}>할인점팀 매입·매출 관리</div>
            <div style={{ fontSize:9,color:'var(--gray3)',marginTop:2 }}>Distribution Management System</div>
          </div>
          <div style={{ display:'flex',background:'var(--gray1)',borderRadius:6,padding:2,marginBottom:12 }}>
            {['로그인','회원가입'].map(t => {
              const isActive = tab==='login' ? t==='로그인' : t==='회원가입';
              return (
                <div key={t} style={{ flex:1,padding:'5px',textAlign:'center',borderRadius:5,background:isActive?'white':'transparent',color:isActive?'var(--navy)':'var(--gray4)',fontSize:10,fontWeight:isActive?700:500,boxShadow:isActive?'0 1px 3px rgba(0,0,0,.1)':'none' }}>
                  {t}
                </div>
              );
            })}
          </div>
          {tab === 'login' ? (
            <>
              {[{label:'이메일',ph:'email@company.com'},{label:'비밀번호',ph:'비밀번호'}].map(f => (
                <div key={f.label} style={{ marginBottom:8 }}>
                  <div style={{ fontSize:9,fontWeight:600,color:'var(--gray4)',marginBottom:3 }}>{f.label}</div>
                  <div style={{ padding:'7px 10px',border:'1.5px solid var(--gray2)',borderRadius:6,fontSize:10,color:'var(--gray3)',background:'var(--gray1)' }}>{f.ph}</div>
                </div>
              ))}
              <div style={{ padding:'9px',background:'var(--blue)',color:'white',borderRadius:7,textAlign:'center',fontSize:12,fontWeight:700,marginTop:4 }}>로그인</div>
            </>
          ) : (
            <>
              {[{label:'이름 *',ph:'홍길동'},{label:'부서',ph:'유통3팀'},{label:'이메일 *',ph:'email@company.com'},{label:'비밀번호 *',ph:'6자 이상'}].map(f => (
                <div key={f.label} style={{ marginBottom:6 }}>
                  <div style={{ fontSize:9,fontWeight:600,color:'var(--gray4)',marginBottom:2 }}>{f.label}</div>
                  <div style={{ padding:'5px 8px',border:'1.5px solid var(--gray2)',borderRadius:5,fontSize:9,color:'var(--gray3)',background:'var(--gray1)' }}>{f.ph}</div>
                </div>
              ))}
              <div style={{ padding:'8px',background:'var(--blue)',color:'white',borderRadius:7,textAlign:'center',fontSize:11,fontWeight:700,marginTop:4 }}>가입 신청</div>
            </>
          )}
        </div>
      </div>
    </MockupFrame>
  );
}

function MockPendingScreen() {
  return (
    <MockupFrame title="가입 신청 후 — 승인 대기 화면">
      <div style={{ padding:16,display:'flex',justifyContent:'center',background:'var(--gray1)' }}>
        <div style={{ background:'white',borderRadius:12,padding:'28px 24px',width:280,textAlign:'center',boxShadow:'var(--shadow)' }}>
          <div style={{ width:56,height:56,background:'#fef3c7',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',fontSize:26 }}>⏳</div>
          <div style={{ fontSize:14,fontWeight:700,color:'var(--navy)',marginBottom:8 }}>승인 대기 중</div>
          <div style={{ fontSize:12,color:'var(--gray3)',lineHeight:1.7,marginBottom:16 }}>
            <strong style={{ color:'var(--navy)' }}>홍길동</strong>님의 가입 신청이 접수되었습니다.<br/>
            관리자 승인 후 로그인하실 수 있습니다.
          </div>
          <div style={{ display:'inline-block',padding:'6px 16px',border:'1.5px solid var(--gray2)',borderRadius:7,fontSize:11,color:'var(--gray4)',cursor:'pointer' }}>로그아웃</div>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ── 목업: 관리자 사용자 관리 ── */
function MockAdminPage() {
  return (
    <MockupFrame title="관리자 — 사용자 관리 화면">
      <div style={{ padding:16 }}>
        <div style={{ display:'flex',gap:4,marginBottom:14 }}>
          {[{label:'대기 중',count:3,active:true},{label:'승인됨',count:null,active:false}].map(tab => (
            <div key={tab.label} style={{ padding:'7px 16px',borderRadius:7,background:tab.active?'var(--navy)':'white',color:tab.active?'white':'var(--gray4)',fontSize:11,fontWeight:600,display:'flex',alignItems:'center',gap:6,boxShadow:'var(--shadow)',cursor:'pointer' }}>
              {tab.label}
              {tab.count && <span style={{ background:'var(--red)',color:'white',fontSize:9,fontWeight:700,padding:'1px 6px',borderRadius:8 }}>{tab.count}</span>}
            </div>
          ))}
        </div>
        <div style={{ background:'white',borderRadius:8,overflow:'hidden',border:'1px solid var(--gray2)' }}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 60px 70px 56px 1fr',background:'var(--gray1)',padding:'6px 12px',gap:8,borderBottom:'1px solid var(--gray2)' }}>
            {['이름','이메일','부서','신청일','상태','작업'].map(h => <div key={h} style={{ fontSize:9,fontWeight:700,color:'var(--gray4)' }}>{h}</div>)}
          </div>
          {[{name:'홍길동',email:'hong@co.kr',dept:'유통3팀',date:'03-15'},{name:'김영희',email:'kim@co.kr',dept:'유통1팀',date:'03-14'},{name:'이철수',email:'lee@co.kr',dept:'기획팀',date:'03-13'}].map(u => (
            <div key={u.name} style={{ display:'grid',gridTemplateColumns:'1fr 1fr 60px 70px 56px 1fr',padding:'8px 12px',gap:8,borderBottom:'1px solid var(--gray2)',alignItems:'center' }}>
              <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                <div style={{ width:20,height:20,borderRadius:'50%',background:'#3b82f6',color:'white',fontSize:9,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>{u.name[0]}</div>
                <span style={{ fontSize:10,fontWeight:600,color:'var(--navy)' }}>{u.name}</span>
              </div>
              <div style={{ fontSize:9,color:'var(--gray4)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{u.email}</div>
              <div style={{ fontSize:9,color:'var(--gray4)' }}>{u.dept}</div>
              <div style={{ fontSize:9,color:'var(--gray3)' }}>{u.date}</div>
              <span style={{ background:'#fef3c7',color:'#92400e',padding:'2px 7px',borderRadius:8,fontSize:8,fontWeight:700 }}>대기중</span>
              <div style={{ display:'flex',gap:4 }}>
                <span style={{ padding:'3px 8px',background:'#dcfce7',color:'#15803d',borderRadius:5,fontSize:9,fontWeight:700,cursor:'pointer' }}>✓ 승인</span>
                <span style={{ padding:'3px 8px',background:'#fee2e2',color:'var(--red)',borderRadius:5,fontSize:9,fontWeight:700,cursor:'pointer' }}>✕ 삭제</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MockupFrame>
  );
}

/* ─── HELP PAGE 메인 컴포넌트 ─── */
function HelpPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const sections = [
    { id:'overview', label:'시스템 개요',   icon:'🏠' },
    { id:'upload',   label:'데이터 업로드', icon:'📤' },
    { id:'query',    label:'데이터 조회',   icon:'🔍' },
    { id:'products', label:'상품DB 업로드', icon:'📦' },
    { id:'account',  label:'계정 관리',     icon:'👤' },
    { id:'admin',    label:'관리자 기능',   icon:'⚙️' },
  ];
  return (
    <div>
      <div className="page-header">
        <div className="page-title">사용방법</div>
        <div className="page-sub">할인점팀 매입·매출 관리시스템 이용 가이드</div>
      </div>
      <div style={{ display:'flex',gap:24 }}>
        <div style={{ width:200,flexShrink:0 }}>
          <div style={{ background:'var(--white)',borderRadius:'var(--radius)',boxShadow:'var(--shadow)',overflow:'hidden',position:'sticky',top:24 }}>
            <div style={{ padding:'14px 16px',background:'var(--navy)',color:'white',fontSize:12,fontWeight:700,letterSpacing:'.5px' }}>목차</div>
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)} style={{ display:'flex',alignItems:'center',gap:8,width:'100%',padding:'12px 16px',border:'none',borderLeft:activeSection===s.id?'3px solid var(--blue)':'3px solid transparent',background:activeSection===s.id?'var(--sky)':'transparent',color:activeSection===s.id?'var(--blue)':'var(--gray4)',fontFamily:'inherit',fontSize:13,fontWeight:activeSection===s.id?700:500,textAlign:'left',cursor:'pointer',transition:'all .15s' }}>
                <span style={{ fontSize:14 }}>{s.icon}</span>{s.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex:1,minWidth:0 }}>
          {activeSection==='overview'  && <HelpSectionOverview />}
          {activeSection==='upload'    && <HelpSectionUpload />}
          {activeSection==='query'     && <HelpSectionQuery />}
          {activeSection==='products'  && <HelpSectionProducts />}
          {activeSection==='account'   && <HelpSectionAccount />}
          {activeSection==='admin'     && <HelpSectionAdmin />}
        </div>
      </div>
    </div>
  );
}

/* ── 시스템 개요 ── */
function HelpSectionOverview() {
  return (
    <div>
      <HelpCard title="시스템 소개" accent="var(--blue)">
        <p style={{ fontSize:14,color:'var(--gray4)',lineHeight:1.8,marginBottom:16 }}>
          <strong style={{ color:'var(--navy)' }}>할인점팀 매입·매출 관리시스템</strong>은 홈플러스, 롯데마트, 이마트 등
          주요 할인점으로부터 받은 매입·매출 엑셀 파일을 자동으로 파싱하여 저장하고,
          판매처별 현황을 조회할 수 있는 전사 데이터 관리 도구입니다.
        </p>
        <div style={{ display:'flex',gap:12,flexWrap:'wrap' }}>
          {[{label:'지원 판매처',value:'8곳',color:'#2563eb'},{label:'주요 기능',value:'업로드·조회·이력',color:'#22c55e'},{label:'파일 형식',value:'XLS / XLSX',color:'#f59e0b'}].map(item => (
            <div key={item.label} style={{ flex:1,minWidth:110,padding:'14px 16px',background:'var(--gray1)',borderRadius:8,textAlign:'center' }}>
              <div style={{ fontSize:18,fontWeight:700,color:item.color }}>{item.value}</div>
              <div style={{ fontSize:12,color:'var(--gray4)',marginTop:4 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </HelpCard>
      <MockOverview />
      <HelpCard title="지원 판매처" accent="var(--blue)">
        <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>
          {[['홈플러스','#0068b7'],['익스프레스','#00a550'],['롯데마트','#ed1c24'],['롯데슈퍼','#c8102e'],['메가마트','#ff6600'],['이마트','#e6b800'],['에브리데이','#8b5cf6'],['농협','#009a44']].map(([name,color]) => (
            <span key={name} style={{ display:'inline-flex',alignItems:'center',gap:5,padding:'4px 12px',border:`1.5px solid ${color}`,borderRadius:20,fontSize:13,fontWeight:600,color,background:color+'18' }}>
              <span style={{ width:7,height:7,borderRadius:'50%',background:color,flexShrink:0 }}/>{name}
            </span>
          ))}
        </div>
        <p style={{ fontSize:12,color:'var(--gray3)',marginTop:12 }}>* 각 판매처의 표준 엑셀 양식을 자동으로 인식하여 파싱합니다.</p>
      </HelpCard>
    </div>
  );
}

/* ── 데이터 업로드 ── */
function HelpSectionUpload() {
  const [tab, setTab] = useState('sales');
  return (
    <div>
      <div style={{ display:'flex',gap:4,marginBottom:16 }}>
        {[{id:'sales',label:'📊 매출 업로드'},{id:'purchase',label:'🚚 매입 업로드'},{id:'history',label:'📋 업로드 이력'}].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding:'8px 16px',borderRadius:8,border:'none',fontFamily:'inherit',fontSize:13,fontWeight:600,cursor:'pointer',background:tab===t.id?'var(--navy)':'var(--white)',color:tab===t.id?'white':'var(--gray4)',boxShadow:'var(--shadow)',transition:'all .15s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'sales' && (
        <>
          <HelpCard title="매출 업로드 순서" accent="#22c55e">
            <HelpStep number={1} title="사이드바 [데이터 업로드 > 매출] 클릭" desc="왼쪽 사이드바 메뉴에서 이동합니다." />
            <HelpStep number={2} title="판매처 파일 드래그하거나 클릭해서 업로드" desc="판매처에서 받은 엑셀 파일을 올리면 판매처와 날짜를 자동으로 인식합니다." note="홈플러스·익스프레스는 하나의 파일에 두 판매처 데이터가 있어도 자동으로 분리됩니다." />
          </HelpCard>
          <MockSalesVendor />
          <HelpCard accent="#22c55e">
            <HelpStep number={3} title="파일 업로드 영역에 파일 드롭" desc="점선 영역에 파일을 끌어다 놓거나, 클릭해서 파일을 선택합니다." />
          </HelpCard>
          <MockDropzone uploaded={false} />
          <MockDropzone uploaded={true} />
          <HelpCard accent="#22c55e">
            <HelpStep number={4} title="미리보기 데이터 확인 후 [저장] 클릭" desc="파싱된 상품코드·수량이 맞는지 확인 후 저장합니다. 필요 시 자사 양식으로 다운로드도 가능합니다." note="동일 날짜·판매처 데이터가 이미 있으면 덮어쓸지 확인 창이 나타납니다." />
          </HelpCard>
          <MockPreviewSave />
        </>
      )}

      {tab === 'purchase' && (
        <>
          <HelpCard title="매입 업로드 순서" accent="#2563eb">
            <HelpStep number={1} title="사이드바 [데이터 업로드 > 매입] 클릭" />
            <HelpStep number={2} title="판매처 선택" desc="화면의 판매처 버튼 중 해당 판매처를 클릭합니다." />
            <HelpStep number={3} title="매입 날짜 입력" desc="해당 매입 데이터의 기준 날짜를 선택합니다." />
            <HelpStep number={4} title="엑셀 파일 업로드" desc="판매처에서 받은 매입 파일을 드래그하거나 클릭해서 선택합니다." note="EUC-KR 인코딩 파일도 자동 처리됩니다. 별도 변환 불필요." />
            <HelpStep number={5} title="미리보기 확인 후 저장" desc="상품코드, 공급수량, 공급금액을 확인 후 [저장] 클릭." />
          </HelpCard>
          <MockPurchaseVendor />
        </>
      )}

      {tab === 'history' && (
        <>
          <HelpCard title="업로드 이력 조회" accent="#f59e0b">
            <HelpStep number={1} title="사이드바 [데이터 업로드 > 업로드 이력] 클릭" desc="지금까지 업로드된 모든 파일 이력을 확인합니다." />
            <HelpStep number={2} title="필터 설정" desc="매입/매출 구분, 판매처, 기간으로 필터링합니다." />
            <HelpStep number={3} title="데이터 다운로드" desc="체크박스로 항목 선택 후 [선택 다운로드] 또는 [전체 다운로드] 클릭." note="여러 건 선택 시 [선택 다운로드] 버튼이 활성화됩니다." />
          </HelpCard>
          <MockQueryPage type="purchase" />
        </>
      )}

      <HelpCard title="주의사항" accent="#ef4444">
        {['상품코드가 88로 시작하는 항목만 자동으로 인식됩니다.','판매처에서 양식을 변경한 경우 파싱이 실패할 수 있습니다.','동일 날짜·판매처 데이터를 다시 업로드하면 기존 데이터를 덮어씁니다.','파일 인코딩이 EUC-KR인 경우에도 자동 처리됩니다.'].map((txt,i) => (
          <div key={i} style={{ display:'flex',gap:8,alignItems:'flex-start',fontSize:13,color:'var(--gray4)',marginBottom:8 }}>
            <span style={{ color:'var(--red)',fontWeight:700,flexShrink:0 }}>⚠</span>{txt}
          </div>
        ))}
      </HelpCard>
    </div>
  );
}

/* ── 데이터 조회 ── */
function HelpSectionQuery() {
  return (
    <div>
      <HelpCard title="매입 조회" accent="#2563eb">
        <HelpStep number={1} title="[데이터 조회 > 매입] 메뉴 클릭" />
        <HelpStep number={2} title="조회 조건 설정" desc="판매처, 기간(시작일~종료일), 브랜드 조건을 설정합니다." />
        <HelpStep number={3} title="[조회] 클릭 → 결과 확인" desc="날짜·판매처·브랜드·상품명·공급수량·공급금액 목록이 표시됩니다." />
        <HelpStep number={4} title="엑셀 다운로드" desc="체크박스로 원하는 행 선택 후 [선택 다운로드] 또는 [전체 다운로드]." note="다운로드 파일에는 날짜·판매처·상품 정보가 포함됩니다." />
      </HelpCard>
      <MockQueryPage type="purchase" />
      <HelpCard title="매출 조회" accent="#22c55e">
        <HelpStep number={1} title="[데이터 조회 > 매출] 메뉴 클릭" />
        <HelpStep number={2} title="조회 조건 설정" desc="판매처, 기간, 브랜드 조건을 선택합니다." />
        <HelpStep number={3} title="결과 확인 및 다운로드" desc="판매수량·매출금액 확인 후 필요 시 엑셀로 내보냅니다." />
      </HelpCard>
      <MockQueryPage type="sales" />
    </div>
  );
}

/* ── 상품DB 업로드 ── */
function HelpSectionProducts() {
  return (
    <div>
      <HelpCard title="상품DB 업로드란?" accent="#f59e0b">
        <p style={{ fontSize:14,color:'var(--gray4)',lineHeight:1.7,marginBottom:12 }}>상품코드별 정가, 브랜드, 상품명 기준 정보를 엑셀로 일괄 등록합니다. 매출 금액 산정 시 여기에 등록된 정가가 사용됩니다.</p>
        {[{label:'홈 대시보드',value:'판매처별 매출액 산정 (판매수량 × 정가)'},{label:'매출 조회',value:'매출금액 컬럼 계산 시 활용'},{label:'매출 업로드',value:'상품명·브랜드 자동 매칭'}].map(item => (
          <div key={item.label} style={{ display:'flex',padding:'10px 0',borderBottom:'1px solid var(--gray2)',fontSize:13 }}>
            <div style={{ width:130,flexShrink:0,color:'var(--gray4)',fontWeight:500 }}>{item.label}</div>
            <div style={{ flex:1,color:'var(--text)' }}>{item.value}</div>
          </div>
        ))}
      </HelpCard>
      <HelpCard title="업로드 방법" accent="#f59e0b">
        <HelpStep number={1} title="[데이터 업로드 > 상품DB 업로드] 메뉴 클릭" />
        <HelpStep number={2} title="엑셀 파일 준비" desc="상품코드, 브랜드, 상품명, 정가 컬럼이 포함된 엑셀 파일을 준비합니다." note="상품코드는 88로 시작하는 바코드 형식이어야 합니다." />
        <HelpStep number={3} title="파일 업로드 및 저장" desc="파일을 선택하고 미리보기를 확인한 후 저장합니다." />
      </HelpCard>
      <MockProductsUpload />
    </div>
  );
}

/* ── 계정 관리 ── */
function HelpSectionAccount() {
  const [mockTab, setMockTab] = useState('login');
  return (
    <div>
      <HelpCard title="회원가입" accent="#22c55e">
        <HelpStep number={1} title="로그인 화면에서 [회원가입] 탭 클릭" />
        <HelpStep number={2} title="정보 입력 후 [가입 신청] 클릭" desc="이름(필수), 부서, 이메일(필수), 비밀번호(6자 이상)를 입력합니다." note="부서 예시: 유통3팀, 유통기획팀" />
        <HelpStep number={3} title="관리자 승인 대기" desc="가입 신청 완료 후 관리자가 승인하기 전까지 '승인 대기 중' 화면이 표시됩니다." />
        <HelpStep number={4} title="승인 완료 후 정상 로그인 가능" />
      </HelpCard>
      <div style={{ display:'flex',gap:8,marginBottom:8 }}>
        {[{id:'login',label:'로그인 화면'},{id:'signup',label:'회원가입 화면'},{id:'pending',label:'승인 대기 화면'}].map(t => (
          <button key={t.id} onClick={() => setMockTab(t.id)} style={{ padding:'6px 14px',borderRadius:6,border:'none',fontFamily:'inherit',fontSize:12,fontWeight:600,cursor:'pointer',background:mockTab===t.id?'var(--navy)':'var(--white)',color:mockTab===t.id?'white':'var(--gray4)',boxShadow:'var(--shadow)',transition:'all .15s' }}>
            {t.label}
          </button>
        ))}
      </div>
      {mockTab === 'pending' ? <MockPendingScreen /> : <MockAuthScreen tab={mockTab} />}
    </div>
  );
}

/* ── 관리자 기능 ── */
function HelpSectionAdmin() {
  return (
    <div>
      <div style={{ padding:'12px 16px',background:'#fef3c7',borderRadius:8,fontSize:13,color:'#92400e',marginBottom:20,display:'flex',gap:8,alignItems:'center' }}>
        <span style={{ fontSize:16 }}>⚙️</span>
        이 섹션은 <strong>관리자(admin) 계정</strong>에만 표시되는 기능입니다.
      </div>
      <HelpCard title="사용자 관리" accent="#ef4444">
        <HelpStep number={1} title="사이드바 [관리자 > 사용자 관리] 클릭" />
        <HelpStep number={2} title="[대기 중] 탭 — 신청자 확인 후 승인 또는 삭제" desc="이름·이메일·부서·신청일을 확인 후 [✓ 승인] 또는 [✕ 삭제] 클릭." note="삭제 시 해당 계정은 완전히 삭제됩니다." />
        <HelpStep number={3} title="[승인됨] 탭 — 승인 취소" desc="승인된 사용자 목록에서 [승인 취소]로 접근 권한을 회수할 수 있습니다." />
      </HelpCard>
      <MockAdminPage />
      <HelpCard title="공지사항 관리" accent="#ef4444">
        <HelpStep number={1} title="홈 화면 공지사항 섹션에서 [공지 작성] 클릭" desc="관리자만 공지를 작성·수정·삭제할 수 있습니다." />
        <HelpStep number={2} title="제목과 내용 입력 후 저장" desc="[📌 상단 고정] 체크 시 공지 목록 최상단에 고정됩니다." />
        <HelpStep number={3} title="수정·삭제" desc="기존 공지의 [수정] 또는 [삭제] 버튼으로 관리합니다." />
      </HelpCard>
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
        {page === 'home'           && <HomePage onNavigate={setPage} profile={profile} />}
        {page === 'purchase'       && <UploadPage type="매입" profile={profile} key="purchase" />}
        {page === 'sales'          && <UploadPage type="매출" profile={profile} key="sales" />}
        {page === 'history'        && <HistoryPage profile={profile} />}
        {page === 'purchase-query' && <PurchaseQueryPage />}
        {page === 'sales-query'    && <SalesQueryPage />}
        {page === 'products'       && <ProductsPage />}
        {page === 'admin'          && profile.role === 'admin' && <AdminPage />}
        {page === 'help'           && <HelpPage />}
      </div>
    </div>
  );
}

/* ─── STYLE INJECT ──────────────────────────────────────────────────── */
const styleTag = document.createElement('style');
styleTag.textContent = CSS;
document.head.appendChild(styleTag);
