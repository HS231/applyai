'use client'

import { useState, useEffect, useRef } from 'react'

const ARRANGEMENTS = ['Remote', 'Hybrid', 'On-site']

const CURRENCIES = [
  { code: 'AED', label: 'AED — UAE Dirham' },
  { code: 'AFN', label: 'AFN — Afghan Afghani' },
  { code: 'ALL', label: 'ALL — Albanian Lek' },
  { code: 'AMD', label: 'AMD — Armenian Dram' },
  { code: 'ANG', label: 'ANG — Netherlands Antillean Guilder' },
  { code: 'AOA', label: 'AOA — Angolan Kwanza' },
  { code: 'ARS', label: 'ARS — Argentine Peso' },
  { code: 'AUD', label: 'AUD — Australian Dollar' },
  { code: 'AWG', label: 'AWG — Aruban Florin' },
  { code: 'AZN', label: 'AZN — Azerbaijani Manat' },
  { code: 'BAM', label: 'BAM — Bosnia-Herzegovina Convertible Mark' },
  { code: 'BBD', label: 'BBD — Barbadian Dollar' },
  { code: 'BDT', label: 'BDT — Bangladeshi Taka' },
  { code: 'BGN', label: 'BGN — Bulgarian Lev' },
  { code: 'BHD', label: 'BHD — Bahraini Dinar' },
  { code: 'BIF', label: 'BIF — Burundian Franc' },
  { code: 'BMD', label: 'BMD — Bermudian Dollar' },
  { code: 'BND', label: 'BND — Brunei Dollar' },
  { code: 'BOB', label: 'BOB — Bolivian Boliviano' },
  { code: 'BRL', label: 'BRL — Brazilian Real' },
  { code: 'BSD', label: 'BSD — Bahamian Dollar' },
  { code: 'BTN', label: 'BTN — Bhutanese Ngultrum' },
  { code: 'BWP', label: 'BWP — Botswanan Pula' },
  { code: 'BYN', label: 'BYN — Belarusian Ruble' },
  { code: 'BZD', label: 'BZD — Belize Dollar' },
  { code: 'CAD', label: 'CAD — Canadian Dollar' },
  { code: 'CDF', label: 'CDF — Congolese Franc' },
  { code: 'CHF', label: 'CHF — Swiss Franc' },
  { code: 'CLP', label: 'CLP — Chilean Peso' },
  { code: 'CNY', label: 'CNY — Chinese Yuan' },
  { code: 'COP', label: 'COP — Colombian Peso' },
  { code: 'CRC', label: 'CRC — Costa Rican Colon' },
  { code: 'CUP', label: 'CUP — Cuban Peso' },
  { code: 'CVE', label: 'CVE — Cape Verdean Escudo' },
  { code: 'CZK', label: 'CZK — Czech Koruna' },
  { code: 'DJF', label: 'DJF — Djiboutian Franc' },
  { code: 'DKK', label: 'DKK — Danish Krone' },
  { code: 'DOP', label: 'DOP — Dominican Peso' },
  { code: 'DZD', label: 'DZD — Algerian Dinar' },
  { code: 'EGP', label: 'EGP — Egyptian Pound' },
  { code: 'ERN', label: 'ERN — Eritrean Nakfa' },
  { code: 'ETB', label: 'ETB — Ethiopian Birr' },
  { code: 'EUR', label: 'EUR — Euro' },
  { code: 'FJD', label: 'FJD — Fijian Dollar' },
  { code: 'FKP', label: 'FKP — Falkland Islands Pound' },
  { code: 'GBP', label: 'GBP — British Pound' },
  { code: 'GEL', label: 'GEL — Georgian Lari' },
  { code: 'GHS', label: 'GHS — Ghanaian Cedi' },
  { code: 'GIP', label: 'GIP — Gibraltar Pound' },
  { code: 'GMD', label: 'GMD — Gambian Dalasi' },
  { code: 'GNF', label: 'GNF — Guinean Franc' },
  { code: 'GTQ', label: 'GTQ — Guatemalan Quetzal' },
  { code: 'GYD', label: 'GYD — Guyanaese Dollar' },
  { code: 'HKD', label: 'HKD — Hong Kong Dollar' },
  { code: 'HNL', label: 'HNL — Honduran Lempira' },
  { code: 'HRK', label: 'HRK — Croatian Kuna' },
  { code: 'HTG', label: 'HTG — Haitian Gourde' },
  { code: 'HUF', label: 'HUF — Hungarian Forint' },
  { code: 'IDR', label: 'IDR — Indonesian Rupiah' },
  { code: 'ILS', label: 'ILS — Israeli Shekel' },
  { code: 'INR', label: 'INR — Indian Rupee' },
  { code: 'IQD', label: 'IQD — Iraqi Dinar' },
  { code: 'IRR', label: 'IRR — Iranian Rial' },
  { code: 'ISK', label: 'ISK — Icelandic Krona' },
  { code: 'JMD', label: 'JMD — Jamaican Dollar' },
  { code: 'JOD', label: 'JOD — Jordanian Dinar' },
  { code: 'JPY', label: 'JPY — Japanese Yen' },
  { code: 'KES', label: 'KES — Kenyan Shilling' },
  { code: 'KGS', label: 'KGS — Kyrgystani Som' },
  { code: 'KHR', label: 'KHR — Cambodian Riel' },
  { code: 'KMF', label: 'KMF — Comorian Franc' },
  { code: 'KPW', label: 'KPW — North Korean Won' },
  { code: 'KRW', label: 'KRW — South Korean Won' },
  { code: 'KWD', label: 'KWD — Kuwaiti Dinar' },
  { code: 'KYD', label: 'KYD — Cayman Islands Dollar' },
  { code: 'KZT', label: 'KZT — Kazakhstani Tenge' },
  { code: 'LAK', label: 'LAK — Laotian Kip' },
  { code: 'LBP', label: 'LBP — Lebanese Pound' },
  { code: 'LKR', label: 'LKR — Sri Lankan Rupee' },
  { code: 'LRD', label: 'LRD — Liberian Dollar' },
  { code: 'LSL', label: 'LSL — Lesotho Loti' },
  { code: 'LYD', label: 'LYD — Libyan Dinar' },
  { code: 'MAD', label: 'MAD — Moroccan Dirham' },
  { code: 'MDL', label: 'MDL — Moldovan Leu' },
  { code: 'MGA', label: 'MGA — Malagasy Ariary' },
  { code: 'MKD', label: 'MKD — Macedonian Denar' },
  { code: 'MMK', label: 'MMK — Myanmar Kyat' },
  { code: 'MNT', label: 'MNT — Mongolian Togrog' },
  { code: 'MOP', label: 'MOP — Macanese Pataca' },
  { code: 'MRU', label: 'MRU — Mauritanian Ouguiya' },
  { code: 'MUR', label: 'MUR — Mauritian Rupee' },
  { code: 'MVR', label: 'MVR — Maldivian Rufiyaa' },
  { code: 'MWK', label: 'MWK — Malawian Kwacha' },
  { code: 'MXN', label: 'MXN — Mexican Peso' },
  { code: 'MYR', label: 'MYR — Malaysian Ringgit' },
  { code: 'MZN', label: 'MZN — Mozambican Metical' },
  { code: 'NAD', label: 'NAD — Namibian Dollar' },
  { code: 'NGN', label: 'NGN — Nigerian Naira' },
  { code: 'NIO', label: 'NIO — Nicaraguan Cordoba' },
  { code: 'NOK', label: 'NOK — Norwegian Krone' },
  { code: 'NPR', label: 'NPR — Nepalese Rupee' },
  { code: 'NZD', label: 'NZD — New Zealand Dollar' },
  { code: 'OMR', label: 'OMR — Omani Rial' },
  { code: 'PAB', label: 'PAB — Panamanian Balboa' },
  { code: 'PEN', label: 'PEN — Peruvian Sol' },
  { code: 'PGK', label: 'PGK — Papua New Guinean Kina' },
  { code: 'PHP', label: 'PHP — Philippine Peso' },
  { code: 'PKR', label: 'PKR — Pakistani Rupee' },
  { code: 'PLN', label: 'PLN — Polish Zloty' },
  { code: 'PYG', label: 'PYG — Paraguayan Guarani' },
  { code: 'QAR', label: 'QAR — Qatari Rial' },
  { code: 'RON', label: 'RON — Romanian Leu' },
  { code: 'RSD', label: 'RSD — Serbian Dinar' },
  { code: 'RUB', label: 'RUB — Russian Ruble' },
  { code: 'RWF', label: 'RWF — Rwandan Franc' },
  { code: 'SAR', label: 'SAR — Saudi Riyal' },
  { code: 'SBD', label: 'SBD — Solomon Islands Dollar' },
  { code: 'SCR', label: 'SCR — Seychellois Rupee' },
  { code: 'SDG', label: 'SDG — Sudanese Pound' },
  { code: 'SEK', label: 'SEK — Swedish Krona' },
  { code: 'SGD', label: 'SGD — Singapore Dollar' },
  { code: 'SHP', label: 'SHP — Saint Helena Pound' },
  { code: 'SLL', label: 'SLL — Sierra Leonean Leone' },
  { code: 'SOS', label: 'SOS — Somali Shilling' },
  { code: 'SRD', label: 'SRD — Surinamese Dollar' },
  { code: 'STN', label: 'STN — Sao Tome and Principe Dobra' },
  { code: 'SVC', label: 'SVC — Salvadoran Colon' },
  { code: 'SYP', label: 'SYP — Syrian Pound' },
  { code: 'SZL', label: 'SZL — Swazi Lilangeni' },
  { code: 'THB', label: 'THB — Thai Baht' },
  { code: 'TJS', label: 'TJS — Tajikistani Somoni' },
  { code: 'TMT', label: 'TMT — Turkmenistani Manat' },
  { code: 'TND', label: 'TND — Tunisian Dinar' },
  { code: 'TOP', label: 'TOP — Tongan Paanga' },
  { code: 'TRY', label: 'TRY — Turkish Lira' },
  { code: 'TTD', label: 'TTD — Trinidad and Tobago Dollar' },
  { code: 'TWD', label: 'TWD — New Taiwan Dollar' },
  { code: 'TZS', label: 'TZS — Tanzanian Shilling' },
  { code: 'UAH', label: 'UAH — Ukrainian Hryvnia' },
  { code: 'UGX', label: 'UGX — Ugandan Shilling' },
  { code: 'USD', label: 'USD — US Dollar' },
  { code: 'UYU', label: 'UYU — Uruguayan Peso' },
  { code: 'UZS', label: 'UZS — Uzbekistani Som' },
  { code: 'VES', label: 'VES — Venezuelan Bolivar' },
  { code: 'VND', label: 'VND — Vietnamese Dong' },
  { code: 'VUV', label: 'VUV — Vanuatu Vatu' },
  { code: 'WST', label: 'WST — Samoan Tala' },
  { code: 'XAF', label: 'XAF — Central African CFA Franc' },
  { code: 'XCD', label: 'XCD — East Caribbean Dollar' },
  { code: 'XOF', label: 'XOF — West African CFA Franc' },
  { code: 'XPF', label: 'XPF — CFP Franc' },
  { code: 'YER', label: 'YER — Yemeni Rial' },
  { code: 'ZAR', label: 'ZAR — South African Rand' },
  { code: 'ZMW', label: 'ZMW — Zambian Kwacha' },
  { code: 'ZWL', label: 'ZWL — Zimbabwean Dollar' },
]

export default function Step3Location({ profile, updateProfile, onNext, onBack }) {
  const [query, setQuery] = useState(profile.location || '')
  const [selected, setSelected] = useState(profile.location || '')
  const [suggestions, setSuggestions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [arrangement, setArrangement] = useState(
    profile.workArrangement
      ? Array.isArray(profile.workArrangement)
        ? profile.workArrangement
        : [profile.workArrangement]
      : ['remote']
  )
  const [currency, setCurrency] = useState(profile.currency || 'CAD')
  const [salaryMin, setSalaryMin] = useState(profile.salaryMin || '')
  const debounceRef = useRef(null)

  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([])
      return
    }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places?input=${encodeURIComponent(query)}`)
        const data = await res.json()
        if (data.predictions) {
          setSuggestions(data.predictions)
          setShowDropdown(true)
        }
      } catch (err) {
        console.error('Places API error:', err)
      }
    }, 300)
  }, [query])

  function handleSelect(location) {
    setSelected(location)
    setQuery(location)
    setSuggestions([])
    setShowDropdown(false)
  }

  function handleNext() {
    updateProfile({
      location: selected || query,
      workArrangement: Array.isArray(arrangement) ? arrangement.join(', ') : arrangement,
      salaryMin: Number(salaryMin) || 0,
      currency,
    })
    onNext()
  }

  return (
    <div className="card">
      <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>
        Location & compensation
      </h2>
      <p style={{ color: 'var(--text-sec)', fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
        We'll filter out roles that don't meet your criteria automatically.
      </p>

      {/* Location search */}
      <div style={{ marginBottom: 20, position: 'relative' }}>
        <label className="field-label">Your location</label>
        <input
          className="input"
          placeholder="Type any city in the world..."
          value={query}
          onChange={e => { setQuery(e.target.value); setSelected('') }}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          autoComplete="off"
        />
        {showDropdown && suggestions.length > 0 && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
            background: 'white', border: '1px solid var(--border)',
            borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            zIndex: 100, overflow: 'hidden',
          }}>
            {suggestions.map((loc, i) => (
              <div
                key={i}
                onMouseDown={() => handleSelect(loc)}
                style={{
                  padding: '11px 14px', fontSize: 13, cursor: 'pointer',
                  borderBottom: i < suggestions.length - 1 ? '0.5px solid var(--border)' : 'none',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F8F7F4'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
              >
                <span>📍</span>
                <span style={{ color: 'var(--text-pri)' }}>{loc}</span>
              </div>
            ))}
            <div style={{ padding: '6px 14px', fontSize: 10, color: 'var(--text-hint)' }}>
              Powered by Google
            </div>
          </div>
        )}
        {selected && (
          <div style={{ fontSize: 11, color: 'var(--teal)', marginTop: 5 }}>
            ✓ {selected}
          </div>
        )}
      </div>

      {/* Work arrangement */}
      <div style={{ marginBottom: 20 }}>
        <label className="field-label">Work arrangement</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {ARRANGEMENTS.map(opt => (
            <button
              key={opt}
              className={`choice-btn ${arrangement.includes(opt.toLowerCase()) ? 'selected' : ''}`}
              onClick={() => {
                const val = opt.toLowerCase()
                setArrangement(prev =>
                  prev.includes(val) ? prev.filter(a => a !== val) : [...prev, val]
                )
              }}
              style={{ textAlign: 'center' }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Currency */}
      <div style={{ marginBottom: 16 }}>
        <label className="field-label">Currency</label>
        <select
          value={currency}
          onChange={e => setCurrency(e.target.value)}
          style={{
            width: '100%', background: 'var(--bg-secondary)',
            border: '1px solid var(--border)', borderRadius: 8,
            padding: '10px 14px', fontSize: 14,
            fontFamily: 'inherit', color: 'var(--text-pri)',
            outline: 'none', cursor: 'pointer',
          }}
        >
          {CURRENCIES.map(c => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Minimum salary — number input */}
      <div style={{ marginBottom: 28 }}>
        <label className="field-label">Minimum salary (annual)</label>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            fontSize: 13, fontWeight: 500, color: 'var(--text-sec)',
          }}>
            {currency}
          </span>
          <input
            type="number"
            value={salaryMin}
            onChange={e => setSalaryMin(e.target.value)}
            placeholder="e.g. 80000"
            min={0}
            style={{
              width: '100%',
              padding: '12px 16px 12px 56px',
              border: '1px solid var(--border)',
              borderRadius: 10,
              fontSize: 15,
              fontFamily: 'inherit',
              background: 'var(--bg-secondary)',
              outline: 'none',
              color: 'var(--text-pri)',
            }}
          />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 5 }}>
          Leave blank to see all salaries
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn-ghost" onClick={onBack} style={{ width: 'auto', padding: '0 20px' }}>
          Back
        </button>
        <button className="btn-primary" onClick={handleNext}>
          Continue →
        </button>
      </div>
    </div>
  )
}
