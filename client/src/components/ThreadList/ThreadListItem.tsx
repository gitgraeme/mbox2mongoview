import React from 'react';
import { Thread } from '../../types/email';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

interface ThreadListItemProps {
  thread: Thread;
  selected: boolean;
  onClick: () => void;
}

const ThreadListItem: React.FC<ThreadListItemProps> = ({ thread, selected, onClick }) => {
  const hasDownloadable = thread.emails.some(email =>
    (email.attachments || []).some(att => att.filename && att.filename.trim() !== "")
  );
  return (
    <ListItemButton
      selected={selected}
      onClick={onClick}
      alignItems="flex-start"
      disableTouchRipple
      disableRipple
      sx={{
        position: 'relative',
        pr: hasDownloadable ? 4 : 2,
        borderLeft: '4px solid transparent',
        transition: 'background 0.2s, color 0.2s',
        '&.Mui-selected': {
          bgcolor: '#133366',
          color: '#fff',
          borderLeft: '4px solid #0d2244',
        },
        '&.Mui-selected:hover': {
          bgcolor: '#0d2244',
          color: '#fff',
        },
      }}
    >
      <ListItemText
        primary={<span style={{ fontWeight: selected ? 700 : 500, display: 'block', whiteSpace: 'normal', marginRight: hasDownloadable ? 18 : 0 }}>{thread.subject}</span>}
        secondary={
          thread.emails.length > 0
            ? new Date(thread.emails[thread.emails.length - 1].date).toLocaleString()
            : ""
        }
        secondaryTypographyProps={{ color: 'grey.400', fontSize: 12 }}
      />
      {hasDownloadable && (
        <span
          style={{
            position: 'absolute',
            top: 16,
            right: 12,
            fontSize: 12,
            opacity: 0.9,
            pointerEvents: 'none',
            width: 16,
            height: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Has attachment"
        >
          📎
        </span>
      )}
    </ListItemButton>
  );
};

export default ThreadListItem;
