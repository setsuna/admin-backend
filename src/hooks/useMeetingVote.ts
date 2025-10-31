/**
 * 会议投票管理 Hook
 * 负责投票的增删改查
 * 使用 TanStack Query 管理状态
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { voteService } from '@/services/vote'
import { useNotifications } from './useNotifications'
import type { VoteType, VoteOption, MeetingSecurityLevel } from '@/types'

export function useMeetingVote(meetingId: string | null) {
  const queryClient = useQueryClient()
  const { showError, showSuccess } = useNotifications()

  /**
   * 加载会议的所有投票
   */
  const {
    data: votes = [],
    isLoading,
    isError,
    error,
    refetch: loadVotes
  } = useQuery({
    queryKey: ['meeting-votes', meetingId],
    queryFn: async () => {
      if (!meetingId) return []
      try {
        const result = await voteService.getMeetingVotes(meetingId)
        return Array.isArray(result) ? result : []
      } catch (error) {
        console.error('加载投票失败:', error)
        return []
      }
    },
    enabled: !!meetingId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  })

  /**
   * 创建投票
   */
  const createVoteMutation = useMutation({
    mutationFn: async ({
      agendaId,
      voteData
    }: {
      agendaId: string
      voteData: {
        title: string
        voteType: VoteType
        options: VoteOption[]
        isAnonymous: boolean
        allowMultiple?: boolean
        securityLevel: MeetingSecurityLevel | null
      }
    }) => {
      if (!meetingId) throw new Error('会议ID不存在')

      const agendaVotes = votes.filter(v => v.agendaId === agendaId)
      const orderNum = agendaVotes.length

      return await voteService.createVote(meetingId, agendaId, {
        ...voteData,
        orderNum
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-votes', meetingId] })
      showSuccess('投票添加成功')
    },
    onError: (error: any) => {
      showError('添加投票失败', error.message)
    }
  })

  const addVote = async (
    agendaId: string,
    voteData: {
      title: string
      voteType: VoteType
      options: VoteOption[]
      isAnonymous: boolean
      allowMultiple?: boolean
      securityLevel: MeetingSecurityLevel | null
    }
  ) => {
    return await createVoteMutation.mutateAsync({ agendaId, voteData })
  }

  /**
   * 更新投票
   */
  const updateVoteMutation = useMutation({
    mutationFn: async ({
      voteId,
      updates
    }: {
      voteId: string
      updates: {
        title?: string
        voteType?: VoteType
        options?: VoteOption[]
        isAnonymous?: boolean
        allowMultiple?: boolean
        securityLevel?: MeetingSecurityLevel | null
      }
    }) => {
      if (!meetingId) throw new Error('会议ID不存在')
      return await voteService.updateVote(meetingId, voteId, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-votes', meetingId] })
      showSuccess('投票更新成功')
    },
    onError: (error: any) => {
      showError('更新投票失败', error.message)
    }
  })

  const updateVote = async (
    voteId: string,
    updates: {
      title?: string
      voteType?: VoteType
      options?: VoteOption[]
      isAnonymous?: boolean
      allowMultiple?: boolean
      securityLevel?: MeetingSecurityLevel | null
    }
  ) => {
    await updateVoteMutation.mutateAsync({ voteId, updates })
  }

  /**
   * 删除投票
   */
  const deleteVoteMutation = useMutation({
    mutationFn: async (voteId: string) => {
      if (!meetingId) throw new Error('会议ID不存在')
      await voteService.deleteVote(meetingId, voteId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-votes', meetingId] })
      showSuccess('投票删除成功')
    },
    onError: (error: any) => {
      showError('删除投票失败', error.message)
    }
  })

  const removeVote = async (voteId: string) => {
    await deleteVoteMutation.mutateAsync(voteId)
  }

  return {
    votes,
    isLoading,
    isError,
    error,
    loadVotes,
    addVote,
    updateVote,
    removeVote
  }
}
