"use client";

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

export type DayPoint = { day: string; label: string; revenue: number; orders: number; paid: number };

const money = (value: number) => new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value);

export function ReportCharts({ data }: { data: DayPoint[] }) {
  const hasSales = data.some(point => point.revenue > 0);
  const hasOrders = data.some(point => point.orders > 0);
  return <div className="report-charts">
    <section className="report-card report-chart">
      <div className="report-card-heading"><div><span>SATIŞ PERFORMANSI</span><h2>Günlük tahsil edilen ciro</h2></div><strong>₺</strong></div>
      {hasSales ? <div className="report-chart-canvas" style={{ minWidth: 0, minHeight: 260, height: 260 }}><ResponsiveContainer width="100%" height={260} minWidth={0} minHeight={260}>
        <AreaChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
          <defs><linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#accb5e" stopOpacity={0.42} /><stop offset="100%" stopColor="#accb5e" stopOpacity={0} /></linearGradient></defs>
          <CartesianGrid vertical={false} stroke="#e9eef2" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={28} tick={{ fill: "#8291a0", fontSize: 11 }} />
          <YAxis tickLine={false} axisLine={false} tickFormatter={money} width={46} tick={{ fill: "#8291a0", fontSize: 11 }} />
          <Tooltip formatter={value => `${money(Number(value))} ₺`} labelFormatter={label => String(label)} />
          <Area dataKey="revenue" name="Tahsil edilen" type="monotone" stroke="#75952c" strokeWidth={3} fill="url(#revenueGradient)" />
        </AreaChart>
      </ResponsiveContainer></div> : <p className="report-empty">Bu dönemde tahsil edilmiş sipariş yok. Grafik, ilk ödemeden sonra dolacak.</p>}
    </section>
    <section className="report-card report-chart">
      <div className="report-card-heading"><div><span>SİPARİŞ AKIŞI</span><h2>Günlük sipariş sayısı</h2></div><strong>#</strong></div>
      {hasOrders ? <div className="report-chart-canvas" style={{ minWidth: 0, minHeight: 260, height: 260 }}><ResponsiveContainer width="100%" height={260} minWidth={0} minHeight={260}>
        <BarChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#e9eef2" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={28} tick={{ fill: "#8291a0", fontSize: 11 }} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={30} tick={{ fill: "#8291a0", fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="orders" name="Toplam sipariş" fill="#233a4d" radius={[4, 4, 0, 0]} maxBarSize={20} />
          <Bar dataKey="paid" name="Ödenen" fill="#a4c759" radius={[4, 4, 0, 0]} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer></div> : <p className="report-empty">Bu dönemde sipariş bulunmuyor. Oluştuğunda günlük dağılım burada görünecek.</p>}
    </section>
  </div>;
}
