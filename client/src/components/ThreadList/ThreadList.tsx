import React from 'react';
import { Thread } from '../../types/email';
import ThreadListItem from './ThreadListItem';
import { List, Divider } from '@mui/material';

interface ThreadListProps {
  threads: Thread[];
  selected: number;
  onSelect: (idx: number) => void;
}

const ThreadList: React.FC<ThreadListProps> = ({ threads, selected, onSelect }) => (
  <List sx={{ flex: 1, p: 0 }}>
    {threads.map((t, i) => (
      <React.Fragment key={i}>
        <ThreadListItem
          thread={t}
          selected={i === selected}
          onClick={() => onSelect(i)}
        />
        {i < threads.length - 1 && <Divider component="li" sx={{ m: 0 }} />}
      </React.Fragment>
    ))}
  </List>
);

export default ThreadList;
