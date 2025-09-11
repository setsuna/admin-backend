import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell,
  Button,
  Loading
} from '@/components/ui'
import { cn } from '@/utils'
import type { TableProps } from '@/types'

export function DataTable<T = any>({ 
  data, 
  columns, 
  loading = false,
  pagination,
  onPaginationChange,
  rowKey = 'id' as keyof T,
  className,
  bordered = false,
  compact = false
}: TableProps<T> & { bordered?: boolean; compact?: boolean }) {
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record)
    }
    return (record as any)[rowKey] || index.toString()
  }
  
  const renderCell = (column: any, record: T, index: number) => {
    const value = (record as any)[column.key]
    
    if (column.render) {
      return column.render(value, record, index)
    }
    
    return value
  }
  
  const handlePageChange = (page: number) => {
    if (pagination && onPaginationChange) {
      onPaginationChange({
        ...pagination,
        page,
      })
    }
  }
  
  const handlePageSizeChange = (pageSize: number) => {
    if (pagination && onPaginationChange) {
      onPaginationChange({
        ...pagination,
        page: 1,
        pageSize,
      })
    }
  }
  
  const totalPages = pagination?.total ? Math.ceil(pagination.total / pagination.pageSize) : 0
  const currentPage = pagination?.page || 1
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* 表格 */}
      <div className={cn(bordered && 'rounded-md border')}>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead 
                  key={column.key.toString()}
                  style={{ width: column.width }}
                  className={cn(
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right'
                  )}
                >
                  {column.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <Loading />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="text-muted-foreground">暂无数据</div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((record, index) => (
                <TableRow key={getRowKey(record, index)} className={cn(compact && 'h-12')}>
                  {columns.map((column) => (
                    <TableCell 
                      key={column.key.toString()}
                      className={cn(
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right',
                        compact && 'py-2'
                      )}
                    >
                      {renderCell(column, record, index)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* 分页 */}
      {pagination && (pagination.total ?? 0) > 0 && (
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>每页显示</span>
            <select
              value={pagination.pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="rounded border bg-background px-2 py-1"
            >
              {[10, 20, 50, 100].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span>条，共 {pagination.total} 条</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page: number
                if (totalPages <= 5) {
                  page = i + 1
                } else if (currentPage <= 3) {
                  page = i + 1
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i
                } else {
                  page = currentPage - 2 + i
                }
                
                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="w-8"
                  >
                    {page}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
