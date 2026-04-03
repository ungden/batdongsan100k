'use client'

import { useState, useEffect, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  createCity,
  deleteCity,
  createDistrict,
  deleteDistrict,
  createFeature,
  deleteFeature,
} from './actions'

type City = { id: string; name: string; slug: string; sort_order: number }
type District = { id: string; name: string; slug: string; city_id: string }
type Feature = { id: string; name: string; icon: string | null }

const tabs = [
  { key: 'cities', label: 'Thanh pho', icon: 'location_city' },
  { key: 'districts', label: 'Quan/Huyen', icon: 'map' },
  { key: 'features', label: 'Tien ich', icon: 'star' },
] as const

export default function CategoriesPage() {
  const [activeTab, setActiveTab] = useState<'cities' | 'districts' | 'features'>('cities')
  const [cities, setCities] = useState<City[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [features, setFeatures] = useState<Feature[]>([])
  const [selectedCityId, setSelectedCityId] = useState<string>('')
  const [isPending, startTransition] = useTransition()

  async function loadData() {
    const supabase = createClient()
    const [citiesRes, districtsRes, featuresRes] = await Promise.all([
      supabase.from('cities').select('*').order('sort_order'),
      supabase.from('districts').select('*').order('name'),
      supabase.from('features').select('*').order('name'),
    ])
    setCities(citiesRes.data ?? [])
    setDistricts(districtsRes.data ?? [])
    setFeatures(featuresRes.data ?? [])
  }

  useEffect(() => {
    loadData()
  }, [])

  function handleCreateCity(formData: FormData) {
    startTransition(async () => {
      await createCity(formData)
      loadData()
    })
  }

  function handleDeleteCity(id: string) {
    if (!confirm('Ban co chac muon xoa thanh pho nay?')) return
    startTransition(async () => {
      await deleteCity(id)
      loadData()
    })
  }

  function handleCreateDistrict(formData: FormData) {
    startTransition(async () => {
      await createDistrict(formData)
      loadData()
    })
  }

  function handleDeleteDistrict(id: string) {
    if (!confirm('Ban co chac muon xoa quan/huyen nay?')) return
    startTransition(async () => {
      await deleteDistrict(id)
      loadData()
    })
  }

  function handleCreateFeature(formData: FormData) {
    startTransition(async () => {
      await createFeature(formData)
      loadData()
    })
  }

  function handleDeleteFeature(id: string) {
    if (!confirm('Ban co chac muon xoa tien ich nay?')) return
    startTransition(async () => {
      await deleteFeature(id)
      loadData()
    })
  }

  const filteredDistricts = selectedCityId
    ? districts.filter((d) => d.city_id === selectedCityId)
    : districts

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Danh muc</h1>
        <p className="text-sm text-on-surface/60 mt-1">
          Quan ly thanh pho, quan/huyen va tien ich
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 shadow-sm w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-primary text-white'
                : 'text-on-surface/60 hover:text-on-surface hover:bg-gray-50'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cities Tab */}
      {activeTab === 'cities' && (
        <div className="space-y-4">
          {/* Add form */}
          <form
            action={handleCreateCity}
            className="bg-white rounded-xl shadow-sm p-4 flex items-end gap-3"
          >
            <div className="flex-1">
              <label className="block text-xs font-medium text-on-surface/60 mb-1">
                Ten thanh pho
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="VD: Ho Chi Minh"
              />
            </div>
            <div className="w-28">
              <label className="block text-xs font-medium text-on-surface/60 mb-1">
                Thu tu
              </label>
              <input
                type="number"
                name="sort_order"
                defaultValue={0}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-container transition-colors disabled:opacity-50 shrink-0"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Them
            </button>
          </form>

          {/* List */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">
                    Ten
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">
                    Slug
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">
                    Thu tu
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">
                    Thao tac
                  </th>
                </tr>
              </thead>
              <tbody>
                {cities.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-on-surface/40">
                      Chua co thanh pho nao
                    </td>
                  </tr>
                )}
                {cities.map((city, i) => (
                  <tr
                    key={city.id}
                    className={`border-b border-gray-50 ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium text-on-surface">{city.name}</td>
                    <td className="px-4 py-3 text-on-surface/50">{city.slug}</td>
                    <td className="px-4 py-3 text-on-surface/70">{city.sort_order}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteCity(city.id)}
                        disabled={isPending}
                        className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Districts Tab */}
      {activeTab === 'districts' && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <label className="block text-xs font-medium text-on-surface/60 mb-1">
              Loc theo thanh pho
            </label>
            <select
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="w-full max-w-xs px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Tat ca</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {/* Add form */}
          <form
            action={handleCreateDistrict}
            className="bg-white rounded-xl shadow-sm p-4 flex items-end gap-3"
          >
            <div className="flex-1">
              <label className="block text-xs font-medium text-on-surface/60 mb-1">
                Ten quan/huyen
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="VD: Quan 1"
              />
            </div>
            <div className="w-48">
              <label className="block text-xs font-medium text-on-surface/60 mb-1">
                Thanh pho
              </label>
              <select
                name="city_id"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Chon thanh pho</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-container transition-colors disabled:opacity-50 shrink-0"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Them
            </button>
          </form>

          {/* List */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">
                    Ten
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">
                    Slug
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">
                    Thanh pho
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">
                    Thao tac
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDistricts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-on-surface/40">
                      Chua co quan/huyen nao
                    </td>
                  </tr>
                )}
                {filteredDistricts.map((district, i) => (
                  <tr
                    key={district.id}
                    className={`border-b border-gray-50 ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium text-on-surface">
                      {district.name}
                    </td>
                    <td className="px-4 py-3 text-on-surface/50">{district.slug}</td>
                    <td className="px-4 py-3 text-on-surface/70">
                      {cities.find((c) => c.id === district.city_id)?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteDistrict(district.id)}
                        disabled={isPending}
                        className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Features Tab */}
      {activeTab === 'features' && (
        <div className="space-y-4">
          {/* Add form */}
          <form
            action={handleCreateFeature}
            className="bg-white rounded-xl shadow-sm p-4 flex items-end gap-3"
          >
            <div className="flex-1">
              <label className="block text-xs font-medium text-on-surface/60 mb-1">
                Ten tien ich
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="VD: Ho boi"
              />
            </div>
            <div className="w-48">
              <label className="block text-xs font-medium text-on-surface/60 mb-1">
                Icon (Material Symbol)
              </label>
              <input
                type="text"
                name="icon"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="VD: pool"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-container transition-colors disabled:opacity-50 shrink-0"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Them
            </button>
          </form>

          {/* List */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">
                    Ten
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">
                    Icon
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">
                    Thao tac
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center text-on-surface/40">
                      Chua co tien ich nao
                    </td>
                  </tr>
                )}
                {features.map((feature, i) => (
                  <tr
                    key={feature.id}
                    className={`border-b border-gray-50 ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium text-on-surface">
                      {feature.name}
                    </td>
                    <td className="px-4 py-3">
                      {feature.icon ? (
                        <span className="inline-flex items-center gap-2 text-on-surface/70">
                          <span className="material-symbols-outlined text-lg">
                            {feature.icon}
                          </span>
                          <span className="text-xs text-on-surface/50">{feature.icon}</span>
                        </span>
                      ) : (
                        <span className="text-on-surface/30">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteFeature(feature.id)}
                        disabled={isPending}
                        className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
