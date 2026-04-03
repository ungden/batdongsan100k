'use client'

import { useEffect, useState, useTransition } from 'react'
import { getSettings, updateSettings } from './actions'

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getSettings().then(setSettings)
  }, [])

  function handleSubmit(formData: FormData) {
    setSaved(false)
    startTransition(async () => {
      await updateSettings(formData)
      const updated = await getSettings()
      setSettings(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  const fields = [
    {
      key: 'site_name',
      label: 'Ten trang web',
      placeholder: 'VD: TitanHome',
      icon: 'language',
    },
    {
      key: 'site_description',
      label: 'Mo ta trang web',
      placeholder: 'Mo ta ngan gon ve trang web',
      icon: 'description',
      multiline: true,
    },
    {
      key: 'contact_email',
      label: 'Email lien he',
      placeholder: 'VD: info@titanhome.vn',
      icon: 'email',
      type: 'email',
    },
    {
      key: 'contact_phone',
      label: 'So dien thoai',
      placeholder: 'VD: 0909 123 456',
      icon: 'phone',
      type: 'tel',
    },
    {
      key: 'contact_address',
      label: 'Dia chi',
      placeholder: 'VD: 123 Nguyen Hue, Quan 1, TP.HCM',
      icon: 'location_on',
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Cai dat</h1>
        <p className="text-sm text-on-surface/60 mt-1">
          Cau hinh thong tin trang web
        </p>
      </div>

      <form action={handleSubmit}>
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="flex items-center gap-2 text-sm font-medium text-on-surface mb-1.5">
                <span className="material-symbols-outlined text-lg text-on-surface/40">
                  {field.icon}
                </span>
                {field.label}
              </label>
              {field.multiline ? (
                <textarea
                  name={field.key}
                  rows={3}
                  value={settings[field.key] ?? ''}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  placeholder={field.placeholder}
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  name={field.key}
                  value={settings[field.key] ?? ''}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-container transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">
              {isPending ? 'hourglass_empty' : 'save'}
            </span>
            {isPending ? 'Dang luu...' : 'Luu cai dat'}
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1 text-sm text-green-600">
              <span className="material-symbols-outlined text-lg">
                check_circle
              </span>
              Da luu thanh cong
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
