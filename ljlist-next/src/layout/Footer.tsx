'use client'

import { LogoMark } from './LogoMark'

export const Footer = () => (
  <footer className="bg-gray-900 text-gray-400">
    <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
      <div>
        <div className="flex items-center gap-2 mb-4"><LogoMark size={34} />
          <div>
            <p className="font-black text-white text-sm">List "J" Grocery</p>
            <p className="text-gray-600 text-[11px]">Hire Purchase · Crediting</p>
          </div>
        </div>
        <p className="text-gray-500 text-xs leading-relaxed mb-4">Ghana's trusted grocery hire-purchase service for all government workers.</p>
        <div className="flex gap-2">{['📘','🐦','📸'].map((s,i) => (
          <button key={i} className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors text-sm">{s}</button>
        ))}</div>
      </div>
      {[
        { title: 'Quick Links', links: ['Home','Fixed Packages','Build Your Own','Apply Now','Track Order'] },
        { title: 'Categories',  links: ['Rice & Grains','Cooking Oils','Canned & Tins','Frozen Foods','Detergents','Foodstuffs'] },
        { title: 'Support',     links: ['Contact Us','FAQs','Return Policy','Privacy Policy','Terms of Service'] },
      ].map(col => (
        <div key={col.title}>
          <h4 className="font-bold text-white mb-4 text-sm">{col.title}</h4>
          <ul className="space-y-2">{col.links.map(l => (
            <li key={l}><a href="#" className="text-gray-500 hover:text-gray-300 text-xs transition-colors">{l}</a></li>
          ))}</ul>
        </div>
      ))}
    </div>
    <div className="border-t border-gray-800 py-4 px-4 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
      <p className="text-gray-600 text-xs">© 2025 List J Grocery Shop · All rights reserved.</p>
      <div className="flex items-center gap-2 text-xs">
        {['Mandate 📋','Ghana Card 🪪','3 Months 📅'].map(m => (
          <span key={m} className="bg-gray-800 text-gray-400 px-2 py-1 rounded font-medium">{m}</span>
        ))}
      </div>
    </div>
  </footer>
)


