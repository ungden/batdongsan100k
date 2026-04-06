'use client'

import { useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

export default function ImageUploader({
  images,
  onChange,
  maxImages = 10,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(
    async (file: File) => {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const path = `properties/${fileName}`

      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (error) {
        console.error('Upload error:', error.message)
        return null
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('property-images').getPublicUrl(data.path)

      return publicUrl
    },
    []
  )

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const validFiles = Array.from(files).filter((f) =>
        f.type.startsWith('image/')
      )
      if (validFiles.length === 0) return

      const remaining = maxImages - images.length
      const toUpload = validFiles.slice(0, remaining)
      if (toUpload.length === 0) return

      setUploading(true)
      const urls: string[] = []

      for (const file of toUpload) {
        const url = await uploadFile(file)
        if (url) urls.push(url)
      }

      if (urls.length > 0) {
        onChange([...images, ...urls])
      }
      setUploading(false)
    },
    [images, maxImages, onChange, uploadFile]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const removeImage = useCallback(
    (index: number) => {
      onChange(images.filter((_, i) => i !== index))
    },
    [images, onChange]
  )

  const addUrl = useCallback(() => {
    const trimmed = urlInput.trim()
    if (!trimmed) return
    if (images.length >= maxImages) return
    onChange([...images, trimmed])
    setUrlInput('')
  }, [urlInput, images, maxImages, onChange])

  return (
    <div className="space-y-3">
      {/* Thumbnails */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, i) => (
            <div key={i} className="relative group w-20 h-20">
              <Image
                src={url}
                alt=""
                width={80}
                height={80}
                className="w-20 h-20 rounded-lg object-cover border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {images.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files)
              e.target.value = ''
            }}
          />
          <span className="material-symbols-outlined text-3xl text-on-surface/30 mb-1">
            cloud_upload
          </span>
          <p className="text-sm text-on-surface/50">
            {uploading
              ? 'Đang tải lên...'
              : 'Kéo thả hình ảnh hoặc click để chọn'}
          </p>
          <p className="text-xs text-on-surface/30 mt-1">
            {images.length}/{maxImages} hình ảnh
          </p>
        </div>
      )}

      {/* URL input fallback */}
      <div className="flex gap-2">
        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addUrl()
            }
          }}
          placeholder="Hoặc nhập URL hình ảnh..."
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        <button
          type="button"
          onClick={addUrl}
          disabled={!urlInput.trim() || images.length >= maxImages}
          className="px-3 py-2 bg-gray-100 text-on-surface/70 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          Thêm
        </button>
      </div>

      {/* Hidden input to pass images as form data */}
      <input type="hidden" name="images" value={images.join('\n')} />
    </div>
  )
}
