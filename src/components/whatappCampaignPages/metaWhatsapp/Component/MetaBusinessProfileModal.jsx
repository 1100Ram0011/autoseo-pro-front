import React, { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import {
  ImagePlus,
  Link as LinkIcon,
  Building2,
  MapPin,
  Mail,
  AlignLeft,
  Info,
  CheckCircle2,
  ShieldAlert,
  ArrowLeft,
  MoreVertical,
  Forward,
  Globe,
} from 'lucide-react'
import {
  useGetBusinessProfileQuery,
  useUpdateBusinessProfileMutation,
  useUploadBusinessProfilePhotoMutation,
} from '@/redux/apis/metaWhatsapp.api'
import ModalWrapper from './ModalWrapper'
import Button from './Button'
import FormField from './FormField'
import { BUSINESS_VERTICALS } from './metaWhatsappConstants'

// ─── Reusable Progress Bar for Char Limits ───
const CharCounter = ({ current, max }) => {
  const percentage = (current / max) * 100
  let color = 'bg-emerald-500'
  if (percentage > 85) color = 'bg-amber-500'
  if (percentage > 100) color = 'bg-red-500'

  return (
    <div className="mt-1.5 flex flex-col items-end gap-1">
      <div className="flex w-full items-center gap-2">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-300 ${color}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <span
          className={`shrink-0 text-[11px] font-semibold ${current > max ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}
        >
          {current}/{max}
        </span>
      </div>
    </div>
  )
}

export default function MetaBusinessProfileModal({
  isOpen,
  onClose,
  selectedNumber,
}) {
  if (!isOpen || !selectedNumber) return null

  const phoneNumberId = selectedNumber?.phoneNumberId
  const phoneNumber = selectedNumber?.phoneNumber

  const {
    data: profileRes,
    isLoading: isFetching,
    refetch,
  } = useGetBusinessProfileQuery(phoneNumberId, {
    skip: !isOpen || !phoneNumberId,
  })

  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateBusinessProfileMutation()
  const [uploadPhoto, { isLoading: isUploadingPhoto }] =
    useUploadBusinessProfilePhotoMutation()

  const [formData, setFormData] = useState({
    about: '',
    address: '',
    description: '',
    email: '',
    websites: [''],
    vertical: '',
    profile_picture_url: '',
  })

  const [dirty, setDirty] = useState(false)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (profileRes?.data) {
      const p = profileRes.data
      setFormData({
        about: p.about || '',
        address: p.address || '',
        description: p.description || '',
        email: p.email || '',
        websites: p.websites && p.websites.length > 0 ? p.websites : [''],
        vertical: p.vertical || '',
        profile_picture_url: p.profile_picture_url || '',
      })
      setPhotoPreview(p.profile_picture_url || '')
      setDirty(false)
    }
  }, [profileRes])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setDirty(true)
  }

  const handleWebsiteChange = (index, value) => {
    const newWebsites = [...formData.websites]
    newWebsites[index] = value
    setFormData((prev) => ({ ...prev, websites: newWebsites }))
    setDirty(true)
  }

  const addWebsiteField = () => {
    if (formData.websites.length < 2) {
      setFormData((prev) => ({ ...prev, websites: [...prev.websites, ''] }))
    }
  }

  const removeWebsiteField = (index) => {
    const newWebsites = formData.websites.filter((_, i) => i !== index)
    setFormData((prev) => ({
      ...prev,
      websites: newWebsites.length ? newWebsites : [''],
    }))
    setDirty(true)
  }

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast.error('Only JPEG or PNG images are allowed.')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB Limit
        toast.error('Image size must be less than 5MB.')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        // Validation for dimensions could be done here by loading into an Image object
        const img = new Image()
        img.onload = () => {
          if (img.width < 192 || img.height < 192) {
            toast.error('Image must be at least 192x192 pixels.')
            return
          }
          setPhotoFile(file)
          setPhotoPreview(reader.result)
        }
        img.src = reader.result
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoUpload = async () => {
    if (!photoFile) return
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('photo', photoFile)
      const res = await uploadPhoto({
        phoneNumberId,
        formData: formDataUpload,
      }).unwrap()
      if (res.success) {
        toast.success(res.message || 'Profile photo uploaded successfully!')
        setPhotoFile(null)
        refetch()
      }
    } catch (err) {
      toast.error(
        err?.data?.message || err?.message || 'Failed to upload photo.'
      )
    }
  }

  const handleSave = async () => {
    if (formData.about.length > 139)
      return toast.error('About text exceeds 139 chars.')
    if (formData.address.length > 256)
      return toast.error('Address exceeds 256 chars.')
    if (formData.description.length > 512)
      return toast.error('Description exceeds 512 chars.')

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email))
        return toast.error('Invalid email format.')
    }

    const cleanWebsites = formData.websites.filter((w) => w.trim() !== '')
    for (const url of cleanWebsites) {
      if (url.length > 256) return toast.error('Website URL exceeds 256 chars.')
      if (!/^https?:\/\//i.test(url))
        return toast.error('Website URLs must start with http:// or https://')
    }

    try {
      const payload = {
        ...formData,
        websites: cleanWebsites,
      }

      const res = await updateProfile({ phoneNumberId, payload }).unwrap()
      if (res.success) {
        toast.success(res.message || 'Profile updated successfully!')
        setDirty(false)
        refetch()
      }
    } catch (err) {
      console.error("Profile Update Error:", err);
      const errorMessage = err?.data?.message || err?.error || err?.message || 'Failed to update profile. Something went wrong.';
      toast.error(errorMessage);
    }
  }

  const handleClose = () => {
    if (dirty) {
      if (
        !window.confirm(
          'You have unsaved changes. Are you sure you want to close?'
        )
      )
        return
    }
    setDirty(false)
    setPhotoFile(null)
    onClose()
  }

  const selectedVerticalInfo = BUSINESS_VERTICALS.find(
    (v) => v.value === formData.vertical
  )

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit WhatsApp Business Profile"
      subtitle={`Configuring public profile for ${phoneNumber || phoneNumberId}`}
      maxWidth="1100px"
    >
      <div className="-mx-6 -mt-6 flex h-[70vh] flex-col overflow-hidden bg-slate-50 dark:bg-slate-900/50 md:flex-row">
        {/* LEFT PANEL: Live Preview */}
        <div className="hidden w-2/5 flex-col items-center justify-center border-r border-slate-200 bg-slate-100 p-6 dark:border-slate-800 dark:bg-slate-900 md:flex">
          <div className="flex flex-col items-center w-full max-w-[340px]">
            <div className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
              
              {/* Top Actions */}
              <div className="flex items-center justify-between p-4 pb-2">
                <ArrowLeft size={20} className="text-slate-500 dark:text-slate-400" />
                <MoreVertical size={20} className="text-slate-500 dark:text-slate-400" />
              </div>

              {/* Header Info */}
              <div className="flex flex-col items-center px-4 pb-4">
                <div className="mb-3 flex h-[100px] w-[100px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Building2 size={36} className="text-slate-400" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  {selectedNumber?.displayName || 'Business Name'}
                </h3>
                <p className="mt-0.5 text-[15px] text-slate-600 dark:text-slate-400">
                  {phoneNumber}
                </p>
                
                {/* Share Button */}
                <div className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-slate-200 px-5 py-1.5 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900">
                  <Forward size={22} className="mb-0.5 text-[#00A884]" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Share</span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-2 w-full border-y border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50" />

              {/* Details List */}
              <div className="flex flex-col space-y-5 p-5">

                {/* Vertical */}
                <div className="flex items-center gap-4">
                  <Building2 size={20} className="shrink-0 text-slate-400" />
                  <span className="text-[15px] text-slate-500 dark:text-slate-400">
                    {BUSINESS_VERTICALS.find((v) => v.value === formData.vertical)?.label || 'Professional services'}
                  </span>
                </div>
                
                {/* Description (Optional in UI but we'll show it if exists) */}
                {formData.description && (
                  <div className="flex items-start gap-4">
                    <Info size={20} className="mt-0.5 shrink-0 text-slate-400" />
                    <span className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
                      {formData.description}
                    </span>
                  </div>
                )}

                {/* Address */}
                <div className="flex items-start gap-4">
                  <MapPin size={20} className="mt-0.5 shrink-0 text-slate-400" />
                  <span className="text-[15px] text-[#027EB5] dark:text-blue-400">
                    {formData.address || 'Address'}
                  </span>
                </div>

                {/* Email */}
                <div className="flex items-center gap-4">
                  <Mail size={20} className="shrink-0 text-slate-400" />
                  <span className="text-[15px] text-[#027EB5] dark:text-blue-400">
                    {formData.email || 'Email'}
                  </span>
                </div>

                {/* Websites */}
                {formData.websites.map((url, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Globe size={20} className="shrink-0 text-slate-400" />
                    <span className="truncate text-[15px] text-[#027EB5] dark:text-blue-400">
                      {url || 'Website URL'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-500">
              This experience may look different across devices.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL: Edit Form */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {isFetching ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            </div>
          ) : (
            <div className="mx-auto max-w-xl space-y-8">
              {/* Photo Upload Section */}
              <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center gap-5">
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImagePlus className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="mb-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Profile Photo
                    </h4>
                    <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                      Minimum 192x192 pixels. Max 5MB (JPEG, PNG).
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        label="Choose File"
                        onClick={() => fileInputRef.current?.click()}
                      />
                      {photoFile && (
                        <Button
                          size="sm"
                          variant="primary"
                          label="Upload to Meta"
                          loading={isUploadingPhoto}
                          disabled={isUploadingPhoto}
                          onClick={handlePhotoUpload}
                          className="bg-blue-600 hover:bg-blue-700"
                        />
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/jpeg, image/png"
                      onChange={handlePhotoSelect}
                    />
                  </div>
                </div>
              </div>

              {/* Text Fields */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Industry Vertical */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Industry Vertical
                    </label>
                    <select
                      name="vertical"
                      value={formData.vertical}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    >
                      <option value="">Select an industry...</option>
                      {BUSINESS_VERTICALS.map((v) => (
                        <option key={v.value} value={v.value}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                    {selectedVerticalInfo?.policyWarning && (
                      <div className="mt-2 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-[11px] leading-tight text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-500">
                        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>{selectedVerticalInfo.policyWarning}</span>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Email Address
                    </label>
                    <FormField
                      name="email"
                      value={formData.email}
                      onChange={(val) => { setFormData(prev => ({ ...prev, email: val })); setDirty(true); }}
                      placeholder="contact@yourbusiness.com"
                      type="email"
                    />
                  </div>
                </div>

                {/* About */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    About (Status)
                  </label>
                  <FormField
                    name="about"
                    value={formData.about}
                    onChange={(val) => { setFormData(prev => ({ ...prev, about: val })); setDirty(true); }}
                    placeholder="E.g. Hey there! I am using WhatsApp."
                    as="textarea"
                    rows={2}
                    className="resize-none"
                  />
                  {/* <CharCounter current={formData.about.length} max={139} /> */}
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Description
                  </label>
                  <FormField
                    name="description"
                    value={formData.description}
                    onChange={(val) => { setFormData(prev => ({ ...prev, description: val })); setDirty(true); }}
                    placeholder="Tell your customers what your business does..."
                    as="textarea"
                    rows={3}
                  />
                  {/* <CharCounter
                    current={formData.description.length}
                    max={512}
                  /> */}
                </div>

                {/* Address */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Address
                  </label>
                  <FormField
                    name="address"
                    value={formData.address}
                    onChange={(val) => { setFormData(prev => ({ ...prev, address: val })); setDirty(true); }}
                    placeholder="123 Business St, City, Country"
                  />
                  {/* <CharCounter current={formData.address.length} max={256} /> */}
                </div>

                {/* Websites */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Websites (Max 2)
                    </label>
                    {formData.websites.length < 2 && (
                      <button
                        type="button"
                        onClick={addWebsiteField}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                      >
                        + Add Website
                      </button>
                    )}
                  </div>
                  {formData.websites.map((url, i) => (
                    <div key={i}>
                      <div className="flex items-center gap-2">
                        <FormField
                          value={url}
                          onChange={(val) =>
                            handleWebsiteChange(i, val)
                          }
                          placeholder="https://www.yourbusiness.com"
                          className="flex-1"
                        />
                        {formData.websites.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeWebsiteField(i)}
                            className="p-2 text-slate-400 transition-colors hover:text-red-500"
                          >
                            ✖
                          </button>
                        )}
                      </div>
                      {/* <CharCounter current={url.length} max={256} /> */}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="-mx-6 -mb-6 flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 p-4 px-6 dark:border-slate-800 dark:bg-slate-900">
        <Button label="Cancel" variant="secondary" onClick={handleClose} />
        <Button
          label="Save Profile"
          variant="primary"
          onClick={handleSave}
          loading={isUpdating}
          disabled={isUpdating || isFetching || !dirty}
        />
      </div>
    </ModalWrapper>
  )
}
