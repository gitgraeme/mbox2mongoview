import React from 'react';
import { Thread } from '../../types/email';
import EmailCard from './EmailCard';
import { Box, Typography } from '@mui/material';

interface ThreadViewProps {
  thread: Thread;
  collapsed: Set<number>;
  onToggleCollapse: (idx: number) => void;
}

const ThreadView: React.FC<ThreadViewProps> = ({ thread, collapsed, onToggleCollapse }) => (
  <Box flex={1} overflow="auto" p={3}>
    {thread.emails.map((email, idx) => (
      <EmailCard
        key={idx}
        email={email}
        idx={idx}
        isCollapsed={collapsed.has(idx)}
        onToggleCollapse={onToggleCollapse}
      />
    ))}
  </Box>
);

export default ThreadView;
