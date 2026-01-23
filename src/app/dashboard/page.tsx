'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function DashboardRouter() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (loading || redirecting) return

    if (!user) {
      console.log('No user found, redirecting to login')
      router.push('/login')
      return
    }

    console.log('User found:', { id: user.id, role: user.role, email: user.email })

    const redirectToDashboard = async () => {
      setRedirecting(true)
      try {
        if (user.role === 'SUPER_ADMIN') {
          console.log('Redirecting SUPER_ADMIN to /dashboard/admin')
          router.push('/dashboard/admin')
        } else if (user.role === 'BUSINESS_ADMIN') {
          console.log('Fetching business data for BUSINESS_ADMIN')
          const res = await fetch('/api/business')
          if (res.ok) {
            const data = await res.json()
            console.log('Business data:', data.business.slug)
            router.push(`/dashboard/business/${data.business.slug}`)
          } else {
            console.log('Business API failed:', res.status, res.statusText)
            router.push('/login')
          }
        } else if (user.role === 'PROFESSIONAL_ADMIN') {
          console.log('Fetching professional data for PROFESSIONAL_ADMIN')
          const res = await fetch('/api/professionals');
          if (res.ok) {
            const data = await res.json();
            console.log('Professional API response:', data);
            const userProfessional = data.professionals ? data.professionals.find(
              (p: any) => p.adminId === user.id
            ) : null;
            console.log('Found professional:', userProfessional);
            if (userProfessional) {
              const redirectUrl = `/dashboard/professional/${userProfessional.slug}`
              console.log('Redirecting to:', redirectUrl)
              console.log('userProfessional.slug:', userProfessional.slug)
              console.log('Full redirectUrl:', redirectUrl)
              router.push(redirectUrl)
            } else {
              console.log('No professional found for user, redirecting to login');
              router.push('/login')
            }
          } else {
            console.log('Professional API failed:', res.status, res.statusText);
            router.push('/login')
          }
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        router.push('/login')
      } finally {
        setRedirecting(false)
      }
    }

    redirectToDashboard()
  }, [user, loading, router, redirecting])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
  )
}
