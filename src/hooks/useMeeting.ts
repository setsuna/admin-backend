import { useState, useEffect, useCallback } from 'react'
import { meetingApi } from '@/services/meeting'
import type { Meeting, MeetingFilters, MyMeetingTab } from '@/types'

// 会议列表 Hook
export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<MeetingFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  const loadMeetings = useCallback(async () => {
    try {
      setLoading(true)
      const response = await meetingApi.getMeetings(filters, currentPage, pageSize)
      setMeetings(response.items)
      setTotal(response.pagination.total)
    } catch (error) {
      console.error('Failed to load meetings:', error)
      setMeetings([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [filters, currentPage, pageSize])

  useEffect(() => {
    loadMeetings()
  }, [loadMeetings])

  const updateFilters = useCallback((newFilters: Partial<MeetingFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1)
  }, [])

  const nextPage = useCallback(() => {
    const totalPages = Math.ceil(total / pageSize)
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }, [total, pageSize])

  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }, [])

  const refresh = useCallback(() => {
    loadMeetings()
  }, [loadMeetings])

  return {
    meetings,
    loading,
    filters,
    currentPage,
    total,
    totalPages: Math.ceil(total / pageSize),
    updateFilters,
    setCurrentPage,
    nextPage,
    prevPage,
    refresh
  }
}

// 我的会议 Hook
export function useMyMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<MyMeetingTab['key']>('all')
  const [filters, setFilters] = useState<MeetingFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10
  // const currentUserId = '1' // TODO: 从用户上下文获取

  const loadMyMeetings = useCallback(async () => {
    try {
      setLoading(true)
      const response = await meetingApi.getMyMeetings(
        activeTab,
        filters,
        currentPage,
        pageSize
      )
      setMeetings(response.items)
      setTotal(response.pagination.total)
    } catch (error) {
      console.error('Failed to load my meetings:', error)
      setMeetings([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [activeTab, filters, currentPage, pageSize])

  useEffect(() => {
    loadMyMeetings()
  }, [loadMyMeetings])

  const switchTab = useCallback((tabKey: MyMeetingTab['key']) => {
    setActiveTab(tabKey)
    setCurrentPage(1)
  }, [])

  const updateFilters = useCallback((newFilters: Partial<MeetingFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1)
  }, [])

  const nextPage = useCallback(() => {
    const totalPages = Math.ceil(total / pageSize)
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }, [total, pageSize])

  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }, [])

  const refresh = useCallback(() => {
    loadMyMeetings()
  }, [loadMyMeetings])

  return {
    meetings,
    loading,
    activeTab,
    filters,
    currentPage,
    total,
    totalPages: Math.ceil(total / pageSize),
    switchTab,
    updateFilters,
    setCurrentPage,
    nextPage,
    prevPage,
    refresh
  }
}

// 单个会议管理 Hook
export function useMeeting(meetingId: string | null) {
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMeeting = useCallback(async () => {
    if (!meetingId) {
      setMeeting(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const meetingData = await meetingApi.getMeetingById(meetingId)
      setMeeting(meetingData)
    } catch (err) {
      setError('Failed to load meeting')
      console.error('Failed to load meeting:', err)
    } finally {
      setLoading(false)
    }
  }, [meetingId])

  useEffect(() => {
    loadMeeting()
  }, [loadMeeting])

  const updateMeeting = useCallback(async (updates: Partial<Meeting>) => {
    if (!meetingId) return null

    try {
      setLoading(true)
      const updatedMeeting = await meetingApi.updateMeeting(meetingId, updates)
      setMeeting(updatedMeeting)
      return updatedMeeting
    } catch (err) {
      setError('Failed to update meeting')
      console.error('Failed to update meeting:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [meetingId])

  const deleteMeeting = useCallback(async () => {
    if (!meetingId) return false

    try {
      setLoading(true)
      const success = await meetingApi.deleteMeeting(meetingId)
      if (success) {
        setMeeting(null)
      }
      return success
    } catch (err) {
      setError('Failed to delete meeting')
      console.error('Failed to delete meeting:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [meetingId])

  return {
    meeting,
    loading,
    error,
    loadMeeting,
    updateMeeting,
    deleteMeeting
  }
}
