/**
 * 会议投票管理 Hook
 * 负责投票的增删改查和排序
 * 使用 TanStack Query 管理状态
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { voteService } from '@/services/vote'
import { useNotifications } from './useNotifications'
import type { MeetingVote, VoteType, VoteOption, MeetingSecurityLevel } from '@/types'

export function useMeetingVote(meetingId: string | null) {
  const queryClient = useQueryClient()
  const { showError } = useNotifications()

  /**
   * 加载会议的所有投票
   * 使用 useQuery
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
        // 🛡️ 防御性编程：确保返回数组
        return Array.isArray(result) ? result : []
      } catch (error) {
        console.error('加载投票失败:', error)
        // 如果接口未实现或失败，返回空数组
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
        securityLevel: MeetingSecurityLevel | null
      }
    }) => {
      if (!meetingId) throw new Error('会议ID不存在')

      // 计算当前议题下的投票数量，用于orderNum
      const agendaVotes = votes.filter(v => v.agendaId === agendaId)
      const orderNum = agendaVotes.length

      return await voteService.createVote(meetingId, agendaId, {
        ...voteData,
        orderNum
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-votes', meetingId] })
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
      agendaId,
      voteId,
      updates
    }: {
      agendaId: string
      voteId: string
      updates: {
        title?: string
        voteType?: VoteType
        options?: VoteOption[]
        isAnonymous?: boolean
        securityLevel?: MeetingSecurityLevel | null
      }
    }) => {
      if (!meetingId) throw new Error('会议ID不存在')
      return await voteService.updateVote(meetingId, agendaId, voteId, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-votes', meetingId] })
    },
    onError: (error: any) => {
      showError('更新投票失败', error.message)
    }
  })

  const updateVote = async (
    agendaId: string,
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
    await updateVoteMutation.mutateAsync({ agendaId, voteId, updates })
  }

  /**
   * 删除投票
   */
  const deleteVoteMutation = useMutation({
    mutationFn: async ({
      agendaId,
      voteId
    }: {
      agendaId: string
      voteId: string
    }) => {
      if (!meetingId) throw new Error('会议ID不存在')
      await voteService.deleteVote(meetingId, agendaId, voteId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-votes', meetingId] })
    },
    onError: (error: any) => {
      showError('删除投票失败', error.message)
    }
  })

  const removeVote = async (agendaId: string, voteId: string) => {
    await deleteVoteMutation.mutateAsync({ agendaId, voteId })
  }

  /**
   * 重新排序投票
   */
  const reorderVotesMutation = useMutation({
    mutationFn: async ({
      agendaId,
      newVotes
    }: {
      agendaId: string
      newVotes: MeetingVote[]
    }) => {
      if (!meetingId) throw new Error('会议ID不存在')
      
      const voteIds = newVotes.map(v => v.id)
      await voteService.updateVoteOrder(meetingId, agendaId, voteIds)
      
      return newVotes
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-votes', meetingId] })
    },
    onError: (error: any) => {
      showError('排序失败', error.message)
    }
  })

  const reorderVotes = async (agendaId: string, newVotes: MeetingVote[]) => {
    await reorderVotesMutation.mutateAsync({ agendaId, newVotes })
  }

  return {
    votes,
    isLoading,
    isError,
    error,
    loadVotes,
    addVote,
    updateVote,
    removeVote,
    reorderVotes
  }
}
