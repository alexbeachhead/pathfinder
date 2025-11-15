/**
 * Merge request helper utilities
 */

import React from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { MergeRequest } from '@/lib/types';

/**
 * Get status icon for merge request
 */
export function getStatusIcon(status: MergeRequest['status']): React.ReactNode {
  switch (status) {
    case 'open':
      return <Clock className="w-4 h-4 text-blue-500" />;
    case 'merged':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'closed':
      return <XCircle className="w-4 h-4 text-gray-500" />;
    case 'conflict':
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
  }
}
