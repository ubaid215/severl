'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  KeyRound,
} from 'lucide-react'

type Tab = 'email' | 'password'

interface FeedbackState {
  type: 'success' | 'error' | null
  message: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('email')
  const [mounted, setMounted] = useState(false)

  // Email form
  const [newEmail, setNewEmail] = useState('')
  const [emailCurrentPassword, setEmailCurrentPassword] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailFeedback, setEmailFeedback] = useState<FeedbackState>({ type: null, message: '' })

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordFeedback, setPasswordFeedback] = useState<FeedbackState>({ type: null, message: '' })

  // Show/hide toggles
  const [showEmailPass, setShowEmailPass] = useState(false)
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const getToken = () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('admin_token')
  }

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailFeedback({ type: null, message: '' })
    const token = getToken()
    if (!token) { router.push('/auth/login'); return }

    setEmailLoading(true)
    try {
      const res = await fetch('/api/auth/account?action=email', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newEmail, currentPassword: emailCurrentPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')

      setEmailFeedback({ type: 'success', message: 'Email updated! Please log in again.' })
      setNewEmail('')
      setEmailCurrentPassword('')
      setTimeout(() => {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        router.push('/auth/login')
      }, 2000)
    } catch (err: any) {
      setEmailFeedback({ type: 'error', message: err.message })
    } finally {
      setEmailLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordFeedback({ type: null, message: '' })
    const token = getToken()
    if (!token) { router.push('/auth/login'); return }

    setPasswordLoading(true)
    try {
      const res = await fetch('/api/auth/account?action=password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')

      setPasswordFeedback({ type: 'success', message: 'Password updated successfully!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err: any) {
      setPasswordFeedback({ type: 'error', message: err.message })
    } finally {
      setPasswordLoading(false)
    }
  }

  const passwordStrength = (pw: string) => {
    if (!pw) return null
    if (pw.length < 8) return { level: 1, label: 'Too short', color: 'bg-red-500' }
    if (pw.length < 10 || !/[A-Z]/.test(pw)) return { level: 2, label: 'Weak', color: 'bg-orange-500' }
    if (!/[0-9]/.test(pw) || !/[^A-Za-z0-9]/.test(pw)) return { level: 3, label: 'Fair', color: 'bg-yellow-400' }
    return { level: 4, label: 'Strong', color: 'bg-green-500' }
  }

  const strength = passwordStrength(newPassword)

  if (!mounted) return null

  const inputBase =
    'w-full bg-[#111316] border border-gray-700 text-white rounded-lg px-4 py-3 text-sm outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 transition-all duration-200 placeholder-gray-600'

  const Feedback = ({ state }: { state: FeedbackState }) =>
    state.type ? (
      <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-medium animate-fadeIn ${
          state.type === 'success'
            ? 'bg-green-500/10 border border-green-500/30 text-green-400'
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}
      >
        {state.type === 'success' ? (
          <CheckCircle2 className="w-4 h-4 shrink-0" />
        ) : (
          <AlertCircle className="w-4 h-4 shrink-0" />
        )}
        {state.message}
      </div>
    ) : null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        .settings-root { font-family: 'DM Sans', sans-serif; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.25s ease forwards; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.35s ease forwards; }
        .tab-indicator { transition: transform 0.25s cubic-bezier(0.4,0,0.2,1), width 0.25s cubic-bezier(0.4,0,0.2,1); }
      `}</style>

      <div className="settings-root min-h-screen bg-[#0D0F12] text-white px-4 py-10 md:px-10">
        {/* Page Header */}
        <div className="mb-10 animate-slideUp">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-xs font-mono text-yellow-400/70 tracking-widest uppercase">Account</p>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
            Security Settings
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage your login credentials</p>
        </div>

        {/* Card */}
        <div
          className="max-w-lg animate-slideUp"
          style={{ animationDelay: '0.05s', opacity: 0, animationFillMode: 'forwards' }}
        >
          <div className="bg-[#13161A] border border-gray-800/60 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
            {/* Tabs */}
            <div className="flex border-b border-gray-800">
              {(['email', 'password'] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab)
                    setEmailFeedback({ type: null, message: '' })
                    setPasswordFeedback({ type: null, message: '' })
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all duration-200 relative ${
                    activeTab === tab
                      ? 'text-yellow-400'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {tab === 'email' ? (
                    <Mail className="w-4 h-4" />
                  ) : (
                    <KeyRound className="w-4 h-4" />
                  )}
                  {tab === 'email' ? 'Change Email' : 'Change Password'}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400 tab-indicator" />
                  )}
                </button>
              ))}
            </div>

            {/* Form Body */}
            <div className="p-6 md:p-8">
              {/* EMAIL TAB */}
              {activeTab === 'email' && (
                <form onSubmit={handleChangeEmail} className="space-y-5 animate-fadeIn">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-gray-400 tracking-wider uppercase">
                      New Email Address
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="new@example.com"
                      required
                      className={inputBase}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-gray-400 tracking-wider uppercase">
                      Confirm with Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showEmailPass ? 'text' : 'password'}
                        value={emailCurrentPassword}
                        onChange={(e) => setEmailCurrentPassword(e.target.value)}
                        placeholder="Your current password"
                        required
                        className={`${inputBase} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowEmailPass(!showEmailPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showEmailPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Feedback state={emailFeedback} />

                  <button
                    type="submit"
                    disabled={emailLoading}
                    className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-semibold py-3 rounded-lg text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2"
                  >
                    {emailLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</>
                    ) : (
                      <><Mail className="w-4 h-4" /> Update Email</>
                    )}
                  </button>

                  <p className="text-xs text-gray-600 text-center">
                    You'll be logged out after changing your email.
                  </p>
                </form>
              )}

              {/* PASSWORD TAB */}
              {activeTab === 'password' && (
                <form onSubmit={handleChangePassword} className="space-y-5 animate-fadeIn">
                  {[
                    {
                      label: 'Current Password',
                      value: currentPassword,
                      setter: setCurrentPassword,
                      show: showCurrentPass,
                      toggle: () => setShowCurrentPass(!showCurrentPass),
                      placeholder: 'Your current password',
                    },
                    {
                      label: 'New Password',
                      value: newPassword,
                      setter: setNewPassword,
                      show: showNewPass,
                      toggle: () => setShowNewPass(!showNewPass),
                      placeholder: 'Min. 8 characters',
                      showStrength: true,
                    },
                    {
                      label: 'Confirm New Password',
                      value: confirmNewPassword,
                      setter: setConfirmNewPassword,
                      show: showConfirmPass,
                      toggle: () => setShowConfirmPass(!showConfirmPass),
                      placeholder: 'Repeat new password',
                    },
                  ].map((field) => (
                    <div key={field.label} className="space-y-1.5">
                      <label className="text-xs font-mono text-gray-400 tracking-wider uppercase">
                        {field.label}
                      </label>
                      <div className="relative">
                        <input
                          type={field.show ? 'text' : 'password'}
                          value={field.value}
                          onChange={(e) => field.setter(e.target.value)}
                          placeholder={field.placeholder}
                          required
                          className={`${inputBase} pr-11`}
                        />
                        <button
                          type="button"
                          onClick={field.toggle}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          {field.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Strength bar */}
                      {'showStrength' in field && field.showStrength && newPassword && strength && (
                        <div className="space-y-1 animate-fadeIn">
                          <div className="flex gap-1 h-1">
                            {[1, 2, 3, 4].map((i) => (
                              <div
                                key={i}
                                className={`flex-1 rounded-full transition-all duration-300 ${
                                  i <= strength.level ? strength.color : 'bg-gray-700'
                                }`}
                              />
                            ))}
                          </div>
                          <p className={`text-xs font-mono ${
                            strength.level <= 1 ? 'text-red-400' :
                            strength.level === 2 ? 'text-orange-400' :
                            strength.level === 3 ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {strength.label}
                          </p>
                        </div>
                      )}

                      {/* Match indicator */}
                      {field.label === 'Confirm New Password' && confirmNewPassword && (
                        <p className={`text-xs font-mono animate-fadeIn ${
                          newPassword === confirmNewPassword ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {newPassword === confirmNewPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                        </p>
                      )}
                    </div>
                  ))}

                  <Feedback state={passwordFeedback} />

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-semibold py-3 rounded-lg text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2"
                  >
                    {passwordLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</>
                    ) : (
                      <><Lock className="w-4 h-4" /> Update Password</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}